// lib/gemini.ts
// Tipos e funções para comunicar com o Gemini via API route

export interface Experiencia {
  cargo: string;
  empresa: string;
  periodo: string;
  descricao: string;
}

export interface Educacao {
  curso: string;
  instituicao: string;
  periodo: string;
}

export interface Idioma {
  idioma: string;
  nivel: string;
}

export interface OptimizedResume {
  nome: string;
  cargo: string;
  contato: {
    email?: string;
    telefone?: string;
    linkedin?: string;
    cidade?: string;
  };
  resumoProfissional: string;
  experiencias: Experiencia[];
  educacao: Educacao[];
  habilidades: string[];
  idiomas: Idioma[];
  certificacoes: string[];
  melhorias: string[]; // lista das melhorias aplicadas para exibir no UI
}

export async function analyzeRoles(resumeText: string): Promise<string[]> {
  const response = await fetch('/api/analyze-roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeText }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Falha ao analisar as vagas sugeridas pela IA.');
  }

  const data = await response.json();
  return data.roles;
}

export async function optimizeResume(resumeText: string, targetRole?: string): Promise<OptimizedResume> {
  const response = await fetch('/api/optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeText, targetRole }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  return data.resume as OptimizedResume;
}
