
import React, { useState, useEffect } from 'react';
import SplashScreen from './components/screens/SplashScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import LoginScreen from './components/screens/LoginScreen';
import ChatScreen from './components/screens/ChatScreen';
import MaintenanceScreen from './components/screens/MaintenanceScreen';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { addLog } from './services/storageService';

type AppState = 'splash' | 'onboarding' | 'login' | 'chat';

const ThemeManager: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { settings } = useSettings();

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      const isDark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', isDark);
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return <>{children}</>;
}


const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('splash');
  
  const isMaintenanceMode = localStorage.getItem('maintenanceMode') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    setTimeout(() => {
      if (onboardingComplete) {
        setAppState('chat');
      } else {
        setAppState('onboarding');
      }
    }, 2500); // Splash screen duration
  }, []);

  const handleOnboardingComplete = () => {
    setAppState('login');
  };
  
  const handleLoginComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setAppState('chat');
  };
  
  const handleLogout = () => {
      addLog('LOGOUT', 'User logged out');
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('nepex-conversations');
      setAppState('login');
  };

  const renderContent = () => {
    if (isMaintenanceMode && !isAdmin) {
      return <MaintenanceScreen />;
    }
  
    switch (appState) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'login':
        return <LoginScreen onComplete={handleLoginComplete} />;
      case 'chat':
        return <ChatScreen onLogout={handleLogout} />;
      default:
        return <SplashScreen />;
    }
  };

  return (
      <div className="bg-white dark:bg-[#0F1724] text-slate-900 dark:text-gray-200 min-h-screen font-sans transition-colors duration-300">
        {renderContent()}
      </div>
  );
};


const App: React.FC = () => {
  return (
    <SettingsProvider>
      <ThemeManager>
        <AppContent />
      </ThemeManager>
    </SettingsProvider>
  );
};

export default App;
