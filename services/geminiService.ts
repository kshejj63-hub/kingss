
import { GoogleGenAI, GenerateContentResponse, Part, Tool } from "@google/genai";
import { Message, Role, ThoughtMode } from "../types";

const API_KEY = process.env.API_KEY;

// --- Global Identity Override ---
export const IDENTITY_INSTRUCTION = `
**CORE PROTOCOL:**
You are "Super Bev AI", a highly advanced intelligence.
You must ADAPT your personality based on the active MODEL PERSONA and VOICE PERSONA.

**CRITICAL RULES:**
1. **NO HALLUCINATION OF USER INPUT:** Do NOT repeat what the user said unless asked.
2. **NO FILLER:** Do NOT add "Hi [user input]" or "You said: [user input]" at the start of your response.
3. **DIRECT RESPONSE:** Answer the query directly and concisely.

**SMART LANGUAGE & DIALECT SYSTEM:**
1. **INPUT DETECTION:** 
   - If user speaks/types ARABIC -> Respond in ARABIC.
   - If user speaks/types ENGLISH -> Respond in ENGLISH.
   
2. **DIALECT ADAPTATION:**
   - **Egyptian:** Use "da", "eh", "ezzay", "keda".
   - **Saudi:** Use "yaal", "esh", "zain", "absher".
   - **Lebanese:** Use "shu", "hlla", "kifak".

**IMAGE GENERATION TRIGGER:**
If the user asks to "generate", "draw", "create", "visualize" an image/picture/photo, you MUST use the image generation tool capabilities. Do not say you cannot draw.
`;

// --- Personas ---

const DEEPSEEK_INSTRUCTION = `
PERSONA: DeepSeek (Research & Analysis)
STYLE: Extremely logical, open-source spirit, highly capable in coding and math.
SPECIALTY: Deep Research, Data Analysis, Complex Logic.
`;

const CHATGPT4_INSTRUCTION = `
PERSONA: ChatGPT-4 (General Conversation)
STYLE: Friendly, versatile, comprehensive.
SPECIALTY: General Chat, Daily Tasks, Explanations.
`;

const CLAUDE_INSTRUCTION = `
PERSONA: Claude 3 (Creative & Writing)
STYLE: Nuanced, literary, safe, empathetic.
SPECIALTY: Creative Writing, Translation, summarization.
`;

const GEMINI_INSTRUCTION = `
PERSONA: Google Gemini (Speed & Accuracy)
STYLE: Fast, factual, multimodal.
SPECIALTY: Quick Info, Real-time Knowledge, Accuracy.
`;

const COPILOT_INSTRUCTION = `
PERSONA: GitHub Copilot (Coding Specialist)
STYLE: Concise, code-first, efficient.
SPECIALTY: Programming, Debugging, Code Optimization.
`;

// --- Model Configuration Interface ---

export interface ModelConfig {
    id: string;
    name: string;
    nickname: string;
    icon: string;
    description: string;
    backendModel: string;
    instruction: string;
    category: 'General' | 'Research' | 'Creative' | 'Coding';
    rating: string;
    reviewCount?: string;
    specialty: string;
    capabilities?: string[];
    animation: string;
}

// --- Available Models (Simulated Built-in) ---

export const AVAILABLE_MODELS: ModelConfig[] = [
  { 
    id: 'model-chatgpt4', 
    name: 'ChatGPT-4', 
    nickname: 'GPT-4',
    icon: '🤖',
    description: 'النموذج الأساسي للمحادثات العامة',
    backendModel: 'gemini-2.5-flash', // Mapped to Gemini for backend
    instruction: CHATGPT4_INSTRUCTION,
    category: 'General',
    rating: '4.9',
    specialty: 'General Chat',
    capabilities: ['نص', 'برمجة', 'تحليل'],
    animation: 'glow'
  },
  { 
    id: 'model-deepseek', 
    name: 'DeepSeek', 
    nickname: 'DeepSeek',
    icon: '🧠',
    description: 'متخصص في البحث العميق والتحليل',
    backendModel: 'gemini-2.5-flash', // Using Thinking/Reasoning logic if available via config
    instruction: DEEPSEEK_INSTRUCTION,
    category: 'Research',
    rating: '4.8',
    specialty: 'Deep Research',
    capabilities: ['بحث', 'تحليل بيانات', 'تفكير عميق'],
    animation: 'pulse'
  },
  { 
    id: 'model-claude', 
    name: 'Claude 3', 
    nickname: 'Claude',
    icon: '🌟',
    description: 'متخصص في الإبداع والكتابة',
    backendModel: 'gemini-2.5-flash',
    instruction: CLAUDE_INSTRUCTION,
    category: 'Creative',
    rating: '4.9',
    specialty: 'Creative Writing',
    capabilities: ['كتابة', 'إبداع', 'ترجمة'],
    animation: 'float'
  },
  { 
    id: 'model-gemini', 
    name: 'Google Gemini', 
    nickname: 'Gemini',
    icon: '⚡',
    description: 'سرعة في الإجابة ودقة في المعلومات',
    backendModel: 'gemini-2.5-flash', 
    instruction: GEMINI_INSTRUCTION,
    category: 'General',
    rating: '4.8',
    specialty: 'Speed & Accuracy',
    capabilities: ['معلومات', 'سرعة', 'دقة'],
    animation: 'sparkle'
  },
  { 
    id: 'model-copilot', 
    name: 'GitHub Copilot', 
    nickname: 'Copilot',
    icon: '💻',
    description: 'متخصص في البرمجة والكود',
    backendModel: 'gemini-2.5-flash',
    instruction: COPILOT_INSTRUCTION,
    category: 'Coding',
    rating: '4.7',
    specialty: 'Coding',
    capabilities: ['برمجة', 'تصحيح أخطاء', 'تحسين كود'],
    animation: 'codeFlow'
  }
];

