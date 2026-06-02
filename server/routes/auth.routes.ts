import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await getDb();
    const user = await db.get(
      'SELECT id, username, name, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (user) {
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        },
        token: 'simulated-shigueno-jwt-token'
      });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha incorretos.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
