
import type { Conversation, User, LogEntry } from '../types';

// --- Users ---
export const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem('nepex-users');
        return users ? JSON.parse(users) : [];
    } catch {
        return [];
    }
};

export const saveUsers = (users: User[]): void => {
    localStorage.setItem('nepex-users', JSON.stringify(users));
};

export const addUser = (email: string): User => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase();
    const existingUser = users.find(u => u.email === normalizedEmail);
    if (existingUser) return existingUser;

    const newUser: User = {
        id: `user-${Date.now()}`,
        email: normalizedEmail,
        isBlocked: false,
        createdAt: Date.now(),
    };
    saveUsers([...users, newUser]);
    return newUser;
};

// --- Conversations ---
export const getConversations = (): Conversation[] => {
    try {
        const conversations = localStorage.getItem('nepex-conversations');
        return conversations ? JSON.parse(conversations) : [];
    } catch {
        return [];
    }
}

// --- Maintenance Mode ---
export const getMaintenanceMode = (): boolean => {
    return localStorage.getItem('maintenanceMode') === 'true';
}

export const setMaintenanceMode = (isEnabled: boolean): void => {
    localStorage.setItem('maintenanceMode', String(isEnabled));
}

// --- Admin ---
export const getIsAdmin = (): boolean => {
    return localStorage.getItem('isAdmin') === 'true';
}

// --- Logs ---
export const getLogs = (): LogEntry[] => {
    try {
        const logs = localStorage.getItem('nepex-logs');
        return logs ? JSON.parse(logs) : [];
    } catch {
        return [];
    }
};

export const addLog = (type: LogEntry['type'], details: string, userEmail?: string): void => {
    const logs = getLogs();
    const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type,
        details,
        userEmail
    };
    // Keep only last 1000 logs to prevent storage overflow
    const updatedLogs = [newLog, ...logs].slice(0, 1000);
    localStorage.setItem('nepex-logs', JSON.stringify(updatedLogs));
};
