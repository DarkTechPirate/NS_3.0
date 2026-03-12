const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    getConversations,
    getMessages,
    sendMessage,
} = require("../controllers/conversationControllers");

router.get("/", protect(), getConversations);
router.get("/:id/messages", protect(), getMessages);
router.post("/:id/messages", protect(), sendMessage);

module.exports = router;
