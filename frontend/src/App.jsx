import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import WelcomeBrandScreen from './pages/WelcomeBrandScreen';
import MemberDashboard from './pages/MemberDashboard';
import FamilyViewMode from './pages/FamilyViewMode';
import MatchDetailScreen from './pages/MatchDetailScreen';
import ProfileCreation from './pages/ProfileCreation';
import ProfileView from './pages/ProfileView';
import Onboarding from './pages/Onboarding';
import Messages from './pages/Messages';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Public Route Component (Redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or spinner
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeBrandScreen />} />

          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          <Route path="/family-view" element={
            <ProtectedRoute>
              <FamilyViewMode />
            </ProtectedRoute>
          } />
          <Route path="/match-detail" element={
            <ProtectedRoute>
              <MatchDetailScreen />
            </ProtectedRoute>
          } />
          <Route path="/create-profile" element={
            <ProtectedRoute>
              <ProfileCreation />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          } />

          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
