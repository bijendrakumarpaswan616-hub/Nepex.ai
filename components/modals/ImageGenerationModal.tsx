import React, { useState } from 'react';
import { SparklesIcon, XIcon } from '../assets/Icons';

interface ImageGenerationModalProps {
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

const examplePrompts = [
    "A photorealistic cat astronaut on Mars",
    "A surreal oil painting of a whale swimming through clouds",
    "A cyberpunk city street at night, neon lights reflecting on wet pavement",
    "A whimsical watercolor illustration of a magical forest library",
];

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({ onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('');

    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
            onClose();
        }
    };
    
    const handleExampleClick = (example: string) => {
        setPrompt(example);
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-[#0F1724] border border-slate-200 dark:border-slate-700/50 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-teal-400" />
                        Generate Image
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-gray-400" />
                    </button>
                </div>
                <p className="text-slate-500 dark:text-gray-400 mb-4">
                    Describe the image you want to create. Be as specific as you can for the best results.
                </p>

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A majestic lion wearing a crown, cinematic lighting"
                    rows={3}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                />

                <div className="my-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">Need inspiration? Try one of these:</p>
                    <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((p, i) => (
                             <button
                                key={i}
                                onClick={() => handleExampleClick(p)}
                                className="px-3 py-1 bg-slate-200 dark:bg-slate-700/50 text-sm rounded-full hover:bg-slate-300 dark:hover:bg-slate-600/50 text-slate-700 dark:text-gray-200 transition-all"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerateClick}
                    disabled={!prompt.trim()}
                    className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B] text-[#0F1724] font-bold rounded-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate
                </button>
            </div>
        </div>
    );
};

export default ImageGenerationModal;
