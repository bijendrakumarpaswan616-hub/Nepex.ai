
import React, { useState, useMemo } from 'react';
import type { Conversation } from '../../types';
import Logo from '../assets/Logo';
import { Trash2Icon, ShieldIcon, LogOutIcon, XIcon, SearchIcon } from '../assets/Icons';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
  onDeleteConversation: (id: string) => void;
  isAdmin: boolean;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, activeConversationId, onConversationSelect, onNewConversation, isOpen, onClose, onDeleteConversation, isAdmin, onOpenAdminPanel, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(query) ||
      conv.messages.some(msg => msg.text.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  return (
    <aside className={`w-72 bg-slate-50/80 dark:bg-slate-900/70 backdrop-blur-md flex flex-col border-r border-slate-200 dark:border-slate-700/50
                       fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
                       md:relative md:translate-x-0
                       ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-200 dark:border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
            <Logo className="w-8 h-8"/>
            <h1 className="text-xl font-bold text-slate-900 dark:text-gray-100">Nepex.ai</h1>
        </div>
        <button onClick={onClose} className="md:hidden p-1 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 rounded-full" aria-label="Close sidebar">
            <XIcon className="w-6 h-6"/>
        </button>
      </div>
      <div className="p-4 flex-shrink-0 space-y-4">
        <button
          onClick={onNewConversation}
          className="w-full px-4 py-2 bg-gradient-to-r from-[#2EE6C8] to-[#FFD66B] text-[#0F1724] font-bold rounded-lg transition-transform hover:scale-105"
        >
          + New Chat
        </button>
        <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-200 dark:bg-slate-800 border border-transparent focus:border-teal-500 rounded-lg text-sm text-slate-900 dark:text-gray-200 outline-none placeholder:text-slate-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <XIcon className="w-3 h-3" />
              </button>
            )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {filteredConversations.length === 0 && searchQuery && (
            <div className="text-center text-slate-500 dark:text-gray-400 text-sm mt-4">
                No conversations found.
            </div>
        )}
        {filteredConversations.map((conv) => (
          <div key={conv.id} className="relative group">
            <button
              onClick={() => onConversationSelect(conv.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md truncate transition-colors pr-8 ${
                activeConversationId === conv.id
                  ? 'bg-teal-500/10 text-teal-500 font-semibold'
                  : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-800/50'
              }`}
            >
              {conv.title}
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-gray-500 rounded-full hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete conversation"
            >
                <Trash2Icon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 mt-auto space-y-2 flex-shrink-0">
        {isAdmin && (
          <button
            onClick={onOpenAdminPanel}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors"
          >
            <ShieldIcon className="w-5 h-5" />
            <span>Admin Panel</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
