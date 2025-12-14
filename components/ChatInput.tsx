
import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string, image?: string) => void;
  onStartLive: () => void;
  disabled: boolean;
  language: 'ar' | 'en';
  onOpenMenu: () => void;
  currentModelName: string;
  onSelectModel: () => void;
  onAction: (action: string) => void; 
  activeModes: string[];
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled, 
  language,
  onStartLive,
  onAction,
  activeModes
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('');
            setInput(transcript);
        };

        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  const toggleListening = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
      } else {
          recognitionRef.current?.start();
          setIsListening(true);
      }
  };

  const handleSendVoice = () => {
      if (input.trim()) {
          onSend(input);
          setInput('');
          // Optional: Speak confirmation here if needed
      }
  };

  const handleSubmit = () => {
    if ((!input.trim()) || disabled) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full z-50 flex flex-col gap-4">
      
      {/* Voice Controls Bar */}
      <div className="flex justify-center items-center gap-3 animate-[slideInUp_0.3s_ease]">
          <button 
            onClick={toggleListening}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'}`}
          >
              <span className="text-xl">{isListening ? '⏹' : '🎤'}</span>
              <span>{language === 'ar' ? (isListening ? 'توقف' : 'تحدث الآن') : (isListening ? 'Stop' : 'Speak')}</span>
          </button>

          <div className="h-8 w-px bg-white/10 mx-2"></div>

          <div className="flex gap-2 bg-white/5 rounded-full p-1 backdrop-blur-sm border border-white/10">
              <IconButton icon="🔇" label="Mute" onClick={() => {/* Handle Mute Logic Global */}} />
              <IconButton icon="🖥" label="Share" onClick={onStartLive} />
              <IconButton icon="📷" label="Cam" onClick={onStartLive} />
              <IconButton icon="📤" label="Send Audio" onClick={handleSendVoice} active={!!input.trim()} />
          </div>
      </div>

      {/* Main Input Bar */}
      <div className="flex items-end gap-2 px-2 relative">
          <div className="flex-1 bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 rounded-[24px] p-2 transition-all shadow-lg flex items-end focus-within:border-[#007AFF] focus-within:bg-[#202020]">
              <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">📎</button>
              <input type="file" ref={fileInputRef} className="hidden" />

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'ar' ? "اكتب رسالتك..." : "Type a message..."}
                disabled={disabled}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-500 py-2 px-2 resize-none focus:outline-none max-h-[120px] overflow-y-auto min-h-[40px] text-sm leading-relaxed"
              />
              
              <button
                onClick={handleSubmit}
                disabled={(!input.trim()) || disabled}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${ (input.trim()) && !disabled ? 'bg-[#007AFF] text-white shadow-lg hover:scale-110' : 'bg-white/5 text-gray-600' }`}
              >
                ➤
              </button>
          </div>
      </div>
    </div>
  );
};

const IconButton: React.FC<{ icon: string, label: string, onClick: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
    <button 
        onClick={onClick}
        title={label}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'bg-[#007AFF] text-white' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}
    >
        <span className="text-lg">{icon}</span>
    </button>
);

export default ChatInput;
