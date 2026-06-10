import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from '../../server-db';
import { GoogleGenAI } from '@google/genai';
import { syncCandidateToRhVision } from '../services/rh-vision-sync';

const router = Router();

// ── Upload de CV (PDF / DOC / DOCX — máx 10 MB) ──────────────────────────────
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'cv');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Formato inválido. Use PDF, DOC ou DOCX.'));
  }
});

// GET /api/candidates — listar todos
router.get('/candidates', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const candidates = await db.all(`
      SELECT c.*,
             v.title as vacancy_title
      FROM candidates c
      LEFT JOIN vacancies v ON c.vacancy_id = v.id
      ORDER BY c.applied_at DESC
    `);
    res.json({ success: true, candidates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/candidates — candidatura com upload opcional de arquivo
router.post('/candidates', upload.single('cv_file'), async (req: Request, res: Response) => {
  try {
    const { name, email, phone, vacancy_id, cv_text } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Nome e e-mail são obrigatórios.' });
    }

    const db = await getDb();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const cvFilePath = req.file ? req.file.path : null;
    const cvFilename = req.file ? req.file.originalname : null;

    const result = await db.run(
      'INSERT INTO candidates (name, email, phone, vacancy_id, cv_text, cv_file_path, cv_filename, applied_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, vacancy_id ? Number(vacancy_id) : null, cv_text || null, cvFilePath, cvFilename, now, 'Novo']
    );

    // Sync para o RH Vision
    syncCandidateToRhVision({ name, email, phone: phone || '', cv_text: cv_text || '' }, vacancy_id || null);

    res.json({ success: true, id: result.lastID, message: 'Currículo enviado com sucesso! Agradecemos o interesse.' });
  } catch (error: any) {
    console.error('[POST /api/candidates] erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/candidates/:id/cv — download do arquivo de CV
router.get('/candidates/:id/cv', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const candidate = await db.get('SELECT cv_file_path, cv_filename FROM candidates WHERE id = ?', [req.params.id]) as any;
    if (!candidate?.cv_file_path) {
      return res.status(404).json({ success: false, error: 'Arquivo não encontrado.' });
    }
    if (!fs.existsSync(candidate.cv_file_path)) {
      return res.status(404).json({ success: false, error: 'Arquivo removido do servidor.' });
    }
    res.download(candidate.cv_file_path, candidate.cv_filename || 'curriculo.pdf');
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/candidates/:id — atualizar status
router.put('/candidates/:id', async (req: Request, res: Response) => {
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

// POST /api/candidates/:id/evaluate — avaliação IA Gemini
router.post('/candidates/:id/evaluate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [id]) as any;
    if (!candidate) return res.status(404).json({ success: false, error: 'Candidato não encontrado.' });

    let vacancyInfo = 'Candidatura espontânea / Banco de talentos';
    if (candidate.vacancy_id) {
      const vacancy = await db.get('SELECT * FROM vacancies WHERE id = ?', [candidate.vacancy_id]) as any;
      if (vacancy) {
        vacancyInfo = `Vaga: ${vacancy.title}\nDepartamento: ${vacancy.department}\nDescrição: ${vacancy.description}\nRequisitos: ${vacancy.requirements}`;
      }
    }

    const activeVacancies = await db.all("SELECT * FROM vacancies WHERE status = 'Ativa'");
    const vacanciesListStr = activeVacancies.map((v: any) => `- ID ${v.id}: ${v.title} (${v.department})`).join('\n');

    let aiRawResponse = '';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `CANDIDATO: ${candidate.name}\nVAGA: ${vacancyInfo}\nCURRÍCULO:\n${candidate.cv_text}\n\nVAGAS ATIVAS:\n${vacanciesListStr}`,
        config: {
          systemInstruction: 'Você é recrutador do Grupo Shigueno. Analise o currículo e retorne JSON puro com: score (0-100), summary, strengths (array), gaps (array), recommendations, matchingVacancies (array), questions (array).',
          responseMimeType: 'application/json',
          temperature: 0.15,
        }
      });
      aiRawResponse = aiResponse.text || '{}';
    } else {
      aiRawResponse = JSON.stringify({
        score: 70, summary: 'Avaliação offline — configure GEMINI_API_KEY para análise IA completa.',
        strengths: ['Experiência rural'], gaps: ['Certificações formais'],
        recommendations: 'Agendar entrevista para verificar qualificações.',
        matchingVacancies: [], questions: ['Qual sua experiência com maquinário agrícola?']
      });
    }

    await db.run('UPDATE candidates SET ai_analysis = ? WHERE id = ?', [aiRawResponse, id]);
    res.json({ success: true, ai_analysis: JSON.parse(aiRawResponse) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/candidates/:id
router.delete('/candidates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const candidate = await db.get('SELECT cv_file_path FROM candidates WHERE id = ?', [id]) as any;
    if (candidate?.cv_file_path && fs.existsSync(candidate.cv_file_path)) {
      fs.unlinkSync(candidate.cv_file_path);
    }
    await db.run('DELETE FROM candidates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Candidato removido do sistema.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
