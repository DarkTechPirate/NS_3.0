const express = require("express");
const router = express.Router();
const MessagingController = require("../controllers/MessagingController");
const MessagingAttachmentController = require("../controllers/MessagingAttachmentController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require('path');

// Multer storage for chat attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads/chat');
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Conversations
router.get("/conversations", protect(), MessagingController.getConversations);
router.post("/conversations/get-or-create", protect(), MessagingController.getOrCreateConversation);
router.put("/conversations/:conversationId/read", protect(), MessagingController.markAsRead);

// Messages
router.get("/conversations/:conversationId/messages", protect(), MessagingController.getMessages);
router.post("/messages", protect(), MessagingController.sendMessage);
router.post("/messages/upload", protect(), upload.single("file"), MessagingAttachmentController.uploadAttachment);

module.exports = router;
