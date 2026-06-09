import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

export async function ensureRecruitmentTables() {
  const db = await getDb();

  // Entrevistas agendadas / realizadas
  await db.run(`
    CREATE TABLE IF NOT EXISTS candidate_interviews (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id    INT NOT NULL,
      vacancy_id      INT NULL,
      interviewer     VARCHAR(80) NOT NULL,
      scheduled_at    DATETIME NOT NULL,
      duration_min    INT DEFAULT 60,
      type            ENUM('Triagem Telefônica','Entrevista RH','Entrevista Técnica','Entrevista Final','Dinâmica de Grupo','Teste Prático') DEFAULT 'Entrevista RH',
      location        VARCHAR(120) NULL COMMENT 'Presencial/Online/Endereço',
      status          ENUM('Agendada','Realizada','Cancelada','Não Compareceu') DEFAULT 'Agendada',
      result          ENUM('Aprovado','Reprovado','Em análise','—') DEFAULT '—',
      score           TINYINT NULL COMMENT '0-10',
      notes           TEXT NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Avaliações de desempenho no processo seletivo
  await db.run(`
    CREATE TABLE IF NOT EXISTS candidate_evaluations (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id    INT NOT NULL,
      vacancy_id      INT NULL,
      evaluator       VARCHAR(80) NOT NULL,
      evaluation_date DATE NOT NULL,
      type            ENUM('Triagem','Competências','Comportamental','Técnica','Cultural','Final') DEFAULT 'Competências',
      -- Critérios (0-10 cada)
      score_technical      TINYINT DEFAULT 0,
      score_communication  TINYINT DEFAULT 0,
      score_attitude       TINYINT DEFAULT 0,
      score_experience     TINYINT DEFAULT 0,
      score_cultural_fit   TINYINT DEFAULT 0,
      overall_score        DECIMAL(4,1) GENERATED ALWAYS AS (
        (score_technical + score_communication + score_attitude + score_experience + score_cultural_fit) / 5.0
      ) STORED,
      strengths       TEXT NULL,
      weaknesses      TEXT NULL,
      recommendation  ENUM('Contratar','Banco de Talentos','Não Recomendado','Aguardar') DEFAULT 'Aguardar',
      notes           TEXT NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Observações / timeline do processo
  await db.run(`
    CREATE TABLE IF NOT EXISTS candidate_observations (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id    INT NOT NULL,
      author          VARCHAR(80) NOT NULL,
      type            ENUM('Observação','Contato','Encaminhamento','Documento','Proposta','Alerta') DEFAULT 'Observação',
      content         TEXT NOT NULL,
      is_private      TINYINT(1) DEFAULT 0,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Encaminhamentos (propostas, documentos solicitados)
  await db.run(`
    CREATE TABLE IF NOT EXISTS candidate_referrals (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id    INT NOT NULL,
      vacancy_id      INT NULL,
      type            ENUM('Proposta Salarial','Exame Admissional','Documentação','Carta Oferta','Integração','Outro') DEFAULT 'Outro',
      description     VARCHAR(200) NOT NULL,
      deadline        DATE NULL,
      status          ENUM('Pendente','Em andamento','Concluído','Cancelado') DEFAULT 'Pendente',
      assigned_to     VARCHAR(80) NULL,
      notes           TEXT NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migração: adiciona coluna pipeline_stage na tabela candidates
  try {
    await db.run(`ALTER TABLE candidates ADD COLUMN pipeline_stage VARCHAR(50) DEFAULT 'Novo'`);
  } catch { /* já existe */ }
  try {
    await db.run(`ALTER TABLE candidates ADD COLUMN salary_expectation VARCHAR(50) NULL`);
  } catch { /* já existe */ }
  try {
    await db.run(`ALTER TABLE candidates ADD COLUMN availability VARCHAR(80) NULL`);
  } catch { /* já existe */ }
  try {
    await db.run(`ALTER TABLE candidates ADD COLUMN source VARCHAR(60) DEFAULT 'Portal'`);
  } catch { /* já existe */ }
  try {
    await db.run(`ALTER TABLE candidates ADD COLUMN recruiter_rating TINYINT NULL`);
  } catch { /* já existe */ }
}

// ── ENTREVISTAS ───────────────────────────────────────────────────────────────

router.get('/recruitment/:candidateId/interviews', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT * FROM candidate_interviews WHERE candidate_id=? ORDER BY scheduled_at DESC',
      [Number(req.params.candidateId)]
    );
    res.json({ success: true, interviews: rows });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/recruitment/:candidateId/interviews', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    const r = await db.run(
      `INSERT INTO candidate_interviews (candidate_id, vacancy_id, interviewer, scheduled_at, duration_min, type, location, status, result, score, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [Number(req.params.candidateId), f.vacancy_id||null, f.interviewer, f.scheduled_at,
       f.duration_min||60, f.type||'Entrevista RH', f.location||null,
       f.status||'Agendada', f.result||'—', f.score||null, f.notes||null]
    );
    res.json({ success: true, id: r.lastID });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/recruitment/interviews/:id', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    await db.run(
      `UPDATE candidate_interviews SET interviewer=?, scheduled_at=?, duration_min=?, type=?, location=?, status=?, result=?, score=?, notes=? WHERE id=?`,
      [f.interviewer, f.scheduled_at, f.duration_min||60, f.type, f.location||null,
       f.status, f.result||'—', f.score||null, f.notes||null, Number(req.params.id)]
    );
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/recruitment/interviews/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM candidate_interviews WHERE id=?', [Number(req.params.id)]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ── AVALIAÇÕES ────────────────────────────────────────────────────────────────

router.get('/recruitment/:candidateId/evaluations', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT * FROM candidate_evaluations WHERE candidate_id=? ORDER BY evaluation_date DESC',
      [Number(req.params.candidateId)]
    );
    res.json({ success: true, evaluations: rows });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/recruitment/:candidateId/evaluations', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    const r = await db.run(
      `INSERT INTO candidate_evaluations
        (candidate_id, vacancy_id, evaluator, evaluation_date, type,
         score_technical, score_communication, score_attitude, score_experience, score_cultural_fit,
         strengths, weaknesses, recommendation, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [Number(req.params.candidateId), f.vacancy_id||null, f.evaluator, f.evaluation_date,
       f.type||'Competências',
       f.score_technical||0, f.score_communication||0, f.score_attitude||0,
       f.score_experience||0, f.score_cultural_fit||0,
       f.strengths||null, f.weaknesses||null, f.recommendation||'Aguardar', f.notes||null]
    );
    res.json({ success: true, id: r.lastID });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/recruitment/evaluations/:id', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    await db.run(
      `UPDATE candidate_evaluations SET
        evaluator=?, evaluation_date=?, type=?,
        score_technical=?, score_communication=?, score_attitude=?, score_experience=?, score_cultural_fit=?,
        strengths=?, weaknesses=?, recommendation=?, notes=?
       WHERE id=?`,
      [f.evaluator, f.evaluation_date, f.type,
       f.score_technical||0, f.score_communication||0, f.score_attitude||0,
       f.score_experience||0, f.score_cultural_fit||0,
       f.strengths||null, f.weaknesses||null, f.recommendation||'Aguardar', f.notes||null,
       Number(req.params.id)]
    );
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/recruitment/evaluations/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM candidate_evaluations WHERE id=?', [Number(req.params.id)]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ── OBSERVAÇÕES ───────────────────────────────────────────────────────────────

router.get('/recruitment/:candidateId/observations', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT * FROM candidate_observations WHERE candidate_id=? ORDER BY created_at DESC',
      [Number(req.params.candidateId)]
    );
    res.json({ success: true, observations: rows });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/recruitment/:candidateId/observations', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    const r = await db.run(
      'INSERT INTO candidate_observations (candidate_id, author, type, content, is_private) VALUES (?,?,?,?,?)',
      [Number(req.params.candidateId), f.author, f.type||'Observação', f.content, f.is_private?1:0]
    );
    res.json({ success: true, id: r.lastID });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/recruitment/observations/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM candidate_observations WHERE id=?', [Number(req.params.id)]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ── ENCAMINHAMENTOS ───────────────────────────────────────────────────────────

router.get('/recruitment/:candidateId/referrals', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT * FROM candidate_referrals WHERE candidate_id=? ORDER BY created_at DESC',
      [Number(req.params.candidateId)]
    );
    res.json({ success: true, referrals: rows });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/recruitment/:candidateId/referrals', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    const r = await db.run(
      `INSERT INTO candidate_referrals (candidate_id, vacancy_id, type, description, deadline, status, assigned_to, notes)
       VALUES (?,?,?,?,?,?,?,?)`,
      [Number(req.params.candidateId), f.vacancy_id||null, f.type||'Outro', f.description,
       f.deadline||null, f.status||'Pendente', f.assigned_to||null, f.notes||null]
    );
    res.json({ success: true, id: r.lastID });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/recruitment/referrals/:id', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE candidate_referrals SET type=?, description=?, deadline=?, status=?, assigned_to=?, notes=? WHERE id=?',
      [f.type, f.description, f.deadline||null, f.status, f.assigned_to||null, f.notes||null, Number(req.params.id)]
    );
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/recruitment/referrals/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM candidate_referrals WHERE id=?', [Number(req.params.id)]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// ── UPDATE COMPLETO DO CANDIDATO ──────────────────────────────────────────────
router.put('/recruitment/candidates/:id', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    await db.run(
      `UPDATE candidates SET status=?, pipeline_stage=?, salary_expectation=?, availability=?, source=?, recruiter_rating=? WHERE id=?`,
      [f.status||'Novo', f.pipeline_stage||'Novo', f.salary_expectation||null,
       f.availability||null, f.source||'Portal', f.recruiter_rating||null,
       Number(req.params.id)]
    );
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

export default router;
