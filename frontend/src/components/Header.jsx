import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import { isProfileComplete } from '../utils/profileCompletion';
import { getBackendBaseUrl } from '../utils/backendUrl';

const Header = ({ variant = 'default' }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine variant based on auth state if not explicitly passed
  const isAuth = user || variant === 'authenticated';
  const profileComplete = isProfileComplete(user);
  const userName = user?.fullname || 'Guest';

  useEffect(() => {
    if (isAuth) {
      fetchNotifications();
      // Polling for demo, ideally use sockets for NEW_NOTIFICATION event
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuth]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications", error);
    }
  };

  // Navigation links based on auth state
  const navLinks = isAuth
    ? profileComplete
      ? [
        { path: '/dashboard', label: 'My Matches' },
        { path: '/family-view', label: 'Family View' },
        { path: '/messages', label: 'Messages' },
        { path: '/profile', label: 'Profile' },
      ]
      : [{ path: '/create-profile', label: 'Complete Profile' }]
    : [];

  const isActive = (path) => location.pathname === path;

  // Image URL Logic
  const BACKEND_URL = getBackendBaseUrl();
  const userImage = user?.profilePicture ?
    (user.profilePicture.startsWith('http') ? user.profilePicture : `${BACKEND_URL}/uploads/${user.profilePicture.replace(/^\/?uploads\//, "")}`)
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
                
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative flex items-center justify-center rounded-full size-10 bg-white border border-stone-200 text-text-charcoal hover:bg-stone-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[24px]">notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-stone-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-4 border-b border-stone-50 flex items-center justify-between bg-stone-50/50">
                        <h3 className="text-sm font-bold text-stone-800">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-medium text-primary hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <span className="material-symbols-outlined text-stone-200 text-4xl mb-2">notifications_off</span>
                            <p className="text-xs text-stone-400">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id}
                              onClick={() => {
                                handleMarkAsRead(notif._id);
                                if (notif.link) window.location.href = notif.link;
                              }}
                              className={`p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer flex gap-4 ${!notif.isRead ? 'bg-primary/[0.02]' : ''}`}
                            >
                              <div className="size-10 shrink-0 rounded-full bg-stone-100 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-xl">
                                  {notif.type === 'MESSAGE' ? 'chat' : notif.type === 'INTEREST' ? 'favorite' : 'verified'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-stone-500' : 'text-stone-800 font-medium'}`}>
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-stone-400 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {!notif.isRead && (
                                <div className="size-2 rounded-full bg-primary mt-2"></div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
                         <button className="text-[11px] font-bold text-stone-500 hover:text-stone-800 transition-colors">
                           View All Activity
                         </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="relative flex items-center justify-center rounded-full size-10 bg-white border border-stone-200 text-text-charcoal hover:bg-stone-50 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
                <Link to={profileComplete ? '/profile' : '/create-profile'}>
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
