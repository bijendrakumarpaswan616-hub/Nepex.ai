
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  attachment?: {
    data: string; // base64 data URL
    mimeType: string;
    name: string;
  };
  generating?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface Settings {
  soundEffects: boolean;
  persona: 'default' | 'concise' | 'tutor' | 'developer' | 'creative';
  theme: 'light' | 'dark' | 'system';
  credits: number;
  nextRefillTimestamp: number;
}

export interface User {
  id: string;
  email: string;
  isBlocked: boolean;
  createdAt: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'LOGIN' | 'LOGOUT' | 'MESSAGE' | 'ERROR';
  details: string;
  userEmail?: string;
}
