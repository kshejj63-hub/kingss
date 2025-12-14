
import React from 'react';

interface FileActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
}

const FileActionModal: React.FC<FileActionModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📎</span> Upload & Convert
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
                 <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-gray-400 hover:bg-white/5 hover:border-indigo-500/50 transition-all cursor-pointer">
                     <span className="text-4xl mb-3">☁️</span>
                     <p className="font-medium text-sm">Drag & Drop files or Click to Upload</p>
                     <p className="text-xs text-gray-600 mt-2">Supports .txt, .pdf, .jpg, .mp3, .mp4</p>
                 </div>

                 <div className="bg-white/5 rounded-xl p-4">
                     <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Conversion Options</h4>
                     <div className="space-y-2">
                         <Option label="📄 Document to PDF" desc="Convert Word, Text, HTML to PDF" />
                         <Option label="🖼 Image to Format" desc="Convert JPG/PNG to WebP, PDF" />
                         <Option label="🎵 Audio Transcription" desc="Convert Speech to Text" />
                         <Option label="🎬 Video Compression" desc="Optimize video file size" />
                     </div>
                 </div>
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
            </div>
        </div>
    </div>
  );
};

const Option: React.FC<{ label: string, desc: string }> = ({ label, desc }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
        <div>
            <div className="text-sm font-bold text-gray-300 group-hover:text-indigo-300 transition-colors">{label}</div>
            <div className="text-xs text-gray-500">{desc}</div>
        </div>
        <div className="text-gray-600 group-hover:text-indigo-500">➔</div>
    </div>
);

export default FileActionModal;
