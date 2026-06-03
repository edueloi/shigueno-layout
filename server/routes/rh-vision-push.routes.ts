// Rota que recebe vagas publicadas pelo RH Vision → publica no portal Shigueno
import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

const WEBHOOK_SECRET = process.env.SHIGUENO_WEBHOOK_SECRET || 'shigueno-webhook-2026';

// POST /api/rh-vision/push-vacancy — RH Vision empurra vaga ativa para o portal
router.post('/rh-vision/push-vacancy', async (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Webhook secret inválido.' });
  }

  const { action, job } = req.body;

  if (!job?.title) {
    return res.status(400).json({ error: 'Campo "job.title" é obrigatório.' });
  }

  try {
    const db = await getDb();

    if (action === 'delete' && job.rh_vision_id) {
      // Remove vaga do portal pelo rh_vision_id armazenado em requirements
      const all = await db.all('SELECT * FROM vacancies');
      const match = (all as any[]).find((v: any) => v.requirements?.includes(`rh_vision_id:${job.rh_vision_id}`));
      if (match) {
        await db.run('DELETE FROM vacancies WHERE id = ?', [match.id]);
        return res.json({ success: true, action: 'deleted' });
      }
      return res.json({ success: true, action: 'not_found' });
    }

    // Monta a localização a partir de city + state
    const location = job.state ? `${job.city || 'Tatuí'} - ${job.state}` : (job.city || 'Tatuí - SP');

    // Marcador para rastrear origem
    const requirements = [
      job.mandatory_requirements || job.requirements || '',
      `rh_vision_id:${job.rh_vision_id}`
    ].filter(Boolean).join('\n');

    // Verifica se já existe pelo rh_vision_id
    const all = await db.all('SELECT * FROM vacancies');
    const existing = (all as any[]).find((v: any) => v.requirements?.includes(`rh_vision_id:${job.rh_vision_id}`));

    if (existing) {
      await db.run(
        'UPDATE vacancies SET title = ?, department = ?, description = ?, location = ?, requirements = ?, status = ? WHERE id = ?',
        [job.title, job.department || '', job.description || '', location, requirements, mapStatus(job.status), existing.id]
      );
      return res.json({ success: true, action: 'updated', id: existing.id });
    }

    const result = await db.run(
      'INSERT INTO vacancies (title, department, description, location, requirements, status) VALUES (?, ?, ?, ?, ?, ?)',
      [job.title, job.department || '', job.description || '', location, requirements, mapStatus(job.status)]
    );

    return res.status(201).json({ success: true, action: 'created', id: result.lastID });
  } catch (error: any) {
    console.error('[RH Vision Push] Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rh-vision/sync-status — status da integração
router.get('/rh-vision/sync-status', async (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Webhook secret inválido.' });
  }

  const db = await getDb();
  const all = await db.all('SELECT * FROM vacancies');
  const synced = (all as any[]).filter((v: any) => v.requirements?.includes('rh_vision_id:'));

  res.json({
    total_vacancies: all.length,
    synced_from_rh_vision: synced.length,
    synced_to_rh_vision: (all as any[]).length - synced.length
  });
});

function mapStatus(status: string | undefined): string {
  if (!status) return 'Ativa';
  return status === 'Aberta' ? 'Ativa' : status === 'Pausada' ? 'Pausada' : 'Ativa';
}

export default router;
