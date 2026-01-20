import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const Header = ({ variant = 'default' }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Determine variant based on auth state if not explicitly passed
  const isAuth = user || variant === 'authenticated';
  const userName = user?.fullname || 'Guest';

  // Navigation links based on auth state
  const navLinks = isAuth ? [
    { path: '/dashboard', label: 'My Matches' },
    { path: '/family-view', label: 'Family View' },
    { path: '/messages', label: 'Messages' },
    {
      path: user?.personalDetails ? '/profile' : '/create-profile',
      label: 'Profile'
    },
  ] : [
    // Guest links if any
  ];

  const isActive = (path) => location.pathname === path;

  // Image URL Logic
  const BACKEND_URL = 'http://localhost:5000'; // Should ideally come from env
  const userImage = user?.profilePicture ?
    (user.profilePicture.startsWith('http') ? user.profilePicture : `${BACKEND_URL}/uploads/${user.profilePicture}`)
    : null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <Logo size="md" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${isActive(link.path)
                  ? 'text-primary font-semibold'
                  : 'text-text-muted hover:text-primary'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isAuth ? (
              <>
                <div className="hidden sm:flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold items-center gap-1">
                  <span className="material-symbols-outlined text-sm">diamond</span>
                  Premium
                </div>
                <button
                  onClick={logout}
                  className="relative flex items-center justify-center rounded-full size-10 bg-white border border-stone-200 text-text-charcoal hover:bg-stone-50 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
                <Link to={user?.personalDetails ? '/profile' : '/create-profile'}>
                  <div
                    className="size-10 rounded-full bg-gradient-to-br from-primary to-secondary bg-center bg-cover border-2 border-white shadow-sm cursor-pointer"
                    style={userImage ? { backgroundImage: `url('${userImage}')` } : {}}
                  >
                    {!userImage && (
                      <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm bg-rajkumari">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hidden md:flex flex-col items-center justify-center bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full transition-all transform hover:scale-105 shadow-soft"
                >
                  <span className="text-sm font-semibold">Apply Now</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header >
  );
};

export default Header;
