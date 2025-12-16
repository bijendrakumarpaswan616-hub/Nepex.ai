
import React, { useRef, useEffect } from 'react';
import type { Conversation, Message } from '../../types';
import MessageBubble from './MessageBubble';
import ChatInputBar from './ChatInputBar';
import Welcome from './Welcome';

interface ChatWindowProps {
  conversation: Conversation | undefined;
  isTyping: boolean;
  onSendMessage: (text: string, attachment?: { data: string; mimeType: string; name: string; }) => void;
  onPlayTTS: (text: string) => Promise<void>;
  onRegenerate: () => void;
  onOpenImageGenModal: () => void;
  onEditMessage: (messageId: string, newText: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, isTyping, onSendMessage, onPlayTTS, onRegenerate, onOpenImageGenModal, onEditMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Select a conversation or start a new one.</p>
      </div>
    );
  }
  
  const lastAssistantMessage = conversation && [...conversation.messages].reverse().find(m => m.sender === 'assistant' && (m.text || m.attachment) && !m.generating);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {conversation.messages.length === 0 ? (
           <Welcome onPromptClick={(prompt) => onSendMessage(prompt)} />
        ) : (
          conversation.messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onPlayTTS={onPlayTTS} 
              isLastAssistantMessage={msg.id === lastAssistantMessage?.id}
              onRegenerate={onRegenerate}
              onEditMessage={onEditMessage}
              isTyping={false}
            />
          ))
        )}
        {isTyping && conversation.messages[conversation.messages.length - 1]?.sender === 'user' && !conversation.messages[conversation.messages.length - 1]?.text.startsWith('/imagine') && (
           <MessageBubble message={{id:'typing', text:'', sender:'assistant', timestamp: Date.now()}} onPlayTTS={async ()=>{}} onRegenerate={() => {}} onEditMessage={() => {}} isTyping={true} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInputBar onSendMessage={onSendMessage} isTyping={isTyping} onOpenImageGenModal={onOpenImageGenModal} />
    </div>
  );
};

export default ChatWindow;
