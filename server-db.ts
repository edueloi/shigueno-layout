import mysql from 'mysql2/promise';

// ── Pool de conexões MySQL ─────────────────────────────────────────────────────
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host:              process.env.DB_HOST || 'localhost',
      user:              process.env.DB_USER || 'root',
      password:          process.env.DB_PASS || 'Edu@06051992',
      database:          process.env.DB_NAME || 'shigueno_data',
      charset:           'utf8mb4',
      waitForConnections: true,
      connectionLimit:   10,
    });
    pool.on('connection', () => console.log('MySQL pool connection established'));
  }
  return pool;
}

async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const rows = await query<T>(sql, params);
  return rows[0];
}

async function execute(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  const [result] = await getPool().execute(sql, params) as any;
  return { lastID: result.insertId || 0, changes: result.affectedRows || 0 };
}

// ── Interface pública (compatível com o restante das rotas) ───────────────────

export interface CustomDb {
  exec(sql: string): Promise<void>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;

  // Blog
  getBlogPosts(): Promise<any[]>;
  getBlogCategories(): Promise<any[]>;
  getBlogAuthors(): Promise<any[]>;
  saveBlogPost(post: any): Promise<any>;
  incrementPostViews(id: number): Promise<void>;
  deleteBlogPost(id: number): Promise<boolean>;
  saveBlogAuthor(author: any): Promise<any>;
  deleteBlogAuthor(id: number): Promise<boolean>;
  saveBlogCategory(cat: any): Promise<any>;
  deleteBlogCategory(id: number): Promise<boolean>;

  // Integration API
  getIntegrationClient(apiKey: string): Promise<IntegrationClient | undefined>;
  createIntegrationClient(data: { name: string; api_key: string }): Promise<IntegrationClient>;
  listIntegrationClients(): Promise<IntegrationClient[]>;
  toggleIntegrationClient(id: number, active: boolean): Promise<boolean>;
  getIntegrationVacancies(clientId: number): Promise<any[]>;
  upsertIntegrationVacancy(data: any): Promise<any>;
  getIntegrationVacancyByExternalId(clientId: number, externalId: string): Promise<any | undefined>;
  getIntegrationCandidates(clientId: number): Promise<any[]>;
  upsertIntegrationCandidate(data: any): Promise<any>;
  updateIntegrationCandidateStatus(clientId: number, externalId: string, status: string): Promise<any | undefined>;
}

export interface IntegrationClient {
  id: number;
  name: string;
  api_key: string;
  active: boolean;
  created_at: string;
}

// ── Implementação ─────────────────────────────────────────────────────────────

class MySqlDb implements CustomDb {

