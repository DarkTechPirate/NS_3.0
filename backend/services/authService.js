const User = require("../models/userModel");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = (email) =>
    User.findOne({ email: new RegExp(`^${escapeRegex(normalizeEmail(email))}$`, "i") });

async function findOrCreateGoogleUser(profile) {
    const profileEmail = normalizeEmail(profile?.email);

    // 1. Check by Google ID
    let user = await User.findOne({ googleId: profile.sub }); // Note: Google calls ID 'sub' in JWTs
    if (user) return user;

    // 2. Check by Email
    if (profileEmail) {
        user = await findUserByEmail(profileEmail);
        if (user) {
            if (user.googleId && user.googleId !== profile.sub) {
                throw new Error("Google account conflict: email already linked to a different Google identity.");
            }

            user.googleId = profile.sub;
            if (!user.profilePicture && profile.picture)
                user.profilePicture = profile.picture;
            await user.save();
            return user;
        }
    }

    // 3. Create New
    const fallbackEmail = `google-user-${Date.now()}@local.invalid`;
    const finalEmail = profileEmail || fallbackEmail;
    return await User.create({
        googleId: profile.sub,
        email: finalEmail,
        fullname: profile.name,
        username: finalEmail.split("@")[0],
        profilePicture: profile.picture,
        password: "google-onetap-" + Date.now(),
    });
}

module.exports = { findOrCreateGoogleUser };