export async function* streamGeminiResponse(
  message: string,
  history: Message[],
  imageBase64: string | undefined,
  modelId: string,
  customSystemInstruction?: string,
  isRootMode: boolean = false,
  thoughtMode: ThoughtMode = 'normal',
  useSearch: boolean = false
): AsyncGenerator<string, void, unknown> {
  
  if (!API_KEY) {
    throw new Error("⚠️ API Key missing in .env");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // 1. Identify the selected model configuration
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0]; 
  
  // DETERMINE MODEL TYPE
  const isImageGenRequest = message.toLowerCase().match(/(generate|draw|create|make).*(image|picture|photo|art)/i);
  const isImageGenModel = selectedModel.backendModel.includes('flash-image') || isImageGenRequest;

  // --- SPECIAL HANDLING: IMAGE GENERATION ---
  if (isImageGenModel) {
      const imageModel = 'gemini-2.5-flash-image';
      try {
          const response = await ai.models.generateContent({
              model: imageModel,
              contents: { parts: [{ text: message }] }
          });

          let foundImage = false;
          const parts = response.candidates?.[0]?.content?.parts;
          if (parts) {
              for (const part of parts) {
                  if (part.inlineData) {
                      const b64 = part.inlineData.data;
                      const mime = part.inlineData.mimeType || 'image/png';
                      yield `\n\n![Generated Image 🎨](data:${mime};base64,${b64})\n\n`;
                      foundImage = true;
                  }
                  if (part.text) {
                      yield part.text;
                  }
              }
          }
          if (!foundImage && !parts?.some(p => p.text)) {
             yield "🎨 Generating your artwork...";
          }
          return;
      } catch (error: any) {
          console.error("Image Gen Error:", error);
          yield `⚠️ **Image Generation Failed 🎨:** ${error.message}`;
          return;
      }
  }

  // 2. Determine System Instruction
  let finalInstruction = `${IDENTITY_INSTRUCTION}\n\n${selectedModel.instruction}`;
  if (customSystemInstruction && customSystemInstruction.trim()) {
      finalInstruction += `\n\n${customSystemInstruction}`;
  }

  // --- CONFIGURATION SETUP ---
  let requestConfig: any = {
      systemInstruction: finalInstruction,
  };

  if (thoughtMode === 'deep') {
      finalInstruction += `\n\n**DEEP THINK MODE 🧠:** You must now THINK DEEPLY before answering. Use the <thinking> tag.`;
  } else if (thoughtMode === 'code') {
      finalInstruction += `\n\n**CODE EXPERT MODE 💻:** Provide strictly optimal, documented code.`;
      requestConfig.thinkingConfig = { thinkingBudget: 0 }; 
  } else {
      requestConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const tools: Tool[] = [];
  if ((useSearch || selectedModel.id === 'model-deepseek') && !selectedModel.backendModel.includes('flash-image')) {
      tools.push({ googleSearch: {} });
  }

  if (tools.length > 0) {
      requestConfig.tools = tools;
  }

  // 3. Prepare History (Filter out streaming messages)
  const historyContents: any[] = history
    .filter(msg => !msg.isStreaming)
    .map(msg => {
      const parts: Part[] = [];
      if (msg.image) {
        const cleanBase64 = msg.image.split(',')[1] || msg.image;
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        });
      }
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      return {
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: parts,
      };
    });

  // 4. Initialize Chat
  const chat = ai.chats.create({
    model: selectedModel.backendModel,
    history: historyContents,
    config: requestConfig
  });

  try {
    const currentParts: Part[] = [];
    if (imageBase64) {
       const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
       currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } });
    }
    currentParts.push({ text: message });

    const resultStream = await chat.sendMessageStream({ message: currentParts as any });

    for await (const chunk of resultStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (parts) {
          for (const part of parts) {
              if (part.inlineData) {
                  const b64 = part.inlineData.data;
                  const mime = part.inlineData.mimeType || 'image/png';
                  yield `\n\n![Generated Image 🎨](data:${mime};base64,${b64})\n\n`;
              }
              if (part.text) yield part.text;
          }
      } else if (chunk.text) {
          yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    let friendlyMessage = `⚠️ Error (${selectedModel.name}): ${error.message}`;
    if (error.message.includes("404") || error.message.includes("NOT_FOUND")) {
        friendlyMessage = `⚠️ Model '${selectedModel.backendModel}' not available.`;
    }
    throw new Error(friendlyMessage);
  }
}
