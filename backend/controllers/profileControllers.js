const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { enqueueMedia } = require("../services/mediaService");
const minio = require("../config/minio");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

// --- Helper: Indian Phone Validator ---
const isValidIndianPhone = (phone) => {
    // Regex: Starts with 6-9, followed by 9 digits (Total 10)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// --- Helper: Password Strength Validator ---
const isPasswordStrong = (password) => {
    const strongRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    return strongRegex.test(password);
};

const createBadRequestError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const sanitizeStringArray = (values) => {
    if (!Array.isArray(values)) return [];

    return values
        .map((value) => (typeof value === "string" ? value.trim() : value))
        .filter(
            (value) =>
                value !== undefined &&
                value !== null &&
                !(typeof value === "string" && value.length === 0)
        );
};

const sanitizeSectionObject = (sectionName, input) => {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return {};
    }

    return Object.entries(input).reduce((acc, [key, value]) => {
        if (value === undefined || value === null) {
            return acc;
        }

        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) {
                return acc;
            }

            if (sectionName === "personalDetails" && key === "dob") {
                const parsedDate = new Date(trimmed);
                if (Number.isNaN(parsedDate.getTime())) {
                    throw createBadRequestError("Invalid date of birth format");
                }
                acc[key] = parsedDate;
                return acc;
            }

            acc[key] = trimmed;
            return acc;
        }

        if (Array.isArray(value)) {
            acc[key] = sanitizeStringArray(value);
            return acc;
        }

        acc[key] = value;
        return acc;
    }, {});
};

