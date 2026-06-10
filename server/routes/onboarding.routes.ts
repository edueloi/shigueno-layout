import { Router } from 'express';
import { getDb } from '../../server-db';
import crypto from 'crypto';

const router = Router();

export async function ensureOnboardingTables() {
  const db = await getDb();

  await db.run(`
    CREATE TABLE IF NOT EXISTS candidate_onboarding (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id  INT NOT NULL,
      employee_id   INT NULL,
      status        ENUM('Pendente','Em andamento','Concluído','Cancelado') DEFAULT 'Pendente',
      start_date    DATE NULL,
      hired_date    DATE NULL,
      department    VARCHAR(80) NULL,
      role          VARCHAR(80) NULL,
      manager_id    INT NULL,
      salary        DECIMAL(10,2) NULL,
      notes         TEXT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS onboarding_items (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      onboarding_id   INT NOT NULL,
      category        VARCHAR(60) NOT NULL,
      item            VARCHAR(160) NOT NULL,
      description     VARCHAR(200) NULL,
      required        TINYINT(1) DEFAULT 1,
      status          ENUM('Pendente','Entregue','Não Aplicável') DEFAULT 'Pendente',
      delivered_at    DATE NULL,
      delivered_by    VARCHAR(80) NULL,
      notes           TEXT NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Garante coluna uid na tabela candidates (caso não criada pela migration)
  try {
    await db.run(`ALTER TABLE candidates ADD COLUMN uid VARCHAR(36) DEFAULT NULL`);
  } catch { /* já existe */ }
}

// ── GET /api/candidates/uid/:uid — busca candidato por UID ───────────────────
router.get('/candidates/uid/:uid', async (req, res) => {
  try {
    const db = await getDb();
    const candidate = await db.get(`
      SELECT c.*, v.title as vacancy_title, v.department as vacancy_department,
             v.description as vacancy_description, v.requirements as vacancy_requirements
      FROM candidates c
      LEFT JOIN vacancies v ON c.vacancy_id = v.id
      WHERE c.uid = ?
    `, [req.params.uid]);
    if (!candidate) return res.status(404).json({ success: false, error: 'Candidato não encontrado.' });
    res.json({ success: true, candidate });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ── POST /api/candidates/:id/generate-uid — gera/regenera UID ────────────────
router.post('/candidates/:id/generate-uid', async (req, res) => {
  try {
    const db = await getDb();
    const existing = await db.get<{ uid: string }>('SELECT uid FROM candidates WHERE id=?', [Number(req.params.id)]);
    if (existing?.uid) return res.json({ success: true, uid: existing.uid });
    const uid = crypto.randomUUID();
    await db.run('UPDATE candidates SET uid=? WHERE id=?', [uid, Number(req.params.id)]);
    res.json({ success: true, uid });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ── ONBOARDING ────────────────────────────────────────────────────────────────

// GET /api/onboarding/:candidateId — onboarding do candidato
router.get('/onboarding/:candidateId', async (req, res) => {
  try {
    const db = await getDb();
    const onboarding = await db.get(
      'SELECT * FROM candidate_onboarding WHERE candidate_id=? ORDER BY created_at DESC',
      [Number(req.params.candidateId)]
    );
    if (!onboarding) return res.json({ success: true, onboarding: null, items: [] });
    const items = await db.all('SELECT * FROM onboarding_items WHERE onboarding_id=? ORDER BY category, id', [(onboarding as any).id]);
    res.json({ success: true, onboarding, items });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// POST /api/onboarding/:candidateId — cria/inicia onboarding
router.post('/onboarding/:candidateId', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    const existing = await db.get('SELECT id FROM candidate_onboarding WHERE candidate_id=?', [Number(req.params.candidateId)]);
    let onboardingId: number;

    if (existing) {
      await db.run(
        'UPDATE candidate_onboarding SET status=?, start_date=?, hired_date=?, department=?, role=?, manager_id=?, salary=?, notes=? WHERE id=?',
        [f.status||'Pendente', f.start_date||null, f.hired_date||null, f.department||null,
         f.role||null, f.manager_id||null, f.salary||null, f.notes||null, (existing as any).id]
      );
      onboardingId = (existing as any).id;
    } else {
      const r = await db.run(
        'INSERT INTO candidate_onboarding (candidate_id, status, start_date, hired_date, department, role, manager_id, salary, notes) VALUES (?,?,?,?,?,?,?,?,?)',
        [Number(req.params.candidateId), f.status||'Pendente', f.start_date||null, f.hired_date||null,
         f.department||null, f.role||null, f.manager_id||null, f.salary||null, f.notes||null]
      );
      onboardingId = r.lastID;

      // Cria checklist padrão de EPIs e documentos
      const defaultItems = [
        // EPIs
        ['EPI', 'Capacete de segurança', 'CA válido', 1],
        ['EPI', 'Botina de segurança', 'Com biqueira de aço', 1],
        ['EPI', 'Luvas de proteção', 'Conforme atividade', 1],
        ['EPI', 'Óculos de proteção', 'Para atividades de risco', 0],
        ['EPI', 'Protetor auricular', 'Áreas com ruído', 0],
        ['EPI', 'Colete refletivo', 'Para operadores de máquinas', 0],
        // Uniformes
        ['Uniforme', 'Camiseta da empresa', '2 unidades', 1],
        ['Uniforme', 'Calça de trabalho', '2 unidades', 1],
        // Documentos
        ['Documento', 'Contrato de trabalho assinado', 'CTPS + contrato', 1],
        ['Documento', 'Ficha de registro do empregado', 'Formulário RH', 1],
        ['Documento', 'ASO — Atestado de Saúde Ocupacional', 'Exame admissional', 1],
        ['Documento', 'Declaração de Dependentes IR', 'Para benefício IRRF', 0],
        // Treinamentos
        ['Treinamento', 'Integração empresarial', 'Apresentação da empresa e normas', 1],
        ['Treinamento', 'Treinamento de segurança NR-1', 'Norma Regulamentadora básica', 1],
        ['Treinamento', 'Treinamento específico da função', 'Conforme cargo', 1],
        // Acessos
        ['Acesso', 'Crachá de identificação', 'Foto e cargo', 1],
        ['Acesso', 'Acesso ao sistema interno', 'Usuário e senha', 0],
        // Benefícios
        ['Benefício', 'Vale Alimentação / Refeição', 'Conforme política', 0],
        ['Benefício', 'Plano de Saúde', 'Cadastro no plano', 0],
        ['Benefício', 'Vale Transporte', 'Declaração de endereço', 0],
      ];
      for (const [cat, item, desc, req] of defaultItems) {
        await db.run(
          'INSERT INTO onboarding_items (onboarding_id, category, item, description, required) VALUES (?,?,?,?,?)',
          [onboardingId, cat, item, desc, req]
        );
      }
    }
    res.json({ success: true, id: onboardingId });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// PUT /api/onboarding/items/:itemId — atualiza item do checklist
router.put('/onboarding/items/:itemId', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE onboarding_items SET status=?, delivered_at=?, delivered_by=?, notes=? WHERE id=?',
      [f.status||'Pendente', f.delivered_at||null, f.delivered_by||null, f.notes||null, Number(req.params.itemId)]
    );
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// POST /api/onboarding/:onboardingId/items — adiciona item customizado
router.post('/onboarding/:onboardingId/items', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    const r = await db.run(
      'INSERT INTO onboarding_items (onboarding_id, category, item, description, required, status) VALUES (?,?,?,?,?,?)',
      [Number(req.params.onboardingId), f.category||'Outro', f.item, f.description||null, f.required?1:0, 'Pendente']
    );
    res.json({ success: true, id: r.lastID });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// DELETE /api/onboarding/items/:itemId
router.delete('/onboarding/items/:itemId', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM onboarding_items WHERE id=?', [Number(req.params.itemId)]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// POST /api/onboarding/:candidateId/convert — converte candidato aprovado em funcionário
router.post('/onboarding/:candidateId/convert', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    const candidate = await db.get('SELECT * FROM candidates WHERE id=?', [Number(req.params.candidateId)]) as any;
    if (!candidate) return res.status(404).json({ success: false, error: 'Candidato não encontrado.' });

    // Cria o funcionário
    const initials = candidate.name.split(' ').slice(0,2).map((w: string) => w[0].toUpperCase()).join('');
    const r = await db.run(
      `INSERT INTO employees (full_name, role, department, hierarchy_level, email, phone, hire_date, status, work_location, salary, notes, avatar_initials)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        candidate.name, f.role||'A definir', f.department||'A definir',
        Number(f.hierarchy_level)||1, candidate.email||null, candidate.phone||null,
        f.hire_date||new Date().toISOString().slice(0,10),
        'Ativo', f.work_location||null, f.salary ? Number(f.salary) : null,
        `Contratado via processo seletivo. Origem: candidatura #${candidate.id}`,
        initials
      ]
    );
    const employeeId = r.lastID;

    // Atualiza candidato
    await db.run('UPDATE candidates SET status=? WHERE id=?', ['Aprovado', candidate.id]);
    // Vincula onboarding ao funcionário
    await db.run('UPDATE candidate_onboarding SET employee_id=?, status=? WHERE candidate_id=?',
      [employeeId, 'Em andamento', candidate.id]);

    res.json({ success: true, employee_id: employeeId, message: `${candidate.name} convertido para funcionário!` });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

export default router;
