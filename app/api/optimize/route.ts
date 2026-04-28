import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Você é um especialista sênior em Recursos Humanos, com mais de 15 anos de experiência em recrutamento e seleção nas maiores empresas do Brasil. Você também é especialista em otimização de currículos para sistemas ATS (Applicant Tracking Systems).

Seu trabalho é analisar o texto extraído de um currículo e devolver uma versão completamente otimizada em formato JSON estruturado.

DIRETRIZES DE OTIMIZAÇÃO:
1. **Resumo Profissional**: Crie um resumo impactante de 3-4 frases que destaque os pontos fortes, anos de experiência e valor agregado. Use linguagem assertiva.
2. **Experiências**: Reescreva as descrições focando em RESULTADOS e IMPACTO com verbos de ação no passado (implementou, liderou, aumentou, reduziu). Adicione métricas quando possível ou inferíveis.
3. **Habilidades**: Organize e expanda as habilidades técnicas com palavras-chave relevantes para ATS. Inclua ferramentas, tecnologias e soft skills estratégicos.
4. **Linguagem**: Use linguagem profissional, objetiva e assertiva. Elimine clichês como "profissional proativo" e "trabalho em equipe" genéricos.
5. **Estrutura**: Organize tudo de forma lógica e profissional. Seja conciso e direto.
6. **REGRAS DE OURO (ANTI-ALUCINAÇÃO DE DATAS E FATOS)**: NUNCA invente, calcule ou presuma datas (início, fim, formaturas). Extraia meses e anos EXATAMENTE como aparecem no texto original. Se constar apenas "cursando o 4º semestre", não tente adivinhar as datas, deixe o período vazio ou copie exatamente como escrito. Não crie empresas, cursos ou competências que não estejam explícitas.

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional, sem markdown, sem \`\`\`. O JSON deve seguir exatamente esta estrutura:
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

export async function POST(request: NextRequest) {
  try {
    const { resumeText, targetRole } = await request.json();

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Texto do currículo muito curto ou vazio. Verifique o PDF enviado.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API Gemini não configurada. Crie o arquivo .env.local com GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    let prompt = `${SYSTEM_PROMPT}\n\n`;
    if (targetRole && targetRole.trim() !== '') {
      prompt += `INSTRUÇÃO CRÍTICA: O usuário deseja se candidatar especificamente para a vaga de "${targetRole}". Adapte fortemente o Resumo Profissional, realce as Experiências mais relevantes e priorize as Habilidades que tenham relação direta com essa vaga.\n\n`;
    }
    prompt += `Texto do currículo a ser otimizado:\n\n${resumeText}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Tenta encontrar um bloco JSON dentro da resposta
    const match = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = match ? match[0] : responseText;

    let resume;
    try {
      resume = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('JSON parse error details:', parseErr);
      console.error('Raw response that failed to parse:', responseText);
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA. O formato gerado foi inválido.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ resume });
  } catch (error: unknown) {
    console.error('Optimize API error:', error);
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
