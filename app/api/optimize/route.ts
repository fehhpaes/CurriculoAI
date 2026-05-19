import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `Você é um especialista sênior em Recursos Humanos, com mais de 15 anos de experiência em recrutamento e seleção nas maiores empresas do Brasil. Você também é especialista em otimização de currículos para sistemas ATS (Applicant Tracking Systems).

Seu trabalho é analisar o texto extraído de um currículo e devolver uma versão completamente otimizada em formato JSON estruturado.

DIRETRIZES DE OTIMIZAÇÃO:
1. **Resumo Profissional**: Crie um resumo impactante de 3-4 frases que destaque os pontos fortes, anos de experiência e valor agregado. Use linguagem assertiva.
2. **Experiências**: Reescreva as descrições focando em RESULTADOS e IMPACTO com verbos de ação no passado (implementou, liderou, aumentou, reduziu). Adicione métricas quando possível ou inferíveis.
3. **Habilidades**: Organize e expanda as habilidades técnicas com palavras-chave relevantes para ATS. Inclua ferramentas, tecnologias e soft skills estratégicos.
4. **Linguagem**: Use linguagem profissional, objetiva e assertiva. Elimine clichês como "profissional proativo" e "trabalho em equipe" genéricos.
5. **Estrutura**: Organize tudo de forma lógica e profissional. Seja conciso e direto.
6. **REGRAS DE OURO (ANTI-ALUCINAÇÃO DE DATAS E FATOS)**: NUNCA invente, calcule ou presuma datas (início, fim, formaturas). Extraia meses e anos EXATAMENTE como aparecem no texto original. Se constar apenas "cursando o 4º semestre", não tente adivinhar as datas, deixe o período vazio ou copie exatamente como escrito. Não crie empresas, cursos ou competências que não estejam explícitas.

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional, sem markdown, sem \`\`\`. O JSON deve seguir exatamente esta estrutura:
{
  "nome": "Nome completo",
  "cargo": "Cargo/Título profissional (inferido ou existente)",
  "contato": {
    "email": "email se encontrado",
    "telefone": "telefone se encontrado",
    "linkedin": "linkedin se encontrado",
    "cidade": "cidade/estado se encontrado"
  },
  "resumoProfissional": "Resumo otimizado de 3-4 frases impactantes",
  "experiencias": [
    {
      "cargo": "Cargo",
      "empresa": "Empresa",
      "periodo": "Mês/Ano - Mês/Ano ou Atual (EXTRAÍDO EXATAMENTE DO ORIGINAL)",
      "descricao": "Descrição otimizada com resultados e verbos de ação"
    }
  ],
  "educacao": [
    {
      "curso": "Nome do curso/grau",
      "instituicao": "Nome da instituição",
      "periodo": "Ano de conclusão ou período (EXTRAÍDO EXATAMENTE DO ORIGINAL, SEM INVENTAR)"
    }
  ],
  "habilidades": ["Habilidade 1", "Habilidade 2", "(Máximo de 12 habilidades)"],
  "idiomas": [
    { "idioma": "Nome do idioma", "nivel": "Nível" }
  ],
  "certificacoes": ["Certificação 1", "(Máximo 5)"],
  "melhorias": [
    "Exemplo: Resumo profissional reescrito com foco em resultados",
    "Liste no máximo 5 melhorias específicas"
  ]
}`;

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
    const { resumeText, targetRole } = await request.json();

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

    let userMessage = '';
    if (targetRole && targetRole.trim() !== '') {
      userMessage += `INSTRUÇÃO CRÍTICA: O usuário deseja se candidatar especificamente para a vaga de "${targetRole}". Adapte fortemente o Resumo Profissional, realce as Experiências mais relevantes e priorize as Habilidades que tenham relação direta com essa vaga.\n\n`;
    }
    userMessage += `Texto do currículo a ser otimizado:\n\n${resumeText}`;

    let lastError: string = 'Erro desconhecido';

    // Tenta cada modelo em sequência até um funcionar
    for (const model of MODELS) {
      try {
        console.log(`[optimize] Tentando modelo: ${model}`);

        const completion = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 8192,
        });

        const responseText = completion.choices[0]?.message?.content?.trim() ?? '';
        const match = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = match ? match[0] : responseText;

        const resume = JSON.parse(cleanJson);
        console.log(`[optimize] Sucesso com modelo: ${model}`);
        return NextResponse.json({ resume, model });

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        console.warn(`[optimize] Modelo ${model} falhou: ${msg}`);

        // Se não for erro de rate limit, provider, 404, 400 ou JSON quebrado, não tenta o próximo
        const isTransientError = msg.includes('429') || msg.includes('404') || msg.includes('400') || msg.includes('rate') || msg.includes('Provider') || msg.includes('JSON') || msg.includes('Unterminated') || msg.includes('Unexpected token');
        if (!isTransientError) break;
      }
    }

    return NextResponse.json({ error: `Todos os modelos falharam. Último erro: ${lastError}` }, { status: 500 });

  } catch (error: unknown) {
    console.error('Optimize API error:', error);
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
