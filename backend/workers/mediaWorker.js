const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { connection } = require("../services/queue");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const minio = require("../config/minio");

sharp.cache(false);

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

        // ... Steps 1 & 2 ...

        // Use the passed finalFilename
        const tempOutput = path.join(path.resolve(outputDir), finalFilename);

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

            // ---------- STEP 4: Upload to MinIO ----------
            const objectKey = `${modelName.toLowerCase()}/${finalFilename}`;
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

            // ---------- STEP 5: DB update ----------
            const storedPath = `/uploads/${objectKey}`;
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
                        // Assuming route is /uploads/ -> map to bucket content
                        const oldKey = oldPath.replace(/^\/uploads\//, "");
                        try {
                            console.log(
                                `[Worker][STEP 5] Deleting old MinIO object: ${oldKey}`
                            );
                            await minio.removeObject(BUCKET, oldKey);
                        } catch (e) {
                            console.warn(`[Worker] Old object delete failed (ignored): ${e}`);
                        }
                    }
                }

                const update = { [fieldName]: storedPath };
                await Model.findByIdAndUpdate(fileId, update);
            }

            // ---------- STEP 6: Cleanup ----------
            console.log(`[Worker][STEP 6] Cleanup start`);
            fs.unlinkSync(tempOutput);
            fs.unlinkSync(absoluteInputPath);

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
