
import React, { useState } from 'react';
import Logo from '../assets/Logo';
import { GoogleIcon } from '../assets/Icons';
import { addUser, getUsers, addLog } from '../../services/storageService';

interface LoginScreenProps {
  onComplete: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onComplete }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isAdminEmail = email.toLowerCase() === 'bijendrakumarpaswan616@gmail.com';

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
        setError('Please enter an email address.');
        return;
    }
    if (!password) {
        setError('Please enter a password.');
        return;
    }

    if (isAdminEmail) {
      if (password === 'sat saheb ji') {
        localStorage.setItem('isAdmin', 'true');
        addLog('LOGIN', 'Admin logged in', email);
        onComplete();
      } else {
        setError('Incorrect password for admin.');
      }
    } else {
      // For regular users
      const users = getUsers();
      const currentUser = users.find(u => u.email === email.toLowerCase());

      if (currentUser?.isBlocked) {
        setError('Your account has been suspended by an administrator.');
        addLog('LOGIN', 'Blocked user attempted login', email);
        return;
      }
      
      // Add user if they don't exist and proceed
      addUser(email);
      addLog('LOGIN', 'User logged in via Email', email);
      onComplete();
    }
  };

  const handleGoogleLogin = () => {
      // Simulation of Google Login
      addLog('LOGIN', 'User logged in via Google', 'google-user@nepex.ai');
      onComplete();
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-white to-slate-100 dark:from-[#0F1724] dark:to-[#0a0f18] relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Logo className="w-20 h-20 mx-auto mb-6 drop-shadow-xl" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Sign in to continue to Nepex.ai</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
            
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-semibold text-slate-700 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md group"
            >
              <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-6 items-center">
                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setError('');
                        }}
                        className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 animate-pulse">
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </p>
                    </div>
                )}
              
                <button
                    type="submit"
                    className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B] text-[#0F1724] font-bold text-lg rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                    {isAdminEmail ? 'Login to Dashboard' : 'Sign In'}
                </button>
            </form>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          By continuing, you agree to our <a href="#" className="underline hover:text-teal-500 transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-teal-500 transition-colors">Privacy Policy</a>.
        </p>
      </div>
      
      <footer className="absolute bottom-6 text-center w-full z-10">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-600">Created by ASP</p>
      </footer>
    </main>
  );
};

export default LoginScreen;
