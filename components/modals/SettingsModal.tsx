import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { Settings } from '../../types';
import { SunIcon, MoonIcon, LaptopIcon } from '../assets/Icons';

interface SettingsModalProps {
  onClose: () => void;
}

interface ThemeButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-pressed={isActive}
    className={`flex flex-col items-center justify-center gap-2 p-3 border rounded-lg transition-colors text-slate-600 dark:text-gray-300 ${
      isActive
        ? 'bg-teal-500/10 border-teal-500 text-teal-500'
        : 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, setSettings } = useSettings();

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-[#0F1724] border border-slate-200 dark:border-slate-700/50 rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-gray-100">Settings</h2>

        {/* Theme Selector */}
        <div className="mb-6">
          <label className="block text-slate-600 dark:text-gray-300 mb-2 font-medium">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            <ThemeButton
              label="Light"
              icon={<SunIcon className="w-5 h-5" />}
              isActive={settings.theme === 'light'}
              onClick={() => handleSettingChange('theme', 'light')}
            />
            <ThemeButton
              label="Dark"
              icon={<MoonIcon className="w-5 h-5" />}
              isActive={settings.theme === 'dark'}
              onClick={() => handleSettingChange('theme', 'dark')}
            />
            <ThemeButton
              label="System"
              icon={<LaptopIcon className="w-5 h-5" />}
              isActive={settings.theme === 'system'}
              onClick={() => handleSettingChange('theme', 'system')}
            />
          </div>
        </div>

        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="sound-toggle" className="font-medium text-slate-600 dark:text-gray-300">Sound Effects</label>
          <button
            id="sound-toggle"
            role="switch"
            aria-checked={settings.soundEffects}
            onClick={() => handleSettingChange('soundEffects', !settings.soundEffects)}
            className={`relative w-12 h-6 rounded-full flex items-center transition-colors ${settings.soundEffects ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${settings.soundEffects ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* AI Persona Selector */}
        <div className="mb-6">
          <label className="block text-slate-600 dark:text-gray-300 mb-2 font-medium">AI Persona</label>
          <select
            value={settings.persona}
            onChange={(e) => handleSettingChange('persona', e.target.value as Settings['persona'])}
            className="w-full p-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="default">Default</option>
            <option value="concise">Concise</option>
            <option value="tutor">Tutor</option>
            <option value="developer">Developer</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        
        <button onClick={onClose} className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 text-slate-800 dark:text-gray-200 font-bold rounded-lg">
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
