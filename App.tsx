
import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import TopBar from './components/TopBar'; 
import LiveAPIModal from './components/LiveAPIModal';
import SettingsModal from './components/SettingsModal';
import BackgroundEffects from './components/BackgroundEffects';
import ClickEffects from './components/ClickEffects';
import ModelSettingsModal from './components/ModelSettingsModal';
import ModelPicker from './components/ModelPicker';
import QuickMenu from './components/QuickMenu';
import StatusBar from './components/StatusBar';
import OnboardingModal from './components/OnboardingModal';
import FileActionModal from './components/FileActionModal';
import Sidebar from './components/Sidebar';
import ProfileModal from './components/ProfileModal';
import ThreeDOrb from './components/ThreeDOrb';
import SearchNotch from './components/SearchNotch';
import LibraryModal from './components/LibraryModal';
import { streamGeminiResponse, AVAILABLE_MODELS } from './services/geminiService';
import { Message, Role, ChatSession, AppSettings, ModelSettings } from './types';
import { auth, User } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const DEFAULT_SETTINGS: AppSettings = {
    themeMode: 'dark',
    themeColor: '#10b981', 
    colorMix: ['#10b981', '#3b82f6', '#8b5cf6'], 
    gradientTheme: 'custom-mix',
    effectType: 'cosmic_ocean',
    clickStyle: 'ripple',
    effectSpeed: 0.5,
    effectDensity: 60,
    isSidebarCompact: false,
    voicePitch: 1.0,
    voiceRate: 1.0,
    voiceVolume: 1.0,
    voicePersona: 'ahmed',
    selectedVoiceURI: '',
    transparencyLevel: 0.1, 
    enablePersonality: true,
    deepResearchEnabled: false,
    language: 'en', 
    dialect: 'auto', 
    responseLanguage: 'auto',
    region: 'Global',
    processingPower: 'medium',
    memoryOptimization: true,
    knowledgeLoad: 'medium',
    onboardingComplete: false,
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
      try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('app_settings') || '{}') }; } catch { return DEFAULT_SETTINGS; }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isFileActionOpen, setIsFileActionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [activeModes, setActiveModes] = useState<string[]>([]);
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  const [searchStartTime, setSearchStartTime] = useState<number | undefined>(undefined);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try { const s = localStorage.getItem('chat_sessions'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModelId, setCurrentModelId] = useState<string>('model-chatgpt4'); 
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  useEffect(() => { try { localStorage.setItem('chat_sessions', JSON.stringify(sessions)); } catch(e) {} }, [sessions]);
  useEffect(() => { if (auth) onAuthStateChanged(auth, (u) => setUser(u ? { ...u } as User : null)); }, []);

  // Handle Light Mode
  useEffect(() => {
      if (appSettings.themeMode === 'light') document.documentElement.classList.add('light-mode');
      else document.documentElement.classList.remove('light-mode');
  }, [appSettings.themeMode]);

  // Sync Messages to Session Storage Logic
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
        setSessions(prevSessions => {
            const existingIndex = prevSessions.findIndex(s => s.id === currentSessionId);
            
            // If session exists, update it
            if (existingIndex !== -1) {
                const updatedSessions = [...prevSessions];
                const existingSession = updatedSessions[existingIndex];
                
                // Determine Title: Keep existing if user-defined, else generate new one from first user message
                let newTitle = existingSession.title;
                if (!existingSession.userDefinedTitle) {
                    const firstUserMsg = messages.find(m => m.role === 'user');
                    if (firstUserMsg) {
                        newTitle = firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '');
                    }
                }

                updatedSessions[existingIndex] = {
                    ...existingSession,
                    messages: messages,
                    updatedAt: Date.now(),
                    title: newTitle
                };
                return updatedSessions;
            } 
            // If new session (not in list yet)
            else {
                const firstUserMsg = messages.find(m => m.role === 'user');
                const title = firstUserMsg ? firstUserMsg.content.slice(0, 40) : "New Chat";
                
                return [{
                    id: currentSessionId,
                    title: title,
                    messages: messages,
                    updatedAt: Date.now(),
                    modelId: currentModelId,
                    isPinned: false,
                    userDefinedTitle: false
                }, ...prevSessions];
            }
        });
    }
  }, [messages, currentSessionId]);

  const createNewSession = (modelId: string) => {
      const newId = Date.now().toString(); 
      setCurrentSessionId(newId); 
      setMessages([]); 
      setCurrentModelId(modelId); 
      setIsQuickMenuOpen(false);
      
      const model = AVAILABLE_MODELS.find(m => m.id === modelId);
      // Optional: Add welcome message locally
      if (model) {
          // Note: We don't save the session immediately to 'sessions' array here.
          // It will be saved when the user sends the first message via the useEffect above.
          // Or we can initialize messages.
      }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
      setSessions(prev => prev.map(s => 
          s.id === id 
          ? { ...s, title: newTitle, userDefinedTitle: true, updatedAt: Date.now() } 
          : s
      ));
  };

  const handleSendMessage = async (text: string, image?: string) => {
    if (!currentSessionId) createNewSession(currentModelId);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, content: text, image, timestamp: Date.now() }]);
    setIsGenerating(true);
    setOrbState('thinking');
    
    if (activeModes.includes('web_search') || activeModes.includes('dark_web')) setSearchStartTime(Date.now());

    try {
        const stream = streamGeminiResponse(text, messages, image, currentModelId, undefined, false, activeModes.includes('deep_think') ? 'deep' : 'normal', activeModes.includes('web_search'));
        const aiId = Date.now().toString();
        setMessages(prev => [...prev, { id: aiId, role: Role.MODEL, content: '', isStreaming: true, timestamp: Date.now(), modelId: currentModelId }]);
        
        setOrbState('speaking');
        let fullText = '';
        for await (const chunk of stream) {
            fullText += chunk;
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullText } : m));
        }
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, isStreaming: false } : m));
    } catch (e: any) {
        // Error handled
    } finally {
        setIsGenerating(false);
        setOrbState('idle');
        setSearchStartTime(undefined);
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans text-gray-100 relative bg-[#0e0e0e]`}>
      {!appSettings.onboardingComplete && <OnboardingModal onComplete={(data) => setAppSettings(p => ({...p, onboardingComplete: true}))} />}
      <BackgroundEffects settings={appSettings} isDarkMode={appSettings.themeMode !== 'light'} />
      <ClickEffects style={appSettings.clickStyle} />
      
      <SearchNotch isVisible={!!searchStartTime} startTime={searchStartTime} />
      
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-0 pointer-events-none opacity-50">
          <ThreeDOrb state={orbState} />
      </div>

      {/* Replaced old LibraryModal props with new robust props */}
      <LibraryModal 
          isOpen={isLibraryOpen} 
          onClose={() => setIsLibraryOpen(false)} 
          sessions={sessions} 
          onSelectSession={(id) => { 
              const s = sessions.find(x => x.id === id); 
              if(s) { 
                  setCurrentSessionId(id); 
                  setMessages(s.messages); 
                  setCurrentModelId(s.modelId); 
              } 
          }} 
          onDeleteSession={(id) => setSessions(p => p.filter(s => s.id !== id))} 
          onTogglePin={(id) => setSessions(p => p.map(s => s.id === id ? {...s, isPinned: !s.isPinned} : s))}
          onRenameSession={handleRenameSession}
          language={appSettings.language}
      />
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} language={appSettings.language} appSettings={appSettings} onUpdateAppSettings={(n) => setAppSettings(p => ({...p, ...n}))} />
      <ModelPicker isOpen={isModelPickerOpen} onClose={() => setIsModelPickerOpen(false)} currentModelId={currentModelId} onSelectModel={createNewSession} language={appSettings.language} />
      <FileActionModal isOpen={isFileActionOpen} onClose={() => setIsFileActionOpen(false)} language={appSettings.language} />
      <QuickMenu isOpen={isQuickMenuOpen} onClose={() => setIsQuickMenuOpen(false)} language={appSettings.language} onAction={(a) => { setIsQuickMenuOpen(false); if(a==='settings') setIsSettingsOpen(true); }} />

      <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => { const s = sessions.find(x => x.id === id); if(s) { setCurrentSessionId(id); setMessages(s.messages); setCurrentModelId(s.modelId); }}}
          onNewChat={() => createNewSession(currentModelId)}
          onClearHistory={() => setSessions([])}
          currentModelId={currentModelId}
          onSelectModel={createNewSession}
          onOpenSettings={() => setIsSettingsOpen(true)}
          language={appSettings.language}
          user={user}
          onOpenProfile={() => setIsProfileOpen(true)}
          onDeleteSession={(id) => setSessions(p => p.filter(s => s.id !== id))}
          onTogglePin={(id) => setSessions(p => p.map(s => s.id === id ? {...s, isPinned: !s.isPinned} : s))}
          onRenameSession={handleRenameSession}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onOpenGroupSetup={()=>{}}
          onOpenWorkflow={()=>{}}
      />

      <div className={`flex-1 flex flex-col h-full relative w-full z-10 transition-all duration-500 ease-out ${isSidebarOpen ? 'md:ml-[280px]' : ''}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="fixed top-4 left-4 z-50 p-2 text-gray-400 md:hidden">☰</button>
        
        <TopBar 
            language={appSettings.language} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
            onNewChat={() => createNewSession(currentModelId)}
            onToggleSearch={() => setActiveModes(prev => prev.includes('web_search') ? prev.filter(m => m !== 'web_search') : [...prev, 'web_search'])}
            currentModelId={currentModelId}
            onSelectModel={createNewSession}
        />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-4 scroll-smooth scrollbar-hide relative">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                    <button onClick={() => createNewSession(currentModelId)} className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold text-lg border border-white/10 transition-transform hover:scale-105 backdrop-blur-md">
                        Start New Chat
                    </button>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto space-y-6 pb-40">
                    {messages.map((msg, i) => (
                        <ChatMessage key={msg.id} message={msg} onLike={() => {}} onRegenerate={() => {}} voiceSettings={{ pitch: 1, rate: 1 }} language={appSettings.language} />
                    ))}
                    <div ref={messagesEndRef} />
                    
                    <div className="flex justify-center mt-8 gap-4">
                         <button onClick={() => { setMessages(prev => prev.slice(0, -1)); createNewSession(currentModelId); }} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
                             <span>🔄</span> Restart
                         </button>
                         <button onClick={() => { setSessions(p => p.filter(s => s.id !== currentSessionId)); createNewSession(currentModelId); }} className="text-red-500/50 hover:text-red-500 text-xs flex items-center gap-1 transition-colors">
                             <span>🗑</span> Delete
                         </button>
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="w-full max-w-3xl mx-auto z-40 pb-6 px-4 relative">
            <ChatInput 
                onSend={handleSendMessage} 
                onStartLive={() => setIsLiveSessionActive(true)} 
                disabled={isGenerating} 
                language={appSettings.language} 
                onOpenMenu={() => setIsQuickMenuOpen(!isQuickMenuOpen)} 
                currentModelName={AVAILABLE_MODELS.find(m => m.id === currentModelId)?.nickname || 'AI'}
                onSelectModel={() => setIsModelPickerOpen(true)}
                onAction={(mode) => setActiveModes(p => p.includes(mode) ? p.filter(x => x !== mode) : [...p, mode])}
                activeModes={activeModes}
            />
        </div>
      </div>
    </div>
  );
}

export default App;
