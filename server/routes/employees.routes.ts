import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from '../../server-db';

const router = Router();

// Upload de foto em disco
const PHOTOS_DIR = path.join(process.cwd(), 'uploads', 'employees');
if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const photoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PHOTOS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `emp_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg','image/png','image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Somente JPEG, PNG ou WebP permitidos.'));
  }
});

export async function ensureEmployeesTable() {
  const db = await getDb();
  await db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      -- Identidade
      full_name         VARCHAR(120) NOT NULL,
      role              VARCHAR(100) NOT NULL,
      department        VARCHAR(80)  NOT NULL,
      hierarchy_level   TINYINT      DEFAULT 1 COMMENT '1=Menor Aprendiz 2=Estagiario 3=Auxiliar 4=Assistente 5=Analista/Operacional 6=Inspetor/Tecnico 7=Lider 8=Supervisor 9=Coordenador 10=Gerente 11=Diretor 12=CFO/CTO/COO 13=VP 14=CEO',
      manager_id        INT          NULL,
      -- Foto
      photo_path        VARCHAR(255) NULL,
      avatar_initials   VARCHAR(3)   NULL,
      -- Contato
      email             VARCHAR(120) NULL,
      phone             VARCHAR(30)  NULL,
      phone2            VARCHAR(30)  NULL,
      -- Documentos
      cpf               VARCHAR(14)  NULL,
      rg                VARCHAR(20)  NULL,
      -- CNH
      has_cnh           TINYINT(1)   DEFAULT 0,
      cnh_category      VARCHAR(10)  NULL COMMENT 'A B C D E AB AC AD AE ...',
      -- Pessoal
      sex               ENUM('Masculino','Feminino','Outro','Prefiro não informar') NULL,
      birth_date        DATE         NULL,
      blood_type        ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NULL,
      marital_status    ENUM('Solteiro','Casado','União Estável','Divorciado','Viúvo','Outro') NULL,
      has_children      TINYINT(1)   DEFAULT 0,
      children_count    TINYINT      DEFAULT 0,
      education         ENUM('Fundamental Incompleto','Fundamental Completo','Médio Incompleto','Médio Completo','Superior Incompleto','Superior Completo','Pós-Graduação','Mestrado','Doutorado') NULL,
      -- PCD e Saúde
      is_pcd            TINYINT(1)   DEFAULT 0,
      pcd_type          VARCHAR(120) NULL,
      has_continuous_medication TINYINT(1) DEFAULT 0,
      medications       TEXT         NULL,
      has_chronic_disease TINYINT(1) DEFAULT 0,
      chronic_diseases  TEXT         NULL,
      allergies         VARCHAR(255) NULL,
      emergency_contact_name  VARCHAR(80) NULL,
      emergency_contact_phone VARCHAR(30) NULL,
      -- Endereço
      cep               VARCHAR(10)  NULL,
      street            VARCHAR(150) NULL,
      street_number     VARCHAR(20)  NULL,
      complement        VARCHAR(80)  NULL,
      neighborhood      VARCHAR(100) NULL,
      city              VARCHAR(80)  NULL,
      state             VARCHAR(2)   NULL,
      country           VARCHAR(50)  DEFAULT 'Brasil',
      -- Trabalho
      hire_date         DATE         NULL,
      termination_date  DATE         NULL,
      status            ENUM('Ativo','Afastado','Férias','Desligado') NOT NULL DEFAULT 'Ativo',
      work_location     VARCHAR(80)  NULL,
      salary            DECIMAL(10,2) NULL,
      notes             TEXT         NULL,
      -- Timestamps
      created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
    )
  `);

  // Migração: adiciona colunas novas se a tabela já existia sem elas
  const migrations = [
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS hierarchy_level TINYINT DEFAULT 1`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_path VARCHAR(255) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone2 VARCHAR(30) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS sex ENUM('Masculino','Feminino','Outro','Prefiro não informar') NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS blood_type ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS marital_status ENUM('Solteiro','Casado','União Estável','Divorciado','Viúvo','Outro') NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS has_children TINYINT(1) DEFAULT 0`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS children_count TINYINT DEFAULT 0`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS education ENUM('Fundamental Incompleto','Fundamental Completo','Médio Incompleto','Médio Completo','Superior Incompleto','Superior Completo','Pós-Graduação','Mestrado','Doutorado') NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS cep VARCHAR(10) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS street VARCHAR(150) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS street_number VARCHAR(20) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS complement VARCHAR(80) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS city VARCHAR(80) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS state VARCHAR(2) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS country VARCHAR(50) DEFAULT 'Brasil'`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS termination_date DATE NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2) NULL`,
    `ALTER TABLE employees MODIFY COLUMN status ENUM('Ativo','Afastado','Férias','Desligado') NOT NULL DEFAULT 'Ativo'`,
    // Novos campos documentos / CNH / saúde
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS rg VARCHAR(20) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS has_cnh TINYINT(1) DEFAULT 0`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS cnh_category VARCHAR(10) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_pcd TINYINT(1) DEFAULT 0`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS pcd_type VARCHAR(120) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS has_continuous_medication TINYINT(1) DEFAULT 0`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS medications TEXT NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS has_chronic_disease TINYINT(1) DEFAULT 0`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS chronic_diseases TEXT NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS allergies VARCHAR(255) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(80) NULL`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(30) NULL`,
  ];
  for (const sql of migrations) {
    try { await db.run(sql); } catch { /* coluna já existe */ }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<number, string> = {
  1:  'Menor Aprendiz',
  2:  'Estagiário',
  3:  'Auxiliar',
  4:  'Assistente',
  5:  'Analista / Operacional',
  6:  'Inspetor / Técnico',
  7:  'Líder de Equipe',
  8:  'Supervisor',
  9:  'Coordenador',
  10: 'Gerente',
  11: 'Diretor',
  12: 'CFO / CTO / COO',
  13: 'Vice-Presidente',
  14: 'CEO / Presidente',
};

// ── GET /api/employees ────────────────────────────────────────────────────────
router.get('/employees', async (req, res) => {
  try {
    const db = await getDb();
    const { dept, status, search } = req.query as Record<string, string>;

    let sql = `
      SELECT e.*,
             m.full_name AS manager_name,
             m.role      AS manager_role,
             TIMESTAMPDIFF(YEAR, e.hire_date, CURDATE()) AS years_of_service,
             DATE_FORMAT(e.birth_date, '%m-%d') AS birth_mmdd
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (dept && dept !== 'Todos') { sql += ' AND e.department = ?'; params.push(dept); }
    if (status && status !== 'Todos') { sql += ' AND e.status = ?'; params.push(status); }
    if (search) {
      sql += ' AND (e.full_name LIKE ? OR e.role LIKE ? OR e.department LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY e.hierarchy_level DESC, e.department ASC, e.full_name ASC';

    const employees = await db.all(sql, params);

    const today = new Date();
    const upcoming = employees.filter((e: any) => {
      if (!e.birth_date) return false;
      const parts = String(e.birth_date).split('-');
      const mm = Number(parts[1]); const dd = Number(parts[2]);
      const birthday = new Date(today.getFullYear(), mm - 1, dd);
      if (birthday < today) birthday.setFullYear(today.getFullYear() + 1);
      return (birthday.getTime() - today.getTime()) / 86400000 <= 30;
    });

    res.json({ success: true, employees, upcoming_birthdays: upcoming });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/employees/departments ───────────────────────────────────────────
router.get('/employees/departments', async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT DISTINCT department FROM employees ORDER BY department ASC');
    res.json({ success: true, departments: rows.map((r: any) => r.department) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/employees/:id ────────────────────────────────────────────────────
router.get('/employees/:id', async (req, res) => {
  try {
    const db = await getDb();
    const employee = await db.get(`
      SELECT e.*,
             m.full_name AS manager_name,
             m.role      AS manager_role,
             TIMESTAMPDIFF(YEAR, e.hire_date, CURDATE()) AS years_of_service,
             TIMESTAMPDIFF(YEAR, e.birth_date, CURDATE()) AS age
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ?
    `, [Number(req.params.id)]);
    if (!employee) return res.status(404).json({ success: false, error: 'Funcionário não encontrado.' });
    const reports = await db.all(
      'SELECT id, full_name, role, department, hierarchy_level, photo_path, avatar_initials, status FROM employees WHERE manager_id = ? ORDER BY hierarchy_level DESC, full_name ASC',
      [Number(req.params.id)]
    );
    res.json({ success: true, employee, reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/employees ───────────────────────────────────────────────────────
router.post('/employees', async (req, res) => {
  try {
    const f = req.body;
    if (!f.full_name || !f.role || !f.department) {
      return res.status(400).json({ success: false, error: 'Nome, cargo e departamento são obrigatórios.' });
    }
    const db = await getDb();
    const initials = f.full_name.split(' ').slice(0,2).map((w: string) => w[0].toUpperCase()).join('');
    const result = await db.run(
      `INSERT INTO employees
        (full_name, role, department, hierarchy_level, manager_id, email, phone, phone2,
         cpf, rg, has_cnh, cnh_category,
         sex, birth_date, blood_type, marital_status, has_children, children_count, education,
         is_pcd, pcd_type, has_continuous_medication, medications,
         has_chronic_disease, chronic_diseases, allergies,
         emergency_contact_name, emergency_contact_phone,
         cep, street, street_number, complement, neighborhood, city, state, country,
         hire_date, status, work_location, salary, notes, avatar_initials)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        f.full_name, f.role, f.department, Number(f.hierarchy_level)||1,
        f.manager_id ? Number(f.manager_id) : null,
        n(f.email), n(f.phone), n(f.phone2),
        n(f.cpf), n(f.rg), b(f.has_cnh), n(f.cnh_category),
        n(f.sex), n(f.birth_date), n(f.blood_type),
        n(f.marital_status), b(f.has_children), Number(f.children_count)||0, n(f.education),
        b(f.is_pcd), n(f.pcd_type), b(f.has_continuous_medication), n(f.medications),
        b(f.has_chronic_disease), n(f.chronic_diseases), n(f.allergies),
        n(f.emergency_contact_name), n(f.emergency_contact_phone),
        n(f.cep), n(f.street), n(f.street_number), n(f.complement),
        n(f.neighborhood), n(f.city), n(f.state), n(f.country)||'Brasil',
        n(f.hire_date), f.status||'Ativo', n(f.work_location),
        f.salary ? Number(f.salary) : null, n(f.notes), initials
      ]
    );
    res.json({ success: true, id: result.lastID });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: string vazia → null (MySQL ENUM rejeita string vazia)
function n(v: any): any { return (v === '' || v === undefined) ? null : v; }
// Helper: boolean/0/1/string → 0 or 1
function b(v: any): 0|1 { return (v === true || v === 1 || v === '1' || v === 'true') ? 1 : 0; }

// ── PUT /api/employees/:id ────────────────────────────────────────────────────
router.put('/employees/:id', async (req, res) => {
  try {
    const f = req.body;
    const db = await getDb();
    const initials = f.full_name?.split(' ').slice(0,2).map((w: string) => w[0].toUpperCase()).join('')||'';
    await db.run(
      `UPDATE employees SET
        full_name=?, role=?, department=?, hierarchy_level=?, manager_id=?,
        email=?, phone=?, phone2=?,
        cpf=?, rg=?, has_cnh=?, cnh_category=?,
        sex=?, birth_date=?, blood_type=?, marital_status=?,
        has_children=?, children_count=?, education=?,
        is_pcd=?, pcd_type=?, has_continuous_medication=?, medications=?,
        has_chronic_disease=?, chronic_diseases=?, allergies=?,
        emergency_contact_name=?, emergency_contact_phone=?,
        cep=?, street=?, street_number=?, complement=?,
        neighborhood=?, city=?, state=?, country=?,
        hire_date=?, termination_date=?, status=?, work_location=?, salary=?, notes=?, avatar_initials=?
       WHERE id=?`,
      [
        f.full_name, f.role, f.department, Number(f.hierarchy_level)||1,
        f.manager_id ? Number(f.manager_id) : null,
        n(f.email), n(f.phone), n(f.phone2),
        n(f.cpf), n(f.rg), b(f.has_cnh), n(f.cnh_category),
        n(f.sex), n(f.birth_date), n(f.blood_type),
        n(f.marital_status), b(f.has_children), Number(f.children_count)||0, n(f.education),
        b(f.is_pcd), n(f.pcd_type), b(f.has_continuous_medication), n(f.medications),
        b(f.has_chronic_disease), n(f.chronic_diseases), n(f.allergies),
        n(f.emergency_contact_name), n(f.emergency_contact_phone),
        n(f.cep), n(f.street), n(f.street_number), n(f.complement),
        n(f.neighborhood), n(f.city), n(f.state), n(f.country)||'Brasil',
        n(f.hire_date), n(f.termination_date), f.status||'Ativo',
        n(f.work_location), f.salary ? Number(f.salary) : null, n(f.notes), initials,
        Number(req.params.id)
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/employees/:id/photo — upload de foto ───────────────────────────
router.post('/employees/:id/photo', photoUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
    const db = await getDb();
    // Remove foto anterior do disco
    const old = await db.get<{ photo_path: string }>('SELECT photo_path FROM employees WHERE id=?', [Number(req.params.id)]);
    if (old?.photo_path && fs.existsSync(old.photo_path)) fs.unlinkSync(old.photo_path);
    await db.run('UPDATE employees SET photo_path=? WHERE id=?', [req.file.path, Number(req.params.id)]);
    res.json({ success: true, photo_url: `/api/employees/${req.params.id}/photo` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/employees/:id/photo — serve a foto ──────────────────────────────
router.get('/employees/:id/photo', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get<{ photo_path: string }>('SELECT photo_path FROM employees WHERE id=?', [Number(req.params.id)]);
    if (!row?.photo_path || !fs.existsSync(row.photo_path)) {
      return res.status(404).send('Not found');
    }
    res.sendFile(path.resolve(row.photo_path));
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── DELETE /api/employees/:id ─────────────────────────────────────────────────
router.delete('/employees/:id', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get<{ photo_path: string }>('SELECT photo_path FROM employees WHERE id=?', [Number(req.params.id)]);
    if (row?.photo_path && fs.existsSync(row.photo_path)) fs.unlinkSync(row.photo_path);
    await db.run('UPDATE employees SET manager_id=NULL WHERE manager_id=?', [Number(req.params.id)]);
    await db.run('DELETE FROM employees WHERE id=?', [Number(req.params.id)]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { LEVEL_LABELS };
export default router;
