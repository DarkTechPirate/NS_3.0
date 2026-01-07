# Namma Sambandhi - Premium Matrimony Platform

A modern, premium matrimony platform built with React and Node.js. Features a beautiful swan heart logo representing the union of two souls.

## Project Structure

```
Namma Sambandhi/
├── frontend/                 # React frontend application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.js             # Swan heart logo component
│   │   │   ├── Header.js           # Shared navigation header
│   │   │   └── Footer.js           # Shared footer
│   │   ├── pages/
│   │   │   ├── WelcomeBrandScreen.js   # Landing page
│   │   │   ├── MemberDashboard.js      # Member dashboard with weekly matches
│   │   │   ├── FamilyViewMode.js       # Family/Parent view mode
│   │   │   ├── MatchDetailScreen.js    # Detailed match profile
│   │   │   ├── ProfileCreation.js      # Profile creation wizard
│   │   │   ├── Messages.js             # Messages/Inbox page
│   │   │   ├── Help.js                 # Help & Support page
│   │   │   ├── Contact.js              # Contact us page
│   │   │   ├── Privacy.js              # Privacy Policy page
│   │   │   └── Terms.js                # Terms of Service page
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/                  # Node.js/Express backend
│   ├── server.js
│   ├── .env
│   └── package.json
└── README.md
```

## Getting Started

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`

## Pages

### 1. Welcome Brand Screen (/)
- Landing page with hero section
- Features and benefits showcase
- How membership works section
- Call-to-action for applications

### 2. Member Dashboard (/dashboard)
- Weekly curated matches
- Match cards with compatibility scores
- Express interest functionality
- Quick filters and navigation

### 3. Family View Mode (/family-view)
- Parent/Family member access
- Shortlisting for family members
- Family background focus
- Core values alignment display

### 4. Match Detail Screen (/match-detail)
- Detailed compatibility breakdown
- Why we paired you section
- Considerations to discuss
- Family ecosystem information

### 5. Profile Creation (/create-profile)
- Multi-step profile wizard
- Personal information
- Location preferences
- About section
- Marital history

## API Endpoints

- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get single match details
- `POST /api/profile` - Create user profile
- `PUT /api/profile/:id` - Update user profile
- `POST /api/matches/:id/interest` - Express interest in a match
- `POST /api/matches/:id/decline` - Decline a match

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Tailwind CSS (via CDN)
- Google Material Symbols
- Google Fonts (Spline Sans, Playfair Display, Manrope, Inter)

### Backend
- Node.js
- Express.js
- CORS
- dotenv

## Design System

### Colors
- **Primary (Rajkumari Pink)**: #be185d, #D12E68, #E35A79
- **Secondary (Ghee Yellow)**: #f59e0b, #F3C969
- **Background**: #fdfbf7, #FCFCFA, #FAFAFA
- **Text**: #334155, #2D2A26, #111827

### Typography
- **Display**: Spline Sans
- **Body**: Manrope, Inter
- **Serif**: Playfair Display

## License

© 2024 Namma Sambandhi. All rights reserved.
