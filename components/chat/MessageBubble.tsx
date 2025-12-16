
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../../types';
import { Volume2Icon, UserIcon, ShareIcon, CopyIcon, RefreshCwIcon, CheckIcon, FileTextIcon, SparklesIcon, Edit2Icon, XIcon } from '../assets/Icons';
import Logo from '../assets/Logo';
import { resumeAudioContext } from '../../utils/audio';

interface MessageBubbleProps {
  message: Message;
  isTyping?: boolean;
  isLastAssistantMessage?: boolean;
  onPlayTTS: (text: string) => Promise<void>;
  onRegenerate: () => void;
  onEditMessage: (messageId: string, newText: string) => void;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

const ImageGenerationSkeleton: React.FC<{text: string}> = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 text-teal-500 animate-spin">
            <SparklesIcon />
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400 text-center">{text}</p>
    </div>
);


const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (isCopied) return;
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="relative group my-2 bg-slate-100 dark:bg-slate-900 rounded-md">
            <div className="flex justify-between items-center text-xs text-slate-400 dark:text-gray-500 px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                <span>{language}</span>
                <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1 p-1 rounded-md text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700/50"
                    aria-label={isCopied ? "Copied" : "Copy code"}
                >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-teal-500" /> : <CopyIcon className="w-4 h-4" />}
                    <span className="text-xs font-medium">{isCopied ? 'Copied!' : 'Copy Code'}</span>
                </button>
            </div>
            <pre className="block text-sm p-3 overflow-x-auto">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTyping = false, isLastAssistantMessage = false, onPlayTTS, onRegenerate, onEditMessage }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUser = message.sender === 'user';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Adjust height
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(message.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nepex.ai Response',
          text: message.text,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
      alert('Content copied to clipboard. Your browser does not support the Share API.');
    }
  };
  
  const handleSaveEdit = () => {
      if (editedText.trim() && editedText.trim() !== message.text) {
          onEditMessage(message.id, editedText);
      }
      setIsEditing(false);
  };

  const handleCancelEdit = () => {
      setEditedText(message.text);
      setIsEditing(false);
  };

  const handlePlayTTS = async () => {
      if (isLoadingTTS) return;
      setIsLoadingTTS(true);
      try {
          // IMPORTANT: Resume context on user gesture to avoid "audio context blocked" and reduce latency
          await resumeAudioContext();
          await onPlayTTS(message.text);
      } finally {
          setIsLoadingTTS(false);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          handleSaveEdit();
      } else if (e.key === 'Escape') {
          handleCancelEdit();
      }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditedText(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
  };

  const formatTextPart = (textPart: string) => {
    let content = textPart
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-300 dark:bg-slate-700 text-sm rounded px-1 py-0.5">$1</code>');

    const lines = content.split('\n');
    const newLines = [];
    let inList = null;
    let paraBuffer = [];

    const flushPara = () => {
        if(paraBuffer.length > 0) {
            newLines.push(`<p>${paraBuffer.join('\n')}</p>`);
            paraBuffer = [];
        }
    }
    
    for (const line of lines) {
        const olMatch = line.match(/^\s*(\d+)\.\s+(.*)/);
        const ulMatch = line.match(/^\s*[-*]\s+(.*)/);

        if(olMatch || ulMatch) {
            flushPara();
            const currentListType = olMatch ? 'ol' : 'ul';
            const itemContent = olMatch ? olMatch[2] : ulMatch[1];
            if (inList !== currentListType) {
                if (inList) newLines.push(`</${inList}>`);
                newLines.push(`<${currentListType}>`);
                inList = currentListType;
            }
            newLines.push(`<li>${itemContent}</li>`);
        } else {
            if(inList) {
                newLines.push(`</${inList}>`);
                inList = null;
            }

            if(line.trim() === '') {
                flushPara();
            } else {
                paraBuffer.push(line);
            }
        }
    }

    flushPara();
    if (inList) {
        newLines.push(`</${inList}>`);
    }
    
    return newLines.join('');
  }

  const renderMessageContent = (text: string) => {
    if (!text) return null;
    if (text.startsWith('/imagine ')) {
        return (
            <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-teal-300"/>
                <span className="italic">{text.substring(8)}</span>
            </div>
        )
    }
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const parts = text.split(codeBlockRegex);

    return parts.map((part, index) => {
        if (index % 2 === 1) { // It's a code block
            const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
            if (match) {
                const [, lang, code] = match;
                return <CodeBlock key={index} language={lang || 'plaintext'} code={code.trim()} />;
            }
        }
        
        const html = formatTextPart(part);
        if (!html.trim()) return null;

        return <div key={index} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  const renderAttachment = (attachment: Message['attachment']) => {
    if (!attachment) return null;

    const { mimeType, data, name } = attachment;

    if (mimeType.startsWith('image/')) {
        return <img src={data} alt={name} className="rounded-lg mb-2 max-w-xs" />;
    }
    if (mimeType.startsWith('video/')) {
        return <video src={data} controls className="rounded-lg mb-2 max-w-xs" />;
    }
    if (mimeType.startsWith('audio/')) {
        return <audio src={data} controls className="my-2" />;
    }
    return (
        <a href={data} download={name} className="flex items-center gap-2 p-2 bg-slate-300 dark:bg-slate-700/50 rounded-lg my-2 hover:bg-slate-400/50 dark:hover:bg-slate-600/50 transition-colors">
            <FileTextIcon className="w-6 h-6 flex-shrink-0 text-slate-600 dark:text-gray-300" />
            <span className="text-sm text-slate-700 dark:text-gray-200 truncate">{name}</span>
        </a>
    )
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-amber-500' : ''}`}>
        {isUser ? (
          <UserIcon className="w-5 h-5 text-white" />
        ) : (
          <Logo className="w-8 h-8" />
        )}
      </div>
      <div className={`max-w-xl p-4 rounded-2xl min-w-0 ${isUser ? 'bg-teal-500 text-white dark:bg-slate-700 dark:text-gray-200 rounded-br-none' : 'bg-slate-200 dark:bg-slate-800 rounded-bl-none'}`}>
        {renderAttachment(message.attachment)}
        
        {isEditing ? (
             <div className="w-full">
                 <textarea
                     ref={textareaRef}
                     value={editedText}
                     onChange={handleTextareaChange}
                     onKeyDown={handleKeyDown}
                     className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none mb-2 overflow-hidden"
                     rows={1}
                 />
                 <div className="flex justify-end gap-2">
                     <button onClick={handleCancelEdit} className="p-1.5 rounded-full bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-700 dark:text-gray-200" aria-label="Cancel edit">
                         <XIcon className="w-4 h-4"/>
                     </button>
                     <button onClick={handleSaveEdit} className="p-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white" aria-label="Save edit">
                         <CheckIcon className="w-4 h-4"/>
                     </button>
                 </div>
                 <p className="text-xs opacity-60 mt-1 text-right mr-1">Esc to cancel • Ctrl+Enter to save</p>
             </div>
        ) : isTyping ? (
          <TypingIndicator />
        ) : message.generating ? (
           <ImageGenerationSkeleton text={message.text}/>
        ) : (
          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none break-words">
            {renderMessageContent(message.text)}
          </div>
        )}

        {/* User Message Actions */}
        {isUser && !isEditing && !isTyping && !message.generating && (
             <div className="flex items-center gap-3 mt-2 justify-end opacity-90 text-teal-100 dark:text-gray-400">
                 <button onClick={() => setIsEditing(true)} className="hover:text-white dark:hover:text-teal-400 transition-colors" aria-label="Edit message">
                     <Edit2Icon className="w-4 h-4" />
                 </button>
                 <button onClick={handleCopy} className="hover:text-white dark:hover:text-teal-400 transition-colors" aria-label="Copy message">
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-300" /> : <CopyIcon className="w-4 h-4" />}
                 </button>
             </div>
        )}

        {/* Assistant Message Actions */}
        {!isUser && !isTyping && !message.generating && message.text && (
           <div className="flex items-center gap-3 mt-2 text-slate-400 dark:text-gray-500">
                <button 
                  onClick={handlePlayTTS} 
                  className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors relative" 
                  aria-label="Play text to speech"
                  disabled={isLoadingTTS}
                >
                    {isLoadingTTS ? (
                        <RefreshCwIcon className="w-4 h-4 animate-spin" />
                    ) : (
                        <Volume2Icon className="w-4 h-4" />
                    )}
                </button>
                <button onClick={handleCopy} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors" aria-label="Copy message">
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                </button>
                <button onClick={handleShare} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors" aria-label="Share message">
                    <ShareIcon className="w-4 h-4" />
                </button>
                {isLastAssistantMessage && (
                     <button onClick={onRegenerate} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors" aria-label="Regenerate response">
                         <RefreshCwIcon className="w-4 h-4" />
                     </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
