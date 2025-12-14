
import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 3) {
      onLoginSuccess({ displayName: name, email: email, photoURL: null });
      onClose();
    } else {
      setStep(prev => (prev + 1) as any);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[gentleEntrance_0.8s_ease]">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2d2d2d] w-full max-w-sm rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8 mt-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-indigo-500' : 'w-2 bg-gray-700'}`}></div>
            ))}
        </div>

        {step === 1 && (
            <div className="animate-[menuItemAppear_0.3s_ease]">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-sm mb-6">Enter your email to continue.</p>
                <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-white mb-4 focus:border-indigo-500 outline-none"
                    autoFocus
                />
                <button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all mb-4">
                    Continue with Email
                </button>
                
                <div className="flex flex-col gap-2">
                     <button className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                         <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                         Google
                     </button>
                     <button className="w-full bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-white/10 hover:bg-gray-900 transition-colors">
                         <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.38-.18-1.07-.17-1.42-.03-1.04.42-2.12.5-3.13-.39C8.32 19.34 6.63 15.35 8.1 11c1.1-3.23 4.2-3.88 5.6-1.53.5.85 1.5.8 1.96.1 1.76-2.6 5.56-1.76 6.32 1.37-3.4 1.76-2.68 6.75 1.07 8.33zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.54 4.33-3.74 4.25z"/></svg>
                         Sign in with Apple
                     </button>
                </div>
            </div>
        )}

        {step === 2 && (
             <div className="animate-[menuItemAppear_0.3s_ease]">
                <h2 className="text-2xl font-bold text-white mb-2">Verification</h2>
                <p className="text-gray-400 text-sm mb-6">Enter the code sent to {email}</p>
                <input 
                    type="text" 
                    placeholder="000 000" 
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-white mb-4 text-center tracking-[0.5em] font-mono text-xl focus:border-indigo-500 outline-none"
                    maxLength={6}
                    autoFocus
                />
                <button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all">
                    Verify
                </button>
            </div>
        )}

        {step === 3 && (
             <div className="animate-[menuItemAppear_0.3s_ease]">
                <h2 className="text-2xl font-bold text-white mb-2">Create Profile</h2>
                <p className="text-gray-400 text-sm mb-6">What should we call you?</p>
                <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-white mb-4 focus:border-indigo-500 outline-none"
                    autoFocus
                />
                <button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all">
                    Complete Setup
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default LoginModal;
