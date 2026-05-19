import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `Analise o currículo e sugira 5 cargos/vagas ideais para o candidato.
Retorne APENAS um JSON válido: { "roles": ["Vaga 1", "Vaga 2", "Vaga 3", "Vaga 4", "Vaga 5"] }`;

// Modelos em ordem de preferência — fallback automático se o primeiro falhar
const MODELS = [
  'google/gemini-2.0-pro-exp-02-05:free',
  'deepseek/deepseek-v4-flash:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
];

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Texto do currículo muito curto ou vazio. Verifique o PDF enviado.' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'Chave da API não configurada. Crie o arquivo .env.local com OPENROUTER_API_KEY.' },
        { status: 500 }
      );
    }

    const truncatedText = resumeText.substring(0, 6000);
    let lastError: string = 'Erro desconhecido';

    // Tenta cada modelo em sequência até um funcionar
    for (const model of MODELS) {
      try {
        console.log(`[analyze-roles] Tentando modelo: ${model}`);

        const completion = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Texto do currículo (amostra):\n\n${truncatedText}` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 512,
        });

        const responseText = completion.choices[0]?.message?.content?.trim() ?? '';
        const match = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = match ? match[0] : responseText;

        const data = JSON.parse(cleanJson);
        console.log(`[analyze-roles] Sucesso com modelo: ${model}`);
        return NextResponse.json({ roles: data.roles || [], model });

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        console.warn(`[analyze-roles] Modelo ${model} falhou: ${msg}`);

        // Se não for erro de rate limit, provider, 404, 400 ou JSON quebrado, não tenta o próximo
        const isTransientError = msg.includes('429') || msg.includes('404') || msg.includes('400') || msg.includes('rate') || msg.includes('Provider') || msg.includes('JSON') || msg.includes('Unterminated') || msg.includes('Unexpected token');
        if (!isTransientError) break;
      }
    }

    return NextResponse.json({ error: `Todos os modelos falharam. Último erro: ${lastError}` }, { status: 500 });

  } catch (error: unknown) {
    console.error('Analyze Roles API error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Erro na API: ${message}` }, { status: 500 });
  }
}
