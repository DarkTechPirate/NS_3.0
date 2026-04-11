const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
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

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
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
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

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
