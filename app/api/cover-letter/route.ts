import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { cvData, companyName, targetPosition, language } = await req.json();

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'API key não configurada no servidor' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Você é um especialista em recrutamento e redação de cartas de apresentação profissionais.

Escreva uma carta de apresentação completa, profissional e persuasiva em ${
      language === 'PT' ? 'português brasileiro' : 'inglês'
    }, com tom formal e entusiástico.

Dados do candidato:
${JSON.stringify(cvData, null, 2)}

A carta deve ser direcionada para a empresa "${companyName}" e para o cargo "${targetPosition}".

Estrutura obrigatória:
- Saudação profissional
- Parágrafo de introdução (quem é o candidato e o cargo desejado)
- 2 ou 3 parágrafos destacando experiências, habilidades e conquistas relevantes
- Parágrafo final com chamada para ação (disponibilidade para entrevista)
- Encerramento formal

Use linguagem natural, evite repetições e torne a carta única e impactante.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error('Erro no Gemini:', err);
    return NextResponse.json(
      { error: 'Erro ao gerar carta com IA', details: err.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';