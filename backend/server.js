const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const passport = require('passport');
const path = require('path');

// Configs
require('./config/passport')(passport);
const connectMongo = require("./config/connectMongo");

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const messagingRoutes = require('./routes/messagingRoutes');
const matchRoutes = require('./routes/matchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sseService = require('./services/sseService');
const { protect } = require('./middleware/authMiddleware');


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
app.use('/api/messaging', messagingRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// SSE Endpoint for real-time updates (Keeping for backward compatibility for now)
app.get('/api/events', protect(), (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const userId = req.user._id.toString();
    sseService.addClient(userId, res);

    // Send initial heartbeat
    res.write('data: {"type":"CONNECTED"}\n\n');

    // Keep connection alive with heartbeats every 30 seconds
    const heartbeat = setInterval(() => {
        res.write('data: {"type":"HEARTBEAT"}\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(heartbeat);
    });
});

// Create HTTP server
const http = require('http');
const server = http.createServer(app);

// Initialize Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5178',
    credentials: true,
  },
});

// Socket Authentication Middleware
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

io.use(async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error('Socket Auth Error:', err.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket Events
const socketService = require('./services/socketService');
socketService.init(io);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Namma Sambandhi API', version: '1.0.0' });
});

// Start Server
(async () => {
  try {
    await connectMongo();



    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();
