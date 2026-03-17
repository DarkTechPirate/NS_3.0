const User = require('../models/userModel');
const Match = require('../models/Match');

/**
 * Calculates a compatibility score between two users.
 * @param {Object} user1 
 * @param {Object} user2 
 * @returns {Object} { score, compatibility, reasons }
 */
const calculateScore = (user1, user2) => {
  let score = 0;
  const reasons = [];

  // 1. Religion/Community (Must match or be open)
  const religion1 = user1.personalDetails?.religion;
  const religion2 = user2.personalDetails?.religion;
  const community1 = user1.personalDetails?.community;
  const community2 = user2.personalDetails?.community;

  if (religion1 === religion2) {
    score += 20;
    reasons.push(`Shared religious background (${religion1})`);
    if (community1 === community2) {
      score += 10;
      reasons.push(`Same community: ${community1}`);
    }
  } else if (religion1 === 'Other' || religion2 === 'Other' || !religion1 || !religion2) {
    score += 10;
    reasons.push('Open to different religious backgrounds');
  }

  // 2. Age Difference
  const age1 = user1.age;
  const age2 = user2.age;
  if (age1 && age2) {
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 3) {
      score += 20;
      reasons.push('Perfect age compatibility');
    } else if (ageDiff <= 7) {
      score += 10;
      reasons.push('Compatible age difference');
    }
  }

  // 3. Education
  const edu1 = user1.careerDetails?.education;
  const edu2 = user2.careerDetails?.education;
  if (edu1 && edu2 && edu1 === edu2) {
    score += 15;
    reasons.push(`Similar educational background: ${edu1}`);
  }

  // 4. Location
  const city1 = user1.addresses?.[0]?.city;
  const city2 = user2.addresses?.[0]?.city;
  const state1 = user1.addresses?.[0]?.state;
  const state2 = user2.addresses?.[0]?.state;

  if (city1 && city2 && city1 === city2) {
    score += 20;
    reasons.push(`Based in the same city: ${city1}`);
  } else if (state1 && state2 && state1 === state2) {
    score += 10;
    reasons.push(`Both from ${state1}`);
  }

  // 5. Height (Simplified)
  const h1 = parseInt(user1.personalDetails?.height);
  const h2 = parseInt(user2.personalDetails?.height);
  if (!isNaN(h1) && !isNaN(h2)) {
    const hDiff = Math.abs(h1 - h2);
    if (hDiff <= 10) {
      score += 10;
      reasons.push('Compatible height');
    }
  }

  // Determine compatibility level
  let compatibility = 'Developing';
  if (score >= 70) compatibility = 'Strong';
  else if (score >= 40) compatibility = 'Moderate';

  return { score, compatibility, reasons };
};

/**
 * Generates matches for a specific user.
 * @param {string} userId 
 */
const generateMatchesForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isVerified) return;

  const oppositeGender = user.gender === 'Male' ? 'Female' : 'Male';
  
  const potentialMatches = await User.find({
    gender: oppositeGender,
    isVerified: true,
    _id: { $ne: userId }
  });

  const matchPromises = potentialMatches.map(async (potential) => {
    const { score, compatibility, reasons } = calculateScore(user, potential);
    
    // Only save matches with at least 'Moderate' compatibility if needed, 
    // or save all for variety. Let's save if score > 30.
    if (score >= 30) {
      return Match.findOneAndUpdate(
        { user: userId, matchedUser: potential._id },
        { 
          score, 
          compatibility, 
          matchReasons: reasons,
          isDeleted: false 
        },
        { upsert: true, new: true }
      );
    }
  });

  await Promise.all(matchPromises);
};

/**
 * Runs the engine for all verified users.
 */
const runMatchEngine = async () => {
  const verifiedUsers = await User.find({ isVerified: true });
  console.log(`[MatchEngine] Running for ${verifiedUsers.length} verified users...`);

  for (const user of verifiedUsers) {
    await generateMatchesForUser(user._id);
  }
  
  console.log('[MatchEngine] Finished daily match generation.');
};

module.exports = {
  calculateScore,
  generateMatchesForUser,
  runMatchEngine
};
