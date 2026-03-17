const Notification = require("../models/Notification");

/**
 * @desc Get user notifications
 * @route GET /api/notifications
 * @access Private
 */
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("sender", "fullname profilePicture");

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error(`[NotificationController] getNotifications Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch notifications." });
    }
};

/**
 * @desc Mark notification as read
 * @route PATCH /api/notifications/:id/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error(`[NotificationController] markAsRead Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to mark notification as read." });
    }
};

/**
 * @desc Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 * @access Private
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
        console.error(`[NotificationController] markAllAsRead Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to mark all as read." });
    }
};
