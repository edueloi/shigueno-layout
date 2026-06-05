import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

// GET all boards with card counts
router.get('/boards', async (req, res) => {
  try {
    const db = await getDb();
    const boards = await db.all('SELECT * FROM boards ORDER BY created_at DESC');
    // Attach card count to each board
    const withCounts = await Promise.all(boards.map(async (b: any) => {
      const [row] = await db.all(
        'SELECT COUNT(*) as total, SUM(completed_at IS NOT NULL) as done FROM activities WHERE board_id = ?',
        [b.id]
      ) as any[];
      return { ...b, total_cards: row?.total || 0, done_cards: row?.done || 0 };
    }));
    res.json({ success: true, boards: withCounts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single board
router.get('/boards/:id', async (req, res) => {
  try {
    const db = await getDb();
    const board = await db.get('SELECT * FROM boards WHERE id = ?', [Number(req.params.id)]);
    if (!board) return res.status(404).json({ success: false, error: 'Quadro não encontrado.' });
    res.json({ success: true, board });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create board (admin only — enforced on frontend)
router.post('/boards', async (req, res) => {
  try {
    const { name, description, color, icon, columns, created_by } = req.body;
    if (!name || !columns?.length) {
      return res.status(400).json({ success: false, error: 'Nome e colunas são obrigatórios.' });
    }
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO boards (name, description, color, icon, columns_json, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', color || 'emerald', icon || 'layout-grid', JSON.stringify(columns), created_by || null]
    );
    res.json({ success: true, id: result.lastID, message: 'Quadro criado.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update board
router.put('/boards/:id', async (req, res) => {
  try {
    const { name, description, color, icon, columns } = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE boards SET name=?, description=?, color=?, icon=?, columns_json=? WHERE id=?',
      [name, description || '', color || 'emerald', icon || 'layout-grid', JSON.stringify(columns), Number(req.params.id)]
    );
    res.json({ success: true, message: 'Quadro atualizado.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE board (also deletes its activities)
router.delete('/boards/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM activities WHERE board_id = ?', [Number(req.params.id)]);
    await db.run('DELETE FROM boards WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: 'Quadro e seus cards excluídos.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
