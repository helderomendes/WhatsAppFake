
import { GoogleGenAI, Type } from "@google/genai";

// Function to generate realistic WhatsApp dialogues using Gemini 3
export const generateConversation = async (topic: string, contacts: {id: string, name: string}[]) => {
  // Always initialize a new GoogleGenAI instance before use to ensure the most current API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contactNames = contacts.map(c => c.name).join(', ');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Atue como um gerador de diálogos de WhatsApp fidedignos.
    Tema: "${topic}".
    Participantes: "Eu" (o remetente principal) e os contatos: ${contactNames}.
    
    INSTRUÇÕES CRUPCIAIS:
    1. Identifique quem envia cada mensagem. Use o nome exato do contato ou "Eu" para o remetente principal.
    2. Seja criativo! Use uma mistura de tipos:
       - 'text': Diálogo natural em PT-BR.
       - 'image': Use 'https://picsum.photos/400/300' para fotos.
       - 'audio': Notas de voz com duração (ex: '0:12').
       - 'sticker': Use imagens de stickers.
       - 'buttons': Opções interativas.
    3. As mensagens devem ter timestamps realistas em sequência (HH:MM).
    4. O tom deve ser informal e condizente com o tema.
    
    Retorne APENAS um JSON com o campo 'messages'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          messages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                senderName: { type: Type.STRING, description: "Nome exato do contato ou 'Eu'" },
                content: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['text', 'image', 'buttons', 'audio', 'sticker', 'system'] },
                timestamp: { type: Type.STRING },
                audioDuration: { type: Type.STRING },
                buttons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING }
                    }
                  }
                }
              },
              required: ["senderName", "content", "type", "timestamp"]
            }
          }
        },
        required: ["messages"]
      }
    }
  });

  return JSON.parse(response.text);
};
