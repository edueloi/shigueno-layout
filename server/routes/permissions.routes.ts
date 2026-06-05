import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

// GET permissions for all users (or ?userId=N for a specific user)
router.get('/permissions', async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.query;
    const rows = userId
      ? await db.all('SELECT * FROM user_permissions WHERE user_id = ?', [Number(userId)])
      : await db.all('SELECT up.*, u.name AS user_name, u.username, u.role FROM user_permissions up JOIN users u ON u.id = up.user_id ORDER BY u.name');
    res.json({ success: true, permissions: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET all users with their permission summary (for the permissions management screen)
router.get('/permissions/users', async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.all('SELECT id, name, username, role FROM users ORDER BY name');
    const allPerms = await db.all('SELECT * FROM user_permissions');
    const permsByUser: Record<number, any> = {};
    for (const p of allPerms) {
      permsByUser[p.user_id] = p;
    }
    const result = users.map((u: any) => ({
      ...u,
      permissions: permsByUser[u.id] || null
    }));
    res.json({ success: true, users: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT upsert permissions for a user
router.put('/permissions/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const {
      can_view_reports,
      can_view_activities,
      can_view_tracking,
      can_view_blog,
      can_view_vacancies,
      can_view_candidates,
      can_view_settings,
      can_edit_activities,
      can_edit_vacancies,
      can_edit_candidates,
      can_edit_blog,
      can_edit_tracking,
      can_edit_settings,
    } = req.body;
    const db = await getDb();
    const existing = await db.get('SELECT id FROM user_permissions WHERE user_id = ?', [userId]);
    if (existing) {
      await db.run(
        `UPDATE user_permissions SET
          can_view_reports=?, can_view_activities=?, can_view_tracking=?, can_view_blog=?,
          can_view_vacancies=?, can_view_candidates=?, can_view_settings=?,
          can_edit_activities=?, can_edit_vacancies=?, can_edit_candidates=?,
          can_edit_blog=?, can_edit_tracking=?, can_edit_settings=?,
          updated_at=NOW()
        WHERE user_id=?`,
        [
          can_view_reports ? 1 : 0, can_view_activities ? 1 : 0, can_view_tracking ? 1 : 0,
          can_view_blog ? 1 : 0, can_view_vacancies ? 1 : 0, can_view_candidates ? 1 : 0,
          can_view_settings ? 1 : 0,
          can_edit_activities ? 1 : 0, can_edit_vacancies ? 1 : 0, can_edit_candidates ? 1 : 0,
          can_edit_blog ? 1 : 0, can_edit_tracking ? 1 : 0, can_edit_settings ? 1 : 0,
          userId
        ]
      );
    } else {
      await db.run(
        `INSERT INTO user_permissions
          (user_id, can_view_reports, can_view_activities, can_view_tracking, can_view_blog,
           can_view_vacancies, can_view_candidates, can_view_settings,
           can_edit_activities, can_edit_vacancies, can_edit_candidates,
           can_edit_blog, can_edit_tracking, can_edit_settings)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          can_view_reports ? 1 : 0, can_view_activities ? 1 : 0, can_view_tracking ? 1 : 0,
          can_view_blog ? 1 : 0, can_view_vacancies ? 1 : 0, can_view_candidates ? 1 : 0,
          can_view_settings ? 1 : 0,
          can_edit_activities ? 1 : 0, can_edit_vacancies ? 1 : 0, can_edit_candidates ? 1 : 0,
          can_edit_blog ? 1 : 0, can_edit_tracking ? 1 : 0, can_edit_settings ? 1 : 0,
        ]
      );
    }
    res.json({ success: true, message: 'Permissões atualizadas.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create a new user
router.post('/users', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, error: 'username, password e name são obrigatórios.' });
    }
    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Usuário já existe com este username.' });
    }
    const result = await db.run(
      'INSERT INTO users (username, password, name, role) VALUES (?,?,?,?)',
      [username, password, name, role || 'operador']
    );
    // Create default permissions (all false) for the new user
    await db.run(
      `INSERT INTO user_permissions (user_id, can_view_reports, can_view_activities, can_view_tracking, can_view_blog, can_view_vacancies, can_view_candidates, can_view_settings, can_edit_activities, can_edit_vacancies, can_edit_candidates, can_edit_blog, can_edit_tracking, can_edit_settings) VALUES (?,0,0,0,0,0,0,0,0,0,0,0,0,0)`,
      [result.lastID]
    );
    res.json({ success: true, id: result.lastID, message: 'Usuário criado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.run('DELETE FROM user_permissions WHERE user_id = ?', [id]);
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'Usuário removido.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