  // Compatibilidade com as rotas que usam SQL string direto
  async exec(_sql: string): Promise<void> { /* no-op */ }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return queryOne<T>(this._toMySQL(sql), params);
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return query<T>(this._toMySQL(sql), params);
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return execute(this._toMySQL(sql), params);
  }

  // Converte dialeto SQLite → MySQL (compatibilidade legado)
  private _toMySQL(sql: string): string {
    return sql
      .replace(/ON CONFLICT\s*\([^)]+\)\s*DO UPDATE SET\s+value\s*=\s*excluded\.value/gi,
               'ON DUPLICATE KEY UPDATE value = VALUES(value)')
      .replace(/\bINSERT OR REPLACE\b/gi, 'REPLACE')
      .replace(/\bINSERT OR IGNORE\b/gi, 'INSERT IGNORE')
      .replace(/CURRENT_TIMESTAMP/g, 'NOW()')
      .replace(/datetime\('now'\)/gi, 'NOW()')
      .replace(/candidates_ai/g, 'candidates'); // ai_analysis está na tabela candidates
  }

  // ── Blog ─────────────────────────────────────────────────────────────────────

  async getBlogPosts(): Promise<any[]> {
    return query('SELECT * FROM blog_posts ORDER BY created_at DESC');
  }

  async getBlogCategories(): Promise<any[]> {
    return query('SELECT * FROM blog_categories ORDER BY id ASC');
  }

  async getBlogAuthors(): Promise<any[]> {
    return query('SELECT * FROM blog_authors ORDER BY id ASC');
  }

  async saveBlogPost(post: any): Promise<any> {
    if (post.id) {
      await execute(
        `UPDATE blog_posts SET title=?, slug=?, excerpt=?, content=?, image_url=?, category_id=?, author_id=?,
         status=?, views=?, published_at=?, is_featured=?, tags=?, updated_at=NOW() WHERE id=?`,
        [post.title, post.slug, post.excerpt||null, post.content||null, post.image_url||null,
         post.category_id||null, post.author_id||null, post.status||'Rascunho',
         post.views||0, post.published_at||null, post.is_featured?1:0, post.tags||null, post.id]
      );
      return post;
    }
    const r = await execute(
      `INSERT INTO blog_posts (title, slug, excerpt, content, image_url, category_id, author_id, status, views, published_at, is_featured, tags)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [post.title, post.slug, post.excerpt||null, post.content||null, post.image_url||null,
       post.category_id||null, post.author_id||null, post.status||'Rascunho',
       0, post.published_at||null, post.is_featured?1:0, post.tags||null]
    );
    post.id = r.lastID;
    post.views = 0;
    return post;
  }

  async incrementPostViews(id: number): Promise<void> {
    await execute('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [id]);
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const r = await execute('DELETE FROM blog_posts WHERE id = ?', [id]);
    return r.changes > 0;
  }

  async saveBlogAuthor(author: any): Promise<any> {
    if (author.id) {
      await execute(
        'UPDATE blog_authors SET name=?, role=?, bio=?, instagram=?, avatar_url=? WHERE id=?',
        [author.name, author.role||null, author.bio||null, author.instagram||null, author.avatar_url||null, author.id]
      );
      return author;
    }
    const r = await execute(
      'INSERT INTO blog_authors (name, role, bio, instagram, avatar_url) VALUES (?,?,?,?,?)',
      [author.name, author.role||null, author.bio||null, author.instagram||null, author.avatar_url||null]
    );
    author.id = r.lastID;
    return author;
  }

  async deleteBlogAuthor(id: number): Promise<boolean> {
    const r = await execute('DELETE FROM blog_authors WHERE id = ?', [id]);
    return r.changes > 0;
  }

  async saveBlogCategory(cat: any): Promise<any> {
    if (cat.id) {
      await execute('UPDATE blog_categories SET name=?, description=? WHERE id=?', [cat.name, cat.description||null, cat.id]);
      return cat;
    }
    const r = await execute('INSERT INTO blog_categories (name, description) VALUES (?,?)', [cat.name, cat.description||null]);
    cat.id = r.lastID;
    return cat;
  }

  async deleteBlogCategory(id: number): Promise<boolean> {
    const r = await execute('DELETE FROM blog_categories WHERE id = ?', [id]);
    return r.changes > 0;
  }

  // ── Integration API ───────────────────────────────────────────────────────────

  async getIntegrationClient(apiKey: string): Promise<IntegrationClient | undefined> {
    return queryOne<IntegrationClient>('SELECT * FROM integration_clients WHERE api_key = ?', [apiKey]);
  }

  async createIntegrationClient(data: { name: string; api_key: string }): Promise<IntegrationClient> {
    const r = await execute('INSERT INTO integration_clients (name, api_key, active) VALUES (?,?,1)', [data.name, data.api_key]);
    return { id: r.lastID, name: data.name, api_key: data.api_key, active: true, created_at: new Date().toISOString() };
  }

  async listIntegrationClients(): Promise<IntegrationClient[]> {
    return query<IntegrationClient>('SELECT * FROM integration_clients ORDER BY id DESC');
  }

  async toggleIntegrationClient(id: number, active: boolean): Promise<boolean> {
    const r = await execute('UPDATE integration_clients SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
    return r.changes > 0;
  }

  async getIntegrationVacancies(clientId: number): Promise<any[]> {
    return query('SELECT * FROM integration_vacancies WHERE client_id = ? ORDER BY id DESC', [clientId]);
  }

  async getIntegrationVacancyByExternalId(clientId: number, externalId: string): Promise<any | undefined> {
    return queryOne('SELECT * FROM integration_vacancies WHERE client_id = ? AND external_id = ?', [clientId, externalId]);
  }

  async upsertIntegrationVacancy(data: any): Promise<any> {
    if (data.external_id) {
      const existing = await this.getIntegrationVacancyByExternalId(data.client_id, data.external_id);
      if (existing) {
        await execute(
          'UPDATE integration_vacancies SET title=?, department=?, description=?, location=?, requirements=?, status=?, updated_at=NOW() WHERE id=?',
          [data.title, data.department||null, data.description||null, data.location||null, data.requirements||null, data.status||'Ativa', existing.id]
        );
        return { ...existing, ...data };
      }
    }
    const r = await execute(
      'INSERT INTO integration_vacancies (client_id, external_id, title, department, description, location, requirements, status) VALUES (?,?,?,?,?,?,?,?)',
      [data.client_id, data.external_id||null, data.title, data.department||null, data.description||null, data.location||null, data.requirements||null, data.status||'Ativa']
    );
    return { ...data, id: r.lastID };
  }

  async getIntegrationCandidates(clientId: number): Promise<any[]> {
    return query('SELECT * FROM integration_candidates WHERE client_id = ? ORDER BY id DESC', [clientId]);
  }

  async upsertIntegrationCandidate(data: any): Promise<any> {
    if (data.external_id) {
      const existing = await queryOne('SELECT * FROM integration_candidates WHERE client_id = ? AND external_id = ?', [data.client_id, data.external_id]);
      if (existing) {
        await execute(
          'UPDATE integration_candidates SET name=?, email=?, phone=?, vacancy_id=?, cv_text=?, status=?, updated_at=NOW() WHERE id=?',
          [data.name, data.email, data.phone||null, data.vacancy_id||null, data.cv_text||null, data.status||'Novo', (existing as any).id]
        );
        return { ...existing, ...data };
      }
    }
    const r = await execute(
      'INSERT INTO integration_candidates (client_id, external_id, name, email, phone, vacancy_id, cv_text, applied_at, status) VALUES (?,?,?,?,?,?,?,?,?)',
      [data.client_id, data.external_id||null, data.name, data.email, data.phone||null, data.vacancy_id||null, data.cv_text||null, data.applied_at||new Date().toISOString(), data.status||'Novo']
    );
    return { ...data, id: r.lastID };
  }

  async updateIntegrationCandidateStatus(clientId: number, externalId: string, status: string): Promise<any | undefined> {
    const existing = await queryOne('SELECT * FROM integration_candidates WHERE client_id = ? AND external_id = ?', [clientId, externalId]);
    if (!existing) return undefined;
    await execute('UPDATE integration_candidates SET status = ?, updated_at = NOW() WHERE id = ?', [status, (existing as any).id]);
    return { ...existing, status };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

const dbInstance = new MySqlDb();

export async function getDb(): Promise<CustomDb> {
  return dbInstance;
}

// Funções de blog exportadas diretamente (compatibilidade com rotas que importam separado)
export async function getBlogPosts()                { return dbInstance.getBlogPosts(); }
export async function getBlogCategories()           { return dbInstance.getBlogCategories(); }
export async function getBlogAuthors()              { return dbInstance.getBlogAuthors(); }
export async function saveBlogPost(post: any)       { return dbInstance.saveBlogPost(post); }
export async function incrementPostViews(id: number){ return dbInstance.incrementPostViews(id); }
export async function deleteBlogPost(id: number)    { return dbInstance.deleteBlogPost(id); }
export async function saveBlogAuthor(author: any)   { return dbInstance.saveBlogAuthor(author); }
export async function deleteBlogAuthor(id: number)  { return dbInstance.deleteBlogAuthor(id); }
export async function saveBlogCategory(cat: any)    { return dbInstance.saveBlogCategory(cat); }
export async function deleteBlogCategory(id: number){ return dbInstance.deleteBlogCategory(id); }
