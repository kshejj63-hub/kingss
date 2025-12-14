
import React, { useState, useEffect } from 'react';
import { AVAILABLE_MODELS } from '../services/geminiService';

interface TopBarProps {
  language: 'ar' | 'en';
  onOpenSettings: () => void;
  onNewChat: () => void;
  onToggleSearch: () => void;
  currentModelId: string;
  onSelectModel: (id: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  language,
  onOpenSettings,
  onNewChat,
  onToggleSearch,
  currentModelId,
  onSelectModel
}) => {
  const [dateState, setDateState] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const currentModel = AVAILABLE_MODELS.find(m => m.id === currentModelId) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const timer = setInterval(() => setDateState(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = dateState.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-4 flex justify-between items-start">
      
      {/* Left: Basic Actions */}
      <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button onClick={onNewChat} className="w-10 h-10 rounded-full hover:bg-white/10 text-white flex items-center justify-center text-xl transition-all" title="New Chat">➕</button>
          <button onClick={onToggleSearch} className="w-10 h-10 rounded-full hover:bg-white/10 text-white flex items-center justify-center text-xl transition-all" title="Search">🔍</button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <span className="text-xs font-mono font-bold text-white px-2">{formattedTime}</span>
      </div>

      {/* Center: AI Hub Selection Area */}
      <div className="pointer-events-auto absolute left-1/2 transform -translate-x-1/2 bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex gap-2 shadow-2xl animate-[slideInDown_0.5s_ease]">
          {AVAILABLE_MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
                    currentModelId === model.id 
                    ? 'bg-[#007AFF] text-white shadow-lg scale-110 -translate-y-1' 
                    : 'hover:bg-white/10 text-gray-400 hover:text-white grayscale hover:grayscale-0'
                }`}
                title={model.name}
              >
                  <span className="text-2xl mb-1">{model.icon}</span>
              </button>
          ))}
      </div>

      {/* Right: AI Switcher & Settings */}
      <div className="pointer-events-auto flex gap-3">
          <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-[#007AFF]/20 hover:bg-[#007AFF]/30 border border-[#007AFF]/50 backdrop-blur-md px-4 py-2 rounded-xl transition-all text-white font-bold"
              >
                  <span>{currentModel.icon}</span>
                  <span className="text-sm">{currentModel.nickname}</span>
                  <span className="text-xs opacity-50">▼</span>
              </button>

              {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-[expandBounce_0.3s_ease]">
                      {AVAILABLE_MODELS.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { onSelectModel(m.id); setIsDropdownOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-gray-200 transition-colors border-b border-white/5 last:border-0"
                          >
                              <span className="text-xl">{m.icon}</span>
                              <div className="flex-1">
                                  <div className="font-bold">{m.name}</div>
                                  <div className="text-[10px] text-gray-500">{m.specialty}</div>
                              </div>
                          </button>
                      ))}
                  </div>
              )}
          </div>

          <button 
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 hover:rotate-90 transition-all duration-500 text-white"
          >
              ⚙
          </button>
      </div>

    </div>
  );
};

export default TopBar;
