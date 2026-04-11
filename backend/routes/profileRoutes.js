const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");
const {
    PersonalInfo,
    uploadProfilePicture,
    uploadGalleryImage,
    deleteGalleryImage,
    uploadJathagam,
    uploadChunk,
    completeUpload
} = require("../controllers/profileControllers");

const uploadDir = path.join(__dirname, "../public/uploads");

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique suffix to prevent filename collisions
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Current mimetypes or common image extensions (for chunked blobs)
    const isImage = file.mimetype.startsWith("image/");
    const isImageExt = /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);

    if (isImage || isImageExt) {
        cb(null, true);
    } else {
        cb(new Error("Not an image! Please upload an image."), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 15 }, // 15MB limit
});

const profileImageUploadMiddleware = (req, res, next) => {
    const uploader = upload.fields([
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]);

    uploader(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || "Image upload failed",
            });
        }

        req.file = req.files?.image?.[0] || req.files?.file?.[0] || null;
        next();
    });
};

// --- ROUTES ---

// 1. Text Info Update
router.put("/info", protect(), PersonalInfo);

// 2. Profile Picture Update (with Multer middleware)
router.post(
    "/profile-image",
    protect(),
    upload.single("image"),
    uploadProfilePicture
);

// 3. Gallery Image Upload
router.post(
    "/gallery-image",
    protect(),
    upload.single("image"),
    uploadGalleryImage
);

// 4. Delete Gallery Image
router.delete(
    "/gallery-image",
    protect(),
    deleteGalleryImage
);

// 5. Jathagam Upload
router.post(
    "/jathagam",
    protect(),
    upload.single("image"),
    uploadJathagam
);

// 6. Chunk Upload
router.post(
    "/upload-chunk",
    protect(),
    upload.single("image"),
    uploadChunk
);

// 7. Complete Upload
router.post(
    "/complete-upload",
    protect(),
    completeUpload
);

module.exports = router;
