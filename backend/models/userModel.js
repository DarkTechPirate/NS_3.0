const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    primary: { type: Boolean, default: false },
    door: { type: String },
    street: { type: String },
    area: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    district: { type: String },
    state: { type: String, required: true },
    country: { type: String, default: "India" },
    zip: { type: String, required: true },
    location: {
        lat: Number,
        lng: Number,
    },
});

const UserSchema = new Schema(
    {
        googleId: { type: String, unique: true, sparse: true },
        username: { type: String },
        fullname: { type: String },

        age: Number,
        gender: { type: String, enum: ["Male", "Female", "Other"] },

        email: { type: String, required: true },
        password: { type: String },
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    // Allow empty phone if checking from google auth init, but strict on update
                    if (!v) return true;
                    return /^[6-9]\d{9}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid 10-digit Indian mobile number!`,
            },
        },
        addresses: [AddressSchema],
        createdAt: { type: Date, default: Date.now },
        profilePicture: String,
        role: { type: String, default: "user", enum: ["admin", "user", "staff"] },

        // --- NEW: Detailed Profile Sections ---
        personalDetails: {
            dob: Date,
            height: String,
            maritalStatus: String,
            religion: String,
            community: String,
            caste: String,
            motherTongue: String,
            about: String,
            jathagam: String, // URL/Path to file
        },

        careerDetails: {
            education: String,
            fieldOfStudy: String,
            institution: String,
            profession: String,
            employer: String,
            income: String,
            workLocation: String,
        },

        familyDetails: {
            fatherName: String,
            fatherOccupation: String,
            motherName: String,
            motherOccupation: String,
            siblings: String,
            familyType: String,
            familyValues: String,
            familyLocation: String,
        },

        lifestyleDetails: {
            diet: String,
            drinking: String,
            smoking: String,
            hobbies: [String],
            livingArrangement: String,
        },

        preferences: {
            relocate: { type: Boolean, default: false },
        },

        profileImages: [String], // Array of public URLs
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", UserSchema);
