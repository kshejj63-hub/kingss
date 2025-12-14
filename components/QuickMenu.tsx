
import React from 'react';

interface QuickMenuProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  onAction: (action: string) => void;
}

const QuickMenu: React.FC<QuickMenuProps> = ({ isOpen, onClose, language, onAction }) => {
  if (!isOpen) return null;

  const t = {
      ar: { menu: 'القائمة', settings: 'الإعدادات', newChat: 'محادثة جديدة', library: 'المكتبة', theme: 'المظهر', models: 'النماذج', help: 'مساعدة', logout: 'خروج' },
      en: { menu: 'Menu', settings: 'Settings', newChat: 'New Chat', library: 'Library', theme: 'Theme', models: 'AI Models', help: 'Help', logout: 'Logout' }
  }[language];

  return (
    <div 
        className="fixed z-[100] w-[280px] animate-[menuSlideIn_0.3s_ease_forwards]"
        style={{ right: '20px', top: '70px' }}
    >
        <div className="glass-panel rounded-2xl p-4 overflow-hidden relative border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t.menu}</span>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <GridItem icon="⚙" label={t.settings} onClick={() => onAction('settings')} delay={0} />
                    <GridItem icon="💬" label={t.newChat} onClick={() => onAction('new_chat')} delay={1} />
                    <GridItem icon="📚" label={t.library} onClick={() => onAction('history')} delay={2} />
                    <GridItem icon="🤖" label={t.models} onClick={() => onAction('models')} delay={3} />
                    <GridItem icon="❓" label={t.help} onClick={() => {}} delay={4} />
                    <GridItem icon="🚪" label={t.logout} onClick={() => onAction('logout')} delay={5} isDestructive />
                </div>
            </div>
        </div>
    </div>
  );
};

const GridItem: React.FC<{ icon: string, label: string, onClick: () => void, delay: number, isDestructive?: boolean }> = ({ icon, label, onClick, delay, isDestructive }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group ${
            isDestructive 
            ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20' 
            : 'bg-white/5 hover:bg-[#007AFF]/20 border-white/5 hover:border-[#007AFF]/30 hover:shadow-[0_0_20px_rgba(0,122,255,0.3)]'
        } border`}
        style={{ animation: `menuItemAppear 0.3s ease forwards`, animationDelay: `${delay * 0.05}s`, opacity: 0 }}
    >
        <span className={`text-2xl mb-1 group-hover:scale-110 transition-transform ${isDestructive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}>{icon}</span>
        <span className={`text-[10px] font-bold ${isDestructive ? 'text-red-400' : 'text-gray-400 group-hover:text-white'}`}>{label}</span>
    </button>
);

export default QuickMenu;
