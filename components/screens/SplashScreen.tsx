import React from 'react';
import Logo from '../assets/Logo';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <style>
        {`
          @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-scale {
            animation: fadeInScale 1.5s ease-out forwards;
          }
        `}
      </style>
      <div className="animate-fade-in-scale">
        <Logo className="w-24 h-24" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mt-4 animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
        Nepex.ai
      </h1>
    </div>
  );
};

export default SplashScreen;