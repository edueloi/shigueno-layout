import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

// GET all activities
router.get('/activities', async (req, res) => {
  try {
    const db = await getDb();
    const activities = await db.all('SELECT * FROM activities');
    res.json({ success: true, activities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new activity
router.post('/activities', async (req, res) => {
  try {
    const { title, description, category, status, priority, responsible, due_date } = req.body;
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO activities (title, description, category, status, priority, responsible, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', category || 'Ações', status || 'A Fazer', priority || 'Média', responsible || '', due_date || '']
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
    const { title, description, category, status, priority, responsible, due_date } = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE activities SET title = ?, description = ?, category = ?, status = ?, priority = ?, responsible = ?, due_date = ? WHERE id = ?',
      [title, description || '', category, status, priority, responsible || '', due_date || '', Number(id)]
    );
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
