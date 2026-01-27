
import { GoogleGenAI, Type } from "@google/genai";

export const generateConversation = async (topic: string, contacts: {id: string, name: string}[]) => {
  // Inicializa a IA com a chave de ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contactNames = contacts.map(c => c.name).join(', ');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model is better for complex structured dialogues
      contents: `Gere uma conversa de WhatsApp sobre o tema: "${topic}".`,
      config: {
        systemInstruction: `Você é um especialista em criar diálogos realistas de WhatsApp em Português do Brasil.
        Participantes disponíveis: "Eu" e os contatos: ${contactNames}.
        
        REGRAS:
        1. Use apenas os nomes de participantes fornecidos.
        2. "Eu" representa o dono do celular.
        3. tipos de mensagens: 'text', 'image', 'buttons', 'audio', 'sticker', 'carousel'.
        4. No tipo 'buttons', inclua pelo menos um botão com texto curto.
        5. No tipo 'audio', defina 'audioDuration' (ex: '0:15').
        6. No tipo 'carousel', forneça uma lista de cards com título e botão.
        7. Retorne um JSON válido seguindo estritamente o schema.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            messages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  senderName: { type: Type.STRING, description: "Nome do participante (Eu ou um dos contatos)" },
                  content: { type: Type.STRING, description: "Texto da mensagem" },
                  type: { type: Type.STRING, enum: ['text', 'image', 'buttons', 'audio', 'sticker', 'carousel'] },
                  timestamp: { type: Type.STRING, description: "Horário no formato HH:MM" },
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

    if (!response.text) throw new Error("Resposta da IA vazia");
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Erro na geração por IA:", error);
    throw error;
  }
};
