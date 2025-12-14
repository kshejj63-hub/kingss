
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  image?: string;
  isStreaming?: boolean;
  timestamp: number;
  modelId?: string;
  stepName?: string;
  isLiked?: boolean;
  searchDuration?: number; 
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  participantIds?: string[];
  workflowId?: string;
  modelId: string; 
  isPinned?: boolean;
  userDefinedTitle?: boolean; // ✅ Prevents system from auto-renaming
}

export type ThoughtMode = 'normal' | 'deep' | 'code';

export interface SendMessageParams {
  message: string;
  history: Message[];
  image?: string;
}

// --- PER MODEL SETTINGS ---
export interface ModelSettings {
  customInstruction: string;
  temperature: number;
  enablePersonality: boolean;
}

// --- WORKFLOW TYPES ---
export type NodeType = 'llm' | 'image' | 'tool';

export interface WorkflowStep {
  id: string;
  type: NodeType;
  modelId: string;
  name: string;
  promptTemplate: string;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  description?: string;
}

// --- APP SETTINGS & THEMING ---
export type EffectType = 
  | 'none' | 'stars' | 'galaxy' | 'leaves' | 'clouds' 
  | 'cosmic_ocean' | 'digital_forest' | 'neon_city' | 'galactic_core' 
  | 'crystal_cave' | 'ai_matrix' | 'sunset_dunes' | 'arctic_lights' 
  | 'cyberpunk_street' | 'mystic_fog';

export type ClickStyle = 'none' | 'ripple' | 'particles' | 'glow' | 'splash' | 'hologram';

export type GradientTheme = 'default' | 'sunset' | 'ocean' | 'forest' | 'lavender' | 'midnight' | 'cyberpunk' | 'royal' | 'custom-mix';

// Detailed Dialect Support
export type Dialect = 'auto' | 'egyptian' | 'saudi' | 'lebanese' | 'emirati' | 'msa';

export type VoicePersona = 'ahmed' | 'omar' | 'layla' | 'fatima';
export type ProcessingPower = 'low' | 'medium' | 'high';
export type KnowledgeLoad = 'light' | 'medium' | 'full';

export interface AppSettings {
  themeMode: 'dark' | 'light' | 'auto';
  themeColor: string; 
  colorMix: string[]; 
  gradientTheme: GradientTheme; 
  effectType: EffectType;
  clickStyle: ClickStyle;
  effectSpeed: number;
  effectDensity: number;
  isSidebarCompact: boolean;
  
  // Audio
  voicePitch: number;
  voiceRate: number;
  voiceVolume: number;
  selectedVoiceURI?: string; 
  voicePersona: VoicePersona;
  
  transparencyLevel: number; 
  enablePersonality: boolean; 
  deepResearchEnabled: boolean; 
  language: 'ar' | 'en'; // UI Language
  
  // Intelligent Language Settings
  responseLanguage: 'auto' | 'en' | 'ar'; 
  dialect: Dialect; 
  
  // New: Region & Performance
  region: string;
  processingPower: ProcessingPower;
  memoryOptimization: boolean;
  knowledgeLoad: KnowledgeLoad;
  
  // State
  onboardingComplete: boolean;
  userName?: string;
}
