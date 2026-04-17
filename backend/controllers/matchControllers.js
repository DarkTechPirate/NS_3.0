const Match = require("../models/Match");
const User = require("../models/userModel");
const Notification = require("../models/Notification");
const socketService = require("../services/socketService");
const mongoose = require("mongoose");
const {
    calculateScore,
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

        const requesterObjectId = new mongoose.Types.ObjectId(userId);

        // Build filtering for the matched user's details
        const matchFilter = {
            user: requesterObjectId,
            isDeleted: false,
        };

        // Aggregation to join with user details and relationship state
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
            { $unwind: "$matchedUserDetails" },
            {
                $lookup: {
                    from: "matches",
                    let: { matchedUserId: "$matchedUser" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user", "$$matchedUserId"] },
                                        { $eq: ["$matchedUser", requesterObjectId] },
                                        { $ne: ["$isDeleted", true] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                interestExpressed: 1,
                                mutualInterest: 1,
                            },
                        },
                    ],
                    as: "reverseMatch",
                },
            },
            {
                $addFields: {
                    interestExpressed: { $ifNull: ["$interestExpressed", false] },
                    interestedInYou: {
                        $ifNull: [{ $arrayElemAt: ["$reverseMatch.interestExpressed", 0] }, false],
                    },
                    reverseMutualInterest: {
                        $ifNull: [{ $arrayElemAt: ["$reverseMatch.mutualInterest", 0] }, false],
                    },
                    isCurrentCycle: {
                        $and: [
                            { $eq: ["$visibleInCycle", true] },
                            { $eq: ["$cycleKey", cycleKey] },
                        ],
                    },
                },
            },
            {
                $addFields: {
                    mutualInterest: {
                        $or: [
                            { $ifNull: ["$mutualInterest", false] },
                            "$reverseMutualInterest",
                            {
                                $and: ["$interestExpressed", "$interestedInYou"],
                            },
                        ],
                    },
                },
            },
            {
                $addFields: {
                    canMessage: "$mutualInterest",
                },
            },
            {
                $match: {
                    $or: [
                        { isCurrentCycle: true },
                        { interestExpressed: true },
                        { interestedInYou: true },
                        { mutualInterest: true },
                    ],
                },
            },
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

        // Prioritize mutual/incoming interest, then current cycle and score.
        pipeline.push({
            $sort: {
                mutualInterest: -1,
                interestedInYou: -1,
                interestExpressed: -1,
                isCurrentCycle: -1,
                score: -1,
            },
        });
        pipeline.push({
            $project: {
                reverseMatch: 0,
                reverseMutualInterest: 0,
            },
        });
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
        const now = new Date();

        const match = await Match.findOne({ _id: matchId, user: senderId, isDeleted: false }).populate("matchedUser");
        if (!match) {
            return res.status(404).json({ success: false, message: "Match not found." });
        }

        const recipientId = match.matchedUser._id;
        const senderUser = await User.findById(senderId).lean();
        const recipientUser = await User.findById(recipientId).lean();

        if (!senderUser || !recipientUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let reverseMatch = await Match.findOne({
            user: recipientId,
            matchedUser: senderId,
        });

        if (!reverseMatch) {
            const reverseScoreData = calculateScore(recipientUser, senderUser);
            reverseMatch = await Match.create({
                user: recipientId,
                matchedUser: senderId,
                score: reverseScoreData.score,
                compatibility: reverseScoreData.compatibility,
                matchReasons: reverseScoreData.reasons,
                isDeleted: false,
                visibleInCycle: false,
                cycleKey: null,
                lastShownAt: now,
            });
        } else if (reverseMatch.isDeleted) {
            reverseMatch.isDeleted = false;
            await reverseMatch.save();
        }

        const wasMutualBefore = Boolean(match.mutualInterest) || Boolean(reverseMatch.mutualInterest);
        const wasAlreadyExpressed = Boolean(match.interestExpressed);

        match.interestExpressed = true;
        if (!match.interestExpressedAt) {
            match.interestExpressedAt = now;
        }

        const isMutualNow = Boolean(reverseMatch.interestExpressed) || Boolean(reverseMatch.mutualInterest);

        if (isMutualNow) {
            match.mutualInterest = true;
            match.mutualInterestAt = match.mutualInterestAt || now;

            reverseMatch.mutualInterest = true;
            reverseMatch.mutualInterestAt = reverseMatch.mutualInterestAt || now;
            await reverseMatch.save();
        }

        await match.save();

        if (!isMutualNow && !wasAlreadyExpressed) {
            await Notification.create({
                recipient: recipientId,
                sender: senderId,
                type: "INTEREST",
                message: `${req.user.fullname} has expressed interest in your profile!`,
                link: `/match-detail/${senderId}`,
            });

            socketService.notifyUser(recipientId.toString(), "NEW_NOTIFICATION", {
                type: "INTEREST",
                message: `${req.user.fullname} expressed interest!`,
            });
        }

        if (isMutualNow && !wasMutualBefore) {
            await Notification.insertMany([
                {
                    recipient: senderId,
                    sender: recipientId,
                    type: "INTEREST",
                    message: `It's a mutual match with ${match.matchedUser.fullname}. You can now message each other.`,
                    link: `/messages?with=${recipientId}`,
                },
                {
                    recipient: recipientId,
                    sender: senderId,
                    type: "INTEREST",
                    message: `It's a mutual match with ${senderUser.fullname}. You can now message each other.`,
                    link: `/messages?with=${senderId}`,
                },
            ]);

            socketService.notifyUser(senderId.toString(), "NEW_NOTIFICATION", {
                type: "INTEREST",
                message: `Mutual interest confirmed with ${match.matchedUser.fullname}. Messaging is unlocked.`,
            });

            socketService.notifyUser(recipientId.toString(), "NEW_NOTIFICATION", {
                type: "INTEREST",
                message: `Mutual interest confirmed with ${senderUser.fullname}. Messaging is unlocked.`,
            });
        }

        res.status(200).json({
            success: true,
            message: isMutualNow
                ? "Mutual interest confirmed. Messaging is now enabled."
                : wasAlreadyExpressed
                    ? "Interest already sent. Waiting for the other user to respond."
                : "Interest expressed successfully. The other user has been notified.",
            data: {
                interestExpressed: true,
                mutualInterest: isMutualNow,
                canMessage: isMutualNow,
            },
        });
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

        const match = await Match.findOne({
            user: requesterId,
            matchedUser: userId,
            isDeleted: false,
        }).populate("matchedUser");

        if (!match) {
            return res.status(404).json({ success: false, message: "Match profile not found." });
        }

        const reverseMatch = await Match.findOne({
            user: userId,
            matchedUser: requesterId,
            isDeleted: false,
        }).select("interestExpressed mutualInterest");

        const interestedInYou = Boolean(reverseMatch?.interestExpressed);
        const mutualInterest =
            Boolean(match.mutualInterest) ||
            Boolean(reverseMatch?.mutualInterest) ||
            (Boolean(match.interestExpressed) && interestedInYou);

        const responseData = {
            ...match.toObject(),
            interestedInYou,
            mutualInterest,
            canMessage: mutualInterest,
        };

        res.status(200).json({
            success: true,
            data: responseData,
        });
    } catch (error) {
        console.error(`[MatchController] getMatchDetail Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch match detail." });
    }
};
