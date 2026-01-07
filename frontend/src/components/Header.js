import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Header = ({ variant = 'default', userName = 'Guest', userImage = null }) => {
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'My Matches' },
    { path: '/family-view', label: 'Family View' },
    { path: '/messages', label: 'Messages' },
    { path: '/create-profile', label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

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
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
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
            {variant === 'authenticated' ? (
              <>
                <div className="hidden sm:flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold items-center gap-1">
                  <span className="material-symbols-outlined text-sm">diamond</span>
                  Premium
                </div>
                <button className="relative flex items-center justify-center rounded-full size-10 bg-white border border-stone-200 text-text-charcoal hover:bg-stone-50 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">notifications</span>
                  <span className="absolute top-2 right-2 size-2 bg-primary rounded-full"></span>
                </button>
                <Link to="/create-profile">
                  <div 
                    className="size-10 rounded-full bg-gradient-to-br from-primary to-secondary bg-center bg-cover border-2 border-white shadow-sm cursor-pointer"
                    style={userImage ? { backgroundImage: `url('${userImage}')` } : {}}
                  >
                    {!userImage && (
                      <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/create-profile" 
                  className="hidden md:flex flex-col items-center justify-center bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full transition-all transform hover:scale-105 shadow-soft"
                >
                  <span className="text-sm font-semibold">Apply Now</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
