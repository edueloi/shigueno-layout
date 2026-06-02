import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

router.get('/suppliers', async (req, res) => {
  try {
    const db = await getDb();
    const suppliers = await db.all('SELECT * FROM suppliers ORDER BY cattle_count DESC');
    res.json({ success: true, suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/suppliers', async (req, res) => {
  try {
    const { name, city, phone, cattle_count, cattle_breed, status, last_delivery } = req.body;
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO suppliers (name, city, phone, cattle_count, cattle_breed, status, last_delivery) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, city, phone, Number(cattle_count) || 0, cattle_breed, status || 'Ativo', last_delivery]
    );
    res.json({ success: true, id: result.lastID, message: 'Fornecedor cadastrado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, phone, cattle_count, cattle_breed, status, last_delivery } = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE suppliers SET name = ?, city = ?, phone = ?, cattle_count = ?, cattle_breed = ?, status = ?, last_delivery = ? WHERE id = ?',
      [name, city, phone, Number(cattle_count) || 0, cattle_breed, status, last_delivery, id]
    );
    res.json({ success: true, message: 'Fornecedor atualizado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM suppliers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Fornecedor removido com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
