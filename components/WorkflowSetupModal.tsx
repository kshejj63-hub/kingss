import React, { useState } from 'react';
import { AVAILABLE_MODELS, ModelConfig } from '../services/geminiService';
import { Workflow, WorkflowStep, NodeType } from '../types';

interface WorkflowSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunWorkflow: (workflow: Workflow) => void;
  language: 'ar' | 'en';
}

const WorkflowSetupModal: React.FC<WorkflowSetupModalProps> = ({
  isOpen,
  onClose,
  onRunWorkflow,
  language
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: '1',
      type: 'llm',
      modelId: 'deepseek-v3-1',
      name: 'Step 1: Analysis (DeepSeek)',
      promptTemplate: 'Analyze the following request strictly and logically:\n\n{{INPUT}}'
    },
    {
      id: '2',
      type: 'llm',
      modelId: 'gpt-5-omni',
      name: 'Step 2: Writer (GPT-5)',
      promptTemplate: 'Based on the analysis below, write a professional report:\n\n{{PREV_RESULT}}'
    }
  ]);
  const [workflowName, setWorkflowName] = useState('');

  if (!isOpen) return null;

  const t = {
    ar: {
      title: 'بناء سير العمل (Workflow Builder)',
      subtitle: 'صمم خط إنتاج ذكي يعمل بتسلسل تلقائي.',
      addStep: 'إضافة خطوة +',
      run: 'تشغيل الـ Workflow 🚀',
      step: 'خطوة',
      promptLabel: 'تعليمات هذه الخطوة (Prompt)',
      modelLabel: 'النموذج المنفذ',
      placeholderInfo: 'استخدم {{PREV_RESULT}} لإدخال نتيجة الخطوة السابقة هنا.',
      inputInfo: 'استخدم {{INPUT}} لإدخال رسالتك الأولى هنا.',
      remove: 'حذف',
      workflowName: 'اسم العملية (اختياري)',
      cancel: 'إلغاء'
    },
    en: {
      title: 'Workflow Builder',
      subtitle: 'Design an intelligent automated pipeline.',
      addStep: 'Add Step +',
      run: 'Run Workflow 🚀',
      step: 'Step',
      promptLabel: 'Instruction (Prompt)',
      modelLabel: 'Executor Model',
      placeholderInfo: 'Use {{PREV_RESULT}} to inject the result of the previous step.',
      inputInfo: 'Use {{INPUT}} to inject your initial message here.',
      remove: 'Remove',
      workflowName: 'Workflow Name (Optional)',
      cancel: 'Cancel'
    }
  }[language];

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type: 'llm',
      modelId: 'gemini-2.5-flash',
      name: `${t.step} ${steps.length + 1}`,
      promptTemplate: 'Take the following output and refine it:\n\n{{PREV_RESULT}}'
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    // Auto-update name if model changes
    if (field === 'modelId') {
       const model = AVAILABLE_MODELS.find(m => m.id === value);
       newSteps[index].name = `${t.step} ${index + 1}: ${model?.name || ''}`;
       // Auto-set type based on model category
       if (model?.category.includes('Image')) newSteps[index].type = 'image';
       else if (model?.category.includes('Agent')) newSteps[index].type = 'tool';
       else newSteps[index].type = 'llm';
    }
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const handleRun = () => {
    if (steps.length === 0) return;
    const workflow: Workflow = {
      id: Date.now().toString(),
      name: workflowName || `Workflow ${new Date().toLocaleTimeString()}`,
      steps: steps
    };
    onRunWorkflow(workflow);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-50 dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">⚡</span>
              {t.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Builder Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-[#0d1117]">
          <div className="mb-6">
             <input 
                type="text" 
                placeholder={t.workflowName}
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 text-lg font-bold px-2 py-1 focus:border-primary-500 focus:outline-none dark:text-white"
             />
          </div>

          <div className="space-y-4 relative">
            {/* Connecting Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-300 dark:bg-gray-800 -z-0"></div>

            {steps.map((step, index) => {
              const model = AVAILABLE_MODELS.find(m => m.id === step.modelId);
              return (
                <div key={step.id} className="relative z-10 flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                  {/* Number Badge */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center justify-center shadow-md">
                    {index + 1}
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t.modelLabel}</label>
                             <select 
                                value={step.modelId}
                                onChange={(e) => updateStep(index, 'modelId', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                             >
                                {AVAILABLE_MODELS.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.category.includes('Super') ? '🧠' : (m.category.includes('Image') ? '🎨' : '🛠️')} {m.name}
                                    </option>
                                ))}
                             </select>
                             <p className="text-[10px] text-gray-500 mt-1 truncate">{model?.description}</p>
                        </div>
                        <button 
                            onClick={() => removeStep(index)}
                            className="text-gray-400 hover:text-red-500 p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {t.promptLabel}
                        </label>
                        <textarea 
                            value={step.promptTemplate}
                            onChange={(e) => updateStep(index, 'promptTemplate', e.target.value)}
                            className="w-full h-24 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        />
                        <div className="flex gap-2 mt-1">
                            {index === 0 && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">{t.inputInfo}</span>}
                            {index > 0 && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded font-mono">{t.placeholderInfo}</span>}
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <button 
                onClick={addStep}
                className="ml-16 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors text-sm font-bold w-[calc(100%-4rem)]"
            >
                {t.addStep}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
             >
                {t.cancel}
             </button>
             <button 
                onClick={handleRun}
                disabled={steps.length === 0}
                className="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2"
             >
                <span>{t.run}</span>
             </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSetupModal;