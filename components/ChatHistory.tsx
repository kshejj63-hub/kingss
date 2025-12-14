
import React, { useState } from 'react';
import { ChatSession } from '../types';
import { AVAILABLE_MODELS } from '../services/geminiService';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  language: 'ar' | 'en';
  onTogglePin: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  language,
  onTogglePin,
  onRenameSession
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  // Format: "Dec 15, 2024 | 14:30"
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(timestamp)).replace(',', ' |');
  };

  const getModelName = (modelId: string) => {
      const m = AVAILABLE_MODELS.find(x => x.id === modelId);
      return m ? m.nickname : 'AI';
  };

  const handleStartEdit = (session: ChatSession, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingId(session.id);
      setEditTitle(session.title);
  };

  const handleSaveEdit = (id: string) => {
      onRenameSession(id, editTitle);
      setEditingId(null);
  };

  // Sort: Pinned first, then by date desc
  const sortedSessions = [...sessions].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm h-full bg-gray-900/95 backdrop-blur-xl shadow-2xl border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Apple Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
             <div className="flex items-center gap-2">
                 <span className="text-lg">📱</span>
                 <h2 className="text-lg font-bold text-white tracking-wide">Chat History</h2>
             </div>
             <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
            <input 
                type="text" 
                placeholder="🔍 Search chats..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder-gray-600"
            />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
             {sortedSessions.length === 0 ? (
                 <div className="text-center text-gray-600 mt-10">
                     <p>No conversations yet.</p>
                 </div>
             ) : (
                 sortedSessions.map(session => (
                     <div 
                        key={session.id} 
                        onClick={() => { onSelectSession(session.id); onClose(); }} 
                        className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                            currentSessionId === session.id 
                            ? 'bg-white/10 border-indigo-500/50 shadow-lg' 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                     >
                         <div className="flex justify-between items-start mb-2">
                             {editingId === session.id ? (
                                 <input 
                                    value={editTitle} 
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onBlur={() => handleSaveEdit(session.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(session.id)}
                                    className="bg-black/50 text-white text-sm rounded px-1 w-full outline-none border border-indigo-500"
                                    autoFocus
                                 />
                             ) : (
                                 <div className="flex items-center gap-2">
                                     {session.isPinned && <span className="text-[10px]">📌</span>}
                                     <h4 className={`font-bold text-sm line-clamp-1 ${session.isPinned ? 'text-indigo-300' : 'text-gray-200'}`}>
                                         {session.title}
                                     </h4>
                                 </div>
                             )}
                         </div>

                         <div className="flex flex-col gap-1 text-[10px] text-gray-500 font-mono">
                             <div className="flex justify-between">
                                 <span>{formatDate(session.updatedAt)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-gray-400">👤 With: {getModelName(session.modelId)}</span>
                             </div>
                         </div>

                         {/* Hover Actions */}
                         <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={(e) => { e.stopPropagation(); onTogglePin(session.id); }} 
                                className="text-gray-400 hover:text-indigo-400"
                                title="Pin"
                            >
                                📌
                             </button>
                             <button 
                                onClick={(e) => handleStartEdit(session, e)} 
                                className="text-gray-400 hover:text-white"
                                title="Rename"
                            >
                                ✏️
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} 
                                className="text-gray-400 hover:text-red-400"
                                title="Delete"
                            >
                                🗑
                             </button>
                         </div>
                     </div>
                 ))
             )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
