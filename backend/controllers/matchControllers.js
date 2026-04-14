const Match = require("../models/Match");
const User = require("../models/userModel");
const Notification = require("../models/Notification");
const socketService = require("../services/socketService");
const mongoose = require("mongoose");
const {
    generateVisibleMatchesForUser,
    getCycleKey,
    getNextRefreshAt,
    MATCH_CONFIG,
} = require("../services/matchEngine");

const toOppositeGender = (gender) => {
    if (gender === "Male") return "Female";
    if (gender === "Female") return "Male";
    return null;
};

/**
 * @desc Get all matches for a user with optional filtering
 * @route GET /api/matches
 * @access Private
 */
exports.getMatches = async (req, res) => {
    try {
        const userId = req.user._id;
        const { community, education, location, diet, familyType } = req.query;

        const now = new Date();
        await generateVisibleMatchesForUser(userId, { now });

        const cycleKey = getCycleKey(now);

        // Build filtering for the matched user's details
        const matchFilter = {
            user: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
            visibleInCycle: true,
            cycleKey,
        };

        // Aggregation to join with user details and filter
        const pipeline = [
            { $match: matchFilter },
            {
                $lookup: {
                    from: "users",
                    localField: "matchedUser",
                    foreignField: "_id",
                    as: "matchedUserDetails"
                }
            },
            { $unwind: "$matchedUserDetails" }
        ];

        // Apply filters to joined user data
        const dynamicFilters = {};
        if (community && community !== "Any" && community !== "Community") {
            dynamicFilters["matchedUserDetails.personalDetails.community"] = community;
        }
        if (education && education !== "Education") {
            dynamicFilters["matchedUserDetails.careerDetails.education"] = education;
        }
        if (location && location !== "Location") {
            // Check both city and state if they match the location string
            dynamicFilters["$or"] = [
                { "matchedUserDetails.addresses.city": location },
                { "matchedUserDetails.addresses.state": location }
            ];
        }
        if (diet && diet !== "Lifestyle") {
            dynamicFilters["matchedUserDetails.lifestyleDetails.diet"] = diet;
        }
        if (familyType && familyType !== "Any" && familyType !== "Family Structure") {
            dynamicFilters["matchedUserDetails.familyDetails.familyType"] = familyType;
        }

        if (Object.keys(dynamicFilters).length > 0) {
            pipeline.push({ $match: dynamicFilters });
        }

        // Sort by score descending
        pipeline.push({ $sort: { score: -1 } });
        pipeline.push({ $limit: MATCH_CONFIG.MAX_VISIBLE_MATCHES });

        const matches = await Match.aggregate(pipeline);

        let insights = null;
        if (matches.length === 0) {
            const requester = await User.findById(userId).select("gender").lean();
            const oppositeGender = toOppositeGender(requester?.gender);

            if (!oppositeGender) {
                insights = {
                    reason: "MISSING_GENDER",
                    message: "Set your gender in profile to receive opposite-gender matches.",
                };
            } else {
                const [oppositeTotal, oppositeVerified] = await Promise.all([
                    User.countDocuments({
                        $or: [{ role: "user" }, { role: { $exists: false } }],
                        gender: oppositeGender,
                        _id: { $ne: userId },
                    }),
                    User.countDocuments({
                        $or: [{ role: "user" }, { role: { $exists: false } }],
                        gender: oppositeGender,
                        isVerified: true,
                        _id: { $ne: userId },
                    }),
                ]);

                if (oppositeTotal === 0) {
                    insights = {
                        reason: "NO_OPPOSITE_PROFILES",
                        message: "No opposite-gender profiles are available yet.",
                        oppositeGender,
                        oppositeTotal,
                        oppositeVerified,
                    };
                } else if (oppositeVerified === 0) {
                    insights = {
                        reason: "NO_VERIFIED_OPPOSITE_PROFILES",
                        message: "Opposite-gender profiles exist but none are verified yet.",
                        oppositeGender,
                        oppositeTotal,
                        oppositeVerified,
                    };
                } else {
                    insights = {
                        reason: "NO_MATCHES_THIS_CYCLE",
                        message: "No profiles qualified this cycle. Match feed will refresh shortly.",
                        oppositeGender,
                        oppositeTotal,
                        oppositeVerified,
                    };
                }
            }
        }

        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches,
            rotation: {
                cycleKey,
                nextRefreshAt: getNextRefreshAt(now).toISOString(),
                intervalMinutes: MATCH_CONFIG.ROTATION_MINUTES,
                maxVisible: MATCH_CONFIG.MAX_VISIBLE_MATCHES,
                noRepeatDays: MATCH_CONFIG.NO_REPEAT_DAYS,
            },
            insights,
        });
    } catch (error) {
        console.error(`[MatchController] getMatches Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch matches." });
    }
};

/**
 * @desc Express interest in a match
 * @route POST /api/matches/:id/interest
 * @access Private
 */
exports.expressInterest = async (req, res) => {
    try {
        const matchId = req.params.id;
        const senderId = req.user._id;

        const match = await Match.findOne({ _id: matchId, user: senderId }).populate("matchedUser");
        if (!match) {
            return res.status(404).json({ success: false, message: "Match not found." });
        }

        const recipientId = match.matchedUser._id;

        // Create Notification for the recipient
        await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type: 'INTEREST',
            message: `${req.user.fullname} has expressed interest in your profile!`,
            link: `/match-detail?id=${senderId}`
        });

        // Notify via socket for the bell icon
        socketService.notifyUser(recipientId.toString(), "NEW_NOTIFICATION", {
            type: 'INTEREST',
            message: `${req.user.fullname} expressed interest!`
        });

        res.status(200).json({ success: true, message: "Interest expressed successfully." });
    } catch (error) {
        console.error(`[MatchController] expressInterest Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to express interest." });
    }
};

/**
 * @desc Get detailed match profile
 * @route GET /api/matches/detail/:userId
 * @access Private
 */
exports.getMatchDetail = async (req, res) => {
    try {
        const { userId } = req.params;
        const requesterId = req.user._id;
        const now = new Date();

        await generateVisibleMatchesForUser(requesterId, { now });

        const cycleKey = getCycleKey(now);

        // Only allow detail view for the currently visible rotating set.
        const match = await Match.findOne({ 
            user: requesterId, 
            matchedUser: userId,
            isDeleted: false,
            visibleInCycle: true,
            cycleKey,
        }).populate("matchedUser");

        if (!match) {
            return res.status(404).json({ success: false, message: "Match profile not found." });
        }

        res.status(200).json({
            success: true,
            data: match
        });
    } catch (error) {
        console.error(`[MatchController] getMatchDetail Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch match detail." });
    }
};
