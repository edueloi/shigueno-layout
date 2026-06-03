import { Router } from 'express';
import { getDb } from '../../server-db';
import { syncVacancyToRhVision } from '../services/rh-vision-sync';

const router = Router();

router.get('/vacancies', async (req, res) => {
  try {
    const db = await getDb();
    const activeOnly = req.query.active === 'true';
    let vacancies;
    if (activeOnly) {
      vacancies = await db.all('SELECT * FROM vacancies WHERE status = ?', ['Ativa']);
    } else {
      vacancies = await db.all('SELECT * FROM vacancies');
    }
    res.json({ success: true, vacancies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/vacancies', async (req, res) => {
  try {
    const { title, department, description, location, requirements, status } = req.body;
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO vacancies (title, department, description, location, requirements, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, department, description, location, requirements, status || 'Ativa']
    );
    syncVacancyToRhVision('upsert', { id: result.lastID, title, department, description, location, requirements, status: status || 'Ativa' });
    res.json({ success: true, id: result.lastID, message: 'Vaga publicada com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, description, location, requirements, status } = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE vacancies SET title = ?, department = ?, description = ?, location = ?, requirements = ?, status = ? WHERE id = ?',
      [title, department, description, location, requirements, status, id]
    );
    syncVacancyToRhVision('upsert', { id: Number(id), title, department, description, location, requirements, status });
    res.json({ success: true, message: 'Vaga atualizada com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM vacancies WHERE id = ?', [id]);
    syncVacancyToRhVision('delete', { id: Number(id), title: '' });
    res.json({ success: true, message: 'Vaga removida com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
