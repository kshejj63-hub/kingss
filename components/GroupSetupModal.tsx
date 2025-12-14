import React, { useState } from 'react';
import { AVAILABLE_MODELS, ModelConfig } from '../services/geminiService';

interface GroupSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (selectedModelIds: string[]) => void;
  language: 'ar' | 'en';
}

const GroupSetupModal: React.FC<GroupSetupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  language
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleModel = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const t = {
    ar: {
      title: 'إنشاء فريق ذكاء اصطناعي',
      subtitle: 'اختر النماذج التي ستعمل معاً في هذه المحادثة.',
      create: 'بدء الدردشة الجماعية',
      cancel: 'إلغاء',
      selected: 'تم اختيار',
      models: 'نماذج'
    },
    en: {
      title: 'Create AI Squad',
      subtitle: 'Select models to work together in this chat.',
      create: 'Start Group Chat',
      cancel: 'Cancel',
      selected: 'Selected',
      models: 'models'
    }
  }[language];

  // Group models by category for easier selection
  const groupedModels = AVAILABLE_MODELS.reduce((acc, model) => {
    if (!acc[model.category]) acc[model.category] = [];
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, ModelConfig[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg">👥</span>
            {t.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(groupedModels).map(([category, models]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {models.map(model => {
                  const isSelected = selectedIds.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      className={`relative flex items-start gap-3 p-3 rounded-xl border-2 text-start transition-all duration-200 ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md' 
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/50'
                      }`}
                    >
                      <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center border transition-colors ${
                          isSelected 
                            ? 'bg-indigo-500 border-indigo-500 text-white' 
                            : 'border-gray-400 dark:border-gray-600'
                      }`}>
                          {isSelected && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                          )}
                      </div>
                      <div className="flex-1">
                          <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{model.name}</div>
                          <div className="text-[10px] text-gray-500 leading-tight mt-1">{model.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-b-2xl flex justify-between items-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {selectedIds.length} {t.selected}
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-sm font-bold transition-colors"
                >
                    {t.cancel}
                </button>
                <button 
                    onClick={() => onCreateGroup(selectedIds)}
                    disabled={selectedIds.length < 2}
                    className={`px-6 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${
                        selectedIds.length < 2
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95'
                    }`}
                >
                   <span>{t.create}</span>
                   {selectedIds.length >= 2 && (
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                         <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                       </svg>
                   )}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default GroupSetupModal;