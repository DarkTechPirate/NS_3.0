const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { runMatchEngine } = require('../services/matchEngine');
const { getMatches, expressInterest, getMatchDetail } = require('../controllers/matchControllers');

/**
 * @route   POST /api/matches/generate
 * @desc    Manually trigger the matching engine (Admin only)
 * @access  Private/Admin
 */
router.post('/generate', protect({ admin: true }), async (req, res) => {
  try {
    console.log(`[Admin] Match generation triggered by: ${req.user.fullname}`);
    
    // Run in background so the request doesn't timeout if there are many users
    runMatchEngine().catch(err => console.error('[MatchEngine] Manual run error:', err));
    
    res.status(202).json({ 
      success: true, 
      message: 'Match generation started in background' 
    });
  } catch (error) {
    console.error('[MatchRoutes] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to start match generation' });
  }
});

/**
 * @route   GET /api/matches
 * @desc    Get all matches for the current user with filtering
 * @access  Private
 */
router.get('/', protect(), getMatches);

/**
 * @route   POST /api/matches/:id/interest
 * @desc    Express interest in a match
 * @access  Private
 */
router.post('/:id/interest', protect(), expressInterest);

/**
 * @route   GET /api/matches/detail/:userId
 * @desc    Get detailed match profile
 * @access  Private
 */
router.get('/detail/:userId', protect(), getMatchDetail);

module.exports = router;
