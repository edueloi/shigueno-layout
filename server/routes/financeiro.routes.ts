import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

export async function ensureFinanceiroTables() {
  const db = await getDb();

  // Folha de pagamento
  await db.run(`
    CREATE TABLE IF NOT EXISTS payroll (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      employee_id   INT NOT NULL,
      reference_month VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
      base_salary   DECIMAL(10,2) NOT NULL DEFAULT 0,
      bonuses       DECIMAL(10,2) DEFAULT 0,
      deductions    DECIMAL(10,2) DEFAULT 0,
      net_salary    DECIMAL(10,2) GENERATED ALWAYS AS (base_salary + bonuses - deductions) STORED,
      status        ENUM('Rascunho','Processado','Pago') DEFAULT 'Rascunho',
      paid_at       DATE NULL,
      notes         TEXT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_emp_month (employee_id, reference_month)
    )
  `);

  // Férias
  await db.run(`
    CREATE TABLE IF NOT EXISTS employee_vacations (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      employee_id          INT NOT NULL,
      days_requested       INT NOT NULL DEFAULT 30,
      start_date           DATE NOT NULL,
      end_date             DATE GENERATED ALWAYS AS (DATE_ADD(start_date, INTERVAL days_requested - 1 DAY)) STORED,
      days_count           INT GENERATED ALWAYS AS (days_requested) STORED,
      -- Abono pecuniário (venda de dias)
      has_pecuniary        TINYINT(1) DEFAULT 0,
      pecuniary_days       TINYINT DEFAULT 0,
      -- Adiantamento 13º salário
      has_advance_13       TINYINT(1) DEFAULT 0,
      -- Adiantamento salarial
      has_salary_advance   TINYINT(1) DEFAULT 0,
      salary_advance_value DECIMAL(10,2) DEFAULT 0,
      -- Vencimento das férias (período aquisitivo)
      acquisition_start    DATE NULL,
      acquisition_end      DATE NULL,
      -- Aprovação
      status               ENUM('Solicitado','Aprovado','Em curso','Concluído','Cancelado') DEFAULT 'Solicitado',
      approved_by          VARCHAR(80) NULL,
      notes                TEXT NULL,
      created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrações caso tabela já existia sem os novos campos
  const vacMigrations = [
    `ALTER TABLE employee_vacations ADD COLUMN IF NOT EXISTS days_requested INT NOT NULL DEFAULT 30`,
    `ALTER TABLE employee_vacations ADD COLUMN IF NOT EXISTS has_pecuniary TINYINT(1) DEFAULT 0`,
    `ALTER TABLE employee_vacations ADD COLUMN IF NOT EXISTS pecuniary_days TINYINT DEFAULT 0`,
    `ALTER TABLE employee_vacations ADD COLUMN IF NOT EXISTS has_advance_13 TINYINT(1) DEFAULT 0`,
    `ALTER TABLE employee_vacations ADD COLUMN IF NOT EXISTS has_salary_advance TINYINT(1) DEFAULT 0`,
    `ALTER TABLE employee_vacations ADD COLUMN IF NOT EXISTS salary_advance_value DECIMAL(10,2) DEFAULT 0`,
    `ALTER TABLE employee_vacations ADD COLUMN IF NOT EXISTS acquisition_start DATE NULL`,
    `ALTER TABLE employee_vacations ADD COLUMN IF NOT EXISTS acquisition_end DATE NULL`,
  ];
  for (const sql of vacMigrations) {
    try { await db.run(sql); } catch { /* já existe */ }
  }

  // Fornecedores
  await db.run(`
    CREATE TABLE IF NOT EXISTS suppliers_fin (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(120) NOT NULL,
      cnpj          VARCHAR(20)  NULL,
      category      VARCHAR(60)  NULL,
      contact_name  VARCHAR(80)  NULL,
      email         VARCHAR(120) NULL,
      phone         VARCHAR(30)  NULL,
      city          VARCHAR(80)  NULL,
      state         VARCHAR(2)   NULL,
      status        ENUM('Ativo','Inativo') DEFAULT 'Ativo',
      notes         TEXT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Estoque
  await db.run(`
    CREATE TABLE IF NOT EXISTS stock_items (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(120) NOT NULL,
      category      VARCHAR(60)  NULL,
      unit          VARCHAR(20)  NULL COMMENT 'kg, L, un, caixa...',
      quantity      DECIMAL(10,3) DEFAULT 0,
      min_quantity  DECIMAL(10,3) DEFAULT 0,
      location      VARCHAR(80)  NULL,
      supplier_id   INT NULL,
      unit_cost     DECIMAL(10,2) NULL,
      notes         TEXT NULL,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Movimentações de estoque
  await db.run(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      item_id       INT NOT NULL,
      type          ENUM('Entrada','Saída','Ajuste') NOT NULL,
      quantity      DECIMAL(10,3) NOT NULL,
      reason        VARCHAR(120) NULL,
      user_name     VARCHAR(80) NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// ── FOLHA DE PAGAMENTO ────────────────────────────────────────────────────────

router.get('/financeiro/payroll', async (req, res) => {
  try {
    const db = await getDb();
    const { month } = req.query as Record<string,string>;
    let sql = `
      SELECT p.*, e.full_name, e.role, e.department
      FROM payroll p
      JOIN employees e ON e.id = p.employee_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (month) { sql += ' AND p.reference_month = ?'; params.push(month); }
    sql += ' ORDER BY e.department, e.full_name';
    const rows = await db.all(sql, params);
    // Totais
    const total = rows.reduce((acc: any, r: any) => ({
      base: acc.base + Number(r.base_salary),
      bonuses: acc.bonuses + Number(r.bonuses),
      deductions: acc.deductions + Number(r.deductions),
      net: acc.net + Number(r.net_salary),
    }), { base:0, bonuses:0, deductions:0, net:0 });
    res.json({ success: true, payroll: rows, totals: total });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.post('/financeiro/payroll', async (req, res) => {
  try {
    const { employee_id, reference_month, base_salary, bonuses, deductions, status, paid_at, notes } = req.body;
    const db = await getDb();
    const existing = await db.get('SELECT id FROM payroll WHERE employee_id=? AND reference_month=?', [employee_id, reference_month]);
    if (existing) {
      await db.run('UPDATE payroll SET base_salary=?,bonuses=?,deductions=?,status=?,paid_at=?,notes=? WHERE id=?',
        [base_salary||0, bonuses||0, deductions||0, status||'Rascunho', paid_at||null, notes||null, (existing as any).id]);
      res.json({ success:true, id:(existing as any).id });
    } else {
      const r = await db.run('INSERT INTO payroll (employee_id,reference_month,base_salary,bonuses,deductions,status,paid_at,notes) VALUES (?,?,?,?,?,?,?,?)',
        [employee_id, reference_month, base_salary||0, bonuses||0, deductions||0, status||'Rascunho', paid_at||null, notes||null]);
      res.json({ success:true, id:r.lastID });
    }
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.put('/financeiro/payroll/:id', async (req, res) => {
  try {
    const { base_salary, bonuses, deductions, status, paid_at, notes } = req.body;
    const db = await getDb();
    await db.run('UPDATE payroll SET base_salary=?,bonuses=?,deductions=?,status=?,paid_at=?,notes=? WHERE id=?',
      [base_salary||0, bonuses||0, deductions||0, status||'Rascunho', paid_at||null, notes||null, Number(req.params.id)]);
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete('/financeiro/payroll/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM payroll WHERE id=?', [Number(req.params.id)]);
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

// ── FÉRIAS ────────────────────────────────────────────────────────────────────

router.get('/financeiro/vacations', async (req, res) => {
  try {
    const db = await getDb();
    const { emp } = req.query as Record<string,string>;
    let sql = `SELECT v.*, e.full_name, e.department, e.role FROM employee_vacations v JOIN employees e ON e.id=v.employee_id WHERE 1=1`;
    const params: any[] = [];
    if (emp) { sql += ' AND v.employee_id=?'; params.push(Number(emp)); }
    sql += ' ORDER BY v.start_date DESC';
    res.json({ success:true, vacations: await db.all(sql, params) });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

// Helper: calcula end_date = start_date + (days - 1)
function calcVacEnd(startDate: string, days: number): string {
  const d = new Date(startDate + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + (days || 30) - 1);
  return d.toISOString().slice(0, 10);
}

router.post('/financeiro/vacations', async (req, res) => {
  try {
    const f = req.body;
    if (!f.employee_id || !f.start_date) {
      return res.status(400).json({ success:false, error:'employee_id e start_date são obrigatórios.' });
    }
    const days = Number(f.days_requested) || 30;
    const end_date = calcVacEnd(f.start_date, days);
    const db = await getDb();
    const r = await db.run(
      `INSERT INTO employee_vacations
        (employee_id, days_requested, start_date, end_date,
         has_pecuniary, pecuniary_days,
         has_advance_13, has_salary_advance, salary_advance_value,
         acquisition_start, acquisition_end,
         status, approved_by, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        f.employee_id, days, f.start_date, end_date,
        f.has_pecuniary?1:0, Number(f.pecuniary_days)||0,
        f.has_advance_13?1:0, f.has_salary_advance?1:0, Number(f.salary_advance_value)||0,
        f.acquisition_start||null, f.acquisition_end||null,
        f.status||'Solicitado', f.approved_by||null, f.notes||null
      ]
    );
    res.json({ success:true, id:r.lastID });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.put('/financeiro/vacations/:id', async (req, res) => {
  try {
    const f = req.body;
    const days = Number(f.days_requested) || 30;
    const end_date = calcVacEnd(f.start_date, days);
    const db = await getDb();
    await db.run(
      `UPDATE employee_vacations SET
        days_requested=?, start_date=?, end_date=?,
        has_pecuniary=?, pecuniary_days=?,
        has_advance_13=?, has_salary_advance=?, salary_advance_value=?,
        acquisition_start=?, acquisition_end=?,
        status=?, approved_by=?, notes=?
       WHERE id=?`,
      [
        days, f.start_date, end_date,
        f.has_pecuniary?1:0, Number(f.pecuniary_days)||0,
        f.has_advance_13?1:0, f.has_salary_advance?1:0, Number(f.salary_advance_value)||0,
        f.acquisition_start||null, f.acquisition_end||null,
        f.status, f.approved_by||null, f.notes||null,
        Number(req.params.id)
      ]
    );
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete('/financeiro/vacations/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM employee_vacations WHERE id=?', [Number(req.params.id)]);
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

// ── FORNECEDORES ──────────────────────────────────────────────────────────────

router.get('/financeiro/suppliers', async (req, res) => {
  try {
    const db = await getDb();
    const { search, status } = req.query as Record<string,string>;
    let sql = 'SELECT * FROM suppliers_fin WHERE 1=1';
    const params: any[] = [];
    if (status && status!=='Todos') { sql+=' AND status=?'; params.push(status); }
    if (search) { sql+=' AND (name LIKE ? OR category LIKE ? OR contact_name LIKE ?)'; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    sql+=' ORDER BY name ASC';
    res.json({ success:true, suppliers: await db.all(sql, params) });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.post('/financeiro/suppliers', async (req, res) => {
  try {
    const { name, cnpj, category, contact_name, email, phone, city, state, status, notes } = req.body;
    const db = await getDb();
    const r = await db.run('INSERT INTO suppliers_fin (name,cnpj,category,contact_name,email,phone,city,state,status,notes) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [name, cnpj||null, category||null, contact_name||null, email||null, phone||null, city||null, state||null, status||'Ativo', notes||null]);
    res.json({ success:true, id:r.lastID });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.put('/financeiro/suppliers/:id', async (req, res) => {
  try {
    const { name, cnpj, category, contact_name, email, phone, city, state, status, notes } = req.body;
    const db = await getDb();
    await db.run('UPDATE suppliers_fin SET name=?,cnpj=?,category=?,contact_name=?,email=?,phone=?,city=?,state=?,status=?,notes=? WHERE id=?',
      [name, cnpj||null, category||null, contact_name||null, email||null, phone||null, city||null, state||null, status||'Ativo', notes||null, Number(req.params.id)]);
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete('/financeiro/suppliers/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM suppliers_fin WHERE id=?', [Number(req.params.id)]);
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

// ── ESTOQUE ───────────────────────────────────────────────────────────────────

router.get('/financeiro/stock', async (req, res) => {
  try {
    const db = await getDb();
    const { search, category } = req.query as Record<string,string>;
    let sql = 'SELECT s.*, sf.name as supplier_name FROM stock_items s LEFT JOIN suppliers_fin sf ON sf.id=s.supplier_id WHERE 1=1';
    const params: any[] = [];
    if (category && category!=='Todos') { sql+=' AND s.category=?'; params.push(category); }
    if (search) { sql+=' AND (s.name LIKE ? OR s.category LIKE ?)'; params.push(`%${search}%`,`%${search}%`); }
    sql+=' ORDER BY s.category, s.name';
    const items = await db.all(sql, params);
    const lowStock = items.filter((i:any) => Number(i.quantity) <= Number(i.min_quantity) && Number(i.min_quantity) > 0);
    res.json({ success:true, items, low_stock: lowStock });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.post('/financeiro/stock', async (req, res) => {
  try {
    const { name, category, unit, quantity, min_quantity, location, supplier_id, unit_cost, notes } = req.body;
    const db = await getDb();
    const r = await db.run('INSERT INTO stock_items (name,category,unit,quantity,min_quantity,location,supplier_id,unit_cost,notes) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, category||null, unit||null, quantity||0, min_quantity||0, location||null, supplier_id||null, unit_cost||null, notes||null]);
    res.json({ success:true, id:r.lastID });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.put('/financeiro/stock/:id', async (req, res) => {
  try {
    const { name, category, unit, quantity, min_quantity, location, supplier_id, unit_cost, notes } = req.body;
    const db = await getDb();
    await db.run('UPDATE stock_items SET name=?,category=?,unit=?,quantity=?,min_quantity=?,location=?,supplier_id=?,unit_cost=?,notes=? WHERE id=?',
      [name, category||null, unit||null, quantity||0, min_quantity||0, location||null, supplier_id||null, unit_cost||null, notes||null, Number(req.params.id)]);
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

// Movimentação de estoque
router.post('/financeiro/stock/:id/move', async (req, res) => {
  try {
    const { type, quantity, reason, user_name } = req.body;
    const db = await getDb();
    await db.run('INSERT INTO stock_movements (item_id,type,quantity,reason,user_name) VALUES (?,?,?,?,?)',
      [Number(req.params.id), type, Math.abs(quantity), reason||null, user_name||null]);
    const delta = type === 'Entrada' ? Math.abs(quantity) : -Math.abs(quantity);
    await db.run('UPDATE stock_items SET quantity = quantity + ? WHERE id=?', [delta, Number(req.params.id)]);
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete('/financeiro/stock/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM stock_movements WHERE item_id=?', [Number(req.params.id)]);
    await db.run('DELETE FROM stock_items WHERE id=?', [Number(req.params.id)]);
    res.json({ success:true });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

export default router;
