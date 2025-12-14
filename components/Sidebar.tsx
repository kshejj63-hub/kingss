
import React, { useState } from 'react';
import { ChatSession } from '../types';
import { User, signInWithGoogle, logout } from '../services/firebase';
import LoginModal from './LoginModal';

interface SidebarProps {
  sessions?: ChatSession[]; 
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onClearHistory: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  currentModelId: string;
  onSelectModel: (id: string) => void;
  onOpenSettings: () => void;
  language: 'ar' | 'en';
  isInstalled?: boolean;
  onInstall?: () => void;
  isSettingsUnlocked?: boolean;
  onUnlockSettings?: () => void;
  user?: User | null;
  onOpenGroupSetup: () => void;
  onOpenWorkflow: () => void; 
  onOpenProfile?: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenLibrary: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions = [], 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  isOpen, 
  toggleSidebar,
  currentModelId,
  user,
  onOpenProfile,
  onOpenLibrary,
  language
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);

  const handleGoogleLogin = async () => {
      try { await signInWithGoogle(); } catch (err: any) { console.error(err); }
  };

  const handleLogout = async () => await logout();

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={() => {}} />
      
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={toggleSidebar} />}
      
      <div className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] text-gray-200 transform transition-transform duration-500 ease-out md:translate-x-0 border-r border-white/5 flex flex-col shadow-[5px_0_25px_rgba(0,0,0,0.3)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* NORTH: Library Button (Animated) */}
        <div className="p-4 pt-6">
            <button 
                onClick={onOpenLibrary}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all group shadow-lg active:scale-95 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                    📚
                </div>
                <div className="text-left relative z-10">
                    <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {language === 'ar' ? 'مكتبة المحادثات' : 'Library'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                        {sessions.length} Chats Saved
                    </div>
                </div>
            </button>
        </div>

        {/* Recent List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-hide">
            <div className="flex justify-between items-center px-2 mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent</span>
                <button onClick={onNewChat} className="text-xs text-indigo-400 hover:text-white transition-colors">+ New</button>
            </div>
            {sessions.slice(0, 5).map((session, index) => (
                <div 
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className={`p-3 rounded-xl text-sm truncate cursor-pointer transition-all border border-transparent animate-[menuItemAppear_0.5s_ease_forwards] ${currentSessionId === session.id ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200 hover:translate-x-1'}`}
                >
                    {session.isPinned && '📌 '} {session.title}
                </div>
            ))}
        </div>

        {/* LOGIN SECTION */}
        <div className="p-6 relative h-28 flex justify-center border-t border-white/5 bg-[#141414]/50 backdrop-blur-sm">
            {user ? (
                 <div onClick={onOpenProfile} className="flex items-center gap-3 w-full p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                     <img src={user.photoURL || ''} className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover" alt="Profile" />
                     <div className="flex-1 overflow-hidden">
                         <div className="text-sm font-bold text-white truncate">{user.displayName}</div>
                         <button onClick={(e) => {e.stopPropagation(); handleLogout()}} className="text-[10px] text-red-400 hover:text-red-300 transition-colors">Logout</button>
                     </div>
                 </div>
            ) : (
                <div className="relative flex flex-col items-center w-full">
                    <button 
                        onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-300 z-10 font-bold text-white text-sm gap-2"
                    >
                        <span>👤</span> {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </button>

                    {isLoginMenuOpen && (
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl p-2 animate-[slideInUp_0.2s_ease] z-50">
                             <div className="text-[10px] font-bold text-gray-500 px-2 py-1 uppercase">Sign In Options</div>
                             <button onClick={() => { setIsLoginModalOpen(true); setIsLoginMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-white text-sm flex gap-2"><span>✉</span> Email Registration</button>
                             <button onClick={() => { handleGoogleLogin(); setIsLoginMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-white text-sm flex gap-2"><span>🔵</span> Google</button>
                             <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-white text-sm flex gap-2"><span>🍎</span> Apple (Coming Soon)</button>
                             <div className="h-px bg-white/5 my-1"></div>
                             <button onClick={() => setIsLoginMenuOpen(false)} className="w-full text-center py-1 text-xs text-red-400 hover:text-red-300">Close</button>
                        </div>
                    )}
                </div>
            )}
        </div>

      </div>
    </>
  );
};

export default Sidebar;
