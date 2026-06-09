import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

// Garante que a tabela existe (chamada no startup do server)
export async function ensureUserPreferencesTable() {
  const db = await getDb();
  await db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      pref_key VARCHAR(120) NOT NULL,
      pref_value LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_pref (user_id, pref_key)
    )
  `);
}

// GET /api/user-preferences?userId=N  → retorna todas as prefs do usuário como objeto {key: value}
router.get('/user-preferences', async (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ success: false, error: 'userId obrigatório.' });
  try {
    const db = await getDb();
    const rows = await db.all<{ pref_key: string; pref_value: string }>(
      'SELECT pref_key, pref_value FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    const prefs: Record<string, any> = {};
    for (const row of rows) {
      try { prefs[row.pref_key] = JSON.parse(row.pref_value); }
      catch { prefs[row.pref_key] = row.pref_value; }
    }
    res.json({ success: true, preferences: prefs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/user-preferences  → body: { userId, key, value }
router.put('/user-preferences', async (req, res) => {
  const { userId, key, value } = req.body;
  if (!userId || !key) return res.status(400).json({ success: false, error: 'userId e key obrigatórios.' });
  try {
    const db = await getDb();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const existing = await db.get('SELECT id FROM user_preferences WHERE user_id = ? AND pref_key = ?', [userId, key]);
    if (existing) {
      await db.run('UPDATE user_preferences SET pref_value = ? WHERE user_id = ? AND pref_key = ?', [serialized, userId, key]);
    } else {
      await db.run('INSERT INTO user_preferences (user_id, pref_key, pref_value) VALUES (?, ?, ?)', [userId, key, serialized]);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/user-preferences/batch → body: { userId, preferences: { key: value, ... } }
router.put('/user-preferences/batch', async (req, res) => {
  const { userId, preferences } = req.body;
  if (!userId || !preferences) return res.status(400).json({ success: false, error: 'userId e preferences obrigatórios.' });
  try {
    const db = await getDb();
    for (const [key, value] of Object.entries(preferences)) {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      const existing = await db.get('SELECT id FROM user_preferences WHERE user_id = ? AND pref_key = ?', [userId, key]);
      if (existing) {
        await db.run('UPDATE user_preferences SET pref_value = ? WHERE user_id = ? AND pref_key = ?', [serialized, userId, key]);
      } else {
        await db.run('INSERT INTO user_preferences (user_id, pref_key, pref_value) VALUES (?, ?, ?)', [userId, key, serialized]);
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
