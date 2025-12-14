
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface LiveAPIModalProps {
  onClose: () => void;
  systemInstruction: string;
  language: 'ar' | 'en';
}

function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = atob(base64);
  const buffer = new ArrayBuffer(binaryString.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binaryString.length; i++) view[i] = binaryString.charCodeAt(i);
  const int16Array = new Int16Array(buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768.0;
  return float32Array;
}

function float32ArrayToBase64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const binaryString = String.fromCharCode(...new Uint8Array(int16Array.buffer));
  return btoa(binaryString);
}

const LiveAPIModal: React.FC<LiveAPIModalProps> = ({ onClose, systemInstruction, language }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [isMuted, setIsMuted] = useState(false); 
  const [cameraOn, setCameraOn] = useState(false);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [statusText, setStatusText] = useState("Connected");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const activeSessionRef = useRef<any>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
        }
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Video/Screen Stream Handling
  useEffect(() => {
    let mounted = true;

    const updateVideo = async () => {
        // Cleanup previous stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        
        if (!mounted) return;
        setErrorMsg(null);

        if (!cameraOn && !screenShareOn) {
            if (videoRef.current) videoRef.current.srcObject = null;
            return;
        }

        try {
            let stream: MediaStream | null = null;
            
            if (screenShareOn) {
                 try {
                    stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                 } catch (err: any) {
                    if (mounted) {
                        setScreenShareOn(false);
                        // Don't show error for cancelled screen share
                    }
                    return;
                 }
            } else if (cameraOn) {
                 try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                 } catch (err: any) {
                    console.error("Camera Error:", err);
                    if (mounted) {
                        setCameraOn(false);
                        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                            setErrorMsg(language === 'ar' ? "الكاميرا غير موجودة" : "Camera not found");
                        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                            setErrorMsg(language === 'ar' ? "تم رفض إذن الكاميرا" : "Camera permission denied");
                        } else {
                            setErrorMsg(language === 'ar' ? "خطأ في الكاميرا" : "Camera Error");
                        }
                    }
                    return;
                 }
            }

            if (mounted && stream) {
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().catch(e => console.error("Play error:", e));
                    };
                }
                
                // Handle stream ending (e.g. user stops screen share from browser UI)
                stream.getVideoTracks()[0].onended = () => {
                    if (mounted) {
                        setScreenShareOn(false);
                        setCameraOn(false);
                    }
                };
            }
        } catch (e: any) {
            console.error("General Media Error:", e);
            if (mounted) {
                setErrorMsg("Device Error");
                setCameraOn(false); 
                setScreenShareOn(false);
            }
        }
    };

    updateVideo();

    return () => {
        mounted = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
    };
  }, [cameraOn, screenShareOn, language]);

  // Audio Session Initialization
  useEffect(() => {
    let isMounted = true;
    let micStream: MediaStream | null = null;
    
    const startSession = async () => {
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) return;

            const ai = new GoogleGenAI({ apiKey });
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            
            outputContextRef.current = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
            
            try {
                micStream = await navigator.mediaDevices.getUserMedia({ 
                    audio: { 
                        echoCancellation: true, 
                        noiseSuppression: true, 
                        autoGainControl: true 
                    } 
                });
            } catch (e: any) {
                console.error("Mic access failed:", e);
                if (isMounted) {
                    if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                        setErrorMsg(language === 'ar' ? "تم رفض إذن الميكروفون" : "Mic permission denied");
                    } else if (e.name === 'NotFoundError') {
                         setErrorMsg(language === 'ar' ? "الميكروفون غير موجود" : "Microphone not found");
                    } else {
                        setErrorMsg(language === 'ar' ? "خطأ في الميكروفون" : "Mic Error");
                    }
                }
            }
            
            if (!isMounted) return;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        if(!isMounted) return;
                        setStatusText(language === 'ar' ? "متصل" : "Connected");
                        
                        if (audioContextRef.current && micStream) {
                            const source = audioContextRef.current.createMediaStreamSource(micStream);
                            const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                            
                            processor.onaudioprocess = (e) => {
                                if (!activeSessionRef.current || isMuted) return;
                                const inputData = e.inputBuffer.getChannelData(0);
                                const base64Audio = float32ArrayToBase64(inputData);
                                activeSessionRef.current.sendRealtimeInput({
                                    media: { mimeType: 'audio/pcm;rate=16000', data: base64Audio }
                                });
                            };
                            
                            source.connect(processor);
                            processor.connect(audioContextRef.current.destination);
                        }
                    },
                    onmessage: (msg: LiveServerMessage) => {
                         if (!isMounted) return;
                         const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                         if (base64Audio && outputContextRef.current) {
                             setStatusText(language === 'ar' ? "يتحدث..." : "Speaking...");
                             const float32Data = base64ToFloat32Array(base64Audio);
                             const buffer = outputContextRef.current.createBuffer(1, float32Data.length, 24000);
                             buffer.getChannelData(0).set(float32Data);
                             const source = outputContextRef.current.createBufferSource();
                             source.buffer = buffer;
                             source.connect(outputContextRef.current.destination);
                             source.start();
                             source.onended = () => {
                                 if (isMounted) setStatusText(language === 'ar' ? "يستمع..." : "Listening...");
                             };
                         }
                    },
                    onclose: () => {
                        if (isMounted) onClose();
                    },
                    onerror: (e) => {
                        console.error(e);
                        if (isMounted) setStatusText("Error");
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: systemInstruction
                }
            });
            
            // Explicitly handle promise to prevent React Error #310 (passing args to non-setter)
            sessionPromise.then(s => {
                if (isMounted) activeSessionRef.current = s;
            });

        } catch (e) {
            console.error(e);
            if (isMounted) setStatusText("Failed");
        }
    };

    startSession();

    return () => {
        isMounted = false;
        if(audioContextRef.current) audioContextRef.current.close();
        if(outputContextRef.current) outputContextRef.current.close();
        if(micStream) micStream.getTracks().forEach(t => t.stop());
    }
  }, [systemInstruction, isMuted, onClose, language]);

  return (
    <div 
        className="fixed z-[100] cursor-move shadow-[0_10px_30px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10"
        style={{ 
            left: position.x, 
            top: position.y, 
            width: '240px', 
            backgroundColor: 'rgba(20, 20, 20, 0.9)',
            backdropFilter: 'blur(20px)',
        }}
        onMouseDown={handleMouseDown}
    >
        {/* Compact Header */}
        <div className="bg-gradient-to-b from-white/10 to-transparent px-3 py-2 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-white tracking-wide">LIVE</span>
            </div>
             <div className="flex items-center gap-1">
                 <button onClick={onClose} className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors text-[8px]">✕</button>
             </div>
        </div>

        {/* Combined View */}
        <div className="h-40 bg-black relative flex items-center justify-center overflow-hidden group">
            <video 
                ref={videoRef} 
                autoPlay muted playsInline
                className={`w-full h-full object-cover ${cameraOn || screenShareOn ? 'block' : 'hidden'}`}
            />

            {!(cameraOn || screenShareOn) && (
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${statusText.includes('Speak') || statusText.includes('يتحدث') ? 'bg-blue-500 scale-110' : 'bg-gray-800'}`}>
                         <span className="text-xl">🎙️</span>
                    </div>
                     <span className="text-[10px] text-gray-400 font-medium">{statusText}</span>
                </div>
            )}
            
            {/* Error Overlay */}
            {errorMsg && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center flex-col p-4 text-center z-10">
                    <span className="text-2xl mb-2">⚠️</span>
                    <span className="text-xs text-red-400 font-bold leading-relaxed">{errorMsg}</span>
                </div>
            )}

            {/* Ask AI Overlay */}
            {(cameraOn || screenShareOn) && !errorMsg && (
                 <button className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-600/90 hover:bg-indigo-500 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md shadow-lg font-bold border border-white/20 flex items-center gap-1 whitespace-nowrap">
                     <span>✨</span> {language === 'ar' ? 'اسأل الذكاء' : 'Ask AI'}
                 </button>
            )}
        </div>

        {/* Compact Controls */}
        <div className="p-2 grid grid-cols-3 gap-1 bg-white/5 border-t border-white/5">
            <ControlBtn 
                active={!isMuted} 
                icon={isMuted ? "🔇" : "🎙"} 
                label={isMuted ? (language === 'ar' ? 'مكتوم' : "Muted") : (language === 'ar' ? 'مايك' : "Mic")} 
                onClick={() => setIsMuted(!isMuted)} 
            />
            <ControlBtn 
                active={cameraOn} 
                icon="📹" 
                label={language === 'ar' ? 'كاميرا' : "Cam"} 
                onClick={() => { setScreenShareOn(false); setCameraOn(!cameraOn); }} 
            />
            <ControlBtn 
                active={screenShareOn} 
                icon="🖥" 
                label={language === 'ar' ? 'شاشة' : "Screen"} 
                onClick={() => { setCameraOn(false); setScreenShareOn(!screenShareOn); }} 
            />
        </div>
    </div>
  );
};

const ControlBtn: React.FC<{ active: boolean, icon: string, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${active ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
        <span className="text-sm mb-0.5">{icon}</span>
        <span className="text-[8px] font-medium">{label}</span>
    </button>
);

export default LiveAPIModal;
