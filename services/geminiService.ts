
import { GoogleGenAI, Content, Modality, Part, GenerateContentParameters } from "@google/genai";
import type { Message as AppMessage } from '../types';

const getAiClient = () => {
    // Priority: 1. Env Var (Deployment) 2. LocalStorage (User entered)
    const apiKey = process.env.API_KEY || localStorage.getItem('nepex-api-key') || '';
    
    if (!apiKey) {
        throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
};

const mapAppMessagesToGeminiHistory = (messages: AppMessage[]): Content[] => {
    // Filter out empty messages that might exist during streaming
    const validMessages = messages.filter(msg => msg.text || msg.attachment);
    return validMessages.map(msg => {
        const parts: Part[] = [];
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        if (msg.attachment) {
            parts.push({
                inlineData: {
                    data: msg.attachment.data.split(',')[1],
                    mimeType: msg.attachment.mimeType,
                }
            });
        }
        return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: parts,
        };
    });
};

export const sendMessageStream = async (
    systemInstruction: string,
    history: AppMessage[],
    message: string,
    attachment?: { data: string; mimeType: string }
) => {
  const ai = getAiClient();
  const geminiHistory = mapAppMessagesToGeminiHistory(history);
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
    history: geminiHistory,
  });

  const content: Part[] = [];
  if (message) {
    content.push({ text: message });
  }
  if (attachment) {
    content.push({
      inlineData: {
        data: attachment.data.split(',')[1], // remove data:mime/type;base64,
        mimeType: attachment.mimeType,
      },
    });
  }

  if (content.length === 0) {
      throw new Error("Cannot send an empty message.");
  }
  
  const messagePayload: GenerateContentParameters = { parts: content };

  const stream = await chat.sendMessageStream({ message: messagePayload });
  return stream;
};


export const generateTextToSpeech = async (text: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS generation failed:", error);
    return null;
  }
};


export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
            },
        });
        
        if (response.generatedImages && response.generatedImages[0]?.image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return base64ImageBytes;
        }
        return null;
    } catch (error) {
        console.error("Image generation failed:", error);
        return null;
    }
};
