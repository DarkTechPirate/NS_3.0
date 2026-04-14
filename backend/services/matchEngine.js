const User = require('../models/userModel');
const Match = require('../models/Match');

const MAX_VISIBLE_MATCHES = Math.max(1, Number(process.env.MATCH_MAX_VISIBLE || 3));
const NO_REPEAT_DAYS = Math.max(1, Number(process.env.MATCH_NO_REPEAT_DAYS || 7));
const ROTATION_MINUTES = Math.max(1, Number(process.env.MATCH_ROTATION_MINUTES || 1));
const MIN_MATCH_SCORE = Math.max(0, Number(process.env.MATCH_MIN_SCORE || 30));
const ALLOW_RECENT_REPEAT_FALLBACK = process.env.MATCH_ALLOW_RECENT_REPEAT_FALLBACK !== 'false';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const COMPATIBILITY_RANK = {
  Strong: 3,
  Moderate: 2,
  Developing: 1,
};

const getRotationWindowMs = () => ROTATION_MINUTES * MINUTE_MS;

const getCycleKey = (at = new Date()) => `cycle-${Math.floor(at.getTime() / getRotationWindowMs())}`;

const getNextRefreshAt = (at = new Date()) => {
  const windowMs = getRotationWindowMs();
  return new Date(Math.ceil((at.getTime() + 1) / windowMs) * windowMs);
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const toOppositeGender = (gender) => {
  if (gender === 'Male') return 'Female';
  if (gender === 'Female') return 'Male';
  return null;
};

const parseHeightToCm = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const normalized = String(value).trim().toLowerCase();

  if (!normalized) return null;

  const feetInches = normalized.match(/(\d+)\s*'?\s*(\d+)?\s*"?/);
  if (feetInches && normalized.includes("'")) {
    const feet = Number(feetInches[1]);
    const inches = Number(feetInches[2] || 0);
    return Math.round((feet * 12 + inches) * 2.54);
  }

  const numeric = normalized.match(/\d+(\.\d+)?/);
  if (!numeric) return null;

  const parsed = Number(numeric[0]);
  if (Number.isNaN(parsed)) return null;

  if (parsed <= 8) {
    return Math.round(parsed * 30.48);
  }

  return Math.round(parsed);
};

const pushReason = (reasons, reason) => {
  if (reason && !reasons.includes(reason) && reasons.length < 6) {
    reasons.push(reason);
  }
};

const compareCandidates = (a, b) => {
  if (b.score !== a.score) return b.score - a.score;

  const compatibilityDelta =
    (COMPATIBILITY_RANK[b.compatibility] || 0) - (COMPATIBILITY_RANK[a.compatibility] || 0);
  if (compatibilityDelta !== 0) return compatibilityDelta;

  return (a.fullname || '').localeCompare(b.fullname || '');
};

const compareByOldestAndScore = (a, b) => {
  const aLastShown = a.lastShownAt ? new Date(a.lastShownAt).getTime() : 0;
  const bLastShown = b.lastShownAt ? new Date(b.lastShownAt).getTime() : 0;

  if (aLastShown !== bLastShown) return aLastShown - bLastShown;
  return compareCandidates(a, b);
};

const appendUntilLimit = (target, source, limit, seenIds) => {
  for (const candidate of source) {
    if (target.length >= limit) break;

    const key = String(candidate.matchedUser);
    if (seenIds.has(key)) continue;

    seenIds.add(key);
    target.push(candidate);
  }
};

/**
 * Calculates a compatibility score between two users.
 * @param {Object} user1 
 * @param {Object} user2 
 * @returns {Object} { score, compatibility, reasons }
 */
const calculateScore = (user1, user2) => {
  let score = 0;
  const reasons = [];

  // 1. Religion/Community
  const religion1 = normalizeString(user1.personalDetails?.religion);
  const religion2 = normalizeString(user2.personalDetails?.religion);
  const community1 = normalizeString(user1.personalDetails?.community);
  const community2 = normalizeString(user2.personalDetails?.community);

  if (religion1 && religion2 && religion1 === religion2) {
    score += 18;
    pushReason(reasons, `Shared religious background (${user1.personalDetails?.religion})`);
  } else if (!religion1 || !religion2 || religion1 === 'other' || religion2 === 'other') {
    score += 8;
    pushReason(reasons, 'Flexible on religious background');
  }

  if (community1 && community2 && community1 === community2) {
    score += 10;
    pushReason(reasons, `Same community (${user1.personalDetails?.community})`);
  }

  // 2. Age Difference
  const age1 = user1.age;
  const age2 = user2.age;
  if (age1 && age2) {
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 2) {
      score += 18;
      pushReason(reasons, 'Very close age match');
    } else if (ageDiff <= 5) {
      score += 12;
      pushReason(reasons, 'Comfortable age compatibility');
    } else if (ageDiff <= 8) {
      score += 6;
    }
  }

  // 3. Education
  const edu1 = normalizeString(user1.careerDetails?.education);
  const edu2 = normalizeString(user2.careerDetails?.education);
  if (edu1 && edu2 && edu1 === edu2) {
    score += 12;
    pushReason(reasons, `Similar educational background (${user1.careerDetails?.education})`);
  }

  // 4. Location
  const city1 = normalizeString(user1.addresses?.[0]?.city);
  const city2 = normalizeString(user2.addresses?.[0]?.city);
  const state1 = normalizeString(user1.addresses?.[0]?.state);
  const state2 = normalizeString(user2.addresses?.[0]?.state);

  if (city1 && city2 && city1 === city2) {
    score += 18;
    pushReason(reasons, `Based in the same city (${user1.addresses?.[0]?.city})`);
  } else if (state1 && state2 && state1 === state2) {
    score += 10;
    pushReason(reasons, `Same state preference (${user1.addresses?.[0]?.state})`);
  }

  // 5. Mother tongue
  const tongue1 = normalizeString(user1.personalDetails?.motherTongue);
  const tongue2 = normalizeString(user2.personalDetails?.motherTongue);
  if (tongue1 && tongue2 && tongue1 === tongue2) {
    score += 8;
    pushReason(reasons, `Shared mother tongue (${user1.personalDetails?.motherTongue})`);
  }

  // 6. Lifestyle alignment
  const diet1 = normalizeString(user1.lifestyleDetails?.diet);
  const diet2 = normalizeString(user2.lifestyleDetails?.diet);
  if (diet1 && diet2 && diet1 === diet2) {
    score += 8;
    pushReason(reasons, `Matching dietary preference (${user1.lifestyleDetails?.diet})`);
  }

  // 7. Family values alignment
  const familyType1 = normalizeString(user1.familyDetails?.familyType);
  const familyType2 = normalizeString(user2.familyDetails?.familyType);
  if (familyType1 && familyType2 && familyType1 === familyType2) {
    score += 7;
    pushReason(reasons, `Both prefer ${user1.familyDetails?.familyType} family structure`);
  }

  // 8. Height compatibility
  const h1 = parseHeightToCm(user1.personalDetails?.height);
  const h2 = parseHeightToCm(user2.personalDetails?.height);
  if (h1 !== null && h2 !== null) {
    const hDiff = Math.abs(h1 - h2);
    if (hDiff <= 8) {
      score += 8;
      pushReason(reasons, 'Comfortable height compatibility');
    } else if (hDiff <= 14) {
      score += 4;
    }
  }

  // Determine compatibility level
  let compatibility = 'Developing';
  if (score >= 70) compatibility = 'Strong';
  else if (score >= 45) compatibility = 'Moderate';

  if (reasons.length === 0) {
    reasons.push('Core profile values are reasonably aligned');
  }

  return { score, compatibility, reasons };
};

