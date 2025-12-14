
import React, { useState, useMemo } from 'react';
import { ChatSession } from '../types';
import { AVAILABLE_MODELS } from '../services/geminiService';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  language: 'ar' | 'en';
}

const LibraryModal: React.FC<LibraryModalProps> = ({ 
  isOpen, onClose, sessions, onSelectSession, onDeleteSession, onTogglePin, onRenameSession, language 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned' | 'recent'>('all');
  const [isBackupLoading, setIsBackupLoading] = useState(false);

  if (!isOpen) return null;

  const t = {
    ar: {
      library: 'مكتبة المحادثات',
      searchPlaceholder: '🔍 ابحث في العناوين أو المحتوى...',
      chats: 'محادثات',
      size: 'الحجم',
      export: 'تصدير الكل',
      backup: 'نسخ احتياطي',
      newChat: 'محادثة جديدة',
      filterAll: 'الكل',
      filterPinned: 'المثبتة',
      filterRecent: 'الأحدث',
      noResults: 'لم يتم العثور على نتائج',
      open: 'فتح',
      rename: 'تعديل',
      delete: 'حذف',
      confirmDelete: 'هل أنت متأكد من حذف هذه المحادثة؟',
      backupSuccess: 'تم إنشاء النسخة الاحتياطية بنجاح!',
      userDefined: 'اسم مخصص',
      date: 'التاريخ',
      model: 'النموذج'
    },
    en: {
      library: 'Chat Library',
      searchPlaceholder: '🔍 Search titles or content...',
      chats: 'Chats',
      size: 'Total Size',
      export: 'Export All',
      backup: 'Backup',
      newChat: 'New Chat',
      filterAll: 'All',
      filterPinned: 'Pinned',
      filterRecent: 'Recent',
      noResults: 'No conversations found',
      open: 'Open',
      rename: 'Rename',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this chat?',
      backupSuccess: 'Backup created successfully!',
      userDefined: 'Custom Name',
      date: 'Date',
      model: 'Model'
    }
  }[language];

  // --- Logic 1: Advanced Search & Filter ---
  const filteredSessions = useMemo(() => {
    let result = sessions;

    // Filter
    if (filter === 'pinned') result = result.filter(s => s.isPinned);
    if (filter === 'recent') result = [...result].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);

    // Search (Title OR Content)
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(lowerTerm) || 
        s.messages.some(m => m.content.toLowerCase().includes(lowerTerm))
      );
    }

    return result.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.updatedAt - a.updatedAt);
  }, [sessions, searchTerm, filter]);

  // --- Logic 2: Stats Calculation ---
  const totalSize = useMemo(() => {
    const sizeBytes = new Blob([JSON.stringify(sessions)]).size;
    return (sizeBytes / 1024 / 1024).toFixed(2); // MB
  }, [sessions]);

  // --- Logic 3: Export/Backup ---
  const handleBackup = () => {
    setIsBackupLoading(true);
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `super_bev_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      alert(t.backupSuccess);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleRename = (id: string, currentTitle: string) => {
    const newTitle = prompt(language === 'ar' ? "الاسم الجديد:" : "New Name:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      onRenameSession(id, newTitle.trim());
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t.confirmDelete)) {
      onDeleteSession(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] w-[90%] max-w-5xl h-[85vh] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111]">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">📚</span> {t.library}
                    </h2>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><strong className="text-[#4cc9f0]">{sessions.length}</strong> {t.chats}</span>
                        <span className="flex items-center gap-1"><strong className="text-[#4cc9f0]">{totalSize}</strong> MB {t.size}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button onClick={handleBackup} disabled={isBackupLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
                        <span>💾</span> {isBackupLoading ? '...' : t.backup}
                    </button>
                    <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">✕</button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="p-6 bg-white/5 border-b border-white/10 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-10 text-white focus:border-[#4cc9f0] focus:shadow-[0_0_15px_rgba(76,201,240,0.3)] outline-none transition-all"
                    />
                    <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                </div>
                <div className="flex gap-2">
                    {(['all', 'pinned', 'recent'] as const).map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                filter === f 
                                ? 'bg-[#4361ee] border-[#4361ee] text-white shadow-lg' 
                                : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {f === 'all' ? t.filterAll : f === 'pinned' ? t.filterPinned : t.filterRecent}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0e0e0e]/50">
                {filteredSessions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <span className="text-6xl mb-4">📭</span>
                        <p className="text-xl">{t.noResults}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSessions.map((session) => {
                            const model = AVAILABLE_MODELS.find(m => m.id === session.modelId);
                            return (
                                <div 
                                    key={session.id} 
                                    className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-[#4cc9f0]/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                                    onClick={() => { onSelectSession(session.id); onClose(); }}
                                >
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-2xl border border-white/5 shadow-inner">
                                                {model?.icon || '🤖'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-white truncate max-w-[150px] group-hover:text-[#4cc9f0] transition-colors" title={session.title}>
                                                    {session.title}
                                                </h3>
                                                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                                                    {session.userDefinedTitle && <span className="text-green-400 bg-green-400/10 px-1 rounded">✎ {t.userDefined}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {session.isPinned && <span className="text-[#ffd700] text-lg animate-pulse">📌</span>}
                                    </div>

                                    {/* Card Body (Snippet) */}
                                    <div className="flex-1 mb-4">
                                        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed bg-black/20 p-2 rounded-lg">
                                            {session.messages[session.messages.length - 1]?.content || "..."}
                                        </p>
                                    </div>

                                    {/* Card Footer (Actions) */}
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleRename(session.id, session.title); }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors"
                                                title={t.rename}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onTogglePin(session.id); }}
                                                className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${session.isPinned ? 'text-[#ffd700]' : 'text-gray-400 hover:text-[#ffd700]'}`}
                                                title="Pin"
                                            >
                                                📌
                                            </button>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                            title={t.delete}
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default LibraryModal;
