import { GoogleGenerativeAI } from "@google/generative-ai";
import { CVData, PersonalInfo, LocalizedContent, EducationItem, ExperienceItem } from "../types";

// Função utilitária para converter arquivo em base64 para o Gemini
export const fileToGenerativePart = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result.includes(',')) reject(new Error("Erro ao ler arquivo"));
      const base64 = result.split(',')[1];
      resolve({
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * EXTRAÇÃO DE DADOS PESSOAIS (OCR)
 */
export const extractPersonalData = async (files: File[]): Promise<PersonalInfo> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chave Gemini não configurada (VITE_GEMINI_API_KEY)");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fileParts = await Promise.all(files.map(fileToGenerativePart));

  const prompt = "Analise as imagens do Bilhete de Identidade (BI). Extraia rigorosamente em JSON: fullName, address, nationality, idNumber, birthDate. Ignore campos de contacto se não estiverem no BI.";

  const result = await model.generateContent([prompt, ...fileParts]);
  const response = await result.response;
  const text = response.text();

  try {
    const data = JSON.parse(text);
    return {
      fullName: data.fullName || "",
      address: data.address || "",
      nationality: data.nationality || "Moçambicana",
      idNumber: data.idNumber || "",
      birthDate: data.birthDate || "",
      phone: "",
      email: ""
    };
  } catch (e) {
    console.error("Erro ao parsear JSON do Gemini:", e);
    return { fullName: "Nome não detectado", address: "", nationality: "", idNumber: "", birthDate: "", phone: "", email: "" };
  }
};

/**
 * EXTRAÇÃO DE DIPLOMAS/CERTIFICADOS
 */
export const extractDocumentsData = async (files: File[]): Promise<{ education: EducationItem[], experience: ExperienceItem[] }> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chave Gemini não configurada");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fileParts = await Promise.all(files.map(fileToGenerativePart));

  const prompt = "Extraia informações de educação e experiência profissional destes certificados e documentos. Retorne JSON com education (array) e experience (array).";

  const result = await model.generateContent([prompt, ...fileParts]);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Erro ao parsear documentos:", e);
    return { education: [], experience: [] };
  }
};

/**
 * GERAÇÃO DE CV COMPLETO (BI-LINGUE)
 */
export const generateFullCV = async (
  personal: PersonalInfo, 
  certs: EducationItem[], 
  manualEd: EducationItem[],
  manualExp: ExperienceItem[]
): Promise<{ pt: LocalizedContent, en: LocalizedContent }> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chave Gemini não configurada");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const education = [...certs, ...manualEd];
  const experience = manualExp;

  const prompt = `Atue como Especialista em Recrutamento de Elite. Gere currículo bilingue (PT e EN) de alto impacto.
  Dados: ${JSON.stringify({ personal, education, experience })}
  Retorne JSON com pt e en (objective, skills array, education array, experience array com description impactante).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Erro ao gerar CV:", e);
    return { pt: {}, en: {} };
  }
};

/**
 * GERAÇÃO DE CARTA DE APRESENTAÇÃO
 */
export const generateCoverLetter = async (cvData: CVData, companyName: string, position: string, lang: 'PT' | 'EN'): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chave Gemini não configurada");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Escreva uma carta de apresentação profissional para ${cvData.personal.fullName} dirigida à empresa ${companyName} para o cargo de ${position}. Idioma: ${lang === 'PT' ? 'Português formal' : 'English formal'}. Seja persuasivo, destaque conquistas e termine com chamada para entrevista. Máximo 400 palavras.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text() || "Erro ao gerar carta.";
};

/**
 * OPENAI (opcional - se quiser usar GPT-4)
 */
export const generateWithOpenAI = async (prompt: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("Chave OpenAI não configurada - usando Gemini como fallback");
    return "";
  }

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
    return data.choices[0].message.content || "";
  } catch (e) {
    console.error("Erro OpenAI:", e);
    return "";
  }
};