/**
 * Fetches currently visible matches for a user in a cycle.
 */
const getVisibleMatchesForCycle = async (userId, cycleKey) => {
  return Match.find({
    user: userId,
    isDeleted: false,
    visibleInCycle: true,
    cycleKey,
  })
    .sort({ score: -1, updatedAt: 1 })
    .limit(MAX_VISIBLE_MATCHES);
};

/**
 * Generates the visible top matches for a specific user and cycle.
 * @param {string|ObjectId} userId
 * @param {Object} [options]
 */
const generateVisibleMatchesForUser = async (userId, options = {}) => {
  const now = options.now instanceof Date ? options.now : new Date();
  const forceRefresh = Boolean(options.forceRefresh);
  const cycleKey = getCycleKey(now);

  if (!forceRefresh) {
    const existingCycleMatches = await getVisibleMatchesForCycle(userId, cycleKey);
    if (existingCycleMatches.length > 0) {
      return existingCycleMatches;
    }
  }

  const user = await User.findById(userId).lean();
  if (!user) return [];

  const oppositeGender = toOppositeGender(user.gender);
  if (!oppositeGender) {
    await Match.updateMany({ user: userId, visibleInCycle: true }, { $set: { visibleInCycle: false } });
    return [];
  }

  const potentialMatches = await User.find({
    role: 'user',
    gender: oppositeGender,
    isVerified: true,
    _id: { $ne: userId },
  }).lean();

  if (!potentialMatches.length) {
    await Match.updateMany({ user: userId, visibleInCycle: true }, { $set: { visibleInCycle: false } });
    return [];
  }

  const previousMatches = await Match.find({
    user: userId,
    matchedUser: { $in: potentialMatches.map((candidate) => candidate._id) },
  })
    .select('matchedUser lastShownAt')
    .lean();

  const previousMatchMap = new Map(
    previousMatches.map((matchDoc) => [matchDoc.matchedUser.toString(), matchDoc])
  );

  const cutoff = new Date(now.getTime() - NO_REPEAT_DAYS * DAY_MS);
  const candidates = [];

  for (const potential of potentialMatches) {
    const { score, compatibility, reasons } = calculateScore(user, potential);
    const previous = previousMatchMap.get(potential._id.toString());
    const lastShownAt = previous?.lastShownAt ? new Date(previous.lastShownAt) : null;
    const recentlyShown = Boolean(lastShownAt && lastShownAt > cutoff);

    candidates.push({
      matchedUser: potential._id,
      score,
      compatibility,
      matchReasons: reasons,
      fullname: potential.fullname || '',
      lastShownAt,
      recentlyShown,
    });
  }

  const highScoreFresh = candidates
    .filter((candidate) => candidate.score >= MIN_MATCH_SCORE && !candidate.recentlyShown)
    .sort(compareCandidates);

  const lowScoreFresh = candidates
    .filter((candidate) => candidate.score < MIN_MATCH_SCORE && !candidate.recentlyShown)
    .sort(compareCandidates);

  const highScoreRecent = candidates
    .filter((candidate) => candidate.score >= MIN_MATCH_SCORE && candidate.recentlyShown)
    .sort(compareByOldestAndScore);

  const lowScoreRecent = candidates
    .filter((candidate) => candidate.score < MIN_MATCH_SCORE && candidate.recentlyShown)
    .sort(compareByOldestAndScore);

  const selected = [];
  const selectedIds = new Set();

  appendUntilLimit(selected, highScoreFresh, MAX_VISIBLE_MATCHES, selectedIds);
  appendUntilLimit(selected, lowScoreFresh, MAX_VISIBLE_MATCHES, selectedIds);

  if (ALLOW_RECENT_REPEAT_FALLBACK) {
    appendUntilLimit(selected, highScoreRecent, MAX_VISIBLE_MATCHES, selectedIds);
    appendUntilLimit(selected, lowScoreRecent, MAX_VISIBLE_MATCHES, selectedIds);
  }

  await Match.updateMany({ user: userId, visibleInCycle: true }, { $set: { visibleInCycle: false } });

  if (!selected.length) {
    return [];
  }

  await Match.bulkWrite(
    selected.map((candidate) => ({
      updateOne: {
        filter: { user: userId, matchedUser: candidate.matchedUser },
        update: {
          $set: {
            user: userId,
            matchedUser: candidate.matchedUser,
            score: candidate.score,
            compatibility: candidate.compatibility,
            matchReasons: candidate.matchReasons,
            isDeleted: false,
            visibleInCycle: true,
            cycleKey,
            lastShownAt: now,
          },
        },
        upsert: true,
      },
    }))
  );

  return getVisibleMatchesForCycle(userId, cycleKey);
};

/**
 * Runs the engine for all verified users to maintain rotating match batches.
 */
const runMatchEngine = async () => {
  const now = new Date();
  const cycleKey = getCycleKey(now);
  const verifiedUsers = await User.find({ isVerified: true }).select('_id');
  console.log(
    `[MatchEngine] Running rotation for ${verifiedUsers.length} verified users (cycle ${cycleKey}).`
  );

  for (const user of verifiedUsers) {
    await generateVisibleMatchesForUser(user._id, { now });
  }
  
  console.log('[MatchEngine] Finished rotating match generation.');
};

module.exports = {
  calculateScore,
  generateVisibleMatchesForUser,
  runMatchEngine,
  getCycleKey,
  getNextRefreshAt,
  getRotationWindowMs,
  MATCH_CONFIG: {
    MAX_VISIBLE_MATCHES,
    NO_REPEAT_DAYS,
    ROTATION_MINUTES,
    MIN_MATCH_SCORE,
    ALLOW_RECENT_REPEAT_FALLBACK,
  },
};
