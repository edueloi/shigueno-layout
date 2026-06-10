import { Router } from 'express';
import { getDb } from '../../server-db';
import { syncVacancyToRhVision } from '../services/rh-vision-sync';

const router = Router();

// Colunas adicionadas após a criação inicial — idempotente (catch ignora se já existir)
export async function ensureVacancyColumns() {
  const db = await getDb();
  const addCol = (sql: string) => db.run(sql).catch(() => {});
  await addCol('ALTER TABLE vacancies ADD COLUMN hierarchy_level INT DEFAULT NULL');
  await addCol('ALTER TABLE vacancies ADD COLUMN contract_type VARCHAR(50) DEFAULT NULL');
  await addCol('ALTER TABLE vacancies ADD COLUMN salary_range VARCHAR(100) DEFAULT NULL');
  await addCol('ALTER TABLE vacancies ADD COLUMN openings INT DEFAULT 1');
}

router.get('/vacancies', async (req, res) => {
  try {
    const db = await getDb();
    const activeOnly = req.query.active === 'true';
    let vacancies;
    if (activeOnly) {
      vacancies = await db.all('SELECT * FROM vacancies WHERE status = ? ORDER BY created_at DESC', ['Ativa']);
    } else {
      vacancies = await db.all('SELECT * FROM vacancies ORDER BY created_at DESC');
    }
    res.json({ success: true, vacancies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/vacancies', async (req, res) => {
  try {
    const { title, department, description, location, requirements, status,
            hierarchy_level, contract_type, salary_range, openings } = req.body;
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO vacancies (title, department, description, location, requirements, status,
        hierarchy_level, contract_type, salary_range, openings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, department, description, location, requirements, status || 'Ativa',
       hierarchy_level || null, contract_type || null, salary_range || null, openings || 1]
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
    const { title, department, description, location, requirements, status,
            hierarchy_level, contract_type, salary_range, openings } = req.body;
    const db = await getDb();
    await db.run(
      `UPDATE vacancies SET title = ?, department = ?, description = ?, location = ?, requirements = ?, status = ?,
        hierarchy_level = ?, contract_type = ?, salary_range = ?, openings = ? WHERE id = ?`,
      [title, department, description, location, requirements, status,
       hierarchy_level || null, contract_type || null, salary_range || null, openings || 1, id]
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
