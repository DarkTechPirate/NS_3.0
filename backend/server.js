const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const passport = require('passport');
const path = require('path');
require('dotenv').config();

// Configs
require('./config/passport')(passport);
const connectMongo = require("./config/connectMongo");

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// FEATURE TOGGLE
const USE_MINIO = process.env.USE_MINIO === "true"; // Set this in .env if you want to use MinIO

// CONDITIONAL MINIO LOAD
let minioClient, BUCKET_NAME;
if (USE_MINIO) {
  try {
    const minio = require("./config/minio");
    minioClient = minio;
    BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "nammasambandi";
  } catch (e) {
    console.warn("MinIO dependency or config missing, skipping MinIO load");
  }
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5178',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Static folder for uploads (Fallback)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ------------------------------------------------
// FILE SERVING — MINIO PROXY
// ------------------------------------------------
app.get(/^\/uploads\/(.+)$/, async (req, res, next) => {
  // If MinIO is not enabled or client not ready, fall through to static middleware (which matches /uploads)
  // Actually static middleware is mounted at /uploads, so this specific route might conflict if not careful.
  // Express routes take precedence if defined before static? No, defined order matters.
  // We mounted static above. But static only serves if file exists on disk.
  // If file doesn't exist on disk (MinIO file), static calls next().
  // So this handler will catch it.

  if (!USE_MINIO || !minioClient) {
    return next();
  }

  const objectName = req.params[0]; // e.g. user/filename.webp

  try {
    // Ensure object exists
    await minioClient.statObject(BUCKET_NAME, objectName);

    // Stream from MinIO
    const stream = await minioClient.getObject(BUCKET_NAME, objectName);

    // Basic headers
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Type", "image/webp");

    stream.pipe(res);
  } catch (err) {
    // If not found in MinIO, invoke next() to see if it's a static file or 404
    next();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Sample data (Preserved)
const matches = [
  { id: 1, name: "Rohan", age: 29, location: "Mumbai, India", height: "5'11\"", education: "MBA, Wharton", profession: "Product Director", matchScore: 94, timeline: "Within 6 Months", verified: true, tags: ["Vegetarian", "Liberal Arts", "Startup Founder", "Hindi & English"], matchReasons: ["Rohan shares your strong interest in sustainable living and ethical consumption.", "Both of you value a nuclear family setup while maintaining close ties to extended relatives."] },
  { id: 2, name: "Arjun", age: 31, location: "Bangalore, India", height: "6'0\"", education: "MS, Stanford", profession: "Architect", matchScore: 88, timeline: "Within 1 Year", verified: true, tags: ["Adventure Sports", "Classical Music", "Non-Smoker"], matchReasons: ["Arjun is looking for a partner who enjoys outdoor activities, matching your hiking hobby.", "Compatible professional ambitions with a shared focus on work-life balance."] },
  { id: 3, name: "Vikram", age: 30, location: "London, UK", height: "5'10\"", education: "PhD, Cambridge", profession: "Economist", matchScore: 91, timeline: "Within 6 Months", verified: true, tags: ["Book Lover", "Eggetarian", "Joint Family"], matchReasons: ["Vikram comes from a family of academics, aligning with your educational background.", "Open to relocation to India, matching your preference to settle in Mumbai."] }
];

app.get('/api/matches', (req, res) => res.json(matches));
app.get('/api/matches/:id', (req, res) => {
  const match = matches.find(m => m.id === parseInt(req.params.id));
  if (!match) return res.status(404).json({ message: 'Match not found' });
  res.json(match);
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Namma Sambandhi API', version: '1.0.0' });
});

// Start Server
(async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();
