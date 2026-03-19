/**
 * Seed Script — Populates the database with test users, matches, conversations, and messages.
 *
 * Usage:
 *   node seed.js                            (uses MONGO_URI from .env)
 *   MONGO_URI=mongodb://localhost:27017/nammasambandhi node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const Match = require("./models/matchModel");
const Conversation = require("./models/conversationModel");
const Message = require("./models/messageModel");

const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/nammasambandhi";

async function seed() {
    console.log(`Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected. Seeding database...\n");

    // ── Clean existing data ────────────────────────────────────────
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await Match.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data.");

    // ── Password hash (shared for all test users) ──────────────────
    const hashedPassword = await bcrypt.hash("Test@1234", 10);

    // ── Create Users ───────────────────────────────────────────────
    const users = await User.insertMany([
        {
            fullname: "Arjun Mehta",
            email: "arjun@test.com",
            password: hashedPassword,
            age: 29,
            gender: "Male",
            addresses: [
                { city: "Bangalore", state: "Karnataka", zip: "560001", primary: true },
            ],
            personalDetails: {
                dob: new Date("1996-05-15"),
                height: "5'10\"",
                maritalStatus: "never-married",
                religion: "Hindu",
                community: "Brahmin",
                motherTongue: "Tamil",
                about: "Software engineer who loves traveling, reading, and cooking South Indian food on weekends.",
            },
            careerDetails: {
                education: "B.Tech, Computer Science",
                institution: "IIT Madras",
                profession: "Software Engineer",
                employer: "Google India",
                income: "25-30 LPA",
                workLocation: "Bangalore",
            },
            familyDetails: {
                fatherName: "Rajesh Mehta",
                fatherOccupation: "Retired Bank Manager",
                motherName: "Lakshmi Mehta",
                motherOccupation: "Homemaker",
                siblings: "1 Elder Sister (Married, Doctor)",
                familyType: "Nuclear",
                familyValues: "Moderate",
                familyLocation: "Chennai",
            },
            lifestyleDetails: {
                diet: "Vegetarian",
                drinking: "Occasionally",
                smoking: "Never",
                hobbies: ["Reading", "Traveling", "Cooking", "Photography"],
                livingArrangement: "Independently",
            },
        },
        {
            fullname: "Priya Subramaniam",
            email: "priya@test.com",
            password: hashedPassword,
            age: 27,
            gender: "Female",
            addresses: [
                { city: "Mumbai", state: "Maharashtra", zip: "400001", primary: true },
            ],
            personalDetails: {
                dob: new Date("1998-09-22"),
                height: "5'6\"",
                maritalStatus: "never-married",
                religion: "Hindu",
                community: "Brahmin",
                motherTongue: "Tamil",
                about: "Senior consultant who believes in balancing career ambition with family values.",
            },
            careerDetails: {
                education: "MBA, Wharton School of Business",
                profession: "Senior Consultant",
                employer: "McKinsey & Company",
                income: "35-40 LPA",
                workLocation: "Mumbai",
            },
            familyDetails: {
                fatherName: "Dr. Venkatesh S.",
                fatherOccupation: "Chief of Surgery, Apollo Hospitals",
                motherName: "Meenakshi S.",
                motherOccupation: "Architect, Partner at own firm",
                siblings: "1 Elder Brother (Investment Banker, London)",
                familyType: "Nuclear",
                familyValues: "Traditional",
                familyLocation: "Mumbai",
            },
            lifestyleDetails: {
                diet: "Vegetarian",
                drinking: "Never",
                smoking: "Never",
                hobbies: ["Yoga", "Classical Dance", "Reading", "Traveling"],
                livingArrangement: "With Family",
            },
        },
        {
            fullname: "Ananya Krishnan",
            email: "ananya@test.com",
            password: hashedPassword,
            age: 26,
            gender: "Female",
            addresses: [
                { city: "Bangalore", state: "Karnataka", zip: "560002", primary: true },
            ],
            personalDetails: {
                dob: new Date("1999-03-10"),
                height: "5'4\"",
                maritalStatus: "never-married",
                religion: "Hindu",
                community: "Kshatriya",
                motherTongue: "Kannada",
                about: "Product manager passionate about building technology that makes a difference.",
            },
            careerDetails: {
                education: "MS, Stanford University",
                profession: "Product Manager",
                employer: "Google",
                income: "30-35 LPA",
                workLocation: "Bangalore",
            },
            familyDetails: {
                fatherName: "Ramesh Krishnan",
                fatherOccupation: "Retired IAS Officer",
                motherName: "Vidya Krishnan",
                motherOccupation: "Professor of English Literature",
                siblings: "None (Only Child)",
                familyType: "Nuclear",
                familyValues: "Liberal",
                familyLocation: "Bangalore",
            },
            lifestyleDetails: {
                diet: "Non-Vegetarian",
                drinking: "Occasionally",
                smoking: "Never",
                hobbies: ["Hiking", "Gaming", "Music", "Cooking"],
                livingArrangement: "Independently",
            },
        },
        {
            fullname: "Meera Raghavan",
            email: "meera@test.com",
            password: hashedPassword,
            age: 28,
            gender: "Female",
            addresses: [
                { city: "Delhi", state: "Delhi", zip: "110001", primary: true },
            ],
            personalDetails: {
                dob: new Date("1997-11-05"),
                height: "5'5\"",
                maritalStatus: "never-married",
                religion: "Hindu",
                community: "Brahmin",
                motherTongue: "Hindi",
                about: "Cardiologist at AIIMS dedicated to patient care and medical research.",
            },
            careerDetails: {
                education: "MBBS, MD (Cardiology), AIIMS Delhi",
                profession: "Cardiologist",
                employer: "AIIMS Delhi",
                income: "20-25 LPA",
                workLocation: "Delhi",
            },
            familyDetails: {
                fatherName: "Advocate R. Raghavan",
                fatherOccupation: "Senior Advocate, Delhi High Court",
                motherName: "Sujata Raghavan",
                motherOccupation: "Homemaker, M.A. in History",
                siblings: "1 Younger Sister (Medical Student)",
                familyType: "Joint",
                familyValues: "Traditional",
                familyLocation: "Delhi",
            },
            lifestyleDetails: {
                diet: "Vegetarian",
                drinking: "Never",
                smoking: "Never",
                hobbies: ["Reading Medical Journals", "Classical Music", "Meditation"],
                livingArrangement: "With Family",
            },
        },
        {
            fullname: "Rohan Kapoor",
            email: "rohan@test.com",
            password: hashedPassword,
            age: 30,
            gender: "Male",
            addresses: [
                { city: "Pune", state: "Maharashtra", zip: "411001", primary: true },
            ],
            personalDetails: {
                dob: new Date("1995-07-20"),
                height: "5'11\"",
                maritalStatus: "never-married",
                religion: "Hindu",
                community: "Kshatriya",
                motherTongue: "Marathi",
                about: "Entrepreneur building a health-tech startup. Believes in work-life balance and family values.",
            },
            careerDetails: {
                education: "MBA, IIM Ahmedabad",
                profession: "Co-Founder & CEO",
                employer: "HealthBridge (Startup)",
                income: "40-50 LPA",
                workLocation: "Pune",
            },
            familyDetails: {
                fatherName: "Vikram Kapoor",
                fatherOccupation: "Industrialist",
                motherName: "Nandini Kapoor",
                motherOccupation: "Social Worker",
                siblings: "1 Younger Brother (MBA Student)",
                familyType: "Nuclear",
                familyValues: "Moderate",
                familyLocation: "Pune",
            },
            lifestyleDetails: {
                diet: "Eggetarian",
                drinking: "Socially",
                smoking: "Never",
                hobbies: ["Cricket", "Running", "Investing", "Travel"],
                livingArrangement: "Independently",
            },
        },
    ]);

    const [arjun, priya, ananya, meera, rohan] = users;
    console.log(`Created ${users.length} users.`);

    // ── Create Matches ─────────────────────────────────────────────
    // Arjun's matches (he sees these 3 profiles)
    const matches = await Match.insertMany([
        {
            user: arjun._id,
            matchedUser: priya._id,
            status: "mutual",
            compatibility: "Strong",
            timeline: "Within 6 Months",
            isVerified: true,
            matchReasons: [
                "Family background emphasizes education and professional achievement.",
                "Shared cultural values and traditional family structure.",
                "Both families are from similar socio-economic backgrounds.",
            ],
            considerations: [
                { topic: "Location", detail: "Currently based in Mumbai, open to Bangalore" },
                { topic: "Living Arrangement", detail: "Prefers nuclear family with close family ties" },
                { topic: "Career Plans", detail: "Plans to continue working post-marriage" },
            ],
            tags: ["Professional", "Traditional", "Well-Educated"],
        },
        {
            user: arjun._id,
            matchedUser: ananya._id,
            status: "pending",
            compatibility: "Moderate",
            timeline: "Within 1 Year",
            isVerified: true,
            matchReasons: [
                "Strong educational background from a well-respected family.",
                "Stable government service background indicates reliability.",
                "Values intellectual pursuits and cultural activities.",
            ],
            considerations: [
                { topic: "Family Size", detail: "Only child — may have different family dynamics" },
                { topic: "Career Intensity", detail: "Tech career may require flexibility" },
                { topic: "Relocation", detail: "May need to discuss Bangalore vs other cities" },
            ],
            tags: ["Tech", "Independent", "Liberal"],
        },
        {
            user: arjun._id,
            matchedUser: meera._id,
            status: "pending",
            compatibility: "Strong",
            timeline: "Within 1 Year",
            isVerified: true,
            matchReasons: [
                "Medical profession indicates dedication and stability.",
                "Family values education and service-oriented careers.",
                "Well-established Delhi family with strong values.",
            ],
            considerations: [
                { topic: "Work Hours", detail: "Medical profession involves demanding schedules" },
                { topic: "Location", detail: "Currently in Delhi, tied to AIIMS position" },
                { topic: "Timeline", detail: "May need flexibility due to career demands" },
            ],
            tags: ["Doctor", "Traditional", "Dedicated"],
        },
        // Reverse match for Priya→Arjun (mutual) so conversation can exist
        {
            user: priya._id,
            matchedUser: arjun._id,
            status: "mutual",
            compatibility: "Strong",
            timeline: "Within 6 Months",
            isVerified: true,
            matchReasons: [
                "Strong technical career at a top company.",
                "Tamil Brahmin background aligns with family preferences.",
                "Down-to-earth personality with good family values.",
            ],
            considerations: [
                { topic: "Location", detail: "Based in Bangalore, open to relocation" },
                { topic: "Lifestyle", detail: "Independent living — discuss post-marriage plans" },
            ],
            tags: ["Engineer", "IIT", "Vegetarian"],
        },
        // Rohan's matches
        {
            user: rohan._id,
            matchedUser: ananya._id,
            status: "pending",
            compatibility: "Moderate",
            timeline: "Within 1 Year",
            isVerified: true,
            matchReasons: [
                "Both have entrepreneurial and tech-oriented mindsets.",
                "Similar age range and educational backgrounds.",
                "Shared hobbies and lifestyle preferences.",
            ],
            considerations: [
                { topic: "Location", detail: "Pune vs Bangalore — needs discussion" },
                { topic: "Career Focus", detail: "Both have demanding careers" },
            ],
            tags: ["Tech", "Young Professional"],
        },
    ]);

    console.log(`Created ${matches.length} matches.`);

    // ── Create Conversation (Arjun ↔ Priya — mutual match) ────────
    const conversation = await Conversation.create({
        participants: [arjun._id, priya._id],
        match: matches[0]._id, // Arjun→Priya match
        lastMessage: {
            text: "Thank you for your interest! I would love to know more about your hobbies.",
            sender: priya._id,
            createdAt: new Date(Date.now() - 2 * 3600000), // 2 hours ago
        },
    });

    console.log("Created 1 conversation.");

    // ── Create Messages ────────────────────────────────────────────
    const now = Date.now();
    const msgs = await Message.insertMany([
        {
            conversation: conversation._id,
            sender: arjun._id,
            text: "Hello! I came across your profile and was really impressed by your background. I'd love to get to know you better.",
            read: true,
            createdAt: new Date(now - 5 * 3600000),
        },
        {
            conversation: conversation._id,
            sender: priya._id,
            text: "Thank you for reaching out, Arjun! I appreciate the kind words. Your profile looks wonderful too. I'd be happy to connect.",
            read: true,
            createdAt: new Date(now - 4.5 * 3600000),
        },
        {
            conversation: conversation._id,
            sender: arjun._id,
            text: "That's great to hear! I noticed we both share a love for traveling. Have you been anywhere interesting recently?",
            read: true,
            createdAt: new Date(now - 4 * 3600000),
        },
        {
            conversation: conversation._id,
            sender: priya._id,
            text: "Yes! I just came back from a trip to Rajasthan. The Jaisalmer desert camp experience was unforgettable. Do you travel often?",
            read: true,
            createdAt: new Date(now - 3 * 3600000),
        },
        {
            conversation: conversation._id,
            sender: arjun._id,
            text: "Rajasthan is amazing! I've been to Udaipur and Jodhpur. I try to plan a trip every quarter. What are some of your other hobbies?",
            read: true,
            createdAt: new Date(now - 2.5 * 3600000),
        },
        {
            conversation: conversation._id,
            sender: priya._id,
            text: "Thank you for your interest! I would love to know more about your hobbies.",
            read: false,
            createdAt: new Date(now - 2 * 3600000),
        },
    ]);

    console.log(`Created ${msgs.length} messages.\n`);

    // ── Summary ────────────────────────────────────────────────────
    console.log("=== Seed Complete ===");
    console.log(`  Users:         ${users.length}`);
    console.log(`  Matches:       ${matches.length}`);
    console.log(`  Conversations: 1`);
    console.log(`  Messages:      ${msgs.length}`);
    console.log("");
    console.log("Test accounts (password: Test@1234):");
    console.log("  arjun@test.com   — has 3 matches, 1 conversation");
    console.log("  priya@test.com   — has 1 match (mutual with Arjun)");
    console.log("  ananya@test.com  — matched by Arjun & Rohan");
    console.log("  meera@test.com   — matched by Arjun");
    console.log("  rohan@test.com   — has 1 match");

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
