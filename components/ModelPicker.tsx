
import React, { useState } from 'react';
import { AVAILABLE_MODELS } from '../services/geminiService';

interface ModelPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentModelId: string;
  onSelectModel: (id: string) => void;
  language: 'ar' | 'en';
}

const ModelPicker: React.FC<ModelPickerProps> = ({ isOpen, onClose, currentModelId, onSelectModel }) => {
  const [filter, setFilter] = useState('All');

  if (!isOpen) return null;

  const filteredModels = AVAILABLE_MODELS.filter(m => filter === 'All' || m.category === filter);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl animate-in fade-in overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-10">
            
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Built-in Models Hub</h2>
                    <p className="text-gray-400">Select specialized intelligence for your task.</p>
                </div>
                <button onClick={onClose} className="text-white hover:text-gray-300 text-xl">✕</button>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {['All', 'Coding 💻', 'Chat 💬', 'Art 🎨', 'Search 🌐'].map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${filter === cat ? 'bg-[#F5F5DC] text-black border-[#F5F5DC]' : 'border-white/10 text-gray-400 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map(model => (
                    <div 
                        key={model.id}
                        onClick={() => { onSelectModel(model.id); onClose(); }}
                        className={`group relative bg-[#1A1A1A] border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl element-3d ${currentModelId === model.id ? 'border-indigo-500 bg-[#202025]' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-3xl shadow-lg">
                                {model.icon}
                            </div>
                            {currentModelId === model.id && <div className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">ACTIVE</div>}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{model.name}</h3>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{model.description}</p>

                        <div className="space-y-3">
                            {model.capabilities?.map((cap, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                                    <span className="text-indigo-500">•</span>
                                    {cap}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ModelPicker;
