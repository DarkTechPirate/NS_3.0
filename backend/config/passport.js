const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = (email) =>
    User.findOne({
        email: new RegExp(`^${escapeRegex(normalizeEmail(email))}$`, "i"),
    });

module.exports = (passport) => {
    // DEBUG LOGS - Run on startup
    console.log("--------------- PASSPORT CONFIG ----------------");
    console.log("GOOGLE_CLIENT_ID Loaded:", !!process.env.GOOGLE_CLIENT_ID);
    console.log("GOOGLE_CLIENT_ID Value (First 5 chars):", process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 5) : "N/A");
    console.log("GOOGLE_CLIENT_SECRET Loaded:", !!process.env.GOOGLE_CLIENT_SECRET);
    console.log("GOOGLE_CLIENT_SECRET Value (First 5 chars):", process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 5) : "N/A");
    console.log("Callback URL:", `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`);
    console.log("------------------------------------------------");

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log("--------------- GOOGLE AUTH START ---------------");
                    const profileEmail = normalizeEmail(profile?.emails?.[0]?.value);

                    // Helper to get the photo URL safely
                    const googlePhoto =
                        profile.photos && profile.photos[0]
                            ? profile.photos[0].value
                            : null;

                    // 1. Check existing user by Google ID
                    let user = await User.findOne({ googleId: profile.id });
                    if (user) {
                        console.log("User found by Google ID:", user.email);
                        return done(null, user);
                    }

                    // 2. Check existing user by Email (Account Linking)
                    if (profileEmail) {
                        user = await findUserByEmail(profileEmail);
                        if (user) {
                            if (user.googleId && user.googleId !== profile.id) {
                                return done(
                                    new Error(
                                        "Google account conflict: email already linked to a different Google identity."
                                    ),
                                    null
                                );
                            }

                            console.log("User found by Email. Linking account...");

                            // Link Google ID
                            user.googleId = profile.id;

                            // OPTIONAL: If user has no profile picture yet, use the Google one
                            if (!user.profilePicture && googlePhoto) {
                                user.profilePicture = googlePhoto;
                            }

                            await user.save();
                            return done(null, user);
                        }
                    }

                    // 3. Prepare New User Object
                    const fallbackEmail = `google-user-${Date.now()}@local.invalid`;
                    const finalEmail = profileEmail || fallbackEmail;
                    const newUserObj = {
                        googleId: profile.id,
                        email: finalEmail,

                        fullname:
                            profile.displayName || profile.name?.givenName || "Google User",

                        username:
                            finalEmail.split("@")[0],

                        password: "google-auth-" + Date.now(),

                        // --- NEW: SAVE PROFILE PICTURE ---
                        profilePicture: googlePhoto,
                    };

                    console.log(
                        "ATTEMPTING TO CREATE USER WITH PHOTO:",
                        newUserObj.profilePicture
                    );

                    const newUser = await User.create(newUserObj);
                    console.log("USER CREATED SUCCESSFULLY:", newUser._id);

                    return done(null, newUser);
                } catch (err) {
                    console.error("CRITICAL DB ERROR:", err);
                    return done(err, null);
                }
            }
        )
    );
};
