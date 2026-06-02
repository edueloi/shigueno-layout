import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

// Get Site Settings
router.get('/site-settings', async (req, res) => {
  try {
    const db = await getDb();
    const settings = await db.all('SELECT * FROM site_settings');
    const config: Record<string, string> = {};
    settings.forEach((row) => {
      config[row.key] = row.value;
    });
    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Site Settings
router.post('/site-settings', async (req, res) => {
  try {
    const db = await getDb();
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await db.run(
        'INSERT INTO site_settings (key, value) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, value]
      );
    }
    res.json({ success: true, message: 'Configurações atualizadas com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
