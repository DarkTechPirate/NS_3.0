const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { connection } = require("../services/queue");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

sharp.cache(false);

const USE_MINIO = process.env.USE_MINIO === "true";
let minio;
if (USE_MINIO) {
  minio = require("../config/minio");
}

// Models
require("../models/userModel");
// require("../models/galleryModel"); // Not yet implemented
// require("../models/productModel"); // Not yet implemented
// require("../models/bannerModel"); // Not yet implemented

const BUCKET = process.env.MINIO_BUCKET_NAME || "nammasambandi";

const worker = new Worker(
    "media-processing",
    async (job) => {
        const {
            fileId,
            filePath,
            mimeType,
            outputDir,
            modelName,
            fieldName,
            operation,
            finalFilename, // Get from job
        } = job.data;

        console.log(`\n[Worker] 🟢 JOB START`);
        console.log(`[Worker] Model: ${modelName}`);
        console.log(`[Worker] File Path: ${filePath}`);

        // ---------- STEP 1 & 2: Path Resolution ----------
        const absoluteInputPath = path.resolve(filePath);
        const tempOutput = path.join(path.resolve(outputDir), finalFilename);

        if (!fs.existsSync(absoluteInputPath)) {
            throw new Error(`Input file not found: ${absoluteInputPath}`);
        }

        try {
            // ---------- STEP 3: Sharp processing ----------
            console.log(`[Worker][STEP 3] Sharp start`);

            let pipeline = sharp(absoluteInputPath);

            if (modelName === "User") {
                pipeline = pipeline.resize(500, 500, { fit: "cover" });
            }
            // Add other models here when implemented

            await pipeline.webp({ quality: 80 }).toFile(tempOutput);

            console.log(`[Worker][STEP 3] Sharp done → ${tempOutput}`);

            if (!fs.existsSync(tempOutput) || fs.statSync(tempOutput).size === 0) {
                throw new Error("Sharp output invalid");
            }

            // ---------- STEP 4: Upload to MinIO (or keep local) ----------
            const objectKey = `${modelName.toLowerCase()}/${finalFilename}`;
            let storedPath;

            if (USE_MINIO && minio) {
                console.log(`[Worker][STEP 4] Uploading to MinIO`);
                console.log(`[Worker][STEP 4] Object Key: ${objectKey}`);

                // Ensure bucket exists
                const bucketExists = await minio.bucketExists(BUCKET);
                if (!bucketExists) {
                    await minio.makeBucket(BUCKET, 'us-east-1'); // Default region
                }

                await minio.fPutObject(BUCKET, objectKey, tempOutput, {
                    "Content-Type": "image/webp",
                });

                console.log(`[Worker][STEP 4] MinIO upload DONE`);
                storedPath = `/uploads/${objectKey}`;
            } else {
                // Local fallback: move file to public/uploads
                const localDir = path.join(__dirname, `../public/uploads/${modelName.toLowerCase()}`);
                if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
                const localDest = path.join(localDir, finalFilename);
                fs.copyFileSync(tempOutput, localDest);
                fs.unlinkSync(tempOutput);
                console.log(`[Worker][STEP 4] File saved locally at ${localDest}`);
                storedPath = `/uploads/${objectKey}`;
            }

            // ---------- STEP 5: DB update ----------
            console.log(`[Worker][STEP 5] Stored path: ${storedPath}`);

            const Model = mongoose.model(modelName);

            if (operation === "push") {
                console.log(`[Worker][STEP 5] Mongo push update`);
                await Model.findByIdAndUpdate(fileId, {
                    $push: { [fieldName]: storedPath },
                });
            } else {
                console.log(`[Worker][STEP 5] Mongo replace update`);

                const doc = await Model.findById(fileId);

                if (doc && doc[fieldName]) {
                    const oldPath = doc[fieldName];
                    if (oldPath && oldPath.startsWith("/uploads/")) {
                        // Extract key from /uploads/user/file.webp -> user/file.webp
                        const oldKey = oldPath.replace(/^\/uploads\//, "");
                        if (USE_MINIO && minio) {
                            try {
                                console.log(
                                    `[Worker][STEP 5] Deleting old MinIO object: ${oldKey}`
                                );
                                await minio.removeObject(BUCKET, oldKey);
                            } catch (e) {
                                console.warn(`[Worker] Old object delete failed (ignored): ${e}`);
                            }
                        } else {
                            // Local fallback: delete old local file
                            const localOldPath = path.join(__dirname, `../public${oldPath}`);
                            try {
                                if (fs.existsSync(localOldPath)) fs.unlinkSync(localOldPath);
                            } catch (e) {
                                console.warn(`[Worker] Old local file delete failed (ignored): ${e}`);
                            }
                        }
                    }
                }

                const update = { [fieldName]: storedPath };
                await Model.findByIdAndUpdate(fileId, update);
            }

            // ---------- STEP 6: Cleanup ----------
            console.log(`[Worker][STEP 6] Cleanup start`);
            if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
            if (fs.existsSync(absoluteInputPath)) fs.unlinkSync(absoluteInputPath);

            console.log(`[Worker] 🎉 JOB COMPLETED SUCCESSFULLY`);
            console.log(`[Worker] Final Path: ${storedPath}\n`);

            return storedPath;
        } catch (err) {
            console.error(`[Worker ❌ ERROR] ${err.message}`);

            if (fs.existsSync(tempOutput)) {
                try {
                    fs.unlinkSync(tempOutput);
                } catch { }
            }

            throw err;
        }
    },
    {
        connection,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
    }
);

console.log("🧵 Media Worker started (MinIO + DEBUG)");
