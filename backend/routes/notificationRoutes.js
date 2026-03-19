const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    getNotifications,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationControllers");

router.get("/", protect(), getNotifications);
router.patch("/read-all", protect(), markAllAsRead);
router.patch("/:id/read", protect(), markAsRead);

module.exports = router;
