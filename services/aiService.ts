
import { GoogleGenAI, Type } from "@google/genai";
import { CVData, PersonalInfo, LocalizedContent, EducationItem, ExperienceItem } from "../types";

// Função utilitária para converter arquivo em base64 para o Gemini
export const fileToGenerativePart = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result.includes(',')) reject(new Error("Erro ao ler arquivo"));
      else resolve({
        inlineData: {
          data: result.split(',')[1],
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * EXTRAÇÃO DE DADOS PESSOAIS (OCR)
 * Usa Gemini 3 Flash para máxima velocidade.
 */
export const extractPersonalData = async (files: File[]): Promise<PersonalInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const fileParts = await Promise.all(files.map(fileToGenerativePart));
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      parts: [
        { text: "Analise as imagens do Bilhete de Identidade (BI). Extraia rigorosamente em JSON: fullName, address, nationality, idNumber, birthDate. Ignore campos de contacto se não estiverem no BI." },
        ...fileParts
      ]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          address: { type: Type.STRING },
          nationality: { type: Type.STRING },
          idNumber: { type: Type.STRING },
          birthDate: { type: Type.STRING }
        },
        required: ["fullName"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    phone: "",
    email: ""
  };
};

/**
 * EXTRAÇÃO DE DIPLOMAS/CERTIFICADOS
 */
export const extractDocumentsData = async (files: File[]): Promise<{ education: EducationItem[], experience: ExperienceItem[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const fileParts = await Promise.all(files.map(fileToGenerativePart));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      parts: [
        { text: "Extraia informações de educação e experiência profissional destes certificados e documentos. Retorne JSON." },
        ...fileParts
      ]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                course: { type: Type.STRING },
                institution: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            }
          },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                company: { type: Type.STRING },
                period: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"education":[], "experience":[]}');
};

/**
 * GERAÇÃO DE CV COMPLETO (BI-LINGUE)
 * Usa Gemini 3 Pro para redação executiva premium.
 */
export const generateFullCV = async (
  personal: PersonalInfo, 
  certs: EducationItem[], 
  manualEd: EducationItem[],
  manualExp: ExperienceItem[]
): Promise<{ pt: LocalizedContent, en: LocalizedContent }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const education = [...certs, ...manualEd];
  const experience = manualExp;

  const prompt = `Atue como um Especialista em Recrutamento de Elite. Gere um currículo bilingue (PT e EN) de alto impacto.
  Dados: ${JSON.stringify({ personal, education, experience })}
  Regras: Perfil objetivo forte, skills modernas e descrições de cargo expandidas com foco em resultados.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pt: { type: Type.OBJECT, properties: { objective: { type: Type.STRING }, skills: { type: Type.ARRAY, items: { type: Type.STRING } }, education: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { course: { type: Type.STRING }, institution: { type: Type.STRING }, year: { type: Type.STRING } } } }, experience: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { role: { type: Type.STRING }, company: { type: Type.STRING }, period: { type: Type.STRING }, description: { type: Type.STRING } } } } } },
          en: { type: Type.OBJECT, properties: { objective: { type: Type.STRING }, skills: { type: Type.ARRAY, items: { type: Type.STRING } }, education: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { course: { type: Type.STRING }, institution: { type: Type.STRING }, year: { type: Type.STRING } } } }, experience: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { role: { type: Type.STRING }, company: { type: Type.STRING }, period: { type: Type.STRING }, description: { type: Type.STRING } } } } } }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * GERAÇÃO DE CARTA DE APRESENTAÇÃO (HÍBRIDA GEMINI/OPENAI)
 */
export const generateCoverLetter = async (cvData: CVData, companyName: string, position: string, lang: 'PT' | 'EN'): Promise<string> => {
  // Usaremos o Gemini 3 Flash para esta tarefa por padrão (mais rápido e já configurado)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Escreva uma carta de apresentação profissional para ${cvData.personal.fullName} dirigida à empresa ${companyName} para o cargo de ${position}. Idioma: ${lang}. Seja persuasivo e formal. Retorne apenas o texto da carta.`
  });
  
  return response.text || "";
};

/**
 * SERVIÇO OPENAI (Integrado via chave direta para tarefas premium)
 */
export const generateWithOpenAI = async (prompt: string): Promise<string> => {
    const apiKey = "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";
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.error("Erro OpenAI:", e);
        return "";
    }
};
