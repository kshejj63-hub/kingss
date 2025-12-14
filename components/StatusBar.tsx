
import React from 'react';

interface StatusBarProps {
  status: string | null;
  language: 'ar' | 'en';
}

const StatusBar: React.FC<StatusBarProps> = ({ status, language }) => {
  if (!status) return null;

  return (
    <div className="absolute top-12 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
            <span className="text-xs font-bold text-white tracking-widest uppercase font-mono">{status}</span>
        </div>
    </div>
  );
};

export default StatusBar;
