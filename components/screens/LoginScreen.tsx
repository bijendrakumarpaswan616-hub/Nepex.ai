import React, { useState } from 'react';
import Logo from '../assets/Logo';
import { GoogleIcon } from '../assets/Icons';
import { addUser, getUsers } from '../../services/storageService';

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
        return;
      }
      
      // Add user if they don't exist and proceed
      addUser(email);
      onComplete();
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      <div className="w-full max-w-sm text-center">
        <Logo className="w-16 h-16 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">Let's get you started</h1>
        <p className="text-slate-500 dark:text-gray-400 mb-8">Create an account to save your chats and settings.</p>

        <div className="space-y-4">
          <button
            onClick={onComplete}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-gray-200 transition-colors"
          >
            <GoogleIcon className="w-6 h-6" />
            Continue with Google
          </button>
        </div>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-slate-200 dark:border-slate-700" />
          <span className="mx-4 text-xs font-medium text-slate-400 dark:text-gray-500">OR</span>
          <hr className="flex-grow border-slate-200 dark:border-slate-700" />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-gray-100 border border-transparent focus:border-teal-500 focus:ring-teal-500 outline-none"
          />
          <input
            type="password"
            placeholder={isAdminEmail ? "Enter admin password" : "Password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('');
            }}
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-gray-100 border border-transparent focus:border-teal-500 focus:ring-teal-500 outline-none"
          />

          {error && <p className="text-red-500 text-sm text-left">{error}</p>}
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B] text-[#0F1724] font-bold rounded-lg transition-transform hover:scale-105"
          >
            {isAdminEmail ? 'Login as Admin' : 'Continue with Email'}
          </button>
        </form>

        <p className="text-xs text-slate-400 dark:text-gray-500 mt-8">
          By continuing, you agree to our <a href="#" className="underline hover:text-teal-400">Terms of Service</a> and <a href="#" className="underline hover:text-teal-400">Privacy Policy</a>.
        </p>
      </div>
      <p className="absolute bottom-8 text-sm text-slate-400 dark:text-gray-500">
        Created by ASP
      </p>
    </div>
  );
};

export default LoginScreen;