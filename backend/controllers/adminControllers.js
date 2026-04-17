const User = require("../models/userModel");
const Notification = require("../models/Notification");
const Match = require("../models/Match");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const socketService = require("../services/socketService");

const getPrimaryAddress = (user) => {
    if (!Array.isArray(user?.addresses) || user.addresses.length === 0) {
        return null;
    }

    return user.addresses.find((address) => address?.primary) || user.addresses[0] || null;
};

const getUserCity = (user) => {
    const primaryAddress = getPrimaryAddress(user);
    return user?.personalDetails?.city || primaryAddress?.city || "Unknown";
};

const getUserState = (user) => {
    const primaryAddress = getPrimaryAddress(user);
    return primaryAddress?.state || "Unknown";
};

const incrementCounter = (counter, key) => {
    if (!key) return;
    const normalized = String(key).trim() || "Unknown";
    counter[normalized] = (counter[normalized] || 0) + 1;
};

const toTopList = (counter, limit = 10) =>
    Object.entries(counter)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

/**
 * @desc Get all pending users (isVerified: false)
 * @route GET /api/admin/pending
 * @access Private/Admin
 */
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ isVerified: false, role: "user" }).select("-password");
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error(`[Admin] getPendingUsers Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch pending users." });
    }
};

/**
 * @desc Get all users for admin overview
 * @route GET /api/admin/users
 * @access Private/Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error(`[Admin] getAllUsers Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
    }
};

/**
 * @desc Get specific user detail
 * @route GET /api/admin/users/:id
 * @access Private/Admin
 */
exports.getUserDetail = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(`[Admin] getUserDetail Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch user details." });
    }
};

/**
 * @desc Verify or Unverify a user
 * @route PATCH /api/admin/users/:id/verify
 * @access Private/Admin
 */
exports.verifyUser = async (req, res) => {
    try {
        const { isVerified } = req.body;
        
        if (typeof isVerified !== "boolean") {
            return res.status(400).json({ success: false, message: "isVerified status must be a boolean." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Create Notification for the user
        await Notification.create({
            recipient: user._id,
            type: 'VERIFICATION',
            message: isVerified 
                ? "Congratulations! Your profile has been verified." 
                : "Your profile verification status has been updated.",
            link: '/profile'
        });
        
        // Notify via socket for the bell icon
        socketService.notifyUser(user._id.toString(), "NEW_NOTIFICATION", {
            type: 'VERIFICATION',
            message: isVerified ? "Your profile has been verified!" : "Verification update."
        });

        res.status(200).json({ 
            success: true, 
            message: `User ${isVerified ? "verified" : "unverified"} successfully.`,
            data: user 
        });
    } catch (error) {
        console.error(`[Admin] verifyUser Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to update verification status." });
    }
};

/**
 * @desc Get admin analytics for dashboard screens
 * @route GET /api/admin/insights
 * @access Private/Admin
 */
