const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data for matches
const matches = [
  {
    id: 1,
    name: "Rohan",
    age: 29,
    location: "Mumbai, India",
    height: "5'11\"",
    education: "MBA, Wharton",
    profession: "Product Director",
    matchScore: 94,
    timeline: "Within 6 Months",
    verified: true,
    tags: ["Vegetarian", "Liberal Arts", "Startup Founder", "Hindi & English"],
    matchReasons: [
      "Rohan shares your strong interest in sustainable living and ethical consumption.",
      "Both of you value a nuclear family setup while maintaining close ties to extended relatives."
    ]
  },
  {
    id: 2,
    name: "Arjun",
    age: 31,
    location: "Bangalore, India",
    height: "6'0\"",
    education: "MS, Stanford",
    profession: "Architect",
    matchScore: 88,
    timeline: "Within 1 Year",
    verified: true,
    tags: ["Adventure Sports", "Classical Music", "Non-Smoker"],
    matchReasons: [
      "Arjun is looking for a partner who enjoys outdoor activities, matching your hiking hobby.",
      "Compatible professional ambitions with a shared focus on work-life balance."
    ]
  },
  {
    id: 3,
    name: "Vikram",
    age: 30,
    location: "London, UK",
    height: "5'10\"",
    education: "PhD, Cambridge",
    profession: "Economist",
    matchScore: 91,
    timeline: "Within 6 Months",
    verified: true,
    tags: ["Book Lover", "Eggetarian", "Joint Family"],
    matchReasons: [
      "Vikram comes from a family of academics, aligning with your educational background.",
      "Open to relocation to India, matching your preference to settle in Mumbai."
    ]
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Namma Sambandhi API',
    version: '1.0.0'
  });
});

// Get all matches
app.get('/api/matches', (req, res) => {
  res.json(matches);
});

// Get single match by ID
app.get('/api/matches/:id', (req, res) => {
  const match = matches.find(m => m.id === parseInt(req.params.id));
  if (!match) {
    return res.status(404).json({ message: 'Match not found' });
  }
  res.json(match);
});

// User profile routes
app.post('/api/profile', (req, res) => {
  // Handle profile creation
  const { firstName, lastName, email, dateOfBirth, gender, location } = req.body;
  res.json({ 
    message: 'Profile created successfully',
    profile: { firstName, lastName, email, dateOfBirth, gender, location }
  });
});

app.put('/api/profile/:id', (req, res) => {
  // Handle profile update
  res.json({ message: 'Profile updated successfully' });
});

// Express interest
app.post('/api/matches/:id/interest', (req, res) => {
  const matchId = parseInt(req.params.id);
  res.json({ 
    message: 'Interest expressed successfully',
    matchId 
  });
});

// Decline match
app.post('/api/matches/:id/decline', (req, res) => {
  const matchId = parseInt(req.params.id);
  res.json({ 
    message: 'Match declined',
    matchId 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
