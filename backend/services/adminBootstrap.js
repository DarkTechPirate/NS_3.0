const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const DEFAULT_ADMIN_LOGIN = String(process.env.DEFAULT_ADMIN_LOGIN || "1");
const DEFAULT_ADMIN_PASSWORD = String(process.env.DEFAULT_ADMIN_PASSWORD || "1");

const ensureDefaultAdminAccount = async () => {
    let adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
        adminUser = new User();
    }

    adminUser.fullname = adminUser.fullname || "Platform Admin";
    adminUser.username = DEFAULT_ADMIN_LOGIN;
    adminUser.email = DEFAULT_ADMIN_LOGIN;
    adminUser.role = "admin";
    adminUser.isVerified = true;
    adminUser.password = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    await adminUser.save();

    console.log(
        `[AdminBootstrap] Admin account ensured. loginId: ${DEFAULT_ADMIN_LOGIN}`
    );
};

module.exports = {
    ensureDefaultAdminAccount,
};