exports.getAdminInsights = async (req, res) => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            users,
            totalMatches,
            matchesLast7Days,
            recentMatches,
            compatibilityBreakdown,
            totalConversations,
            conversationsLast7Days,
            totalMessages,
            messagesLast24Hours,
            totalNotifications,
            notificationTypeBreakdown,
        ] = await Promise.all([
            User.find({ role: "user" }).select("fullname email isVerified profilePicture profileImages addresses personalDetails careerDetails loginStats createdAt"),
            Match.countDocuments({}),
            Match.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            Match.find({})
                .sort({ createdAt: -1 })
                .limit(12)
                .populate("user", "fullname addresses personalDetails")
                .populate("matchedUser", "fullname addresses personalDetails"),
            Match.aggregate([
                {
                    $group: {
                        _id: "$compatibility",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Conversation.countDocuments({}),
            Conversation.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            Message.countDocuments({ isDeleted: { $ne: true } }),
            Message.countDocuments({
                isDeleted: { $ne: true },
                createdAt: { $gte: oneDayAgo },
            }),
            Notification.countDocuments({}),
            Notification.aggregate([
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const totalProfiles = users.length;
        const verifiedProfiles = users.filter((user) => user.isVerified).length;
        const pendingProfiles = totalProfiles - verifiedProfiles;
        const profilesWithPhotos = users.filter(
            (user) => Boolean(user.profilePicture) || (Array.isArray(user.profileImages) && user.profileImages.length > 0)
        ).length;

        const cityCounter = {};
        const stateCounter = {};
        const loginCityCounter = {};
        const loginLocationCounter = {};

        let usersLoggedIn = 0;
        let totalLoginEvents = 0;
        let loginsLast7Days = 0;
        let activeUsersLast30Days = 0;

        const recentLoginUsers = [];

        users.forEach((user) => {
            const city = getUserCity(user);
            const state = getUserState(user);

            incrementCounter(cityCounter, city);
            incrementCounter(stateCounter, state);

            const loginCount = Number(user?.loginStats?.loginCount || 0);
            totalLoginEvents += loginCount;

            const lastLoginAt = user?.loginStats?.lastLoginAt ? new Date(user.loginStats.lastLoginAt) : null;
            const lastLoginLocation = user?.loginStats?.lastLoginLocation || city;

            if (loginCount > 0) {
                usersLoggedIn += 1;
                incrementCounter(loginCityCounter, city);
                incrementCounter(loginLocationCounter, lastLoginLocation || city);
            }

            if (lastLoginAt) {
                if (lastLoginAt >= sevenDaysAgo) {
                    loginsLast7Days += 1;
                }

                if (lastLoginAt >= thirtyDaysAgo) {
                    activeUsersLast30Days += 1;
                }

                recentLoginUsers.push({
                    id: user._id,
                    fullname: user.fullname || "Member",
                    email: user.email || "",
                    lastLoginAt,
                    loginCount,
                    city,
                    location: lastLoginLocation || city,
                    ip: user?.loginStats?.lastLoginIp || "unknown",
                    isVerified: Boolean(user.isVerified),
                });
            }
        });

        recentLoginUsers.sort((a, b) => b.lastLoginAt - a.lastLoginAt);

        const compatibilityMap = {
            Strong: 0,
            Moderate: 0,
            Developing: 0,
        };

        compatibilityBreakdown.forEach((entry) => {
            if (!entry?._id) return;
            compatibilityMap[entry._id] = entry.count;
        });

        const recentMatchRows = recentMatches.map((match) => ({
            id: match._id,
            compatibility: match.compatibility || "Moderate",
            createdAt: match.createdAt,
            userName: match?.user?.fullname || "Member",
            userCity: getUserCity(match?.user),
            matchedUserName: match?.matchedUser?.fullname || "Member",
            matchedUserCity: getUserCity(match?.matchedUser),
        }));

        const notificationBreakdown = notificationTypeBreakdown
            .map((entry) => ({
                label: entry?._id || "SYSTEM",
                count: entry?.count || 0,
            }))
            .sort((a, b) => b.count - a.count);

        res.status(200).json({
            success: true,
            data: {
                generatedAt: now,
                screens: {
                    profiles: {
                        totalProfiles,
                        verifiedProfiles,
                        pendingProfiles,
                        profilesWithPhotos,
                    },
                    matches: {
                        totalMatches,
                        matchesLast7Days,
                        compatibilityBreakdown: compatibilityMap,
                        recentMatches: recentMatchRows,
                    },
                    usage: {
                        totalConversations,
                        conversationsLast7Days,
                        totalMessages,
                        messagesLast24Hours,
                        totalNotifications,
                        averageMessagesPerConversation:
                            totalConversations > 0 ? Number((totalMessages / totalConversations).toFixed(2)) : 0,
                        notificationTypeBreakdown: notificationBreakdown,
                    },
                    logins: {
                        totalLoginEvents,
                        usersLoggedIn,
                        loginsLast7Days,
                        activeUsersLast30Days,
                        recentLoginUsers: recentLoginUsers.slice(0, 12),
                    },
                    locations: {
                        topProfileCities: toTopList(cityCounter, 10),
                        topStates: toTopList(stateCounter, 10),
                        topLoginCities: toTopList(loginCityCounter, 10),
                        topLoginLocations: toTopList(loginLocationCounter, 10),
                    },
                },
            },
        });
    } catch (error) {
        console.error(`[Admin] getAdminInsights Error: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch admin insights." });
    }
};
