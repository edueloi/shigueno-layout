import { Router, Request, Response } from 'express';
import { getDb } from '../../server-db';
import { integrationAuthMiddleware } from '../middlewares/integration-auth.middleware';

const router = Router();

// All integration routes require API Key
router.use(integrationAuthMiddleware);

// GET /api/integration/me — info do cliente autenticado
router.get('/integration/me', (req: Request, res: Response) => {
  const client = (req as any).integrationClient;
  res.json({
    success: true,
    client: {
      id: client.id,
      name: client.name,
      created_at: client.created_at
    }
  });
});

// GET /api/integration/vacancies — listar vagas do cliente
router.get('/integration/vacancies', async (req: Request, res: Response) => {
  const client = (req as any).integrationClient;
  const db = await getDb();
  const vacancies = await db.getIntegrationVacancies(client.id);
  res.json({ success: true, data: vacancies });
});

// POST /api/integration/vacancies — criar ou sincronizar vaga
// Body: { external_id, title, department, description, location, requirements, status }
router.post('/integration/vacancies', async (req: Request, res: Response) => {
  const client = (req as any).integrationClient;
  const { external_id, title, department, description, location, requirements, status } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: 'O campo "title" é obrigatório.' });
  }

  const db = await getDb();
  const vacancy = await db.upsertIntegrationVacancy({
    client_id: client.id,
    external_id: external_id || null,
    title: String(title),
    department: String(department || ''),
    description: String(description || ''),
    location: String(location || ''),
    requirements: String(requirements || ''),
    status: String(status || 'Ativa')
  });

  res.status(201).json({ success: true, data: vacancy });
});

// GET /api/integration/candidates — listar candidatos do cliente
router.get('/integration/candidates', async (req: Request, res: Response) => {
  const client = (req as any).integrationClient;
  const db = await getDb();
  const candidates = await db.getIntegrationCandidates(client.id);
  res.json({ success: true, data: candidates });
});

// POST /api/integration/candidates — enviar candidato
// Body: { external_id, name, email, phone, vacancy_external_id?, cv_text, status? }
router.post('/integration/candidates', async (req: Request, res: Response) => {
  const client = (req as any).integrationClient;
  const { external_id, name, email, phone, vacancy_external_id, cv_text, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Os campos "name" e "email" são obrigatórios.' });
  }

  const db = await getDb();

  let vacancy_id: number | null = null;
  if (vacancy_external_id) {
    const vacancy = await db.getIntegrationVacancyByExternalId(client.id, String(vacancy_external_id));
    if (vacancy) vacancy_id = vacancy.id;
  }

  const candidate = await db.upsertIntegrationCandidate({
    client_id: client.id,
    external_id: external_id || null,
    name: String(name),
    email: String(email),
    phone: String(phone || ''),
    vacancy_id,
    cv_text: String(cv_text || ''),
    applied_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: String(status || 'Novo')
  });

  res.status(201).json({ success: true, data: candidate });
});

// PATCH /api/integration/candidates/:external_id/status — atualizar status
// Body: { status }
router.patch('/integration/candidates/:external_id/status', async (req: Request, res: Response) => {
  const client = (req as any).integrationClient;
  const { external_id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Novo', 'Em Análise', 'Aprovado', 'Recusado'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Status inválido. Use um dos: ${validStatuses.join(', ')}`
    });
  }

  const db = await getDb();
  const updated = await db.updateIntegrationCandidateStatus(client.id, external_id, status);

  if (!updated) {
    return res.status(404).json({ success: false, error: 'Candidato não encontrado.' });
  }

  res.json({ success: true, data: updated });
});

export default router;
