import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Middlewares
import { requestLogger } from './server/middlewares/logger.middleware';
import { authMiddleware } from './server/middlewares/auth.middleware';

// Routes
import siteSettingsRouter from './server/routes/siteSettings.routes';
import authRouter from './server/routes/auth.routes';
import vacanciesRouter from './server/routes/vacancies.routes';
import candidatesRouter from './server/routes/candidates.routes';
import suppliersRouter from './server/routes/suppliers.routes';
import dashboardRouter, { ensureProductionTable } from './server/routes/dashboard.routes';
import routesRouter from './server/routes/routes.routes';
import blogRouter from './server/routes/blog.routes';
import activitiesRouter from './server/routes/activities.routes';
import chatbotRouter from './server/routes/chatbot.routes';
import integrationRouter from './server/routes/integration.routes';
import integrationAdminRouter from './server/routes/integration-admin.routes';
import rhVisionPushRouter from './server/routes/rh-vision-push.routes';
import permissionsRouter from './server/routes/permissions.routes';
import boardsRouter from './server/routes/boards.routes';
import userPreferencesRouter, { ensureUserPreferencesTable } from './server/routes/user-preferences.routes';
import employeesRouter, { ensureEmployeesTable } from './server/routes/employees.routes';
import financeiroRouter, { ensureFinanceiroTables } from './server/routes/financeiro.routes';
import recruitmentRouter, { ensureRecruitmentTables } from './server/routes/recruitment.routes';
import onboardingRouter from './server/routes/onboarding.routes';

async function startServer() {
  const app = express();
  const PORT = 3008;

  // Garante tabelas opcionais existam antes de servir
  try {
    await ensureProductionTable();
    await ensureUserPreferencesTable();
    await ensureEmployeesTable();
    await ensureFinanceiroTables();
    await ensureRecruitmentTables();
    console.log('Tabelas auxiliares verificadas/criadas com sucesso.');
  } catch (e) {
    console.warn('Aviso ao verificar tabelas auxiliares:', e);
  }

  // Global request logging middleware
  app.use(requestLogger);

  // Serve local images folder
  app.use('/images', express.static(path.join(process.cwd(), 'images')));

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Apply authentication checker to secure state mutations on the API
  app.use('/api', authMiddleware);

  // --- API ROUTE MOUNTING ---
  // RH Vision webhook ANTES de qualquer middleware de autenticação por API Key
  app.use('/api', rhVisionPushRouter);
  app.use('/api', siteSettingsRouter);
  app.use('/api', authRouter);
  app.use('/api', vacanciesRouter);
  app.use('/api', candidatesRouter);
  app.use('/api', suppliersRouter);
  app.use('/api', dashboardRouter);
  app.use('/api', routesRouter);
  app.use('/api', blogRouter);
  app.use('/api', activitiesRouter);
  app.use('/api', boardsRouter);
  app.use('/api', permissionsRouter);
  app.use('/api', userPreferencesRouter);
  app.use('/api', employeesRouter);
  app.use('/api', financeiroRouter);
  app.use('/api', recruitmentRouter);
  app.use('/api', onboardingRouter);
  app.use('/api', chatbotRouter);
  // integrationRouter usa router.use(apiKeyMiddleware) sem path — deve ser montado com prefix /api/integration
  app.use('/api/integration', integrationRouter);
  app.use('/api', integrationAdminRouter);

  // Image proxy route for Sr. Haruo Shigueno's original image (avoids Mixed Content HTTP block in browser HTTPS iframe)
  app.get('/api/haruo-image', async (req, res) => {
    try {
      const response = await fetch('http://www.shigueno.com.br/img/haruo.jpg', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/jpeg,image/png,image/*;q=0.8'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to load image from original server: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86450');
      res.send(buffer);
    } catch (error) {
      console.warn('Could not load Haruo Shigueno original photo over http proxy, redirecting to safe placeholder.', error);
      res.redirect('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80');
    }
  });

  // --- VITE WEB MIDDLEWARE OR STATIC ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shigueno full-stack modular server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
