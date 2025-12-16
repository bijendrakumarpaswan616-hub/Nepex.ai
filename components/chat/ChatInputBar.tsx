import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicIcon, PaperclipIcon, FileTextIcon, CameraIcon, VideoIcon, XIcon, SparklesIcon } from '../assets/Icons';
import CameraModal from '../modals/CameraModal';


// Fix for SpeechRecognition API not being in standard TypeScript lib
// See: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  }
}

interface ChatInputBarProps {
  onSendMessage: (text: string, attachment?: { data: string; mimeType: string; name: string; }) => void;
  isTyping: boolean;
  onOpenImageGenModal: () => void;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, isTyping, onOpenImageGenModal }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string; name: string; } | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Fix: Use type definitions for SpeechRecognition and remove 'as any'
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setText(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleSend = () => {
    if ((text.trim() || attachment) && !isTyping) {
      onSendMessage(text, attachment);
      setText('');
      setAttachment(undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleMicClick = () => {
    if (recognitionRef.current) {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    } else {
        alert("Speech recognition is not supported in your browser.");
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachment({
                data: reader.result as string,
                mimeType: file.type,
                name: file.name
            });
        }
        reader.readAsDataURL(file);
    }
    // Reset file input value to allow re-uploading the same file
    if(e.target) e.target.value = '';
  };
  
  const handleCapture = (capturedAttachment: { data: string; mimeType: string; name: string; }) => {
    setAttachment(capturedAttachment);
    setCameraOpen(false);
  }

  const renderAttachmentPreview = () => {
    if (!attachment) return null;

    return (
      <div className="relative mb-2 p-2 bg-slate-200 dark:bg-slate-600/50 rounded-lg flex items-center gap-2 max-w-xs">
        {attachment.mimeType.startsWith('image/') ? (
          <img src={attachment.data} className="h-20 w-auto rounded" alt={attachment.name} />
        ) : attachment.mimeType.startsWith('video/') ? (
          <video src={attachment.data} className="h-20 w-auto rounded" controls />
        ) : (
          <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300 p-2">
            <FileTextIcon className="w-8 h-8 flex-shrink-0" />
            <span className="text-sm truncate">{attachment.name}</span>
          </div>
        )}
        <button 
          onClick={() => setAttachment(undefined)} 
          className="absolute -top-2 -right-2 bg-slate-700 hover:bg-slate-800 text-white rounded-full p-0.5"
          aria-label="Remove attachment"
        >
            <XIcon className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <>
    <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700/50">
      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-2 flex items-end gap-2">
        <div className="relative">
            <button ref={attachmentButtonRef} onClick={() => setShowAttachmentMenu(s => !s)} className="p-2 text-slate-500 dark:text-gray-400 hover:text-[#2EE6C8] rounded-full">
                <PaperclipIcon className="w-6 h-6"/>
            </button>
            {showAttachmentMenu && (
                <div className="absolute bottom-full mb-2 w-52 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg py-1 z-10">
                    <p className="px-3 py-2 text-xs text-slate-400 dark:text-gray-500">Try <code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">/imagine</code></p>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                    <button onClick={() => { onOpenImageGenModal(); setShowAttachmentMenu(false); }} className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-gray-200">
                        <SparklesIcon className="w-5 h-5"/> Generate Image
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }} className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-gray-200">
                        <FileTextIcon className="w-5 h-5"/> Upload File
                    </button>
                    <button onClick={() => { setCameraMode('photo'); setCameraOpen(true); setShowAttachmentMenu(false); }} className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-gray-200">
                        <CameraIcon className="w-5 h-5"/> Take Photo
                    </button>
                    <button onClick={() => { setCameraMode('video'); setCameraOpen(true); setShowAttachmentMenu(false); }} className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-gray-200">
                        <VideoIcon className="w-5 h-5"/> Record Video
                    </button>
                </div>
            )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" className="hidden"/>
        <div className="flex-1 flex flex-col">
            {renderAttachmentPreview()}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or /imagine..."
              rows={1}
              className="w-full bg-transparent resize-none outline-none text-slate-900 dark:text-gray-200 placeholder:text-slate-500 dark:placeholder-gray-500"
              style={{maxHeight: '100px'}}
            />
        </div>
        <button onClick={handleMicClick} className={`p-2 rounded-full ${isRecording ? 'text-red-500' : 'text-slate-500 dark:text-gray-400 hover:text-[#2EE6C8]'}`}>
            <MicIcon className="w-6 h-6"/>
        </button>
        <button onClick={handleSend} disabled={isTyping || (!text.trim() && !attachment)} className="p-3 bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B] rounded-full text-black disabled:opacity-50 transition-opacity">
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
    {isCameraOpen && <CameraModal mode={cameraMode} onClose={() => setCameraOpen(false)} onCapture={handleCapture} />}
    </>
  );
};

export default ChatInputBar;
