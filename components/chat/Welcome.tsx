import React from 'react';
import Logo from '../assets/Logo';
import { STARTER_PROMPTS } from '../../constants';

interface WelcomeProps {
    onPromptClick: (prompt: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onPromptClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-gray-400">
      <Logo className="w-20 h-20 mb-4" />
      <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-2">How can I help you today?</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl w-full">
        {STARTER_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-left hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
          >
            <p className="text-slate-700 dark:text-gray-300">{prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Welcome;