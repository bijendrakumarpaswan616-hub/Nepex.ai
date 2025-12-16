import React, { useState } from 'react';
import Logo from '../assets/Logo';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: "Welcome to Nepex.ai",
    description: "Your personal AI assistant, and Nepal's first AI assistant. Sign up to save conversations, customize your assistant, and access voice chat.",
  },
  {
    title: "Your Privacy, Your Control",
    description: "Nepex keeps your data safe — you choose what’s saved. Toggle ‘Private Mode’ in settings to keep a conversation local to your device.",
  },
  {
    title: "Quick Start",
    description: "Try these starters: ‘Summarize this article’, ‘Draft an email to my boss’, or ‘Explain recursion like I’m five’.",
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [animationClass, setAnimationClass] = useState('animate-fade-in-up');

  const handleNext = () => {
    // Start fade-out animation
    setAnimationClass('animate-fade-out-down');

    setTimeout(() => {
      if (step < onboardingSteps.length - 1) {
        setStep(step + 1);
        // Start fade-in animation for new content
        setAnimationClass('animate-fade-in-up');
      } else {
        onComplete();
      }
    }, 300); // Duration should match the animation duration
  };

  const currentStep = onboardingSteps[step];

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 text-center overflow-hidden">
      <style>{`
          @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeOutDown {
              from { opacity: 1; transform: translateY(0); }
              to { opacity: 0; transform: translateY(-20px); }
          }
          .animate-fade-in-up {
              animation: fadeInUp 0.5s ease-out forwards;
          }
          .animate-fade-out-down {
              animation: fadeOutDown 0.3s ease-in forwards;
          }
      `}</style>

      <div className={`w-full max-w-md ${animationClass}`}>
        <Logo className="w-16 h-16 mb-8 mx-auto" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-4">{currentStep.title}</h2>
        <p className="text-lg text-slate-500 dark:text-gray-400 mb-12">{currentStep.description}</p>
      </div>
      
      <div className="flex items-center space-x-2 mb-12">
        {onboardingSteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === step ? 'bg-[#2EE6C8] w-6' : 'bg-slate-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
      <button
        onClick={handleNext}
        className="px-8 py-3 bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B] text-[#0F1724] font-bold rounded-full transition-transform hover:scale-105"
      >
        {step === onboardingSteps.length - 1 ? "Get Started" : "Continue"}
      </button>
      <p className="absolute bottom-8 text-sm text-slate-400 dark:text-gray-500">
        Created by ASP
      </p>
    </div>
  );
};

export default OnboardingScreen;
