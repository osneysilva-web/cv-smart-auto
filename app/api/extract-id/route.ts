import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'API key não configurada' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imageParts = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: file.type || 'image/jpeg',
          },
        };
      })
    );

    const prompt = `Você é um especialista em extração de dados de documentos de identidade (BI, RG, CNH, etc.).
Analise as imagens fornecidas (frente e/ou verso) e extraia os seguintes dados em formato JSON:

{
  "fullName": "Nome completo",
  "birthDate": "DD/MM/YYYY",
  "nationality": "Nacionalidade",
  "documentNumber": "Número do documento",
  "issueDate": "Data de emissão (se existir)",
  "expiryDate": "Data de validade (se existir)",
  "fatherName": "Nome do pai (se existir)",
  "motherName": "Nome da mãe (se existir)",
  "address": "Endereço (se existir)"
}

Retorne apenas o JSON válido, sem texto adicional.`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();

    // Remove qualquer texto extra e pega só o JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Não conseguiu extrair JSON válido');
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao extrair dados do BI:', error);
    return NextResponse.json({ error: 'Falha ao processar documento' }, { status: 500 });
  }
}