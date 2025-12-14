
import React, { useState } from 'react';
import { AppSettings, EffectType, ClickStyle } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  appSettings: AppSettings;
  onUpdateAppSettings: (newSettings: Partial<AppSettings>) => void;
}

type Section = 'appearance' | 'audio' | 'system';

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, language, appSettings, onUpdateAppSettings
}) => {
  const [active, setActive] = useState<Section>('appearance');

  if (!isOpen) return null;

  const sections: { id: Section, icon: string, label: string }[] = [
      { id: 'appearance', icon: '🎨', label: 'Appearance' },
      { id: 'audio', icon: '🔊', label: 'Audio & Voice' },
      { id: 'system', icon: '⚡', label: 'System' },
  ];

  const backgrounds: { id: EffectType, name: string }[] = [
      { id: 'stars', name: 'Stars ⭐' },
      { id: 'galaxy', name: 'Galaxy 🌌' },
      { id: 'cosmic_ocean', name: 'Cosmic Ocean 🌊' },
      { id: 'digital_forest', name: 'Digital Forest 🌳' },
      { id: 'neon_city', name: 'Neon City 🌃' },
      { id: 'ai_matrix', name: 'AI Matrix 💻' },
      { id: 'sunset_dunes', name: 'Sunset Dunes 🌅' },
      { id: 'crystal_cave', name: 'Crystal Cave 💎' },
      { id: 'galactic_core', name: 'Galactic Core 🌪' },
      { id: 'leaves', name: 'Falling Leaves 🍂' }
  ];

  const clickStyles: { id: ClickStyle, name: string }[] = [
      { id: 'none', name: 'None' },
      { id: 'ripple', name: 'Ripple 💧' },
      { id: 'particles', name: 'Particles ✨' },
      { id: 'glow', name: 'Glow 💡' },
      { id: 'splash', name: 'Splash 🎨' },
      { id: 'hologram', name: 'Hologram 👾' }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="bg-[#121212] w-full max-w-4xl h-[80vh] rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden">
            
            {/* Sidebar */}
            <div className="w-64 bg-[#1A1A1A] border-r border-white/5 p-4 flex flex-col">
                <div className="text-xl font-bold text-white mb-8 px-4 flex items-center gap-2">
                    <span>⚙</span> Settings
                </div>
                <div className="space-y-1 flex-1">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActive(s.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active === s.id ? 'bg-[#F5F5DC] text-black font-bold shadow-lg transform scale-105' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span>{s.icon}</span>
                            <span className="text-sm">{s.label}</span>
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="mt-4 p-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                    Close
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-[#0e0e0e] p-8 overflow-y-auto relative">
                <div className="max-w-2xl mx-auto animate-[slideInUp_0.4s_ease]">
                    
                    {active === 'appearance' && (
                        <div className="space-y-8">
                            <Header title="Appearance" sub="Customize look and feel." />
                            
                            {/* Theme Toggle */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-300">Theme Mode</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['dark', 'light', 'auto'].map(mode => (
                                        <button 
                                            key={mode}
                                            onClick={() => onUpdateAppSettings({ themeMode: mode as any })}
                                            className={`p-3 rounded-xl border text-sm font-bold capitalize ${appSettings.themeMode === mode ? 'bg-[#007AFF] border-[#007AFF] text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3D Background */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-300">3D Environment</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {backgrounds.map(bg => (
                                        <button 
                                            key={bg.id}
                                            onClick={() => onUpdateAppSettings({ effectType: bg.id })}
                                            className={`p-3 rounded-xl border text-sm text-left transition-all ${appSettings.effectType === bg.id ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {bg.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Click Styles */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-300">Click Effects</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {clickStyles.map(style => (
                                        <button 
                                            key={style.id}
                                            onClick={() => onUpdateAppSettings({ clickStyle: style.id })}
                                            className={`p-2 rounded-xl border text-xs font-bold transition-all ${appSettings.clickStyle === style.id ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                        >
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {active === 'audio' && (
                         <div className="space-y-8">
                            <Header title="Audio & Voice" sub="Voice settings." />
                            <SettingRow 
                                label="App Language" 
                                control={
                                    <div className="flex gap-2">
                                        <button onClick={() => onUpdateAppSettings({ language: 'en' })} className={`px-3 py-1 rounded ${appSettings.language === 'en' ? 'bg-[#007AFF] text-white' : 'bg-white/5 text-gray-400'}`}>English</button>
                                        <button onClick={() => onUpdateAppSettings({ language: 'ar' })} className={`px-3 py-1 rounded ${appSettings.language === 'ar' ? 'bg-[#007AFF] text-white' : 'bg-white/5 text-gray-400'}`}>العربية</button>
                                    </div>
                                } 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

const Header: React.FC<{ title: string, sub: string }> = ({ title, sub }) => (
    <div className="mb-6 border-b border-white/5 pb-4">
        <h2 className="text-3xl font-bold text-white mb-1">{title}</h2>
        <p className="text-gray-500">{sub}</p>
    </div>
);

const SettingRow: React.FC<{ label: string, control: React.ReactNode }> = ({ label, control }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
        <span className="text-gray-200 font-medium">{label}</span>
        {control}
    </div>
);

const Switch: React.FC<{ checked: boolean }> = ({ checked }) => (
    <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-green-500' : 'bg-gray-600'}`}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
    </div>
);

export default SettingsModal;
