
import { GoogleGenAI, Type } from "@google/genai";
import { CVData, PersonalInfo, LocalizedContent, EducationItem, ExperienceItem } from "../types";

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

export const extractPersonalData = async (files: File[]): Promise<PersonalInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const fileParts = await Promise.all(files.map(fileToGenerativePart));
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      parts: [
        { text: "Analise o Bilhete de Identidade. Extraia: fullName, address, nationality (IMPORTANTE: Para a naturalidade/nacionalidade, use sempre a PROVÍNCIA/CIDADE de nascimento encontrada no documento, não o país), idNumber, birthDate. IMPORTANTE: DEIXE OS CAMPOS 'phone' E 'email' COMO STRING VAZIA (\"\"). NÃO INVENTE DADOS DE CONTACTO." },
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
          phone: { type: Type.STRING },
          email: { type: Type.STRING },
          nationality: { type: Type.STRING },
          idNumber: { type: Type.STRING },
          birthDate: { type: Type.STRING }
        },
        required: ["fullName", "idNumber"]
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

export const extractDocumentsData = async (files: File[]): Promise<{ education: EducationItem[], experience: ExperienceItem[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const fileParts = await Promise.all(files.map(fileToGenerativePart));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      parts: [
        { text: "Extraia informações reais de educação e experiência destes documentos. Retorne JSON com 'education' (course, institution, year) e 'experience' (role, company, period, description)." },
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

export const generateFullCV = async (
  personal: PersonalInfo, 
  certs: EducationItem[], 
  manualEd: EducationItem[],
  manualExp: ExperienceItem[]
): Promise<{ pt: LocalizedContent, en: LocalizedContent }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const education = [...certs, ...manualEd];
  const experience = manualExp;

  const prompt = `Gere um currículo de ALTO NÍVEL (Executivo) usando EXCLUSIVAMENTE estes dados:
  PESSOAL: ${JSON.stringify(personal)}
  EDUCAÇÃO: ${JSON.stringify(education)}
  EXPERIÊNCIA: ${JSON.stringify(experience)}
  
  Instruções:
  - Crie um objetivo profissional impactante e executivo (3-5 frases).
  - Expanda as descrições de experiência para parecerem profissionais e focadas em resultados.
  - A Naturalidade deve sempre exibir a PROVÍNCIA fornecida nos dados pessoais.
  - O e-mail e telefone DEVEM ser EXATAMENTE os fornecidos: "${personal.email}" e "${personal.phone}".
  
  RETORNE JSON COM AS CHAVES 'pt' E 'en'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pt: {
            type: Type.OBJECT,
            properties: {
              objective: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { course: { type: Type.STRING }, institution: { type: Type.STRING }, year: { type: Type.STRING } } } },
              experience: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { role: { type: Type.STRING }, company: { type: Type.STRING }, period: { type: Type.STRING }, description: { type: Type.STRING } } } },
              certifications: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { course: { type: Type.STRING }, institution: { type: Type.STRING }, year: { type: Type.STRING } } } }
            },
            required: ["objective", "skills", "education", "experience"]
          },
          en: {
            type: Type.OBJECT,
            properties: {
              objective: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { course: { type: Type.STRING }, institution: { type: Type.STRING }, year: { type: Type.STRING } } } },
              experience: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { role: { type: Type.STRING }, company: { type: Type.STRING }, period: { type: Type.STRING }, description: { type: Type.STRING } } } },
              certifications: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { course: { type: Type.STRING }, institution: { type: Type.STRING }, year: { type: Type.STRING } } } }
            },
            required: ["objective", "skills", "education", "experience"]
          }
        },
        required: ["pt", "en"]
      }
    }
  });

  if (!response.text) throw new Error("A IA não retornou nenhum texto.");
  return JSON.parse(response.text.trim());
};

export const generateCoverLetter = async (cvData: CVData, companyName: string, position: string, lang: 'PT' | 'EN'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const date = new Date().toLocaleDateString(lang === 'PT' ? 'pt-PT' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Escreva uma carta de apresentação formal, profissional e PRONTA PARA ENVIO para ${cvData.personal.fullName}. 
    Idioma: ${lang}
    Empresa alvo: ${companyName}
    Cargo pretendido: ${position}
    Data de hoje: ${date}
    Dados Pessoais: ${JSON.stringify(cvData.personal)}
    
    REGRAS CRÍTICAS DE FORMATAÇÃO E CONTEÚDO:
    1. PROIBIDO o uso de formatação Markdown (NÃO use asteriscos *, hashtags #, negrito, itálico ou aspas extras).
    2. Texto LIMPO, use apenas parágrafos e quebras de linha simples.
    3. NÃO inclua linhas de assinatura (Ex: _________).
    4. Encerre com "Atenciosamente," seguido APENAS pelo nome: ${cvData.personal.fullName}.
    5. A carta deve estar PRONTA PARA ENVIO. Comece com data e local no topo.`
  });
  return response.text || "";
};
