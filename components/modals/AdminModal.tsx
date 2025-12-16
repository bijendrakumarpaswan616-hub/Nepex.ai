
import React, { useState, useEffect, useMemo } from 'react';
import { UserIcon, MessageSquareIcon, SlashIcon, ShieldOffIcon, FileTextIcon, BarChart2Icon } from '../assets/Icons';
import { getUsers, getConversations, getMaintenanceMode, setMaintenanceMode, saveUsers, getLogs } from '../../services/storageService';
import type { User, LogEntry } from '../../types';

interface AdminModalProps {
  onClose: () => void;
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg flex items-center gap-4">
        <div className="bg-teal-500/10 text-teal-500 p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-gray-100">{value}</p>
        </div>
    </div>
);


const AdminModal: React.FC<AdminModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');
    const [isMaintenance, setIsMaintenance] = useState(getMaintenanceMode());
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [totalMessages, setTotalMessages] = useState(0);

    useEffect(() => {
        setUsers(getUsers());
        setLogs(getLogs());
        const conversations = getConversations();
        const messageCount = conversations.reduce((acc, curr) => acc + curr.messages.length, 0);
        setTotalMessages(messageCount);
    }, []);

    const handleMaintenanceToggle = () => {
        const newValue = !isMaintenance;
        setIsMaintenance(newValue);
        setMaintenanceMode(newValue);
    };

    const handleUserBlockToggle = (userId: string) => {
        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                return { ...user, isBlocked: !user.isBlocked };
            }
            return user;
        });
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
    };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-[#0F1724] border border-slate-200 dark:border-slate-700/50 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Admin Control Panel</h2>
                <p className="text-xs font-mono text-green-500 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                </p>
            </div>
            <div className="flex space-x-4">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'overview' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <BarChart2Icon className="w-4 h-4"/> Overview
                </button>
                <button 
                    onClick={() => setActiveTab('logs')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'logs' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <FileTextIcon className="w-4 h-4"/> Activity Logs
                </button>
            </div>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {activeTab === 'overview' ? (
                <>
                {/* Statistics Section */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-3">Live Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard title="Total Registered Users" value={users.length.toLocaleString()} icon={<UserIcon className="w-6 h-6"/>} />
                        <StatCard title="Total Messages Sent" value={totalMessages.toLocaleString()} icon={<MessageSquareIcon className="w-6 h-6"/>} />
                    </div>
                </div>

                {/* System Controls Section */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-3">System Controls</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                        <div className="pr-4">
                            <label htmlFor="maintenance-toggle" className="font-medium text-slate-700 dark:text-gray-200">Maintenance Mode</label>
                            <p className="text-xs text-slate-500 dark:text-gray-400">When enabled, only admins can access the app.</p>
                        </div>
                        <button
                            id="maintenance-toggle"
                            role="switch"
                            aria-checked={isMaintenance}
                            onClick={handleMaintenanceToggle}
                            className={`relative w-12 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${isMaintenance ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${isMaintenance ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        </div>
                    </div>
                </div>
                
                {/* User Management Section */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-3">User Management</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg max-h-60 overflow-y-auto">
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {users.map(user => (
                                <li key={user.id} className="p-3 flex items-center justify-between">
                                    <div>
                                        <p className={`font-medium ${user.isBlocked ? 'text-red-500 line-through' : 'text-slate-800 dark:text-gray-200'}`}>{user.email}</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleUserBlockToggle(user.id)}
                                        className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full ${user.isBlocked ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}`}
                                    >
                                        {user.isBlocked ? <ShieldOffIcon className="w-4 h-4"/> : <SlashIcon className="w-4 h-4"/>}
                                        {user.isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                </>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-gray-300">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No activity logs found.</td>
                                </tr>
                            )}
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                            log.type === 'LOGIN' ? 'bg-green-100 text-green-700' :
                                            log.type === 'LOGOUT' ? 'bg-orange-100 text-orange-700' :
                                            log.type === 'ERROR' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-800 dark:text-gray-200">{log.userEmail || 'Anonymous'}</td>
                                    <td className="px-4 py-3">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700/50 flex-shrink-0">
            <button onClick={onClose} className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 text-slate-800 dark:text-gray-200 font-bold rounded-lg">
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
