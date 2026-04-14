const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    getAllUsers,
    getPendingUsers,
    getUserDetail,
    verifyUser
} = require("../controllers/adminControllers");

// All routes here require admin privileges
router.get("/users", protect({ admin: true }), getAllUsers);
router.get("/pending", protect({ admin: true }), getPendingUsers);
router.get("/users/:id", protect({ admin: true }), getUserDetail);
router.patch("/users/:id/verify", protect({ admin: true }), verifyUser);

module.exports = router;
