import { Router, Request, Response } from 'express';
import { getDb } from '../../server-db';
import crypto from 'crypto';

const router = Router();

// GET /api/admin/integration/clients — listar clientes cadastrados
router.get('/admin/integration/clients', async (_req: Request, res: Response) => {
  const db = await getDb();
  const clients = await db.listIntegrationClients();
  // Never expose the api_key in listing — show only last 6 chars
  const safe = clients.map(c => ({
    ...c,
    api_key: `****${c.api_key.slice(-6)}`
  }));
  res.json({ success: true, data: safe });
});

// POST /api/admin/integration/clients — criar novo cliente
// Body: { name }
router.post('/admin/integration/clients', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'O campo "name" é obrigatório.' });
  }

  const api_key = `shg_${crypto.randomBytes(24).toString('hex')}`;

  const db = await getDb();
  const client = await db.createIntegrationClient({ name: String(name), api_key });

  // Return full api_key ONCE at creation
  res.status(201).json({
    success: true,
    message: 'Cliente criado. Guarde a api_key com segurança — ela não será exibida novamente.',
    data: client
  });
});

// PATCH /api/admin/integration/clients/:id/toggle — ativar/desativar cliente
// Body: { active: true | false }
router.patch('/admin/integration/clients/:id/toggle', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { active } = req.body;

  if (typeof active !== 'boolean') {
    return res.status(400).json({ success: false, error: 'O campo "active" deve ser true ou false.' });
  }

  const db = await getDb();
  const ok = await db.toggleIntegrationClient(id, active);

  if (!ok) {
    return res.status(404).json({ success: false, error: 'Cliente não encontrado.' });
  }

  res.json({ success: true, message: `Cliente ${active ? 'ativado' : 'desativado'} com sucesso.` });
});

export default router;
