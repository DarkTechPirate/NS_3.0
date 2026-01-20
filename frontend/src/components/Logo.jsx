import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { icon: 44, text: 60 },
    md: { icon: 56, text: 80 },
    lg: { icon: 68, text: 100 },
    xl: { icon: 84, text: 120 }
  };

  const { icon, text } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/assets/images/logo/ns logo.png" 
        alt="Namma Sambandhi" 
        height={icon}
        className="shrink-0 object-contain"
        style={{ height: `${icon}px` }}
      />
    </div>
  );
};

export default Logo;
