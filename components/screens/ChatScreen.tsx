
import React, { useState, useEffect, useCallback } from 'react';
import { sendMessageStream, generateTextToSpeech, generateImage } from '../../services/geminiService';
import type { Conversation, Message } from '../../types';
import ChatWindow from '../chat/ChatWindow';
import Sidebar from '../sidebar/Sidebar';
import SettingsModal from '../modals/SettingsModal';
import AdminModal from '../modals/AdminModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import ImageGenerationModal from '../modals/ImageGenerationModal';
import { useSettings } from '../../contexts/SettingsContext';
import { PERSONA_PROMPTS } from '../../constants';
import { useSound } from '../../hooks/useSound';
import { playBase64Audio } from '../../utils/audio';
import { SettingsIcon, MenuIcon } from '../assets/Icons';
import { addLog } from '../../services/storageService';

interface ChatScreenProps {
  onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onLogout }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [isImageGenModalOpen, setImageGenModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const { settings } = useSettings();
  const playSound = useSound();

  // --- Initialization & Storage ---
  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, []);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    const saved = localStorage.getItem('nepex-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed);
            setActiveConversationId(parsed[0].id);
        } else { createNewConversation(); }
      } catch { createNewConversation(); }
    } else { createNewConversation(); }
  }, [createNewConversation]);

  useEffect(() => {
    if (conversations.length > 0) localStorage.setItem('nepex-conversations', JSON.stringify(conversations));
    else localStorage.removeItem('nepex-conversations');
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // --- Logic: Send Message ---
  const executeSendMessage = useCallback(async (historyForApi: Message[], prompt: Message) => {
    if (!activeConversationId) return;
    setIsTyping(true);
    const assistantMessageId = `msg-${Date.now() + 1}`;

    // Add placeholder assistant message
    setConversations(prev => prev.map(c => c.id === activeConversationId ? {
        ...c, messages: [...c.messages, { id: assistantMessageId, text: '', sender: 'assistant', timestamp: Date.now() }]
    } : c));

    try {
      const stream = await sendMessageStream(
          PERSONA_PROMPTS[settings.persona],
          historyForApi, // Pass history WITHOUT the current user prompt
          prompt.text,
          prompt.attachment ? { data: prompt.attachment.data, mimeType: prompt.attachment.mimeType } : undefined
      );
      
      let responseText = '';
      for await (const chunk of stream) {
        responseText += chunk.text;
        setConversations(prev => prev.map(c => c.id === activeConversationId ? {
            ...c, messages: c.messages.map(m => m.id === assistantMessageId ? { ...m, text: responseText } : m)
        } : c));
      }
      playSound('receive');
      addLog('MESSAGE', 'AI generated response');
    } catch (error) {
      console.error("API Error:", error);
      playSound('error');
      setConversations(prev => prev.map(c => c.id === activeConversationId ? {
          ...c, messages: c.messages.map(m => m.id === assistantMessageId ? { ...m, text: "Connection error. Please try again." } : m)
      } : c));
    } finally { setIsTyping(false); }
  }, [activeConversationId, settings.persona, playSound]);

  // --- Logic: Image Generation ---
  const executeImageGeneration = useCallback(async (prompt: string, historyForApi: Message[]) => {
    if (!activeConversationId) return;

    setIsTyping(true);
    const assistantMessageId = `msg-${Date.now() + 1}`;
    
    setConversations(prev => prev.map(c => c.id === activeConversationId ? {
        ...c, messages: [...historyForApi, { id: assistantMessageId, sender: 'assistant', text: `Generating: ${prompt}`, timestamp: Date.now(), generating: true }]
    } : c));

    try {
      const base64Image = await generateImage(prompt);
      if (base64Image) {
        setConversations(prev => prev.map(c => c.id === activeConversationId ? {
            ...c, messages: c.messages.map(m => m.id === assistantMessageId ? {
                ...m, generating: false, text: '', attachment: { data: `data:image/png;base64,${base64Image}`, mimeType: 'image/png', name: `${prompt.slice(0,15)}.png` }
            } : m)
        } : c));
        playSound('receive');
        addLog('MESSAGE', 'AI generated image');
      } else { throw new Error('No data'); }
    } catch (e) {
      playSound('error');
      setConversations(prev => prev.map(c => c.id === activeConversationId ? {
          ...c, messages: c.messages.map(m => m.id === assistantMessageId ? { ...m, generating: false, text: "Could not generate image." } : m)
      } : c));
    } finally { setIsTyping(false); }
  }, [activeConversationId, playSound]);

  // --- Handlers ---
  const handleSendMessage = async (text: string, attachment?: { data: string; mimeType: string; name: string; }) => {
    if (!activeConversationId || (!text.trim() && !attachment)) return;
    
    playSound('send');
    addLog('MESSAGE', 'User sent a message');
    
    const userMessage: Message = { id: `msg-${Date.now()}`, text, sender: 'user', timestamp: Date.now(), attachment };
    
    // Optimistic Update
    let newHistory: Message[] = [];
    setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
            newHistory = [...c.messages, userMessage];
            let title = c.title;
            if (c.messages.length === 0 && text.trim()) title = text.trim().substring(0, 30);
            return { ...c, title, messages: newHistory };
        }
        return c;
    }));

    const imagineMatch = text.match(/^\/imagine\s+(.*)/);
    if (imagineMatch && imagineMatch[1]) {
        await executeImageGeneration(imagineMatch[1], newHistory);
    } else {
        await executeSendMessage(newHistory.slice(0, -1), userMessage);
    }
  };

  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
      if (!activeConversationId || isTyping) return;
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (!conversation) return;

      const msgIndex = conversation.messages.findIndex(m => m.id === messageId);
      if (msgIndex === -1) return;

      const historyForApi = conversation.messages.slice(0, msgIndex);
      const updatedMessage = { ...conversation.messages[msgIndex], text: newText };
      
      setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: [...historyForApi, updatedMessage] } : c));
      addLog('MESSAGE', 'User edited message');

      const imagineMatch = newText.match(/^\/imagine\s+(.*)/);
      if (imagineMatch && imagineMatch[1]) await executeImageGeneration(imagineMatch[1], [...historyForApi, updatedMessage]);
      else await executeSendMessage(historyForApi, updatedMessage);
  }, [activeConversationId, conversations, isTyping, executeSendMessage, executeImageGeneration]);

  const handleRegenerate = useCallback(async () => {
    if (!activeConversation || isTyping) return;
    
    const lastUserIndex = activeConversation.messages.findLastIndex(m => m.sender === 'user');
    if (lastUserIndex === -1) return;

    const historyForApi = activeConversation.messages.slice(0, lastUserIndex);
    const lastUserMsg = activeConversation.messages[lastUserIndex];
    const uiMessages = activeConversation.messages.slice(0, lastUserIndex + 1);

    setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: uiMessages } : c));
    addLog('MESSAGE', 'User regenerated response');
    
    const imagineMatch = lastUserMsg.text.match(/^\/imagine\s+(.*)/);
    if (imagineMatch && imagineMatch[1]) await executeImageGeneration(imagineMatch[1], uiMessages);
    else await executeSendMessage(historyForApi, lastUserMsg);
  }, [activeConversation, activeConversationId, isTyping, executeSendMessage, executeImageGeneration]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0F1724] transition-colors duration-300">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onConversationSelect={(id) => { setActiveConversationId(id); setSidebarOpen(false); }}
        onNewConversation={() => { createNewConversation(); setSidebarOpen(false); }}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onDeleteConversation={setConversationToDelete}
        isAdmin={isAdmin}
        onOpenAdminPanel={() => setAdminModalOpen(true)}
        onLogout={onLogout}
      />
      
      {isSidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="flex-shrink-0 flex items-center justify-between p-4 h-16 border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-[#0F1724]/80 backdrop-blur-sm z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-gray-300"><MenuIcon className="w-6 h-6" /></button>
          <h2 className="text-lg font-bold bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B] bg-clip-text text-transparent truncate">
            {activeConversation?.title || 'Nepex.ai'}
          </h2>
          <button onClick={() => setSettingsOpen(true)} className="p-2 text-slate-600 dark:text-gray-300"><SettingsIcon className="w-6 h-6" /></button>
        </header>

        <ChatWindow
          conversation={activeConversation}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onPlayTTS={async (text) => { const audio = await generateTextToSpeech(text); if(audio) await playBase64Audio(audio); }}
          onRegenerate={handleRegenerate}
          onOpenImageGenModal={() => setImageGenModalOpen(true)}
          onEditMessage={handleEditMessage}
        />
      </main>

      {isSettingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {isAdmin && isAdminModalOpen && <AdminModal onClose={() => setAdminModalOpen(false)} />}
      {isImageGenModalOpen && <ImageGenerationModal onClose={() => setImageGenModalOpen(false)} onGenerate={(p) => handleSendMessage(`/imagine ${p}`)} />}
      
      <ConfirmationModal
        isOpen={!!conversationToDelete}
        onClose={() => setConversationToDelete(null)}
        onConfirm={() => {
            if(conversationToDelete) {
                const remaining = conversations.filter(c => c.id !== conversationToDelete);
                setConversations(remaining);
                if (activeConversationId === conversationToDelete) {
                    remaining.length > 0 ? setActiveConversationId(remaining[0].id) : createNewConversation();
                }
                setConversationToDelete(null);
            }
        }}
        title="Delete Chat"
        message="Are you sure you want to delete this conversation?"
      />
    </div>
  );
};

export default ChatScreen;
