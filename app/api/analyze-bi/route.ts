import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData();
    const frontImage = formData.get("front") as File | null;
    const backImage = formData.get("back") as File | null;

    if (!frontImage || !backImage) {
      return NextResponse.json(
        { error: "Faltam imagens da frente e/ou verso do BI" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key não configurada no servidor" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const frontBytes = Buffer.from(await frontImage.arrayBuffer());
    const backBytes = Buffer.from(await backImage.arrayBuffer());

    const prompt = `Analise estas imagens do Bilhete de Identidade (frente e verso) e extraia os dados em JSON válido.
Campos obrigatórios:
- nome_completo
- numero_bi
- data_nascimento
- data_validade
- local_emissao
- nacionalidade

Responda APENAS com o JSON válido, sem texto adicional, explicação ou markdown.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: frontImage.type || "image/jpeg",
          data: frontBytes.toString("base64"),
        },
      },
      {
        inlineData: {
          mimeType: backImage.type || "image/jpeg",
          data: backBytes.toString("base64"),
        },
      },
    ]);

    const text = result.response.text().trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.warn("JSON inválido retornado pela IA:", text);
      data = { raw_response: text };
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Erro no processamento Gemini:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar as imagens com a IA" },
      { status: 500 }
    );
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";