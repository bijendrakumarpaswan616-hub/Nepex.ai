import React from 'react';
import Logo from '../assets/Logo';
import { SettingsIcon } from '../assets/Icons';

const MaintenanceScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <div className="relative mb-6">
        <Logo className="w-20 h-20" />
        <SettingsIcon className="absolute -bottom-2 -right-2 w-8 h-8 text-slate-500 dark:text-gray-400 animate-spin [animation-duration:5s]" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-2">Under Maintenance</h1>
      <p className="text-lg text-slate-500 dark:text-gray-400 max-w-md">
        Nepex.ai is currently undergoing scheduled maintenance. We'll be back online shortly. Thank you for your patience!
      </p>
    </div>
  );
};

export default MaintenanceScreen;
