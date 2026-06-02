import fs from 'fs';
import path from 'path';

// Pure TypeScript fallback database simulating SQLite to completely avoid GLIBC native binary errors on Cloud Containers

export interface CustomDb {
  exec(sql: string): Promise<void>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
}

interface DbData {
  users: any[];
  vacancies: any[];
  candidates: any[];
  suppliers: any[];
  site_settings: { key: string; value: string }[];
  routes?: any[];
  blog_posts?: any[];
  blog_categories?: any[];
  blog_authors?: any[];
  activities?: any[];
}

const DB_FILE = path.join(process.cwd(), 'shigueno_db.json');

const nextId = (list: any[]) => {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
};

class SafeJsonDb {
  private data: DbData;

  constructor() {
    this.data = {
      users: [],
      vacancies: [],
      candidates: [],
      suppliers: [],
      site_settings: [],
      routes: [],
      blog_posts: [],
      blog_categories: [],
      blog_authors: [],
      activities: []
    };
    this.load();
    if (!this.data.routes) {
      this.data.routes = [];
    }
    if (!this.data.blog_posts) {
      this.data.blog_posts = [];
    }
    if (!this.data.blog_categories) {
      this.data.blog_categories = [];
    }
    if (!this.data.blog_authors) {
      this.data.blog_authors = [];
    }
    if (!this.data.activities) {
      this.data.activities = [];
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);

        // Ensure new structures are initialized
        if (!this.data.routes) this.data.routes = [];
        if (!this.data.blog_posts) this.data.blog_posts = [];
        if (!this.data.blog_categories) this.data.blog_categories = [];
        if (!this.data.blog_authors) this.data.blog_authors = [];
        if (!this.data.activities) this.data.activities = [];

        if (this.data.activities.length === 0) {
          this.data.activities = [
            {
              id: 1,
              title: 'Comprar ração balanceada para postura',
              description: 'Cotação de 15 toneladas de ração mineralizada com fornecedores parceiros da região de Sorocaba.',
              category: 'Compras',
              status: 'A Fazer',
              priority: 'Alta',
              responsible: 'Gisela Shigueno',
              due_date: '2026-06-10'
            },
            {
              id: 2,
              title: 'Revisar bicos de pulverização (tratores da laranja)',
              description: 'Manutenção preventiva periódica dos equipamentos de pulverização agrícola para evitar perdas.',
              category: 'Ações',
              status: 'Em Progresso',
              priority: 'Média',
              responsible: 'Haruo Jr. Shigueno',
              due_date: '2026-06-05'
            },
            {
              id: 3,
              title: 'Contratar Tratorista Especialista para Itaí',
              description: 'Processo seletivo aberto para contratação urgente de piloto de maquinário John Deere.',
              category: 'Contratações Gerais',
              status: 'Concluído',
              priority: 'Alta',
              responsible: 'RH Shigueno',
              due_date: '2026-05-28'
            },
            {
              id: 4,
              title: 'Pagamento de fornecedor de caixas/embalagens de papelão',
              description: 'Efetuar a liquidação das notas fiscais da Tecnocarton de Sorocaba sobre embalagens de ovos Shigueno.',
              category: 'Financeiro',
              status: 'A Fazer',
              priority: 'Alta',
              responsible: 'Roberto Shigueno',
              due_date: '2026-06-03'
            }
          ];
          this.save();
        }

        // Seed default blog settings and categories/authors/posts if empty
        if (!this.data.blog_categories || this.data.blog_categories.length === 0) {
          this.seedBlogDefaults();
          this.save();
        }

        console.log('Banco de dados carregado com sucesso do disco!');
        return;
      }
    } catch (e) {
      console.error('Erro ao ler banco de dados do disco, usando padrão:', e);
    }
    
    // Seed default data if file does not exist or is corrupt
    this.seedDefaults();
    this.seedBlogDefaults();
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Erro ao salvar banco de dados local:', e);
    }
  }

  private seedDefaults() {
    console.log('Semeando banco de dados com os valores originais Shigueno...');
    
    // Seed admin user
    this.data.users = [
      { id: 1, username: 'shigueno', password: 'shigueno2026', name: 'Gestão Shigueno', role: 'admin' }
    ];

    // Seed vacancies
    this.data.vacancies = [
      {
        id: 1,
        title: 'Tratorista Agrícola',
        department: 'Citricultura',
        description: 'Responsável pelo manejo de tratores e implementos nos pomares de citros, pulverização e preparação do solo na Fazenda Nova Aliança.',
        location: 'Tatuí - SP',
        requirements: 'Experiência como operador de tratores, CNH categoria C, conhecimento em manutenção preventiva de equipamentos agrícolas.',
        status: 'Ativa'
      },
      {
        id: 2,
        title: 'Auxiliar de Avicultura',
        department: 'Avicultura',
        description: 'Atuar na coleta seletiva de ovos, triagem inicial por qualidade, alimentação e verificação das instalações dos galpões de postura.',
        location: 'Tatuí - SP',
        requirements: 'Ensino fundamental completo, proatividade, disposição para trabalhar em ambiente rural e cuidado no manuseio delicado dos produtos.',
        status: 'Ativa'
      },
      {
        id: 3,
        title: 'Campeiro / Tratador de Gado Nelore',
        department: 'Agropecuária',
        description: 'Trabalhar na cria e recria do rebanho Nelore, controle de vacinação, alimentação mineral e acompanhamento sanitário nas pastagens.',
        location: 'Santo Antônio do Leverger - MT',
        requirements: 'Experiência prévia com manejo de gado de corte, conhecimento básico de medicamentos veterinários e manejo com responsabilidade.',
        status: 'Ativa'
      },
      {
        id: 4,
        title: 'Classificador de Ovos',
        department: 'Avicultura',
        description: 'Operar os maquinários de classificação eletrônica, garantindo a divisão precisa entre as classificações Super Extra (Jumbo), Extra, Grande, Médio, Pequeno e Industrial.',
        location: 'Tatuí - SP',
        requirements: 'Ensino médio completo, facilidade com painéis de controle, foco em detalhes e boas práticas de higiene alimentar.',
        status: 'Ativa'
      }
    ];

    // Seed candidates
    this.data.candidates = [
      {
        id: 1,
        name: 'José Alencar Ramos',
        email: 'jose.alencar@email.com',
        phone: '(15) 99764-5412',
        vacancy_id: 1,
        cv_text: 'Trabalho há mais de 8 anos como tratorista em fazendas de cana e laranja na região de Tatuí e Boituva. Conheço maquinários John Deere e Massey Ferguson. CNH D ativa, curso do Senar de operação de pulverizadores concluído.',
        applied_at: '2026-05-25 10:14:00',
        status: 'Em Análise'
      },
      {
        id: 2,
        name: 'Manoel Francisco da Silva',
        email: 'manoel.nelore@email.com',
        phone: '(65) 98112-4433',
        vacancy_id: 3,
        cv_text: 'Campeiro experiente nascido e criado na região do Pantanal. Sei lidar com tropa, aplicar vacinas, tratar bicheiras, marcar e apartar bezerros. Já trabalhei na Fazenda Colorado no MT cuidando de 1200 cabeças de Nelore. Tenho referências na região de Leverger.',
        applied_at: '2026-05-27 15:42:00',
        status: 'Novo'
      }
    ];

    // Seed suppliers (Mato Grosso)
    this.data.suppliers = [
      {
        id: 1,
        name: 'Fazenda Recanto Verde',
        city: 'Santo Antônio do Leverger',
        phone: '(65) 99241-1122',
        cattle_count: 420,
        cattle_breed: 'Nelore Puro',
        status: 'Ativo',
        last_delivery: '2026-04-12'
      },
      {
        id: 2,
        name: 'Estância Pantaneira',
        city: 'Poconé',
        phone: '(65) 3345-8899',
        cattle_count: 650,
        cattle_breed: 'Nelore',
        status: 'Ativo',
        last_delivery: '2026-05-02'
      },
      {
        id: 3,
        name: 'Sítio Sol Nascente',
        city: 'Santo Antônio do Leverger',
        phone: '(65) 98144-0011',
        cattle_count: 180,
        cattle_breed: 'Nelore / Cruzamento',
        status: 'Em Negociação',
        last_delivery: '2026-02-28'
      },
      {
        id: 4,
        name: 'Fazenda Três Corações',
        city: 'Rondonópolis',
        phone: '(66) 3421-5544',
        cattle_count: 850,
        cattle_breed: 'Nelore de Elite',
        status: 'Ativo',
        last_delivery: '2026-05-18'
      },
      {
        id: 5,
        name: 'Fazenda Rio Manso',
        city: 'Cuiabá',
        phone: '(65) 99988-7711',
        cattle_count: 320,
        cattle_breed: 'Nelore',
        status: 'Ativo',
        last_delivery: '2026-05-10'
      },
      {
        id: 6,
        name: 'Fazenda Novo Progresso',
        city: 'Cáceres',
        phone: '(65) 3223-9911',
        cattle_count: 510,
        cattle_breed: 'Nelore / Angus',
        status: 'Inativo',
        last_delivery: '2025-11-15'
      }
    ];

    // Seed site settings
    this.data.site_settings = [
      { key: 'company_motto', value: 'Uma empresa sempre preocupada com a qualidade de vida.' },
      { key: 'about_text_intro', value: 'O patriarca da família Shigueno, Sr. Haruo Shigueno chegou ao Brasil em 1932. Na bagagem apenas vontade e determinação.' },
      { key: 'about_text_full', value: 'A princípio se estabeleceu na cidade de Aliança, noroeste do estado de SP, onde foram praticar a cafeicultura, decepcionando-se com o descumprimento do que lhes foi prometido, voltou e estabeleceu-se em Mogi das Cruzes. Numa época em que ninguém ousava criar galinhas comercialmente, Haruo Shigueno com 18 anos, começou a importar incubatórios e produzir pintinhos, dando início na atividade de avicultura na família. Com a expansão dos negócios, os irmãos Shigueno se separaram, ficando um irmão em Mogi das Cruzes e Haruo foi para São José dos Campos. Com a desapropriação sofrida pela Granja Shigueno em São José dos Campos, voltou-se o visionário Haruo Shigueno para a cidade de Tatuí, onde por volta de 1970 começou a montar sua granja.' },
      { key: 'about_diversification', value: 'Com a produção de ovos em maior escala, surgiu o esterco das aves e porque não aproveitá-lo para a citricultura? Foi aí que se iniciou, já em 1975, quando pouco se falava em adubação orgânica, iniciou-se a fertilização da terra com o esterco das galinhas em pomares de citricultura. Posteriormente estendeu a área de citros também para Buri - SP e cafeicultura em Itaí - SP, conseguindo graças à adubação orgânica uma produtividade invejável.' },
      { key: 'contact_email', value: 'sac@shigueno.com.br' },
      { key: 'contact_phone', value: '(15) 3259-9710' }
    ];

    // Seed transport tracking routes
    this.data.routes = [
      {
        id: 1,
        driver_name: 'Ricardo N. Santos',
        vehicle_plate: 'ABC-5H40',
        vehicle_type: 'Caminhão Baú (Ovos)',
        start_location: 'Tatuí (Granja)',
        destination: 'Sorocaba (Distribuição)',
        status: 'Concluída',
        started_at: '2026-05-27 06:15:00',
        completed_at: '2026-05-27 07:45:00',
        current_lat: -23.5015,
        current_lng: -47.4522,
        progress: 100,
        speed: 0,
        fuel_level: 82,
        cargo_description: '140 caixas de Ovos Tipo Extra',
        last_event: 'Carga entregue com sucesso e comprovante assinado.',
        coordinates_history: [
          { lat: -23.3556, lng: -47.8556, time: '2026-05-27 06:15:00', speed: 0, event: 'Início da rota na Granja Shigueno' },
          { lat: -23.4120, lng: -47.7210, time: '2026-05-27 06:35:00', speed: 80, event: 'Passagem pela Rod. Senador Laurindo Dias' },
          { lat: -23.4680, lng: -47.5850, time: '2026-05-27 07:10:00', speed: 75, event: 'Pedágio Km 84' },
          { lat: -23.5015, lng: -47.4522, time: '2026-05-27 07:45:00', speed: 0, event: 'Chegada ao distribuidor Sorocaba' }
        ]
      },
      {
        id: 2,
        driver_name: 'Adilson de Oliveira',
        vehicle_plate: 'XYZ-8N70',
        vehicle_type: 'Semirreboque Gaiola (Gado)',
        start_location: 'Santo Antônio do Leverger (MT)',
        destination: 'Tatuí (Fazenda Nova Aliança)',
        status: 'Ativa',
        started_at: '2026-05-28 04:00:00',
        completed_at: null,
        current_lat: -19.3300,
        current_lng: -51.2100,
        progress: 45,
        speed: 78,
        fuel_level: 68,
        cargo_description: '45 Garrotes Nelore para Recria Silvipastoril',
        last_event: 'Motorista informou parada rápida para alimentação do gado.',
        coordinates_history: [
          { lat: -15.8656, lng: -56.0781, time: '2026-05-28 04:00:00', speed: 0, event: 'Carga iniciada na Estância Shigueno MT' },
          { lat: -17.0500, lng: -54.9100, time: '2026-05-28 07:12:00', speed: 82, event: 'Parada técnica na balança' },
          { lat: -18.2200, lng: -53.5600, time: '2026-05-28 10:45:00', speed: 75, event: 'Abastecimento em posto credenciado' },
          { lat: -19.3300, lng: -51.2100, time: '2026-05-28 13:00:00', speed: 78, event: 'Viagem em progresso - Divisa MS/SP' }
        ]
      }
    ];

    // Seed default tasks/activities
    this.data.activities = [
      {
        id: 1,
        title: 'Comprar ração balanceada para postura',
        description: 'Cotação de 15 toneladas de ração mineralizada com fornecedores parceiros da região de Sorocaba.',
        category: 'Compras',
        status: 'A Fazer',
        priority: 'Alta',
        responsible: 'Gisela Shigueno',
        due_date: '2026-06-10'
      },
      {
        id: 2,
        title: 'Revisar bicos de pulverização (tratores da laranja)',
        description: 'Manutenção preventiva periódica dos equipamentos de pulverização agrícola para evitar perdas.',
        category: 'Ações',
        status: 'Em Progresso',
        priority: 'Média',
        responsible: 'Haruo Jr. Shigueno',
        due_date: '2026-06-05'
      },
      {
        id: 3,
        title: 'Contratar Tratorista Especialista para Itaí',
        description: 'Processo seletivo aberto para contratação urgente de piloto de maquinário John Deere.',
        category: 'Contratações Gerais',
        status: 'Concluído',
        priority: 'Alta',
        responsible: 'RH Shigueno',
        due_date: '2026-05-28'
      },
      {
        id: 4,
        title: 'Pagamento de fornecedor de caixas/embalagens de papelão',
        description: 'Efetuar a liquidação das notas fiscais da Tecnocarton de Sorocaba sobre embalagens de ovos Shigueno.',
        category: 'Financeiro',
        status: 'A Fazer',
        priority: 'Alta',
        responsible: 'Roberto Shigueno',
        due_date: '2026-06-03'
      },
      {
        id: 5,
        title: 'Fechamento de faturamento mensal de citros',
        description: 'Consolidação das cargas de laranja enviadas para as redes varejistas parceiras de São Paulo.',
        category: 'Financeiro',
        status: 'Em Progresso',
        priority: 'Média',
        responsible: 'Roberto Shigueno',
        due_date: '2026-06-04'
      },
      {
        id: 6,
        title: 'Auditoria preventiva das cercas rurais',
        description: 'Inspeção e reparo de eventuais estacas frouxas ou arames rompidos nos setores A-1 e B-3.',
        category: 'Ações',
        status: 'A Fazer',
        priority: 'Baixa',
        responsible: 'Claudio Tratorista',
        due_date: '2026-06-15'
      }
    ];

    this.save();
  }

  // --- SQL INTERPRETER / SIMULATOR API ---

  async exec(sql: string): Promise<void> {
    // Schema matches are handled statically in JSON, so this is a safe no-op.
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const trimmed = sql.trim().replace(/\s+/g, ' ');

    // 1. User authentication bypass
    if (trimmed.includes('FROM users WHERE username = ?')) {
      const username = params[0];
      const password = params[1];
      const u = this.data.users.find(x => x.username === username && x.password === password);
      if (!u) return undefined;
      return {
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role
      } as any;
    }

    // 2. Counts
    if (trimmed.includes('COUNT(*) as count FROM vacancies')) {
      return { count: this.data.vacancies.length } as any;
    }
    if (trimmed.includes('COUNT(*) as count FROM candidates')) {
      return { count: this.data.candidates.length } as any;
    }
    if (trimmed.includes('COUNT(*) as count FROM suppliers')) {
      return { count: this.data.suppliers.length } as any;
    }

    // 3. Sum total cattle count in MT
    if (trimmed.includes('SUM(cattle_count) as total')) {
      const total = this.data.suppliers.reduce((sum, s) => sum + (Number(s.cattle_count) || 0), 0);
      return { total } as any;
    }

    return undefined;
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const trimmed = sql.trim().replace(/\s+/g, ' ');

    // 1. Site configuration
    if (trimmed.includes('SELECT * FROM site_settings')) {
      return this.data.site_settings as any;
    }

    // 1b. Tracking routes list
    if (trimmed.includes('SELECT * FROM routes')) {
      const list = this.data.routes || [];
      // Order: Active routes first, then by started_at DESC
      const sorted = [...list].sort((a, b) => {
        if (a.status === 'Ativa' && b.status !== 'Ativa') return -1;
        if (a.status !== 'Ativa' && b.status === 'Ativa') return 1;
        return b.started_at.localeCompare(a.started_at);
      });
      return sorted as any;
    }

    // 2. Active vacancies
    if (trimmed.includes('SELECT * FROM vacancies WHERE status = ?')) {
      const status = params[0];
      return this.data.vacancies.filter(v => v.status === status) as any;
    }

    // 3. All vacancies
    if (trimmed.includes('SELECT * FROM vacancies')) {
      return this.data.vacancies as any;
    }

    // 4. Joined candidates
    if (trimmed.includes('SELECT c.*, v.title as vacancy_title')) {
      const joined = this.data.candidates.map(c => {
        const v = this.data.vacancies.find(j => Number(j.id) === Number(c.vacancy_id));
        return {
          ...c,
          vacancy_title: v ? v.title : null
        };
      });
      // Order by applied_at DESC (lexicographical string sort handles ISO dates perfectly)
      joined.sort((a, b) => b.applied_at.localeCompare(a.applied_at));
      return joined as any;
    }

    // 5b. Activities
    if (trimmed.includes('SELECT * FROM activities')) {
      const list = [...(this.data.activities || [])];
      return list as any;
    }

    // 5. Cattle Suppliers
    if (trimmed.includes('SELECT * FROM suppliers')) {
      const list = [...this.data.suppliers];
      // ORDER BY cattle_count DESC
      list.sort((a, b) => (Number(b.cattle_count) || 0) - (Number(a.cattle_count) || 0));
      return list as any;
    }

    // 6. City distribution reports
    if (trimmed.includes('GROUP BY city')) {
      const groups: Record<string, { city: string, value: number, supplier_count: number }> = {};
      for (const s of this.data.suppliers) {
        const city = s.city || 'Santo Antônio do Leverger';
        if (!groups[city]) {
          groups[city] = { city, value: 0, supplier_count: 0 };
        }
        groups[city].value += Number(s.cattle_count) || 0;
        groups[city].supplier_count += 1;
      }
      const result = Object.values(groups);
      // ORDER BY value DESC
      result.sort((a, b) => b.value - a.value);
      return result as any;
    }

    // 7. Group candidates per vacancy reports
    if (trimmed.includes('candidates c LEFT JOIN vacancies v') && trimmed.includes('GROUP BY label')) {
      const groups: Record<string, number> = {};
      for (const c of this.data.candidates) {
        const v = this.data.vacancies.find(j => Number(j.id) === Number(c.vacancy_id));
        const label = v ? v.title : 'Espontâneo';
        groups[label] = (groups[label] || 0) + 1;
      }
      const result = Object.entries(groups).map(([label, value]) => ({ label, value }));
      // ORDER BY value DESC
      result.sort((a, b) => b.value - a.value);
      return result as any;
    }

    return [];
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    const trimmed = sql.trim().replace(/\s+/g, ' ');

    // --- TRACKING ROUTES HANDLERS ---
    // A. Create / Start Tracking Route
    if (trimmed.includes('INSERT INTO routes')) {
      const [driver_name, vehicle_plate, vehicle_type, start_location, destination, status, started_at, current_lat, current_lng, progress, speed, fuel_level, cargo_description, last_event, coordinates_history] = params;
      if (!this.data.routes) this.data.routes = [];
      const id = nextId(this.data.routes);
      
      const newRoute = {
        id,
        driver_name: String(driver_name),
        vehicle_plate: String(vehicle_plate),
        vehicle_type: String(vehicle_type),
        start_location: String(start_location),
        destination: String(destination),
        status: status || 'Ativa',
        started_at: String(started_at),
        completed_at: null,
        current_lat: Number(current_lat) || 0,
        current_lng: Number(current_lng) || 0,
        progress: Number(progress) || 0,
        speed: Number(speed) || 0,
        fuel_level: Number(fuel_level) || 100,
        cargo_description: String(cargo_description || ''),
        last_event: String(last_event || 'Rota iniciada'),
        coordinates_history: typeof coordinates_history === 'string' ? JSON.parse(coordinates_history) : (coordinates_history || [])
      };
      
      this.data.routes.push(newRoute);
      this.save();
      return { lastID: id, changes: 1 };
    }

    // B. Update location telemetry / Event ping / Stop route
    if (trimmed.includes('UPDATE routes')) {
      const [current_lat, current_lng, progress, speed, fuel_level, last_event, coordinates_history, status, completed_at, id] = params;
      const list = this.data.routes || [];
      const item = list.find(x => Number(x.id) === Number(id));
      if (item) {
        item.current_lat = Number(current_lat);
        item.current_lng = Number(current_lng);
        item.progress = Number(progress);
        item.speed = Number(speed);
        item.fuel_level = Number(fuel_level);
        item.last_event = String(last_event);
        item.coordinates_history = typeof coordinates_history === 'string' ? JSON.parse(coordinates_history) : coordinates_history;
        if (status) item.status = status;
        if (completed_at !== undefined) item.completed_at = completed_at;
        this.save();
        return { lastID: Number(id), changes: 1 };
      }
      return { lastID: 0, changes: 0 };
    }

    // C. Delete historical routing tracking logs
    if (trimmed.includes('DELETE FROM routes')) {
      const id = params[0];
      const list = this.data.routes || [];
      const lenBefore = list.length;
      this.data.routes = list.filter(x => Number(x.id) !== Number(id));
      this.save();
      return { lastID: 0, changes: lenBefore - (this.data.routes || []).length };
    }

    // 1. Site settings upsert
    if (trimmed.includes('INSERT INTO site_settings')) {
      const key = params[0];
      const value = params[1];
      const idx = this.data.site_settings.findIndex(x => x.key === key);
      if (idx !== -1) {
        this.data.site_settings[idx].value = String(value);
      } else {
        this.data.site_settings.push({ key: String(key), value: String(value) });
      }
      this.save();
      return { lastID: 0, changes: 1 };
    }

    // 2. Insert vacancy
    if (trimmed.includes('INSERT INTO vacancies')) {
      const [title, department, description, location, requirements, status] = params;
      const id = nextId(this.data.vacancies);
      this.data.vacancies.push({
        id,
        title: String(title),
        department: String(department),
        description: String(description),
        location: String(location),
        requirements: String(requirements),
        status: String(status || 'Ativa')
      });
      this.save();
      return { lastID: id, changes: 1 };
    }

    // 3. Update vacancy
    if (trimmed.includes('UPDATE vacancies')) {
      const [title, department, description, location, requirements, status, id] = params;
      const item = this.data.vacancies.find(x => Number(x.id) === Number(id));
      if (item) {
        item.title = String(title);
        item.department = String(department);
        item.description = String(description);
        item.location = String(location);
        item.requirements = String(requirements);
        item.status = String(status);
        this.save();
        return { lastID: Number(id), changes: 1 };
      }
      return { lastID: 0, changes: 0 };
    }

    // 4. Delete vacancy
    if (trimmed.includes('DELETE FROM vacancies')) {
      const id = params[0];
      const lenBefore = this.data.vacancies.length;
      this.data.vacancies = this.data.vacancies.filter(x => Number(x.id) !== Number(id));
      this.save();
      return { lastID: 0, changes: lenBefore - this.data.vacancies.length };
    }

    // 5. Insert candidates application
    if (trimmed.includes('INSERT INTO candidates')) {
      const [name, email, phone, vacancy_id, cv_text, applied_at, status] = params;
      const id = nextId(this.data.candidates);
      this.data.candidates.push({
        id,
        name: String(name),
        email: String(email),
        phone: String(phone),
        vacancy_id: vacancy_id ? Number(vacancy_id) : null,
        cv_text: String(cv_text),
        applied_at: String(applied_at),
        status: String(status || 'Novo')
      });
      this.save();
      return { lastID: id, changes: 1 };
    }

    // 6. Update candidate status
    if (trimmed.includes('UPDATE candidates')) {
      const [status, id] = params;
      const item = this.data.candidates.find(x => Number(x.id) === Number(id));
      if (item) {
        item.status = String(status);
        this.save();
        return { lastID: Number(id), changes: 1 };
      }
      return { lastID: 0, changes: 0 };
    }

    // 6b. Update candidate AI evaluation
    if (trimmed.includes('UPDATE candidates_ai')) {
      const [ai_analysis, id] = params;
      const item = this.data.candidates.find(x => Number(x.id) === Number(id));
      if (item) {
        item.ai_analysis = typeof ai_analysis === 'string' ? JSON.parse(ai_analysis) : ai_analysis;
        this.save();
        return { lastID: Number(id), changes: 1 };
      }
      return { lastID: 0, changes: 0 };
    }

    // 7. Delete candidate
    if (trimmed.includes('DELETE FROM candidates')) {
      const id = params[0];
      const lenBefore = this.data.candidates.length;
      this.data.candidates = this.data.candidates.filter(x => Number(x.id) !== Number(id));
      this.save();
      return { lastID: 0, changes: lenBefore - this.data.candidates.length };
    }

    // 8. Insert supplier
    if (trimmed.includes('INSERT INTO suppliers')) {
      const [name, city, phone, cattle_count, cattle_breed, status, last_delivery] = params;
      const id = nextId(this.data.suppliers);
      this.data.suppliers.push({
        id,
        name: String(name),
        city: String(city),
        phone: String(phone),
        cattle_count: Number(cattle_count) || 0,
        cattle_breed: String(cattle_breed),
        status: String(status || 'Ativo'),
        last_delivery: String(last_delivery)
      });
      this.save();
      return { lastID: id, changes: 1 };
    }

    // 9. Update supplier
    if (trimmed.includes('UPDATE suppliers')) {
      const [name, city, phone, cattle_count, cattle_breed, status, last_delivery, id] = params;
      const item = this.data.suppliers.find(x => Number(x.id) === Number(id));
      if (item) {
        item.name = String(name);
        item.city = String(city);
        item.phone = String(phone);
        item.cattle_count = Number(cattle_count) || 0;
        item.cattle_breed = String(cattle_breed);
        item.status = String(status);
        item.last_delivery = String(last_delivery);
        this.save();
        return { lastID: Number(id), changes: 1 };
      }
      return { lastID: 0, changes: 0 };
    }

    // 10. Delete supplier
    if (trimmed.includes('DELETE FROM suppliers')) {
      const id = params[0];
      const lenBefore = this.data.suppliers.length;
      this.data.suppliers = this.data.suppliers.filter(x => Number(x.id) !== Number(id));
      this.save();
      return { lastID: 0, changes: lenBefore - this.data.suppliers.length };
    }

    // 11. Insert activity
    if (trimmed.includes('INSERT INTO activities')) {
      const [title, description, category, status, priority, responsible, due_date] = params;
      if (!this.data.activities) this.data.activities = [];
      const id = nextId(this.data.activities);
      this.data.activities.push({
        id,
        title: String(title),
        description: String(description),
        category: String(category || 'Ações'),
        status: String(status || 'A Fazer'),
        priority: String(priority || 'Média'),
        responsible: String(responsible || ''),
        due_date: String(due_date || '')
      });
      this.save();
      return { lastID: id, changes: 1 };
    }

    // 12. Update activity
    if (trimmed.includes('UPDATE activities')) {
      const [title, description, category, status, priority, responsible, due_date, id] = params;
      const list = this.data.activities || [];
      const item = list.find(x => Number(x.id) === Number(id));
      if (item) {
        item.title = String(title);
        item.description = String(description);
        item.category = String(category);
        item.status = String(status);
        item.priority = String(priority);
        item.responsible = String(responsible);
        item.due_date = String(due_date);
        this.save();
        return { lastID: Number(id), changes: 1 };
      }
      return { lastID: 0, changes: 0 };
    }

    // 13. Delete activity
    if (trimmed.includes('DELETE FROM activities')) {
      const id = params[0];
      const list = this.data.activities || [];
      const lenBefore = list.length;
      this.data.activities = list.filter(x => Number(x.id) !== Number(id));
      this.save();
      return { lastID: 0, changes: lenBefore - (this.data.activities || []).length };
    }

    return { lastID: 0, changes: 0 };
  }

  public seedBlogDefaults() {
    this.data.blog_categories = [
      { id: 1, name: 'Avicultura Moderna', description: 'Tudo sobre manejo de postura, qualidade de ovos e biosseguridade.' },
      { id: 2, name: 'Citricultura Sustentável', description: 'Técnicas de cultivo de laranja e limão com adubação orgânica.' },
      { id: 3, name: 'Cafeicultura de Altitude', description: 'Práticas de colheita sustentável e produção de café especial.' },
      { id: 4, name: 'Pecuária Nelore', description: 'Cria e recria de gado Nelore com máxima dignidade nas pastagens do MT.' },
      { id: 5, name: 'Sustentabilidade Rural', description: 'Adubação orgânica, conservação do solo e preservação de mananciais.' }
    ];

    this.data.blog_authors = [
      { id: 1, name: 'Haruo Shigueno Junior', role: 'Diretor de Operações', bio: 'Neto do fundador Haruo Shigueno, dedicado à expansão das tecnologias agrícolas do Grupo Shigueno.', instagram: '@haruoshiguenojr', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { id: 2, name: 'Dra. Aline Shigueno', role: 'Médica Veterinária', bio: 'Especialista em manejo gentil e sanidade animal, encarregada do plantel Nelore e do controle geral das aves.', instagram: '@aline_shigueno', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { id: 3, name: 'Eng. Agrônomo Lucas Mendes', role: 'Gestor de Culturas', bio: 'Mestre em solos e nutrição de plantas. Coordenador de adubação sustentável na Fazenda Nova Aliança.', instagram: '@lucasmendes.agro', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
    ];

    this.data.blog_posts = [
      {
        id: 1,
        title: 'Como a Adubação Orgânica de Postura Revolucionou Nossos Pomares de Citros',
        slug: 'adubacao-organica-revolucionou-pomares-citros',
        excerpt: 'Desde 1975, o Grupo Shigueno utiliza o esterco das aves como fertilizante orgânico inovador, resultando em uma produtividade invejável e sustentável em Tatuí e Buri.',
        content: `A história da nossa diversificação é pautada pela inteligência ecológica e economia circular pioneira. Quando na década de 1970 consolidamos a produção de ovos em Tatuí - SP, um desafio produtivo se transformou em uma oportunidade de ouro: o que fazer com o esterco decorrente do adubo natural das aves de postura?\n\nA resposta veio em 1975 na mente visionária de Haruo Shigueno. Ao invés de descartar o composto, iniciamos estudos e aplicações sistemáticas de fertilização orgânica em nossos pomares de citros. Esta prática, que na época era vista com ceticismo pela agricultura convencional, provou-se altamente eficiente.\n\n### Benefícios Observados na Citricultura Shigueno:\n\n1. **Enriquecimento Biológico do Solo:** Ao contrário dos fertilizantes sintéticos, o esterco de galinha enriquecido reativa a microfauna benéfica do solo, melhorando a absorção de nutrientes.\n2. **Retenção de Umidade:** Solos adubados organicamente retêm até 30% mais água, provendo resiliência crucial durante as estiagens na região de Buri.\n3. **Sanidade da Planta:** Pomares nutridos à base de composto orgânico exibem cutículas foliares mais espessas, reduzindo a incidência de fitopatógenos e pragas.\n\nHoje, nossa produtividade por hectare supera médias nacionais, comprovando que a preservação ecológica e a rentabilidade caminham de mãos dadas!`,
        image_url: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&auto=format&fit=crop&q=80',
        category_id: 2,
        author_id: 3,
        status: 'Publicado',
        views: 142,
        published_at: '2026-05-10T12:00:00Z',
        is_featured: true,
        tags: 'citricultura,adubação orgânica,sustentabilidade,tatuí'
      },
      {
        id: 2,
        title: 'Qualidade do Ovo Shigueno: Do Galpão Climatizado até a Mesa em Horas',
        slug: 'qualidade-do-ovo-shigueno-galpao-mesa-horas',
        excerpt: 'Especialização, nutrição balanceada e triagem eletrônica precisa garantem a excelência que consolidou nossa marca de ovos na região desde 1970.',
        content: `Na Granja Shigueno, cada detalhe no galpão é acompanhado com rigor científico. Nossas galinhas recebem uma ração balanceada exclusiva de grãos, complementada com minerais cruciais para que a casca do ovo seja altamente resistente e o interior possua coloração e sabor impecáveis.\n\n### A Jornada da Excelência:\n\n* **Coleta Delicada e Monitorada:** Os ovos são coletados com esteiras suaves, minimizando trincas microbianas.\n* **Classificação Eletrônica:** Contamos com equipamentos automatizados modernos que separam perfeitamente as classificações entre *Super Extra (Jumbo)*, *Extra*, *Grande*, *Médio* e *Pequeno*.\n* **Logística Integrada:** Nossos frotistas rastreados iniciam o transporte nas primeiras horas da manhã, garantindo que panificadoras e supermercados de Sorocaba, Tatuí e região recebam ovos frescos em tempo recorde.\n\nA tradição iniciada por Haruo Shigueno mantém-se ativa graças à inovação contínua e zelo de toda a nossa equipe técnica!`,
        image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&auto=format&fit=crop&q=80',
        category_id: 1,
        author_id: 1,
        status: 'Publicado',
        views: 89,
        published_at: '2026-05-18T08:30:00Z',
        is_featured: false,
        tags: 'ovos,avicultura,tecnologia,frescor'
      },
      {
        id: 3,
        title: 'Manejo Gentil e Dignidade Animal na Criação de Bezerros Nelore no MT',
        slug: 'manejo-gentil-dignidade-bezerros-nelore-mt',
        excerpt: 'Como aplicamos técnicas de manejo racional para eliminar o estresse no rebanho, elevando as margens de recria com segurança veterinária no Mato Grosso.',
        content: `Nos limites de Santo Antônio do Leverger, no estado de Mato Grosso, nosso rebanho da raça Nelore é criado sob uma filosofia rígida de respeito e cuidado. Acreditamos que a produtividade está intrinsecamente ligada ao bem-estar do animal.\n\n### Princípios do Manejo Racional Shigueno:\n\n* **Zero Violência ou Gritos:** Os campeiros são treinados para guiar o rebanho utilizando apenas linguagem corporal e toques gentis, eliminando o estresse.\n* **Pastoreio Rotacionado Intensivo:** As pastagens são divididas em piquetes gerenciados, garantindo pasto verde, volumoso fresco e tempo para reuniões de manejo.\n* **Nutrição Mineral Premium:** Cochos higienizados e cobertos fornecem suplementação de fósforo e oligoelementos essenciais para a saúde dos bezerros de recria.\n\nCom corpo veterinário contínuo, mantemos controle sob imunização sanitária contra febre aftosa e outras epizootias, garantindo que nossos parceiros de recria de Mato Grosso recebam lotes de bezerros saudáveis e de procedência idônea. Isso é pecuária com dignidade!`,
        image_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80',
        category_id: 4,
        author_id: 2,
        status: 'Publicado',
        views: 121,
        published_at: '2026-05-22T15:00:00Z',
        is_featured: false,
        tags: 'nelore,mato grosso,pecuária,bem-estar animal'
      }
    ];

    // Seed menu config if not present
    const hasBlogMenuSetting = this.data.site_settings.some(s => s.key === 'show_blog_on_menu');
    if (!hasBlogMenuSetting) {
      this.data.site_settings.push({ key: 'show_blog_on_menu', value: 'true' });
    }
  }

  public getBlogPosts() {
    return this.data.blog_posts || [];
  }
  public getBlogCategories() {
    return this.data.blog_categories || [];
  }
  public getBlogAuthors() {
    return this.data.blog_authors || [];
  }
  public saveBlogPost(post: any) {
    if (!this.data.blog_posts) this.data.blog_posts = [];
    if (post.id) {
      const idx = this.data.blog_posts.findIndex(p => Number(p.id) === Number(post.id));
      if (idx !== -1) {
        this.data.blog_posts[idx] = { ...this.data.blog_posts[idx], ...post };
      } else {
        this.data.blog_posts.push(post);
      }
    } else {
      post.id = nextId(this.data.blog_posts);
      post.views = 0;
      this.data.blog_posts.push(post);
    }
    this.save();
    return post;
  }
  public incrementPostViews(id: number) {
    if (!this.data.blog_posts) return;
    const post = this.data.blog_posts.find(p => Number(p.id) === Number(id));
    if (post) {
      post.views = (Number(post.views) || 0) + 1;
      this.save();
    }
  }
  public deleteBlogPost(id: number) {
    if (!this.data.blog_posts) return false;
    const initialLen = this.data.blog_posts.length;
    this.data.blog_posts = this.data.blog_posts.filter(p => Number(p.id) !== Number(id));
    this.save();
    return this.data.blog_posts.length < initialLen;
  }

  public saveBlogAuthor(author: any) {
    if (!this.data.blog_authors) this.data.blog_authors = [];
    if (author.id) {
      const idx = this.data.blog_authors.findIndex(a => Number(a.id) === Number(author.id));
      if (idx !== -1) {
        this.data.blog_authors[idx] = { ...this.data.blog_authors[idx], ...author };
      } else {
        this.data.blog_authors.push(author);
      }
    } else {
      author.id = nextId(this.data.blog_authors);
      this.data.blog_authors.push(author);
    }
    this.save();
    return author;
  }
  public deleteBlogAuthor(id: number) {
    if (!this.data.blog_authors) return false;
    const initialLen = this.data.blog_authors.length;
    this.data.blog_authors = this.data.blog_authors.filter(a => Number(a.id) !== Number(id));
    this.save();
    return this.data.blog_authors.length < initialLen;
  }

  public saveBlogCategory(cat: any) {
    if (!this.data.blog_categories) this.data.blog_categories = [];
    if (cat.id) {
      const idx = this.data.blog_categories.findIndex(c => Number(c.id) === Number(cat.id));
      if (idx !== -1) {
        this.data.blog_categories[idx] = { ...this.data.blog_categories[idx], ...cat };
      } else {
        this.data.blog_categories.push(cat);
      }
    } else {
      cat.id = nextId(this.data.blog_categories);
      this.data.blog_categories.push(cat);
    }
    this.save();
    return cat;
  }
  public deleteBlogCategory(id: number) {
    if (!this.data.blog_categories) return false;
    const initialLen = this.data.blog_categories.length;
    this.data.blog_categories = this.data.blog_categories.filter(c => Number(c.id) !== Number(id));
    this.save();
    return this.data.blog_categories.length < initialLen;
  }
}

const dbInstance = new SafeJsonDb();

export async function getDb(): Promise<CustomDb> {
  return dbInstance;
}

// Module-level blog functions
export async function getBlogPosts() {
  return dbInstance.getBlogPosts();
}
export async function getBlogCategories() {
  return dbInstance.getBlogCategories();
}
export async function getBlogAuthors() {
  return dbInstance.getBlogAuthors();
}
export async function saveBlogPost(post: any) {
  return dbInstance.saveBlogPost(post);
}
export async function incrementPostViews(id: number) {
  return dbInstance.incrementPostViews(id);
}
export async function deleteBlogPost(id: number) {
  return dbInstance.deleteBlogPost(id);
}
export async function saveBlogAuthor(author: any) {
  return dbInstance.saveBlogAuthor(author);
}
export async function deleteBlogAuthor(id: number) {
  return dbInstance.deleteBlogAuthor(id);
}
export async function saveBlogCategory(cat: any) {
  return dbInstance.saveBlogCategory(cat);
}
export async function deleteBlogCategory(id: number) {
  return dbInstance.deleteBlogCategory(id);
}
