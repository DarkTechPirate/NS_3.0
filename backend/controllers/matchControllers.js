const Match = require("../models/Match");
const Notification = require("../models/Notification");
const socketService = require("../services/socketService");
const mongoose = require("mongoose");

/**
 * @desc Get all matches for a user with optional filtering
 * @route GET /api/matches
 * @access Private
 */
exports.getMatches = async (req, res) => {
    try {
        const userId = req.user._id;
        const { community, education, location, diet, familyType } = req.query;

        // Build filtering for the matched user's details
        const matchFilter = {
            user: new mongoose.Types.ObjectId(userId),
            isDeleted: false
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

        const matches = await Match.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches
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

        // Verify that a match exists
        const match = await Match.findOne({ 
            user: requesterId, 
            matchedUser: userId,
            isDeleted: false 
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
