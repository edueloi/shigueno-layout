import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

router.get('/dashboard/reports', async (req, res) => {
  try {
    const db = await getDb();

    // Counts
    const vacanciesCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM vacancies');
    const candidatesCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM candidates');
    const suppliersCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM suppliers');
    
    // Total cattle count
    const totalCattle = await db.get<{ total: number }>('SELECT SUM(cattle_count) as total FROM suppliers');

    // Distribution by City
    const cityDistribution = await db.all(`
      SELECT city, SUM(cattle_count) as value, COUNT(*) as supplier_count
      FROM suppliers
      GROUP BY city
      ORDER BY value DESC
    `);

    // Candidates per Vacancy count
    const candidatesByVacancy = await db.all(`
      SELECT COALESCE(v.title, 'Espontâneo') as label, COUNT(c.id) as value
      FROM candidates c
      LEFT JOIN vacancies v ON c.vacancy_id = v.id
      GROUP BY label
      ORDER BY value DESC
    `);

    // Mocked production output statistics/realtime graphs
    const productionStats = [
      { month: 'Dez', ovos: 410, citros: 310, cafe: 280 },
      { month: 'Jan', ovos: 440, citros: 340, cafe: 290 },
      { month: 'Fev', ovos: 480, citros: 390, cafe: 310 },
      { month: 'Mar', ovos: 510, citros: 420, cafe: 330 },
      { month: 'Abr', ovos: 550, citros: 460, cafe: 380 },
      { month: 'Mai', ovos: 590, citros: 510, cafe: 410 }
    ];

    res.json({
      success: true,
      stats: {
        totalVacancies: vacanciesCount?.count || 0,
        totalCandidates: candidatesCount?.count || 0,
        totalSuppliers: suppliersCount?.count || 0,
        totalCattleHead: totalCattle?.total || 0,
        cityDistribution,
        candidatesByVacancy,
        productionStats
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
