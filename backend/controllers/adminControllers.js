const User = require("../models/userModel");
const Notification = require("../models/Notification");
const socketService = require("../services/socketService");

/**
 * @desc Get all pending users (isVerified: false)
 * @route GET /api/admin/pending
 * @access Private/Admin
 */
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ isVerified: false, role: "user" }).select("-password");
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error(`[Admin] getPendingUsers Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch pending users." });
    }
};

/**
 * @desc Get specific user detail
 * @route GET /api/admin/users/:id
 * @access Private/Admin
 */
exports.getUserDetail = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(`[Admin] getUserDetail Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch user details." });
    }
};

/**
 * @desc Verify or Unverify a user
 * @route PATCH /api/admin/users/:id/verify
 * @access Private/Admin
 */
exports.verifyUser = async (req, res) => {
    try {
        const { isVerified } = req.body;
        
        if (typeof isVerified !== "boolean") {
            return res.status(400).json({ success: false, message: "isVerified status must be a boolean." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Create Notification for the user
        await Notification.create({
            recipient: user._id,
            type: 'VERIFICATION',
            message: isVerified 
                ? "Congratulations! Your profile has been verified." 
                : "Your profile verification status has been updated.",
            link: '/profile'
        });
        
        // Notify via socket for the bell icon
        socketService.notifyUser(user._id.toString(), "NEW_NOTIFICATION", {
            type: 'VERIFICATION',
            message: isVerified ? "Your profile has been verified!" : "Verification update."
        });

        res.status(200).json({ 
            success: true, 
            message: `User ${isVerified ? "verified" : "unverified"} successfully.`,
            data: user 
        });
    } catch (error) {
        console.error(`[Admin] verifyUser Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to update verification status." });
    }
};
