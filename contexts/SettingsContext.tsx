
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import type { Settings } from '../types';
import { INITIAL_CREDITS } from '../constants';

const defaultSettings: Settings = {
  soundEffects: true,
  persona: 'default',
  theme: 'dark',
  credits: INITIAL_CREDITS,
  nextRefillTimestamp: Date.now() + 24 * 60 * 60 * 1000,
};

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('nepex-settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        
        // Initialize or validate credits/timestamp
        let currentCredits = parsed.credits;
        let nextRefill = parsed.nextRefillTimestamp;
        
        // If missing or refill time passed, reset
        if (currentCredits === undefined || nextRefill === undefined || Date.now() > nextRefill) {
             currentCredits = INITIAL_CREDITS;
             nextRefill = Date.now() + 24 * 60 * 60 * 1000;
        }

        const finalSettings = { 
            ...defaultSettings, 
            ...parsed,
            credits: currentCredits,
            nextRefillTimestamp: nextRefill
        };
        
        delete (finalSettings as any).proTier;
        
        return finalSettings;
      }
      return defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('nepex-settings', JSON.stringify(settings));
  }, [settings]);

  // Periodic check for credit refill
  useEffect(() => {
    const checkRefill = () => {
        if (Date.now() > settings.nextRefillTimestamp) {
            setSettings(prev => ({
                ...prev,
                credits: INITIAL_CREDITS,
                nextRefillTimestamp: Date.now() + 24 * 60 * 60 * 1000
            }));
        }
    };
    
    // Check every minute
    const interval = setInterval(checkRefill, 60000);
    return () => clearInterval(interval);
  }, [settings.nextRefillTimestamp]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'nepex-settings' && event.newValue) {
        try {
          const newSettings = JSON.parse(event.newValue);
          const finalSettings = { ...defaultSettings, ...newSettings };
          delete (finalSettings as any).proTier;
          if (JSON.stringify(finalSettings) !== JSON.stringify(settings)) {
            setSettings(finalSettings);
          }
        } catch (error) {
          console.error('Error parsing settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [settings]);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};