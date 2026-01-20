import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-stone-200 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Logo size="md" />
            <p className="mt-4 text-sm text-text-muted leading-relaxed">
              A premium, private matrimony platform for discerning individuals ready to make thoughtful marriage decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-text-charcoal mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-text-muted hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="text-sm text-text-muted hover:text-primary transition-colors">My Matches</Link></li>
              <li><Link to="/family-view" className="text-sm text-text-muted hover:text-primary transition-colors">Family View</Link></li>
              <li><Link to="/create-profile" className="text-sm text-text-muted hover:text-primary transition-colors">Create Profile</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-text-charcoal mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-text-muted hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-sm text-text-muted hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-sm text-text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-text-charcoal mb-4">Get in Touch</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <span className="material-symbols-outlined text-base">mail</span>
                contact@nammasambandhi.com
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <span className="material-symbols-outlined text-base">phone</span>
                +91 98765 43210
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © 2024 Namma Sambandhi. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-medium text-text-muted">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">lock</span> 
              Data Encrypted
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">verified_user</span> 
              100% Verified Profiles
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
