import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

    const SYSTEM_PROMPT = `Você é um Consultor de Carreira de Elite. Seu objetivo é analisar a trajetória (experiências, educação, habilidades) extraída de um currículo e sugerir até 5 cargos ou vagas que fazem mais sentido para o perfil do candidato.
Pense em caminhos diretos (ex: desenvolvedor, suporte técnico) e caminhos alternativos/híbridos que o candidato pode não ter pensado, mas para os quais possui as habilidades necessárias.
Retorne APENAS um objeto JSON com a propriedade "roles" contendo um array de strings.
Exemplo:
{
  "roles": ["Desenvolvedor Front-End", "Analista de Suporte de TI", "Professor de Informática", "Especialista em Redes"]
}`;

    const prompt = `${SYSTEM_PROMPT}\n\nTexto do currículo:\n\nExperiência como professor de geografia e técnico de TI.`;

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    console.log('Response:', result.response.text());
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
