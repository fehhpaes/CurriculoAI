import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Analise o currículo e sugira 5 cargos/vagas ideais para o candidato.
Retorne APENAS um JSON: { "roles": ["Vaga 1", "Vaga 2", "Vaga 3", "Vaga 4", "Vaga 5"] }`;

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Texto do currículo muito curto ou vazio. Verifique o PDF enviado.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API Gemini não configurada.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    // Truncate text to avoid context overflow for simple role analysis
    const truncatedText = resumeText.substring(0, 6000);

    const prompt = `${SYSTEM_PROMPT}\n\nTexto do currículo (amostra):\n\n${truncatedText}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Tenta encontrar um bloco JSON dentro da resposta
    const match = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = match ? match[0] : responseText;

    let data;
    try {
      data = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('JSON parse error details:', parseErr);
      console.error('Raw response:', responseText);
      return NextResponse.json(
        { error: `Erro de JSON: ${parseErr instanceof Error ? parseErr.message : 'desconhecido'}. Resposta RAW: ${responseText.substring(0, 100)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ roles: data.roles || [] });
  } catch (error: unknown) {
    console.error('Analyze Roles API error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Erro na API Gemini: ${message}` }, { status: 500 });
  }
}
