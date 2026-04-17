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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import { isProfileComplete } from './utils/profileCompletion';

// Member Route Component
const MemberRoute = ({ children, requireCompleteProfile = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (requireCompleteProfile && !isProfileComplete(user)) {
    return <Navigate to="/create-profile" replace />;
  }
  return children;
};

// Public Route Component (Redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or spinner
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to={isProfileComplete(user) ? '/dashboard' : '/create-profile'} replace />;
  }
  return children;
};

// Admin Login Route: allow guests and non-admin users, redirect only admins
const AdminLoginRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

          <Route path="/admin-login" element={
            <AdminLoginRoute>
              <AdminLogin />
            </AdminLoginRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <MemberRoute requireCompleteProfile>
              <MemberDashboard />
            </MemberRoute>
          } />
          <Route path="/family-view" element={
            <MemberRoute requireCompleteProfile>
              <FamilyViewMode />
            </MemberRoute>
          } />
          <Route path="/match-detail/:id" element={
            <MemberRoute requireCompleteProfile>
              <MatchDetailScreen />
            </MemberRoute>
          } />
          <Route path="/create-profile" element={
            <MemberRoute>
              <ProfileCreation />
            </MemberRoute>
          } />
          <Route path="/messages" element={
            <MemberRoute requireCompleteProfile>
              <Messages />
            </MemberRoute>
          } />
          <Route path="/profile" element={
            <MemberRoute requireCompleteProfile>
              <ProfileView />
            </MemberRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
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
