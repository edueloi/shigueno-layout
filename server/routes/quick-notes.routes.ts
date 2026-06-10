import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

// Garante que a tabela existe (chamada no startup do server)
export async function ensureQuickNotesTable() {
  const db = await getDb();
  await db.run(`
    CREATE TABLE IF NOT EXISTS quick_notes (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      content    TEXT NOT NULL,
      color      VARCHAR(20) DEFAULT 'amber',
      is_done    TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_quick_notes_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

// GET /api/quick-notes?userId=N → notas do usuário (pendentes primeiro, mais recentes no topo)
router.get('/quick-notes', async (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ success: false, error: 'userId obrigatório.' });
  try {
    const db = await getDb();
    const notes = await db.all(
      'SELECT * FROM quick_notes WHERE user_id = ? ORDER BY is_done ASC, created_at DESC LIMIT 30',
      [userId]
    );
    res.json({ success: true, notes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/quick-notes → body: { userId, content, color }
router.post('/quick-notes', async (req, res) => {
  const { userId, content, color } = req.body;
  if (!userId || !content?.trim()) return res.status(400).json({ success: false, error: 'userId e content obrigatórios.' });
  try {
    const db = await getDb();
    const r = await db.run(
      'INSERT INTO quick_notes (user_id, content, color) VALUES (?, ?, ?)',
      [userId, content.trim(), color || 'amber']
    );
    res.json({ success: true, id: r.lastID });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/quick-notes/:id → body: { content?, color?, is_done? }
router.put('/quick-notes/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { content, color, is_done } = req.body;
  try {
    const db = await getDb();
    const sets: string[] = [];
    const params: any[] = [];
    if (content !== undefined) { sets.push('content = ?'); params.push(content); }
    if (color !== undefined)   { sets.push('color = ?');   params.push(color); }
    if (is_done !== undefined) { sets.push('is_done = ?'); params.push(is_done ? 1 : 0); }
    if (!sets.length) return res.status(400).json({ success: false, error: 'Nada para atualizar.' });
    params.push(id);
    await db.run(`UPDATE quick_notes SET ${sets.join(', ')} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/quick-notes/:id
router.delete('/quick-notes/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM quick_notes WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
