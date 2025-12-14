
import React, { useState, useEffect } from 'react';
import { ModelSettings } from '../types';
import { AVAILABLE_MODELS } from '../services/geminiService';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
  currentSettings: ModelSettings;
  onSave: (modelId: string, settings: ModelSettings) => void;
  language: 'ar' | 'en';
}

const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  modelId,
  currentSettings,
  onSave,
  language
}) => {
  const [instruction, setInstruction] = useState(currentSettings.customInstruction || '');
  const [temp, setTemp] = useState(currentSettings.temperature || 0.7);
  const [personality, setPersonality] = useState(currentSettings.enablePersonality ?? true);

  const model = AVAILABLE_MODELS.find(m => m.id === modelId);

  useEffect(() => {
    if (isOpen) {
      setInstruction(currentSettings.customInstruction || '');
      setTemp(currentSettings.temperature || 0.7);
      setPersonality(currentSettings.enablePersonality ?? true);
    }
  }, [isOpen, currentSettings, modelId]);

  if (!isOpen) return null;

  const t = {
    ar: {
      title: 'إعدادات النموذج',
      training: 'تعليمات التدريب (Training)',
      trainingDesc: 'أدخل تعليمات خاصة لهذا النموذج فقط (مثل: "تحدث كأنك مهندس برمجيات")',
      creativity: 'مستوى الإبداع',
      enablePersona: 'تفعيل الشخصية الرسمية',
      save: 'حفظ الإعدادات',
      cancel: 'إلغاء'
    },
    en: {
      title: 'Model Settings',
      training: 'Custom Instructions (Training)',
      trainingDesc: 'Enter specific instructions for this model only (e.g., "Act like a Senior Engineer")',
      creativity: 'Creativity Level',
      enablePersona: 'Enable Official Persona',
      save: 'Save Settings',
      cancel: 'Cancel'
    }
  }[language];

  const handleSave = () => {
    onSave(modelId, {
      customInstruction: instruction,
      temperature: temp,
      enablePersonality: personality
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <div className="flex items-center gap-3 mb-6">
           <div className="text-3xl">{model?.icon}</div>
           <div>
             <h2 className="text-xl font-bold">{model?.name}</h2>
             <p className="text-xs text-gray-400">{t.title}</p>
           </div>
        </div>

        <div className="space-y-6">
          
          {/* Personality Toggle */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <span className="text-sm font-medium">{t.enablePersona}</span>
            <button 
              onClick={() => setPersonality(!personality)} 
              className={`w-12 h-6 rounded-full transition-colors relative ${personality ? 'bg-primary-600' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${personality ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Creativity Slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
               <span>{t.creativity}</span>
               <span>{temp.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.1" 
              value={temp} 
              onChange={(e) => setTemp(parseFloat(e.target.value))} 
              className="w-full accent-primary-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
               <span>Precise</span>
               <span>Creative</span>
            </div>
          </div>

          {/* Training Instructions */}
          <div>
             <label className="block text-sm font-medium mb-1">{t.training}</label>
             <p className="text-[10px] text-gray-400 mb-2">{t.trainingDesc}</p>
             <textarea 
               value={instruction}
               onChange={(e) => setInstruction(e.target.value)}
               className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none resize-none"
               placeholder="..."
             />
          </div>

        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">{t.cancel}</button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 transition-colors text-white font-bold text-sm shadow-lg shadow-primary-500/20">{t.save}</button>
        </div>
      </div>
    </div>
  );
};

export default ModelSettingsModal;
