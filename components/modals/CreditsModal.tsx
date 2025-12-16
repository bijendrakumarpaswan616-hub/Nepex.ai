
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { CoinsIcon, XIcon, SparklesIcon, MessageSquareIcon, RefreshCwIcon } from '../assets/Icons';
import { CREDIT_COSTS, INITIAL_CREDITS } from '../../constants';

interface CreditsModalProps {
  onClose: () => void;
}

const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  const { settings } = useSettings();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = settings.nextRefillTimestamp - now;

      if (diff <= 0) {
        setTimeLeft('Ready to refresh!');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.nextRefillTimestamp]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-[#0F1724] border border-slate-200 dark:border-slate-700/50 rounded-lg shadow-xl w-full max-w-sm p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B]"></div>
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <CoinsIcon className="w-6 h-6 text-[#FFD66B]" />
                Daily Balance
            </h2>
            <button onClick={onClose} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <XIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="text-center mb-8">
            <p className="text-6xl font-bold bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B] bg-clip-text text-transparent">
                {settings.credits}
            </p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 font-medium">Credits Available</p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2 text-slate-600 dark:text-gray-300">
                <RefreshCwIcon className="w-4 h-4 animate-spin-slow" style={{ animationDuration: '3s' }}/>
                <span className="text-xs uppercase tracking-wide font-semibold">Next Refill In</span>
            </div>
            <p className="text-center text-2xl font-mono font-bold text-slate-800 dark:text-white">
                {timeLeft}
            </p>
            <p className="text-center text-xs text-slate-400 dark:text-gray-500 mt-2">
                You get {INITIAL_CREDITS} credits every 24 hours.
            </p>
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <MessageSquareIcon className="w-4 h-4 text-teal-500" />
                    <span className="text-sm text-slate-600 dark:text-gray-300">Chat Message</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-gray-100">{CREDIT_COSTS.MESSAGE} credit</span>
            </div>
            <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-slate-600 dark:text-gray-300">Image Gen</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-gray-100">{CREDIT_COSTS.IMAGE} credits</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsModal;
