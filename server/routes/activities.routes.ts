import { Router } from 'express';
import { getDb } from '../../server-db';

// Normaliza qualquer formato de data para YYYY-MM-DD (ou null se vazio)
function toDateOnly(val: any): string | null {
  if (!val) return null;
  const s = String(val);
  if (s.includes('T')) return s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

const router = Router();

// GET all activities — ?history=1 retorna concluídos; ?userId=N filtra por visibilidade
router.get('/activities', async (req, res) => {
  try {
    const db = await getDb();
    const history = req.query.history === '1';
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const boardId = req.query.boardId ? Number(req.query.boardId) : null;

    let activities: any[];
    if (boardId) {
      activities = history
        ? await db.all('SELECT * FROM activities WHERE board_id = ? AND completed_at IS NOT NULL ORDER BY completed_at DESC', [boardId])
        : await db.all('SELECT * FROM activities WHERE board_id = ? AND completed_at IS NULL ORDER BY created_at DESC', [boardId]);
    } else {
      activities = history
        ? await db.all('SELECT * FROM activities WHERE completed_at IS NOT NULL ORDER BY completed_at DESC')
        : await db.all('SELECT * FROM activities WHERE completed_at IS NULL ORDER BY created_at DESC');
    }

    if (userId) {
      activities = activities.filter((a: any) => {
        if (a.visibility === 'public' || !a.visibility) return true;
        if (a.created_by === userId) return true;
        if (a.shared_with) {
          try {
            const sw = typeof a.shared_with === 'string' ? JSON.parse(a.shared_with) : a.shared_with;
            return Array.isArray(sw) && sw.includes(userId);
          } catch { return false; }
        }
        return false;
      });
    }

    res.json({ success: true, activities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new activity
router.post('/activities', async (req, res) => {
  try {
    const { title, description, category, sector, status, priority, responsible, due_date, created_by, created_by_name, visibility, shared_with, board_id, extra_data, board_type } = req.body;
    const db = await getDb();
    const sharedWithJson = shared_with ? JSON.stringify(shared_with) : null;
    const extraJson = extra_data ? JSON.stringify(extra_data) : null;
    const result = await db.run(
      'INSERT INTO activities (title, description, category, sector, status, priority, responsible, due_date, created_by, created_by_name, visibility, shared_with, board_id, extra_data, board_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', category || 'Ações', sector || '', status || 'A Fazer', priority || 'Média', responsible || '', toDateOnly(due_date), created_by || null, created_by_name || '', visibility || 'public', sharedWithJson, board_id || null, extraJson, board_type || null]
    );
    res.json({ success: true, id: result.lastID, message: 'Atividade salva com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update an activity
router.put('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, sector, status, priority, responsible, due_date, mark_completed, visibility, shared_with, board_id, extra_data, board_type } = req.body;
    const db = await getDb();
    const completedAt = mark_completed ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
    const sharedWithJson = shared_with ? JSON.stringify(shared_with) : null;
    const extraJson = extra_data ? JSON.stringify(extra_data) : null;
    if (mark_completed) {
      await db.run(
        'UPDATE activities SET title=?, description=?, category=?, sector=?, status=?, priority=?, responsible=?, due_date=?, completed_at=?, visibility=?, shared_with=?, board_id=?, extra_data=?, board_type=? WHERE id=?',
        [title, description || '', category, sector || '', status, priority, responsible || '', toDateOnly(due_date), completedAt, visibility || 'public', sharedWithJson, board_id ?? null, extraJson, board_type || null, Number(id)]
      );
    } else {
      await db.run(
        'UPDATE activities SET title=?, description=?, category=?, sector=?, status=?, priority=?, responsible=?, due_date=?, completed_at=NULL, visibility=?, shared_with=?, board_id=?, extra_data=?, board_type=? WHERE id=?',
        [title, description || '', category, sector || '', status, priority, responsible || '', toDateOnly(due_date), visibility || 'public', sharedWithJson, board_id ?? null, extraJson, board_type || null, Number(id)]
      );
    }
    res.json({ success: true, message: 'Atividade atualizada com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE an activity
router.delete('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM activities WHERE id = ?', [Number(id)]);
    res.json({ success: true, message: 'Atividade removida com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
