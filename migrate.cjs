// migrate.js — Migra o Shigueno para MySQL
// Uso: nvs use 22 && node migrate.js
// Cria o banco shigueno_data, todas as tabelas e insere os dados iniciais.

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || 'Edu@06051992';
const DB_NAME = process.env.DB_NAME || 'shigueno_data';

// ── Helpers ───────────────────────────────────────────────────────────────────
function ok(msg)   { console.log(`  \x1b[32m✔\x1b[0m  ${msg}`); }
function info(msg) { console.log(`  \x1b[36m→\x1b[0m  ${msg}`); }
function warn(msg) { console.log(`  \x1b[33m⚠\x1b[0m  ${msg}`); }

async function run() {
  // 1. Conecta sem banco para criar o schema
  const root = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS });
  info(`Conectado ao MySQL como ${DB_USER}@${DB_HOST}`);

  await root.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  ok(`Banco \`${DB_NAME}\` garantido`);
  await root.end();

  // 2. Conecta no banco criado
  const db = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS, database: DB_NAME, multipleStatements: true });
  info(`Usando banco \`${DB_NAME}\``);

  // ── DDL ─────────────────────────────────────────────────────────────────────
  console.log('\n  Criando tabelas...');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      username   VARCHAR(100) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      name       VARCHAR(255) NOT NULL,
      role       VARCHAR(50)  NOT NULL DEFAULT 'admin',
      created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('users');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS vacancies (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      title        VARCHAR(255) NOT NULL,
      department   VARCHAR(100),
      description  LONGTEXT,
      location     VARCHAR(255),
      requirements LONGTEXT,
      status       VARCHAR(50)  NOT NULL DEFAULT 'Ativa',
      created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('vacancies');

  // Colunas extras de vacancies — idempotente (catch ignora se já existir)
  const vacancyCols = [
    `ALTER TABLE vacancies ADD COLUMN hierarchy_level INT DEFAULT NULL`,
    `ALTER TABLE vacancies ADD COLUMN contract_type VARCHAR(50) DEFAULT NULL`,
    `ALTER TABLE vacancies ADD COLUMN salary_range VARCHAR(100) DEFAULT NULL`,
    `ALTER TABLE vacancies ADD COLUMN openings INT DEFAULT 1`,
  ];
  for (const col of vacancyCols) {
    try { await db.execute(col); } catch(e) { /* coluna já existe */ }
  }
  ok('vacancies columns');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS candidates (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      email        VARCHAR(255) NOT NULL,
      phone        VARCHAR(50),
      vacancy_id   INT          DEFAULT NULL,
      cv_text      LONGTEXT,
      applied_at   DATETIME     NOT NULL,
      status       VARCHAR(50)  NOT NULL DEFAULT 'Novo',
      ai_analysis  JSON,
      cv_file_path VARCHAR(500),
      cv_filename  VARCHAR(255),
      created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('candidates');

  // Colunas adicionadas após a criação inicial — ADD COLUMN IF NOT EXISTS é idempotente no MySQL 8+
  const candidateCols = [
    `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS uid VARCHAR(36) DEFAULT NULL`,
    `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT NULL`,
    `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS salary_expectation VARCHAR(100) DEFAULT NULL`,
    `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS availability VARCHAR(100) DEFAULT NULL`,
    `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT NULL`,
    `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS recruiter_rating INT DEFAULT NULL`,
  ];
  for (const col of candidateCols) {
    try { await db.execute(col); } catch(e) { /* coluna já existe */ }
  }
  ok('candidates columns');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(255) NOT NULL,
      city          VARCHAR(100),
      phone         VARCHAR(50),
      cattle_count  INT          DEFAULT 0,
      cattle_breed  VARCHAR(100),
      status        VARCHAR(50)  NOT NULL DEFAULT 'Ativo',
      last_delivery DATE,
      created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('suppliers');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      \`key\`      VARCHAR(100) NOT NULL PRIMARY KEY,
      value        LONGTEXT     NOT NULL,
      updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('site_settings');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS routes (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      driver_name          VARCHAR(255) NOT NULL,
      vehicle_plate        VARCHAR(20)  NOT NULL,
      vehicle_type         VARCHAR(100),
      start_location       VARCHAR(255),
      destination          VARCHAR(255),
      status               VARCHAR(50)  NOT NULL DEFAULT 'Ativa',
      started_at           DATETIME     NOT NULL,
      completed_at         DATETIME,
      current_lat          DOUBLE       DEFAULT 0,
      current_lng          DOUBLE       DEFAULT 0,
      progress             INT          DEFAULT 0,
      speed                INT          DEFAULT 0,
      fuel_level           INT          DEFAULT 100,
      cargo_description    VARCHAR(255),
      last_event           VARCHAR(500),
      coordinates_history  JSON,
      created_at           DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at           DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('routes');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS activities (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      title            VARCHAR(255) NOT NULL,
      description      LONGTEXT,
      category         VARCHAR(100) DEFAULT 'Ações',
      sector           VARCHAR(100) DEFAULT '',
      status           VARCHAR(50)  NOT NULL DEFAULT 'A Fazer',
      priority         VARCHAR(50)  DEFAULT 'Média',
      responsible      VARCHAR(255),
      due_date         DATE,
      completed_at     DATETIME     DEFAULT NULL,
      created_by       INT          DEFAULT NULL,
      created_by_name  VARCHAR(255) DEFAULT '',
      visibility       ENUM('public','private') DEFAULT 'public',
      shared_with      JSON         DEFAULT NULL,
      board_id         INT          DEFAULT NULL,
      created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('activities');

  // ── Colunas novas de activities (idempotente — catch ignora se já existir) ──
  const addCol = (sql) => db.execute(sql).catch(() => {});
  await addCol(`ALTER TABLE activities ADD COLUMN sector VARCHAR(100) DEFAULT ''`);
  await addCol(`ALTER TABLE activities ADD COLUMN completed_at DATETIME DEFAULT NULL`);
  await addCol(`ALTER TABLE activities ADD COLUMN created_by INT DEFAULT NULL`);
  await addCol(`ALTER TABLE activities ADD COLUMN created_by_name VARCHAR(255) DEFAULT ''`);
  await addCol(`ALTER TABLE activities ADD COLUMN visibility ENUM('public','private') DEFAULT 'public'`);
  await addCol(`ALTER TABLE activities ADD COLUMN shared_with JSON DEFAULT NULL`);
  await addCol(`ALTER TABLE activities ADD COLUMN board_id INT DEFAULT NULL`);
  await addCol(`ALTER TABLE activities ADD COLUMN extra_data JSON DEFAULT NULL`);
  await addCol(`ALTER TABLE activities ADD COLUMN board_type VARCHAR(100) DEFAULT NULL`);
  ok('activities columns');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS boards (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      description  LONGTEXT,
      color        VARCHAR(50)  DEFAULT 'emerald',
      icon         VARCHAR(50)  DEFAULT 'layout-grid',
      columns_json JSON         NOT NULL,
      created_by   INT          DEFAULT NULL,
      created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('boards');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_permissions (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      user_id              INT NOT NULL UNIQUE,
      can_view_reports     TINYINT(1) NOT NULL DEFAULT 1,
      can_view_activities  TINYINT(1) NOT NULL DEFAULT 1,
      can_view_tracking    TINYINT(1) NOT NULL DEFAULT 0,
      can_view_blog        TINYINT(1) NOT NULL DEFAULT 0,
      can_view_vacancies   TINYINT(1) NOT NULL DEFAULT 1,
      can_view_candidates  TINYINT(1) NOT NULL DEFAULT 0,
      can_view_settings    TINYINT(1) NOT NULL DEFAULT 0,
      can_edit_activities  TINYINT(1) NOT NULL DEFAULT 0,
      can_edit_vacancies   TINYINT(1) NOT NULL DEFAULT 0,
      can_edit_candidates  TINYINT(1) NOT NULL DEFAULT 0,
      can_edit_blog        TINYINT(1) NOT NULL DEFAULT 0,
      can_edit_tracking    TINYINT(1) NOT NULL DEFAULT 0,
      can_edit_settings    TINYINT(1) NOT NULL DEFAULT 0,
      updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('user_permissions');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS blog_categories (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      description LONGTEXT,
      created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('blog_categories');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS blog_authors (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      role        VARCHAR(100),
      bio         LONGTEXT,
      instagram   VARCHAR(100),
      avatar_url  LONGTEXT,
      created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('blog_authors');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      title        VARCHAR(500) NOT NULL,
      slug         VARCHAR(500) NOT NULL UNIQUE,
      excerpt      LONGTEXT,
      content      LONGTEXT,
      image_url    LONGTEXT,
      category_id  INT,
      author_id    INT,
      status       VARCHAR(50)  NOT NULL DEFAULT 'Rascunho',
      views        INT          DEFAULT 0,
      published_at DATETIME,
      is_featured  TINYINT(1)   DEFAULT 0,
      tags         LONGTEXT,
      created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
      FOREIGN KEY (author_id)   REFERENCES blog_authors(id)    ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('blog_posts');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS integration_clients (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      api_key    VARCHAR(100) NOT NULL UNIQUE,
      active     TINYINT(1)   NOT NULL DEFAULT 1,
      created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('integration_clients');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS integration_vacancies (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      client_id   INT          NOT NULL,
      external_id VARCHAR(255),
      title       VARCHAR(255) NOT NULL,
      department  VARCHAR(100),
      description LONGTEXT,
      location    VARCHAR(255),
      requirements LONGTEXT,
      status      VARCHAR(50)  NOT NULL DEFAULT 'Ativa',
      created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_external (client_id, external_id),
      FOREIGN KEY (client_id) REFERENCES integration_clients(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('integration_vacancies');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS integration_candidates (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      client_id   INT          NOT NULL,
      external_id VARCHAR(255),
      name        VARCHAR(255) NOT NULL,
      email       VARCHAR(255) NOT NULL,
      phone       VARCHAR(50),
      vacancy_id  INT,
      cv_text     LONGTEXT,
      applied_at  DATETIME,
      status      VARCHAR(50)  NOT NULL DEFAULT 'Novo',
      created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_ext_cand (client_id, external_id),
      FOREIGN KEY (client_id) REFERENCES integration_clients(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('integration_candidates');

  // ── Tabelas de recrutamento ───────────────────────────────────────────────────

  await db.execute(`
    CREATE TABLE IF NOT EXISTS candidate_interviews (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id  INT          NOT NULL,
      vacancy_id    INT          DEFAULT NULL,
      interviewer   VARCHAR(255) NOT NULL,
      scheduled_at  DATETIME     NOT NULL,
      duration_min  INT          DEFAULT 60,
      type          VARCHAR(100) DEFAULT 'Entrevista RH',
      location      VARCHAR(255) DEFAULT NULL,
      status        VARCHAR(50)  DEFAULT 'Agendada',
      result        VARCHAR(100) DEFAULT '—',
      score         INT          DEFAULT NULL,
      notes         LONGTEXT,
      created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('candidate_interviews');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS candidate_evaluations (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id         INT          NOT NULL,
      vacancy_id           INT          DEFAULT NULL,
      evaluator            VARCHAR(255) NOT NULL,
      evaluation_date      DATE         NOT NULL,
      type                 VARCHAR(100) DEFAULT 'Competências',
      score_technical      INT          DEFAULT 0,
      score_communication  INT          DEFAULT 0,
      score_attitude       INT          DEFAULT 0,
      score_experience     INT          DEFAULT 0,
      score_cultural_fit   INT          DEFAULT 0,
      strengths            LONGTEXT,
      weaknesses           LONGTEXT,
      recommendation       VARCHAR(100) DEFAULT 'Aguardar',
      notes                LONGTEXT,
      created_at           DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at           DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('candidate_evaluations');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS candidate_observations (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id  INT          NOT NULL,
      author        VARCHAR(255) NOT NULL,
      type          VARCHAR(100) DEFAULT 'Observação',
      content       LONGTEXT     NOT NULL,
      is_private    TINYINT(1)   DEFAULT 0,
      created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('candidate_observations');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS candidate_referrals (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id  INT          NOT NULL,
      vacancy_id    INT          DEFAULT NULL,
      type          VARCHAR(100) DEFAULT 'Outro',
      description   LONGTEXT     NOT NULL,
      deadline      DATE         DEFAULT NULL,
      status        VARCHAR(50)  DEFAULT 'Pendente',
      assigned_to   VARCHAR(255) DEFAULT NULL,
      notes         LONGTEXT,
      created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('candidate_referrals');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS candidate_onboarding (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id  INT          NOT NULL UNIQUE,
      employee_id   INT          DEFAULT NULL,
      status        VARCHAR(50)  DEFAULT 'Pendente',
      start_date    DATE         DEFAULT NULL,
      hired_date    DATE         DEFAULT NULL,
      department    VARCHAR(100) DEFAULT NULL,
      role          VARCHAR(255) DEFAULT NULL,
      manager_id    INT          DEFAULT NULL,
      salary        DECIMAL(10,2) DEFAULT NULL,
      notes         LONGTEXT,
      created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('candidate_onboarding');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS onboarding_items (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      onboarding_id   INT          NOT NULL,
      category        VARCHAR(100) NOT NULL,
      item            VARCHAR(255) NOT NULL,
      description     LONGTEXT,
      required        TINYINT(1)   DEFAULT 1,
      status          VARCHAR(50)  DEFAULT 'Pendente',
      delivered_at    DATETIME     DEFAULT NULL,
      delivered_by    VARCHAR(255) DEFAULT NULL,
      notes           LONGTEXT,
      created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (onboarding_id) REFERENCES candidate_onboarding(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('onboarding_items');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS quick_notes (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      content    TEXT NOT NULL,
      color      VARCHAR(20) DEFAULT 'amber',
      is_done    TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_quick_notes_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `); ok('quick_notes');

  // ── Seed data ────────────────────────────────────────────────────────────────
  console.log('\n  Inserindo dados iniciais...');

  // Lê JSON atual para migrar dados existentes
  const jsonPath = path.join(__dirname, 'shigueno_db.json');
  let jsonData = { users:[], vacancies:[], candidates:[], suppliers:[], site_settings:[], activities:[], blog_categories:[], blog_authors:[], blog_posts:[], routes:[] };
  if (fs.existsSync(jsonPath)) {
    try { jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); info('Dados do shigueno_db.json carregados para migração'); }
    catch(e) { warn('Não foi possível ler shigueno_db.json, usando dados padrão'); }
  }

  // Users
  const users = jsonData.users?.length ? jsonData.users : [{ username: 'shigueno', password: 'shigueno2026', name: 'Gestão Shigueno', role: 'admin' }];
  for (const u of users) {
    await db.execute(`INSERT IGNORE INTO users (username, password, name, role) VALUES (?,?,?,?)`, [u.username, u.password, u.name, u.role || 'admin']);
  }
  ok(`users (${users.length})`);

  // Vacancies
  const vacancies = jsonData.vacancies?.length ? jsonData.vacancies : [];
  for (const v of vacancies) {
    await db.execute(`INSERT IGNORE INTO vacancies (id, title, department, description, location, requirements, status) VALUES (?,?,?,?,?,?,?)`,
      [v.id, v.title, v.department||null, v.description||null, v.location||null, v.requirements||null, v.status||'Ativa']);
  }
  ok(`vacancies (${vacancies.length})`);

  // Candidates
  const candidates = jsonData.candidates?.length ? jsonData.candidates : [];
  for (const c of candidates) {
    const ai = c.ai_analysis ? JSON.stringify(c.ai_analysis) : null;
    await db.execute(`INSERT IGNORE INTO candidates (id, name, email, phone, vacancy_id, cv_text, applied_at, status, ai_analysis) VALUES (?,?,?,?,?,?,?,?,?)`,
      [c.id, c.name, c.email, c.phone||null, c.vacancy_id||null, c.cv_text||null, c.applied_at, c.status||'Novo', ai]);
  }
  ok(`candidates (${candidates.length})`);

  // Suppliers
  const suppliers = jsonData.suppliers?.length ? jsonData.suppliers : [];
  for (const s of suppliers) {
    await db.execute(`INSERT IGNORE INTO suppliers (id, name, city, phone, cattle_count, cattle_breed, status, last_delivery) VALUES (?,?,?,?,?,?,?,?)`,
      [s.id, s.name, s.city||null, s.phone||null, s.cattle_count||0, s.cattle_breed||null, s.status||'Ativo', s.last_delivery||null]);
  }
  ok(`suppliers (${suppliers.length})`);

  // Site settings
  const settings = jsonData.site_settings?.length ? jsonData.site_settings : [
    { key: 'company_motto',        value: 'Uma empresa sempre preocupada com a qualidade de vida.' },
    { key: 'contact_email',        value: 'sac@shigueno.com.br' },
    { key: 'contact_phone',        value: '(15) 3259-9710' },
    { key: 'show_blog_on_menu',    value: 'true' },
  ];
  for (const s of settings) {
    await db.execute(`INSERT INTO site_settings (\`key\`, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)`, [s.key, s.value]);
  }
  ok(`site_settings (${settings.length})`);

  // Activities
  const activities = jsonData.activities?.length ? jsonData.activities : [];
  for (const a of activities) {
    await db.execute(`INSERT IGNORE INTO activities (id, title, description, category, status, priority, responsible, due_date) VALUES (?,?,?,?,?,?,?,?)`,
      [a.id, a.title, a.description||null, a.category||'Ações', a.status||'A Fazer', a.priority||'Média', a.responsible||null, a.due_date||null]);
  }
  ok(`activities (${activities.length})`);

  // Blog categories
  const cats = jsonData.blog_categories?.length ? jsonData.blog_categories : [];
  for (const c of cats) {
    await db.execute(`INSERT IGNORE INTO blog_categories (id, name, description) VALUES (?,?,?)`, [c.id, c.name, c.description||null]);
  }
  ok(`blog_categories (${cats.length})`);

  // Blog authors
  const authors = jsonData.blog_authors?.length ? jsonData.blog_authors : [];
  for (const a of authors) {
    await db.execute(`INSERT IGNORE INTO blog_authors (id, name, role, bio, instagram, avatar_url) VALUES (?,?,?,?,?,?)`,
      [a.id, a.name, a.role||null, a.bio||null, a.instagram||null, a.avatar_url||null]);
  }
  ok(`blog_authors (${authors.length})`);

  // Blog posts
  const posts = jsonData.blog_posts?.length ? jsonData.blog_posts : [];
  for (const p of posts) {
    await db.execute(`INSERT IGNORE INTO blog_posts (id, title, slug, excerpt, content, image_url, category_id, author_id, status, views, published_at, is_featured, tags) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [p.id, p.title, p.slug, p.excerpt||null, p.content||null, p.image_url||null, p.category_id||null, p.author_id||null,
       p.status||'Rascunho', p.views||0, p.published_at||null, p.is_featured?1:0, p.tags||null]);
  }
  ok(`blog_posts (${posts.length})`);

  // Routes (GPS)
  const routes = jsonData.routes?.length ? jsonData.routes : [];
  for (const r of routes) {
    const hist = r.coordinates_history ? JSON.stringify(r.coordinates_history) : null;
    await db.execute(`INSERT IGNORE INTO routes (id, driver_name, vehicle_plate, vehicle_type, start_location, destination, status, started_at, completed_at, current_lat, current_lng, progress, speed, fuel_level, cargo_description, last_event, coordinates_history) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [r.id, r.driver_name, r.vehicle_plate, r.vehicle_type||null, r.start_location||null, r.destination||null, r.status||'Ativa',
       r.started_at, r.completed_at||null, r.current_lat||0, r.current_lng||0, r.progress||0, r.speed||0, r.fuel_level||100,
       r.cargo_description||null, r.last_event||null, hist]);
  }
  ok(`routes (${routes.length})`);

  await db.end();

  console.log(`
  \x1b[32m✔ Migração concluída!\x1b[0m

  Banco: \x1b[1m${DB_NAME}\x1b[0m no MySQL (${DB_HOST})

  Próximo passo: adicione no .env do shigueno-layout:
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=Edu@06051992
    DB_NAME=shigueno_data

  Depois rode: nvs use 22 && npm run dev
`);
}

run().catch(err => {
  console.error('\n  \x1b[31m✖ Erro na migração:\x1b[0m', err.message);
  process.exit(1);
});
