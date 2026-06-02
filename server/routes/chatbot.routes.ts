import { Router } from 'express';
import { getDb } from '../../server-db';
import { GoogleGenAI } from '@google/genai';

const router = Router();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('A chave de API do Gemini (GEMINI_API_KEY) não está configurada no painel de Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Public endpoint to chat with ShiguenoBot
router.post('/chatbot', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Lista de mensagens inválida.' });
    }

    const db = await getDb();
    
    // Fetch all current company site settings
    const settingsRows = await db.all('SELECT * FROM site_settings');
    const settings: Record<string, string> = {};
    settingsRows.forEach((row) => {
      settings[row.key] = row.value;
    });

    // Fetch currently active vacancies
    const vacancies = await db.all("SELECT * FROM vacancies WHERE status = ?", ['Ativa']);

    const motto = settings['company_motto'] || 'Uma empresa sempre preocupada com a qualidade de vida.';
    const aboutIntro = settings['about_text_intro'] || '';
    const aboutFull = settings['about_text_full'] || '';
    const aboutDiv = settings['about_diversification'] || '';
    const contactEmail = settings['contact_email'] || 'sac@shigueno.com.br';
    const contactPhone = settings['contact_phone'] || '(15) 3259-9710';

    // Format list of job vacancies
    const vacanciesList = vacancies && vacancies.length > 0
      ? vacancies.map((v: any) => `- ${v.title} (${v.department}) em ${v.location}. Requisitos: ${v.requirements}`).join('\n')
      : 'No momento, não temos vagas registradas abertas diretamente. Conquiste sua oportunidade enviando um currículo de candidatura espontânea pela seção Trabalhe Conosco!';

    // Build the custom contextual system instruction prompt
    const systemInstruction = `Você é o ShiguenoBot, o assistente virtual robótico e acolhedor de autoatendimento oficial do renomado Grupo Shigueno (líderes em Avicultura de Postura, Citricultura Sustentável, Cafeicultura de Altitude de Alta Produtividade e Agropecuária de Nelore).
Sua missão é interagir com visitantes, clientes, parceiros comerciais, produtores rurais e interessados em vagas de trabalho, ofertando repostas inteligentes, claras, prestativas e acolhedoras.

Use ESTAS INFORMAÇÕES OFICIAIS do banco de dados Shigueno para responder às perguntas:
- Lema da Empresa: "${motto}"
- Introdução / Origens: ${aboutIntro}
- Trajetória Histórica: Chegada do patriarca Sr. Haruo Shigueno ao Brasil em 1932. Em Mogi das Cruzes, aos 18 anos, ele foi pioneiro na importação de incubatórios e produção de pintinhos. Posteriormente transferiu a sede produtiva de São José dos Campos de volta para a região de Tatuí por volta de 1970, montando sua granja em maior escala.
  Detalhes oficiais: ${aboutFull}
- Integração Ecológica e Economia Circular (desde 1975): A Shigueno utiliza o esterco orgânico rico proveniente de suas aves de postura para fertilizar pomares de laranja (em Tatuí e Buri) e também plantações de café (em Itaí), obtendo uma fantástica produtividade e solo regenerativo.
  Detalhes de sustentabilidade: ${aboutDiv}
- Canais de Contato Direto:
  E-mail: ${contactEmail}
  Telefone / WhatsApp Comercial: ${contactPhone}

Oportunidades de Vagas de Emprego em Aberto hoje:
${vacanciesList}

Diretrizes da sua resposta:
1. Responda SEMPRE em português do Brasil de forma extremamente educada e acolhedora.
2. Mantenha os finais de respostas sempre curtos e convidativos. Responda em no máximo 2-3 parágrafos curtos. Utilize pontos de destaque em tópicos com Markdown caso queira listar coisas facilitando a leitura.
3. Se o assunto for relevante a vagas e recrutamento, indique como enviar currículo através da página "Trabalhe Conosco / Vagas" no menu superior e mencione as vagas ativas mostradas acima caso se encaixem no perfil citado.
4. Para dúvidas complexas, reclamações ou fechamento de negócios comerciais diretos (como compra de ovos, remessa de citros, parcerias de gado Nelore), informe de forma clara o WhatsApp comercial oficial da empresa (${contactPhone}) e encoraje o usuário a clicar no botão de contato direto no WhatsApp para falar com um atendente humano.
5. Não invente nenhuma informação e preserve intacta a verdade histórica da família Shigueno e seus fundadores.`;

    const ai = getAiClient();
    
    // Map and sanitize frontend chat formats to the Google Gen AI chat parts SDK expectation
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({
      success: true,
      reply: response.text || 'Desculpe, não consegui obter a resposta do meu módulo cognitivo. Por favor, tente novamente.'
    });

  } catch (error: any) {
    console.error('Erro na chamada do ShiguenoBot:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Falha ao processar inteligência do chatbot.'
    });
  }
});

export default router;
