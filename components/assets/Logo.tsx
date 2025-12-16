import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  // no custom props
}

const Logo: React.FC<LogoProps> = (props) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="logo-gradient-swoosh" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2EE6C8" />
        <stop offset="100%" stopColor="#FFD66B" />
      </linearGradient>
    </defs>
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100ZM32 75 V 25 H 42 L 62 65 V 25 H 72 V 75 H 62 L 42 35 V 75 Z"
      fill="url(#logo-gradient-swoosh)"
    />
  </svg>
);

export default Logo;