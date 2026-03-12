const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    getMatches,
    getMatchDetail,
    expressInterest,
    declineMatch,
    updateFamilyReview,
} = require("../controllers/matchControllers");

router.get("/", protect(), getMatches);
router.get("/:id", protect(), getMatchDetail);
router.post("/:id/interest", protect(), expressInterest);
router.post("/:id/decline", protect(), declineMatch);
router.patch("/:id/family-review", protect(), updateFamilyReview);

module.exports = router;
