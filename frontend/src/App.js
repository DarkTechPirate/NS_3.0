import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeBrandScreen from './pages/WelcomeBrandScreen';
import MemberDashboard from './pages/MemberDashboard';
import FamilyViewMode from './pages/FamilyViewMode';
import MatchDetailScreen from './pages/MatchDetailScreen';
import ProfileCreation from './pages/ProfileCreation';
import Onboarding from './pages/Onboarding';
import Messages from './pages/Messages';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeBrandScreen />} />
        <Route path="/dashboard" element={<MemberDashboard />} />
        <Route path="/family-view" element={<FamilyViewMode />} />
        <Route path="/match-detail" element={<MatchDetailScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/create-profile" element={<ProfileCreation />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}

export default App;
