
import React from 'react';

interface ThreeDOrbProps {
  state: 'idle' | 'listening' | 'speaking' | 'thinking';
}

const ThreeDOrb: React.FC<ThreeDOrbProps> = ({ state }) => {
  let animationClass = '';
  let colorClass = '';

  switch (state) {
    case 'speaking':
      animationClass = 'animate-[rotate-orb_2s_linear_infinite]';
      colorClass = 'bg-gradient-to-tr from-blue-500 to-purple-600';
      break;
    case 'thinking':
      animationClass = 'animate-pulse';
      colorClass = 'bg-gradient-to-tr from-orange-400 to-red-500';
      break;
    case 'listening':
      animationClass = 'scale-110';
      colorClass = 'bg-gradient-to-tr from-green-400 to-emerald-600';
      break;
    default:
      animationClass = 'animate-[pulse-orb_3s_infinite]';
      colorClass = 'bg-gradient-to-tr from-indigo-500 to-blue-500';
  }

  return (
    <div className="relative group cursor-pointer perspective-container w-[120px] h-[120px] flex items-center justify-center">
      {/* The Orb */}
      <div 
        className={`w-20 h-20 rounded-full shadow-[0_0_50px_rgba(0,122,255,0.3)] transition-all duration-500 element-3d ${animationClass} ${colorClass}`}
        style={{
           background: state === 'idle' ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(0,122,255,0.8), rgba(0,0,50,1))' : undefined
        }}
      >
        {/* Shine effect */}
        <div className="absolute top-3 left-4 w-6 h-4 bg-white/40 blur-md rounded-full transform -rotate-45"></div>
      </div>
      
      {/* Hover Menu (3D Effect) */}
      <div className="absolute top-full mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] border border-white/10">🎤 Mic</div>
          <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] border border-white/10">📹 Cam</div>
      </div>
    </div>
  );
};

export default ThreeDOrb;
