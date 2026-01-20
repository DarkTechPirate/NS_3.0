const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { enqueueMedia } = require("../services/mediaService");

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
        if (req.body.gender) {
            user.gender = req.body.gender;
        }

        // --- NEW: Universal Update Logic for Profile Sections ---
        // We expect req.body to potentially contain keys like 'personalDetails', 'careerDetails', etc.
        const sections = ['personalDetails', 'careerDetails', 'familyDetails', 'lifestyleDetails', 'preferences', 'profileImages'];

        sections.forEach(section => {
            if (req.body[section]) {
                // If the section exists in the body, update the user model
                // For objects (like personalDetails), we merge. For arrays (hobbies, profileImages), we replace or merge carefully.
                // Simple merge strategy:
                if (typeof req.body[section] === 'object' && !Array.isArray(req.body[section])) {
                    user[section] = { ...user[section], ...req.body[section] };
                } else {
                    user[section] = req.body[section];
                }
            }
        });

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
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
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
        const publicPath = await enqueueMedia(req.file, req.user._id, "User", "profilePicture");

        res.status(200).json({
            success: true,
            message: "Profile picture processing started",
            filePath: publicPath.replace(/^\/uploads\//, ""), // Frontend expects relative path? Or just path logic.
            // ProfileCreation.jsx adds http://localhost:5000/uploads/ + res.filePath
            // If publicPath is /uploads/user/foo.webp, and we return user/foo.webp, then frontend becomes /uploads/user/foo.webp. Correct.
        });
    } catch (error) {
        console.error("Profile Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
