
import React, { useState } from 'react';

interface OnboardingModalProps {
  onComplete: (data: any) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [data, setData] = useState({
      appLang: 'en',
      voiceId: 'ai_tech',
      name: '',
      theme: 'Auto',
      animationLevel: 80
  });
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const selectLanguage = (lang: 'ar' | 'en') => {
      setData({ ...data, appLang: lang });
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const next = () => { setDirection('right'); setStep(s => s + 1); };
  const back = () => { setDirection('left'); setStep(s => s - 1); };
  const finish = () => onComplete(data);

  const previewVoice = (id: string, text: string) => {
      if (playingVoiceId) window.speechSynthesis.cancel();
      setPlayingVoiceId(id);
      
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = id === 'ai_futuristic' ? 0.8 : (id === 'ai_energetic' ? 1.2 : 1.0);
      u.onend = () => setPlayingVoiceId(null);
      window.speechSynthesis.speak(u);
  };

  const isAr = data.appLang === 'ar';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0e0e0e]/95 backdrop-blur-xl font-sans overflow-hidden">
        {/* Background Aura */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-blue-900/20 pointer-events-none"></div>

        <div className="w-full max-w-3xl relative z-10 p-4">
            
            {/* Header */}
            <div className="text-center mb-8 animate-[welcomeEntrance_0.8s_ease]">
                <div className="text-6xl mb-2">🌟</div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                    {isAr ? 'مرحباً بك في Super Bev AI' : 'WELCOME TO SUPER BEV AI'}
                </h1>
                <p className="text-gray-400">Let's personalize your experience</p>
            </div>

            {/* Main Card */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col relative">
                
                {/* Progress */}
                <div className="flex justify-center gap-3 p-6 border-b border-white/5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-12 bg-[#007AFF] shadow-[0_0_10px_#007AFF]' : (step > i ? 'w-3 bg-green-500' : 'w-3 bg-gray-700')}`}></div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 relative overflow-hidden">
                    
                    {/* Step 1: Language */}
                    {step === 1 && (
                        <div className={`absolute inset-0 p-8 flex flex-col animate-[${direction === 'right' ? 'slideInRight' : 'slideOutLeft'}_0.5s_ease]`}>
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">{isAr ? 'اختر لغتك' : 'Choose Your Language'}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <LanguageOption 
                                    code="en" name="English" flag="🇺🇸" 
                                    selected={data.appLang === 'en'} 
                                    onClick={() => selectLanguage('en')} 
                                    index={0} 
                                />
                                <LanguageOption 
                                    code="ar" name="العربية" flag="🇪🇬" 
                                    selected={data.appLang === 'ar'} 
                                    onClick={() => selectLanguage('ar')} 
                                    index={1} 
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Voice */}
                    {step === 2 && (
                        <div className={`absolute inset-0 p-8 flex flex-col animate-[slideInRight_0.5s_ease]`}>
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">{isAr ? 'اختر صوت المساعد' : 'Select AI Voice'}</h2>
                            <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 max-h-[320px] scrollbar-hide">
                                <VoiceOption 
                                    id="ai_tech" name="Tech Assistant" desc="Professional & Clear"
                                    selected={data.voiceId === 'ai_tech'}
                                    isPlaying={playingVoiceId === 'ai_tech'}
                                    onSelect={() => setData({...data, voiceId: 'ai_tech'})}
                                    onPreview={() => previewVoice('ai_tech', "System online. Analysis complete.")}
                                />
                                <VoiceOption 
                                    id="ai_calm" name="Calm Guide" desc="Soothing & Relaxed"
                                    selected={data.voiceId === 'ai_calm'}
                                    isPlaying={playingVoiceId === 'ai_calm'}
                                    onSelect={() => setData({...data, voiceId: 'ai_calm'})}
                                    onPreview={() => previewVoice('ai_calm', "I am here to help you breathe and focus.")}
                                />
                                <VoiceOption 
                                    id="ai_energetic" name="Energetic Buddy" desc="Fast & Enthusiastic"
                                    selected={data.voiceId === 'ai_energetic'}
                                    isPlaying={playingVoiceId === 'ai_energetic'}
                                    onSelect={() => setData({...data, voiceId: 'ai_energetic'})}
                                    onPreview={() => previewVoice('ai_energetic', "Let's build something amazing together right now!")}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Customization */}
                    {step === 3 && (
                        <div className={`absolute inset-0 p-8 flex flex-col animate-[slideInRight_0.5s_ease]`}>
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">{isAr ? 'التخصيص' : 'Customize Experience'}</h2>
                            
                            <div className="space-y-6">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">{isAr ? 'اسمك' : 'Your Name'}</label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={(e) => setData({...data, name: e.target.value})}
                                        className="w-full bg-[#2D2D2D] border border-white/10 rounded-xl p-4 text-white focus:border-[#007AFF] outline-none transition-all"
                                        placeholder="e.g. Alex"
                                    />
                                </div>

                                {/* Animation Slider */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm text-gray-400">{isAr ? 'كثافة الأنيميشن' : 'Animation Intensity'}</label>
                                        <span className="text-sm text-[#007AFF]">{data.animationLevel}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={data.animationLevel} 
                                        onChange={(e) => setData({...data, animationLevel: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Ready */}
                    {step === 4 && (
                        <div className={`absolute inset-0 p-8 flex flex-col items-center justify-center text-center animate-[slideInRight_0.5s_ease]`}>
                            <div className="w-24 h-24 bg-[#007AFF]/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <span className="text-5xl">🚀</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{isAr ? 'أنت جاهز تماماً!' : "You're All Set!"}</h2>
                            <p className="text-gray-400 max-w-md">
                                {isAr ? 'تم إعداد بيئة العمل الخاصة بك بنجاح.' : 'Your personalized AI workspace has been configured successfully.'}
                            </p>
                        </div>
                    )}

                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-white/5 flex justify-between items-center bg-[#141414]">
                    {step > 1 ? (
                        <button onClick={back} className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium">
                            {isAr ? 'رجوع' : 'Back'}
                        </button>
                    ) : (
                        <div></div>
                    )}

                    <button 
                        onClick={step === 4 ? finish : next}
                        disabled={step === 3 && !data.name}
                        className="px-8 py-3 bg-[#007AFF] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-[0_4px_14px_rgba(0,122,255,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {step === 4 ? (isAr ? 'ابدأ ⚡' : 'Launch ⚡') : (isAr ? 'التالي ←' : 'Next →')}
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
};

const LanguageOption: React.FC<{ code: string, name: string, flag: string, selected: boolean, onClick: () => void, index: number }> = ({ code, name, flag, selected, onClick, index }) => (
    <button 
        onClick={onClick}
        style={{ '--card-index': index } as any}
        className={`relative p-6 rounded-2xl border text-left transition-all duration-300 group animate-[cardAppear_0.5s_ease_forwards] ${selected ? 'bg-[#007AFF]/10 border-[#007AFF] animate-[selectPulse_0.6s_ease]' : 'bg-[#2D2D2D] border-transparent hover:border-gray-500 hover:-translate-y-1'}`}
    >
        <span className="text-4xl mb-4 block">{flag}</span>
        <span className={`text-xl font-bold block ${selected ? 'text-[#007AFF]' : 'text-white'}`}>{name}</span>
        {selected && <div className="absolute top-4 right-4 text-[#007AFF]">✔</div>}
    </button>
);

const VoiceOption: React.FC<{ id: string, name: string, desc: string, selected: boolean, isPlaying: boolean, onSelect: () => void, onPreview: () => void }> = ({ name, desc, selected, isPlaying, onSelect, onPreview }) => (
    <div 
        onClick={onSelect}
        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selected ? 'bg-[#007AFF]/10 border-[#007AFF]' : 'bg-[#2D2D2D] border-transparent hover:bg-[#333]'}`}
    >
        <div>
            <div className={`font-bold ${selected ? 'text-[#007AFF]' : 'text-white'}`}>{name}</div>
            <div className="text-xs text-gray-400">{desc}</div>
        </div>
        <div className="flex items-center gap-3">
            {isPlaying && (
                <div className="flex gap-1 h-4 items-end">
                    <div className="sound-wave-bar" style={{ animationDelay: '0s', height: '8px' }}></div>
                    <div className="sound-wave-bar" style={{ animationDelay: '0.1s', height: '12px' }}></div>
                    <div className="sound-wave-bar" style={{ animationDelay: '0.2s', height: '16px' }}></div>
                </div>
            )}
            <button 
                onClick={(e) => { e.stopPropagation(); onPreview(); }}
                className="px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-xs text-white border border-white/10 transition-colors"
            >
                {isPlaying ? '⏹' : '🔊 Preview'}
            </button>
        </div>
    </div>
);

export default OnboardingModal;
