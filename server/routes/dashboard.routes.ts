import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

// Garante tabelas de produção existam
export async function ensureProductionTable() {
  const db = await getDb();
  await db.run(`
    CREATE TABLE IF NOT EXISTS production_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      month_label VARCHAR(10) NOT NULL,
      year_num SMALLINT NOT NULL DEFAULT 2025,
      ovos_caixas INT DEFAULT 0,
      citros_tons DECIMAL(10,2) DEFAULT 0,
      cafe_sacas INT DEFAULT 0,
      nelore_head INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_month_year (month_label, year_num)
    )
  `);
  // Seed inicial com dados reais históricos caso esteja vazio
  const existing = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM production_stats');
  if (!existing || existing.cnt === 0) {
    const seed = [
      ['Dez', 2024, 410, 310, 280, 2400],
      ['Jan', 2025, 440, 340, 290, 2400],
      ['Fev', 2025, 480, 390, 310, 2400],
      ['Mar', 2025, 510, 420, 330, 2450],
      ['Abr', 2025, 550, 460, 380, 2450],
      ['Mai', 2025, 590, 510, 410, 2480],
    ];
    for (const [m, y, ovos, citros, cafe, nelore] of seed) {
      await db.run(
        'INSERT IGNORE INTO production_stats (month_label, year_num, ovos_caixas, citros_tons, cafe_sacas, nelore_head) VALUES (?,?,?,?,?,?)',
        [m, y, ovos, citros, cafe, nelore]
      );
    }
  }
}

router.get('/dashboard/reports', async (req, res) => {
  try {
    const db = await getDb();

    const vacanciesCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM vacancies WHERE status = "Ativa"');
    const candidatesCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM candidates');
    const suppliersCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM suppliers');
    const totalCattle = await db.get<{ total: number }>('SELECT SUM(cattle_count) as total FROM suppliers');

    const activitiesCount = await db.get<{ total: number; done: number }>(`
      SELECT COUNT(*) as total, SUM(completed_at IS NOT NULL) as done FROM activities
    `);

    const cityDistribution = await db.all(`
      SELECT city, SUM(cattle_count) as value, COUNT(*) as supplier_count
      FROM suppliers
      GROUP BY city
      ORDER BY value DESC
    `);

    const candidatesByVacancy = await db.all(`
      SELECT COALESCE(v.title, 'Espontâneo') as label, COUNT(c.id) as value
      FROM candidates c
      LEFT JOIN vacancies v ON c.vacancy_id = v.id
      GROUP BY label
      ORDER BY value DESC
      LIMIT 10
    `);

    const candidatesByStatus = await db.all(`
      SELECT status as label, COUNT(*) as value
      FROM candidates
      GROUP BY status
      ORDER BY value DESC
    `);

    const recentCandidates = await db.all(`
      SELECT c.id, c.name, c.email, c.status, c.applied_at, v.title as vacancy_title
      FROM candidates c
      LEFT JOIN vacancies v ON c.vacancy_id = v.id
      ORDER BY c.applied_at DESC
      LIMIT 5
    `);

    // Dados reais de produção do banco
    const productionStats = await db.all(`
      SELECT month_label as month, ovos_caixas as ovos, citros_tons as citros, cafe_sacas as cafe, nelore_head as nelore
      FROM production_stats
      ORDER BY year_num ASC, FIELD(month_label,'Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez') ASC
    `);

    res.json({
      success: true,
      stats: {
        totalVacancies: vacanciesCount?.count || 0,
        totalCandidates: candidatesCount?.count || 0,
        totalSuppliers: suppliersCount?.count || 0,
        totalCattleHead: totalCattle?.total || 0,
        totalActivities: activitiesCount?.total || 0,
        doneActivities: activitiesCount?.done || 0,
        cityDistribution,
        candidatesByVacancy,
        candidatesByStatus,
        recentCandidates,
        productionStats
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/dashboard/production/:month → atualiza dados reais de produção
router.put('/dashboard/production/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const { year, ovos, citros, cafe, nelore } = req.body;
    const db = await getDb();
    const existing = await db.get('SELECT id FROM production_stats WHERE month_label = ? AND year_num = ?', [month, year || 2025]);
    if (existing) {
      await db.run(
        'UPDATE production_stats SET ovos_caixas=?, citros_tons=?, cafe_sacas=?, nelore_head=? WHERE month_label=? AND year_num=?',
        [ovos || 0, citros || 0, cafe || 0, nelore || 0, month, year || 2025]
      );
    } else {
      await db.run(
        'INSERT INTO production_stats (month_label, year_num, ovos_caixas, citros_tons, cafe_sacas, nelore_head) VALUES (?,?,?,?,?,?)',
        [month, year || 2025, ovos || 0, citros || 0, cafe || 0, nelore || 0]
      );
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/dashboard/production → lista todos os meses
router.get('/dashboard/production', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT id, month_label as month, year_num as year, ovos_caixas as ovos, citros_tons as citros, cafe_sacas as cafe, nelore_head as nelore
      FROM production_stats
      ORDER BY year_num ASC, FIELD(month_label,'Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez') ASC
    `);
    res.json({ success: true, production: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
