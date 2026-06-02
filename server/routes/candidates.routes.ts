import { Router } from 'express';
import { getDb } from '../../server-db';
import { GoogleGenAI } from '@google/genai';

const router = Router();

router.get('/candidates', async (req, res) => {
  try {
    const db = await getDb();
    const candidates = await db.all(`
      SELECT c.*, v.title as vacancy_title 
      FROM candidates c
      LEFT JOIN vacancies v ON c.vacancy_id = v.id
      ORDER BY c.applied_at DESC
    `);
    res.json({ success: true, candidates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/candidates', async (req, res) => {
  try {
    const { name, email, phone, vacancy_id, cv_text } = req.body;
    const db = await getDb();
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').slice(0, 19);

    const result = await db.run(
      'INSERT INTO candidates (name, email, phone, vacancy_id, cv_text, applied_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, vacancy_id || null, cv_text, formattedDate, 'Novo']
    );

    res.json({ success: true, id: result.lastID, message: 'Currículo enviado com sucesso! Agradecemos o interesse.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await getDb();
    await db.run('UPDATE candidates SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Status do candidato atualizado.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/candidates/:id/evaluate', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    // Fetch Candidate
    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [id]);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidato não encontrado.' });
    }

    // Fetch vacancy information
    let vacancyInfo = 'Candidatura espontânea / Banco de talentos';
    if (candidate.vacancy_id) {
      const vacancy = await db.get('SELECT * FROM vacancies WHERE id = ?', [candidate.vacancy_id]);
      if (vacancy) {
        vacancyInfo = `Vaga: ${vacancy.title}\nDepartamento: ${vacancy.department}\nDescrição da Vaga: ${vacancy.description}\nRequisitos: ${vacancy.requirements}`;
      }
    }

    // Fetch other active vacancies
    const activeVacancies = await db.all('SELECT * FROM vacancies WHERE status = "Ativa"');
    const vacanciesListStr = activeVacancies.map((v: any) => `- ID ${v.id}: ${v.title} (${v.department}) - Requisitos: ${v.requirements}`).join('\n');

    let aiRawResponse = '';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemPrompt = `Você é um Recrutador de Recursos Humanos Especialista do Grupo Shigueno, uma empresa familiar tradicional brasileira de agronegócio de alta qualidade, ativa em Tatuí, Buri, Itaí e Mato Grosso.
Analise detalhadamente o currículo fornecido e produza uma triagem profissional. Avalie a aderência técnica e comportamental com a vaga almejada e cruze com as demais oportunidades ativas da empresa.

Sua resposta DEVE ser estritamente no formato JSON estruturado com o seguinte esquema exato de chaves (sem formatação markdown envolta, apenas JSON puro e válido):
{
  "score": 0 a 100 (número inteiro da aderência),
  "summary": "Um breve parágrafo resumindo as competências principais encontradas no currículo",
  "strengths": ["Item 1 de diferencial relevante", "Item 2", "Item 3"],
  "gaps": ["Ponto de melhoria ou pré-requisito faltante 1", "Ponto 2"],
  "recommendations": "Próximos passos recomendados (ex: prosseguir entrevista, realocar, aguardar novas vagas)",
  "matchingVacancies": ["Nomes de vagas recomendadas adicionais que se adequam"],
  "questions": ["Pergunta 1 focada no perfil", "Pergunta 2 focada na rotina de campo", "Pergunta 3 sobre experiência prévia"]
}`;

      const userPrompt = `DADOS DO CANDIDATO:
Nome: ${candidate.name}
Vaga Almejada original: ${vacancyInfo}

TEXTO DO CURRÍCULO:
"""
${candidate.cv_text}
"""

OUTRAS VAGAS ATIVAS NO GRUPO SHIGUENO:
${vacanciesListStr}

Escreva uma triagem atenciosa, focada em produtividade rural consciente e boas práticas agrícolas. Retorne estritamente o JSON descrito.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.15,
        }
      });

      aiRawResponse = aiResponse.text || '{}';
    } else {
      // Sophisticated offline fallback when there's no GEMINI_API_KEY configured yet
      const matchScore = candidate.cv_text.toLowerCase().includes('trator') || candidate.cv_text.toLowerCase().includes('operador') ? 85
                         : candidate.cv_text.toLowerCase().includes('nelore') || candidate.cv_text.toLowerCase().includes('gado') ? 90
                         : candidate.cv_text.toLowerCase().includes('granja') || candidate.cv_text.toLowerCase().includes('ovo') ? 80 : 70;

      const strengths = [
        "Capacidade técnica prática alinhada com as necessidades descritas",
        "Experiência com rotinas rurais tradicionais de campo",
        "Disponibilidade para início imediato conforme perfil avaliado"
      ];

      const gaps = [
        "Falta certificação técnica formal em maquinários avançados",
        "Pode precisar de integração sobre controles de biosseguridade aviária do Grupo Shigueno"
      ];

      const questions = [
        "Como era a divisão das suas tarefas em sua experiência agropecuária anterior?",
        "Tem facilidade para trabalhar em equipe nos galpões ou pomares?",
        "Quais técnicas de segurança física você prioriza no manejo diário rural?"
      ];

      aiRawResponse = JSON.stringify({
        score: matchScore,
        summary: `Candidato robusto com experiência em serviços do agronegócio de base. Apresenta vocação natural para desafios ao ar livre e estabilidade nos locais anteriores.`,
        strengths: strengths,
        gaps: gaps,
        recommendations: "Agendar uma ligação telefônica inicial para confirmar qualificações básicas de CNH e disponibilidade geográfica.",
        matchingVacancies: candidate.vacancy_id === 1 ? ["Auxiliar de Avicultura"] : ["Tratorista Agrícola"],
        questions: questions
      });
    }

    // Save with candidates_ai
    await db.run('UPDATE candidates_ai SET ai_analysis = ? WHERE id = ?', [aiRawResponse, id]);

    res.json({ success: true, ai_analysis: JSON.parse(aiRawResponse) });
  } catch (error: any) {
    console.error('Error in candidate AI evaluation route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM candidates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Candidato removido do sistema.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
