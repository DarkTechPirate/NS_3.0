const Match = require("../models/matchModel");
const User = require("../models/userModel");
const Conversation = require("../models/conversationModel");

// GET /api/matches — all matches for the logged-in user
exports.getMatches = async (req, res) => {
    try {
        const matches = await Match.find({ user: req.user._id })
            .populate(
                "matchedUser",
                "fullname age gender profilePicture personalDetails careerDetails familyDetails lifestyleDetails addresses profileImages"
            )
            .sort({ createdAt: -1 });

        const formatted = matches.map((m) => {
            const u = m.matchedUser;
            if (!u) return null;
            return {
                id: m._id,
                matchedUserId: u._id,
                name: u.fullname || "Unknown",
                age: u.age || (u.personalDetails?.dob ? Math.floor((Date.now() - new Date(u.personalDetails.dob).getTime()) / 3.15576e10) : null),
                gender: u.gender,
                location: u.careerDetails?.workLocation || u.addresses?.[0]?.city || "Not specified",
                height: u.personalDetails?.height || null,
                education: u.careerDetails?.education || null,
                profession: u.careerDetails?.profession || null,
                image: u.profilePicture
                    ? u.profilePicture.startsWith("http")
                        ? u.profilePicture
                        : `/uploads/${u.profilePicture}`
                    : null,
                profileImages: u.profileImages || [],
                isVerified: m.isVerified,
                compatibility: m.compatibility,
                timeline: m.timeline,
                status: m.status,
                tags: m.tags,
                matchReasons: m.matchReasons,
                considerations: m.considerations,
                familyShortlisted: m.familyShortlisted,
                familyFlagged: m.familyFlagged,
                familyNotes: m.familyNotes,
                family: {
                    father: u.familyDetails?.fatherName
                        ? `${u.familyDetails.fatherName}${u.familyDetails.fatherOccupation ? ", " + u.familyDetails.fatherOccupation : ""}`
                        : null,
                    mother: u.familyDetails?.motherName
                        ? `${u.familyDetails.motherName}${u.familyDetails.motherOccupation ? ", " + u.familyDetails.motherOccupation : ""}`
                        : null,
                    siblings: u.familyDetails?.siblings || null,
                    familyType: u.familyDetails?.familyType || null,
                    familyValues: u.familyDetails?.familyValues || null,
                },
                lifestyle: {
                    diet: u.lifestyleDetails?.diet || null,
                    drinking: u.lifestyleDetails?.drinking || null,
                    smoking: u.lifestyleDetails?.smoking || null,
                    hobbies: u.lifestyleDetails?.hobbies || [],
                },
                about: u.personalDetails?.about || null,
                religion: u.personalDetails?.religion || null,
                community: u.personalDetails?.community || null,
                motherTongue: u.personalDetails?.motherTongue || null,
                createdAt: m.createdAt,
            };
        }).filter(Boolean);

        res.json(formatted);
    } catch (error) {
        console.error("Get Matches Error:", error);
        res.status(500).json({ message: "Failed to fetch matches" });
    }
};

