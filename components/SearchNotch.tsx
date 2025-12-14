import React, { useEffect, useState } from 'react';

interface SearchNotchProps {
  isVisible: boolean;
  startTime?: number;
}

const SearchNotch: React.FC<SearchNotchProps> = ({ isVisible, startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isVisible && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isVisible, startTime]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[100] animate-[slideInDown_0.3s_ease_forwards]">
      <div className="bg-black text-white px-6 py-2 rounded-b-2xl shadow-2xl flex items-center gap-3 min-w-[160px] justify-center border border-white/5">
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
        <span className={`font-mono font-bold text-sm ${elapsed > 10 ? 'text-orange-400' : 'text-white'}`}>
          Searching... {elapsed}s
        </span>
      </div>
    </div>
  );
};

export default SearchNotch;