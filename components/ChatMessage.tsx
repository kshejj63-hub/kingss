
import React, { useState } from 'react';
import { Message, Role } from '../types';
import { AVAILABLE_MODELS } from '../services/geminiService';

interface ChatMessageProps {
  message: Message;
  onLike: (id: string) => void;
  onRegenerate: (id: string) => void;
  voiceSettings: { pitch: number; rate: number; selectedVoiceURI?: string };
  language: 'ar' | 'en';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onLike, onRegenerate, voiceSettings, language }) => {
  const isUser = message.role === Role.USER;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLikedLocal, setIsLikedLocal] = useState(message.isLiked);

  const modelInfo = message.modelId ? AVAILABLE_MODELS.find(m => m.id === message.modelId) : null;
  const displayName = isUser ? (language === 'ar' ? 'أنت' : 'You') : (modelInfo ? modelInfo.nickname : 'AI');

  const handleSpeak = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(message.content);
    u.rate = voiceSettings.rate; 
    u.pitch = voiceSettings.pitch;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u); 
    setIsSpeaking(true);
  };

  const handleLikeClick = () => {
      setIsLikedLocal(!isLikedLocal);
      onLike(message.id);
  };

  const renderContent = () => {
    return <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>; 
  };

  return (
    <div className={`flex w-full mb-8 group ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg mx-3 backdrop-blur-md border border-white/10 z-10 ${isUser ? 'bg-[#007AFF] text-white' : 'bg-[#1A1A1A] text-white border-white/20'}`}>
          {isUser ? <span className="font-bold text-xs">{language==='ar'?'أنا':'YOU'}</span> : <span className="text-xl">{modelInfo?.icon || '🤖'}</span>}
        </div>

        {/* Message Container */}
        <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 mb-1 px-1 text-[10px] text-gray-400 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="font-bold text-gray-200">{displayName}</span>
                <span>•</span>
                <span>{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            
            <div className={`relative px-6 py-4 shadow-xl backdrop-blur-xl border border-white/10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,122,255,0.1)] ${
                isUser 
                ? 'bg-[#007AFF] text-white rounded-2xl rounded-tr-sm' 
                : 'bg-[#1A1A1A] text-gray-100 rounded-2xl rounded-tl-sm hover:border-[#007AFF]/30'
            }`}>
                {message.image && <img src={message.image} alt="Attachment" className="max-h-60 rounded-lg mb-3 border border-white/20" />}
                {renderContent()}
            </div>

            {/* Voice & Action Controls (AI Only) */}
            {!isUser && !message.isStreaming && (
                <div className="mt-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    
                    {/* Voice Controls */}
                    <div className="flex items-center gap-1 bg-[#2D2D2D] rounded-full p-1 border border-white/5">
                        <button onClick={handleSpeak} className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${isSpeaking ? 'bg-[#007AFF] text-white animate-pulse' : 'text-gray-400 hover:text-white'}`}>
                            <span>{isSpeaking ? '🔊' : '🔈'}</span> {isSpeaking ? 'Stop' : 'Listen'}
                        </button>
                        <div className="w-px h-3 bg-white/10"></div>
                        <button onClick={() => onRegenerate(message.id)} className="px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 hover:text-white transition-colors">
                            🔄 Refine
                        </button>
                    </div>

                    {/* Standard Actions */}
                    <div className="flex gap-2">
                        <button onClick={handleLikeClick} className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${isLikedLocal ? 'text-red-500 scale-110' : 'text-gray-500'}`} title="Like">
                            <svg className="w-4 h-4" fill={isLikedLocal ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(message.content)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors" title="Copy">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ChatMessage;