// GET /api/matches/:id — single match detail
exports.getMatchDetail = async (req, res) => {
    try {
        const match = await Match.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate(
            "matchedUser",
            "fullname age gender profilePicture personalDetails careerDetails familyDetails lifestyleDetails addresses profileImages"
        );

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        const u = match.matchedUser;

        res.json({
            id: match._id,
            matchedUserId: u._id,
            name: u.fullname || "Unknown",
            age: u.age || (u.personalDetails?.dob ? Math.floor((Date.now() - new Date(u.personalDetails.dob).getTime()) / 3.15576e10) : null),
            gender: u.gender,
            location: u.careerDetails?.workLocation || u.addresses?.[0]?.city || "Not specified",
            height: u.personalDetails?.height || null,
            education: u.careerDetails?.education || null,
            institution: u.careerDetails?.institution || null,
            profession: u.careerDetails?.profession || null,
            employer: u.careerDetails?.employer || null,
            income: u.careerDetails?.income || null,
            image: u.profilePicture
                ? u.profilePicture.startsWith("http")
                    ? u.profilePicture
                    : `/uploads/${u.profilePicture}`
                : null,
            profileImages: u.profileImages || [],
            isVerified: match.isVerified,
            compatibility: match.compatibility,
            timeline: match.timeline,
            status: match.status,
            tags: match.tags,
            matchReasons: match.matchReasons,
            considerations: match.considerations,
            family: {
                fatherName: u.familyDetails?.fatherName || null,
                fatherOccupation: u.familyDetails?.fatherOccupation || null,
                motherName: u.familyDetails?.motherName || null,
                motherOccupation: u.familyDetails?.motherOccupation || null,
                siblings: u.familyDetails?.siblings || null,
                familyType: u.familyDetails?.familyType || null,
                familyValues: u.familyDetails?.familyValues || null,
                familyLocation: u.familyDetails?.familyLocation || null,
            },
            lifestyle: {
                diet: u.lifestyleDetails?.diet || null,
                drinking: u.lifestyleDetails?.drinking || null,
                smoking: u.lifestyleDetails?.smoking || null,
                hobbies: u.lifestyleDetails?.hobbies || [],
                livingArrangement: u.lifestyleDetails?.livingArrangement || null,
            },
            about: u.personalDetails?.about || null,
            religion: u.personalDetails?.religion || null,
            community: u.personalDetails?.community || null,
            caste: u.personalDetails?.caste || null,
            motherTongue: u.personalDetails?.motherTongue || null,
            maritalStatus: u.personalDetails?.maritalStatus || null,
            addresses: u.addresses || [],
            createdAt: match.createdAt,
        });
    } catch (error) {
        console.error("Get Match Detail Error:", error);
        res.status(500).json({ message: "Failed to fetch match detail" });
    }
};

// POST /api/matches/:id/interest — express interest in a match
exports.expressInterest = async (req, res) => {
    try {
        const match = await Match.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        match.status = "interested";
        await match.save();

        // Check if the other user has also expressed interest (mutual match)
        const reverseMatch = await Match.findOne({
            user: match.matchedUser,
            matchedUser: req.user._id,
            status: "interested",
        });

        if (reverseMatch) {
            // Mutual interest — update both to "mutual" and create a conversation
            match.status = "mutual";
            reverseMatch.status = "mutual";
            await match.save();
            await reverseMatch.save();

            // Create a conversation between them
            const existingConvo = await Conversation.findOne({
                participants: { $all: [req.user._id, match.matchedUser] },
            });

            if (!existingConvo) {
                await Conversation.create({
                    participants: [req.user._id, match.matchedUser],
                    match: match._id,
                });
            }

            return res.json({
                success: true,
                message: "It's a mutual match! You can now message each other.",
                status: "mutual",
            });
        }

        res.json({
            success: true,
            message: "Interest expressed successfully",
            status: "interested",
        });
    } catch (error) {
        console.error("Express Interest Error:", error);
        res.status(500).json({ message: "Failed to express interest" });
    }
};

// POST /api/matches/:id/decline — decline a match
exports.declineMatch = async (req, res) => {
    try {
        const match = await Match.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        match.status = "declined";
        await match.save();

        res.json({
            success: true,
            message: "Match declined",
            status: "declined",
        });
    } catch (error) {
        console.error("Decline Match Error:", error);
        res.status(500).json({ message: "Failed to decline match" });
    }
};

// PATCH /api/matches/:id/family-review — save shortlist, flag, notes from family view
exports.updateFamilyReview = async (req, res) => {
    try {
        const match = await Match.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        const { familyShortlisted, familyFlagged, familyNotes } = req.body;

        if (familyShortlisted !== undefined) match.familyShortlisted = familyShortlisted;
        if (familyFlagged !== undefined) match.familyFlagged = familyFlagged;
        if (familyNotes !== undefined) match.familyNotes = familyNotes;

        await match.save();

        res.json({
            success: true,
            familyShortlisted: match.familyShortlisted,
            familyFlagged: match.familyFlagged,
            familyNotes: match.familyNotes,
        });
    } catch (error) {
        console.error("Update Family Review Error:", error);
        res.status(500).json({ message: "Failed to update family review" });
    }
};