// --- 1. Personal Info Update ---
exports.PersonalInfo = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, phone, password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // Full Name Update
        if (fullName && fullName.trim().length > 0) {
            user.fullname = fullName.trim();
        }

        // Gender Update
        if (typeof req.body.gender === "string") {
            const trimmedGender = req.body.gender.trim();
            if (trimmedGender) {
                user.gender = trimmedGender;
            }
        }

        // --- NEW: Universal Update Logic for Profile Sections ---
        // We expect req.body to potentially contain keys like 'personalDetails', 'careerDetails', etc.
        const sections = ['personalDetails', 'careerDetails', 'familyDetails', 'lifestyleDetails', 'preferences', 'profileImages'];

        sections.forEach(section => {
            if (req.body[section] !== undefined) {
                // If the section exists in the body, update the user model
                // For objects (like personalDetails), we merge. For arrays (hobbies, profileImages), we replace or merge carefully.
                // Simple merge strategy:
                if (typeof req.body[section] === 'object' && !Array.isArray(req.body[section])) {
                    const sanitizedSection = sanitizeSectionObject(section, req.body[section]);
                    if (Object.keys(sanitizedSection).length > 0) {
                        const existingSection =
                            user[section] && typeof user[section].toObject === "function"
                                ? user[section].toObject()
                                : user[section] || {};

                        user[section] = { ...existingSection, ...sanitizedSection };
                    }
                } else if (Array.isArray(req.body[section])) {
                    user[section] = sanitizeStringArray(req.body[section]);
                }
            }
        });

        // Profile Picture Update
        if (typeof req.body.profilePicture === "string") {
            const trimmedPicturePath = req.body.profilePicture.trim();
            if (trimmedPicturePath) {
                user.profilePicture = trimmedPicturePath;
            }
        }

        // Indian Phone Validation
        if (phone) {
            const cleanPhone = phone.toString().replace(/\D/g, ""); // Remove non-digits
            if (!isValidIndianPhone(cleanPhone)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid Indian mobile number. Must be 10 digits starting with 6-9.",
                });
            }
            user.phone = cleanPhone;
        }

        // Password Update
        if (password && password.length > 0) {
            if (!isPasswordStrong(password)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password is too weak. Must contain 8+ characters, uppercase, lowercase, number, and special character.",
                });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();

        // Convert to object and strip password for security
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: userResponse,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);

        if (error.statusCode === 400) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.name === "ValidationError") {
            const firstValidationError = Object.values(error.errors || {})[0];
            return res.status(400).json({
                success: false,
                message: firstValidationError?.message || "Invalid profile data",
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: error.message || "Invalid profile data",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// --- 2. NEW: Profile Picture Upload ---
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, message: "No image uploaded" });
        }

        // Add Job to Queue and get anticipated path
        const publicPath = await enqueueMedia(req.file, req.user._id, "User", "profilePicture", "set");

        // Local filesystem mode: immediately persist and return relative path.
        const relativePath = req.file.filename;
        await User.findByIdAndUpdate(req.user._id, { profilePicture: relativePath });

        return res.status(200).json({
            success: true,
            message: "Profile picture processing started",
            filePath: publicPath.replace(/^\/uploads\//, ""),
        });
    } catch (error) {
        console.error("Profile Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 3. NEW: Gallery Image Upload ---
exports.uploadGalleryImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        // Add Job to Queue with 'push' operation
        const publicPath = await enqueueMedia(req.file, req.user._id, "User", "profileImages", "push");

        res.status(200).json({
            success: true,
            message: "Gallery image processing started",
            filePath: publicPath.replace(/^\/uploads\//, ""),
        });
    } catch (error) {
        console.error("Gallery Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 4. NEW: Delete Gallery Image ---
exports.deleteGalleryImage = async (req, res) => {
    try {
        const { imagePath } = req.body;
        const userId = req.user._id;

        if (!imagePath) {
            return res.status(400).json({ success: false, message: "Image path is required" });
        }

        // 1. Remove from User array in DB
        // Support pulling both legacy '/uploads/user/...' and new 'user/...' formats
        await User.findByIdAndUpdate(userId, {
            $pull: { profileImages: { $in: [imagePath, `/uploads/${imagePath}`] } }
        });

        // 2. Delete from Storage (MinIO)
        const BUCKET = process.env.MINIO_BUCKET_NAME || "nammasambandi";
        try {
            await minio.removeObject(BUCKET, imagePath);
            console.log(`Deleted ${imagePath} from MinIO`);
        } catch (e) {
            console.warn(`MinIO delete failed (likely file not found): ${e.message}`);
        }

        res.status(200).json({ success: true, message: "Image removed successfully" });
    } catch (error) {
        console.error("Delete Gallery Image Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 5. NEW: Jathagam Upload ---
exports.uploadJathagam = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Add Job to Queue
        const publicPath = await enqueueMedia(req.file, req.user._id, "User", "personalDetails.jathagam", "set");

        res.status(200).json({
            success: true,
            message: "Jathagam processing started",
            filePath: publicPath.replace(/^\/uploads\//, ""),
        });
    } catch (error) {
        console.error("Jathagam Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 6. NEW: Chunk Upload ---
exports.uploadChunk = async (req, res) => {
    try {
        const { chunkNumber, totalChunks, uploadId } = req.body;
        if (!req.file) return res.status(400).send("No chunk file");

        const tempDir = path.join("public/uploads/temp", uploadId);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const chunkPath = path.join(tempDir, `chunk-${chunkNumber}`);
        try {
            fs.copyFileSync(req.file.path, chunkPath);
            fs.unlinkSync(req.file.path);
        } catch (e) {
            fs.renameSync(req.file.path, chunkPath); // Fallback
        }

        res.status(200).json({ success: true, message: `Chunk ${chunkNumber} received` });
    } catch (error) {
        console.error("Chunk Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 7. NEW: Complete Chunked Upload ---
exports.completeUpload = async (req, res) => {
    try {
        const { uploadId, fileName, modelName, fieldName, operation } = req.body;
        const tempDir = path.join("public/uploads/temp", uploadId);
        const finalPath = path.join("public/uploads", `${uploadId}-${fileName}`);

        const chunks = fs.readdirSync(tempDir).sort((a, b) => {
            return parseInt(a.split("-")[1]) - parseInt(b.split("-")[1]);
        });

        const writeStream = fs.createWriteStream(finalPath);
        for (const chunk of chunks) {
            const chunkPath = path.join(tempDir, chunk);
            const chunkData = fs.readFileSync(chunkPath);
            writeStream.write(chunkData);
            fs.unlinkSync(chunkPath); // Delete chunk after writing
        }
        writeStream.end();

        // Wait for streaming to finish
        await new Promise((resolve) => writeStream.on("finish", resolve));
        fs.rmdirSync(tempDir); // Remove temp folder

        // Trigger processing
        const fakeFile = {
            path: finalPath,
            mimetype: mime.lookup(finalPath) || "image/webp",
        };

        const publicPath = await enqueueMedia(fakeFile, req.user._id, modelName || "User", fieldName, operation || "set");

        res.status(200).json({
            success: true,
            filePath: publicPath.replace(/^\/uploads\//, ""),
            message: "Upload completed and processing started",
        });
    } catch (error) {
        console.error("Complete Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
