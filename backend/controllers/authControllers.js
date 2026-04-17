const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const generateTokenAndSetCookie = require("../utils/generateToken");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = (email) =>
    User.findOne({
        email: new RegExp(`^${escapeRegex(normalizeEmail(email))}$`, "i"),
    });

const toAuthResponseUser = (user) => {
    const safeUser = typeof user.toObject === "function" ? user.toObject() : { ...user };
    delete safeUser.password;
    delete safeUser.__v;
    return safeUser;
};

const getPrimaryAddress = (user) => {
    if (!Array.isArray(user?.addresses) || user.addresses.length === 0) {
        return null;
    }

    return user.addresses.find((address) => address?.primary) || user.addresses[0] || null;
};

const getUserLocationLabel = (user) => {
    const primaryAddress = getPrimaryAddress(user);
    const city = user?.personalDetails?.city || primaryAddress?.city || "";
    const state = primaryAddress?.state || "";

    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return "Unknown";
};

const getRequestIp = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const rawIp =
        (typeof forwardedFor === "string" && forwardedFor.split(",")[0]) ||
        req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        "unknown";

    return String(rawIp).trim().replace(/^::ffff:/, "");
};

const recordLoginEvent = async (user, req) => {
    const loginAt = new Date();
    const loginIp = getRequestIp(req);
    const loginLocation = getUserLocationLabel(user);

    await User.findByIdAndUpdate(user._id, {
        $inc: {
            "loginStats.loginCount": 1,
        },
        $set: {
            "loginStats.lastLoginAt": loginAt,
            "loginStats.lastLoginIp": loginIp,
            "loginStats.lastLoginLocation": loginLocation,
        },
        $push: {
            "loginStats.recentLogins": {
                $each: [{ at: loginAt, ip: loginIp, location: loginLocation }],
                $slice: -20,
            },
        },
    });
};

// ==============================================
// 1. SIGNUP
// ==============================================
exports.Signup = async (req, res) => {
    try {
        // 1. Get Confirm Password from body
        const { fullname, username, email, password, confirmPassword, phone } =
            req.body;
        const normalizedEmail = normalizeEmail(email);

        // 2. Fallback: If username is missing, generate it from email
        const finalUsername = username || normalizedEmail.split("@")[0];
        const finalFullname = fullname || "User"; // Fallback if name is missing

        if (!normalizedEmail || !password || !finalUsername) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 3. BACKEND MATCH CHECK
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // 4. BACKEND STRENGTH CHECK
        // Regex: At least 8 chars, 1 upper, 1 lower, 1 number, 1 special char
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!strongPasswordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 chars long and include uppercase, lowercase, number, and symbol.",
            });
        }

        // 5. Check duplicate email
        const existingUser = await findUserByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 6. Hash & Save
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullname: finalFullname,
            username: finalUsername,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
        });

        const token = generateTokenAndSetCookie(res, newUser._id);

        try {
            await recordLoginEvent(newUser, req);
        } catch (trackingError) {
            console.error("Signup login tracking error:", trackingError.message);
        }

        res.status(201).json({
            message: "Signup successful",
            user: toAuthResponseUser(newUser),
            token,
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ==============================================
// 2. LOGIN
// ==============================================
exports.Login = async (req, res) => {
    try {
        const loginEmail = normalizeEmail(req.body.email);
        const password = req.body.password;

        if (!loginEmail || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // Member login is intentionally email-only to avoid account collisions.
        const user = await findUserByEmail(loginEmail);
        if (!user) return res.status(404).json({ message: "No account found for this email" });

        // Verify Password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        // Generate Token & Set Cookie
        const token = generateTokenAndSetCookie(res, user._id);

        try {
            await recordLoginEvent(user, req);
        } catch (trackingError) {
            console.error("Login tracking error:", trackingError.message);
        }

        res.status(200).json({
            message: "Login successful",
            user: toAuthResponseUser(user),
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================================
// 3. ADMIN LOGIN
// ==============================================
exports.AdminLogin = async (req, res) => {
    try {
        const loginId = String(req.body.loginId || req.body.email || "").trim();
        const normalizedLoginEmail = normalizeEmail(loginId);
        const password = String(req.body.password || "");

        if (!loginId || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const adminUser = loginId.includes("@")
            ? await User.findOne({
                role: "admin",
                email: new RegExp(`^${escapeRegex(normalizedLoginEmail)}$`, "i"),
            })
            : await User.findOne({
                role: "admin",
                username: loginId,
            });

        if (!adminUser) {
            return res.status(404).json({ message: "Admin user not found" });
        }

        const match = await bcrypt.compare(password, adminUser.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateTokenAndSetCookie(res, adminUser._id);

        try {
            await recordLoginEvent(adminUser, req);
        } catch (trackingError) {
            console.error("Admin login tracking error:", trackingError.message);
        }

        res.status(200).json({
            message: "Admin login successful",
            user: toAuthResponseUser(adminUser),
            token,
        });
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ==============================================
// 4. LOGOUT
// ==============================================
exports.Logout = (req, res) => {
    // Clear the cookie by setting it to expire immediately
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
};

// ==============================================
// 5. ME (Check Auth Status)
// ==============================================
exports.Me = async (req, res) => {
    const user = await User
        .findById(req.user._id)
        .select("-password -__v -updatedAt");

    const token = generateTokenAndSetCookie.generateToken(req.user._id);

    res.status(200).json({
        success: true,
        user,
        token,
    });
};

// ==============================================
// 6. reset-password (Forgot Password)
// ==============================================
exports.resetPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        // TODO: Generate OTP or Reset Token and send email
        // Example:
        // const token = crypto.randomBytes(32).toString("hex");
        // await saveTokenToDBOrRedis(token);
        // sendEmail(user.email, token);

        return res.status(200).json({
            success: true,
            message: "Password reset instructions sent to email",
            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (err) {
        console.error("Reset Password Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
