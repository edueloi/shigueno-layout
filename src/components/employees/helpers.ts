// ── Tipos e helpers compartilhados do módulo de RH (Equipe & Hierarquia) ──────

export interface Employee {
  id: number;
  full_name: string;
  role: string;
  department: string;
  hierarchy_level: number;
  manager_id: number | null;
  manager_name?: string;
  manager_role?: string;
  photo_path?: string;
  avatar_initials?: string;
  // Contato
  email?: string;
  phone?: string;
  phone2?: string;
  // Documentos
  cpf?: string;
  rg?: string;
  has_cnh?: boolean | number;
  cnh_category?: string;
  // Pessoal
  sex?: string;
  birth_date?: string;
  blood_type?: string;
  marital_status?: string;
  has_children?: boolean | number;
  children_count?: number;
  education?: string;
  // PCD e Saúde
  is_pcd?: boolean | number;
  pcd_type?: string;
  has_continuous_medication?: boolean | number;
  medications?: string;
  has_chronic_disease?: boolean | number;
  chronic_diseases?: string;
  allergies?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  // Endereço
  cep?: string;
  street?: string;
  street_number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  // Trabalho
  hire_date?: string;
  termination_date?: string;
  status: 'Ativo' | 'Afastado' | 'Férias' | 'Desligado';
  work_location?: string;
  salary?: number;
  notes?: string;
  years_of_service?: number;
  age?: number;
  birth_mmdd?: string;
}

// ── Constantes visuais ────────────────────────────────────────────────────────
export const DEPT_COLORS: Record<string, string> = {
  'RH': 'bg-blue-100 text-blue-800 border-blue-200',
  'Avicultura': 'bg-amber-100 text-amber-800 border-amber-200',
  'Citricultura': 'bg-orange-100 text-orange-800 border-orange-200',
  'Cafeicultura': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Pecuária': 'bg-green-100 text-green-800 border-green-200',
  'Financeiro': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Administrativo': 'bg-slate-100 text-slate-700 border-slate-200',
  'Logística': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'TI': 'bg-purple-100 text-purple-800 border-purple-200',
};

export const AVATAR_BG = ['bg-emerald-700','bg-blue-700','bg-purple-700','bg-amber-600','bg-rose-700','bg-indigo-700','bg-teal-700','bg-cyan-700'];

// Níveis 1–14 (crescente: quanto maior, mais alto na hierarquia)
export const LEVEL_LABELS: Record<number, string> = {
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

export const LEVEL_COLORS: Record<number, string> = {
  1:  'bg-slate-100 text-slate-500 border-slate-200',
  2:  'bg-slate-100 text-slate-600 border-slate-200',
  3:  'bg-sky-50   text-sky-600   border-sky-200',
  4:  'bg-sky-100  text-sky-700   border-sky-200',
  5:  'bg-blue-100 text-blue-700  border-blue-200',
  6:  'bg-teal-100 text-teal-700  border-teal-200',
  7:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  8:  'bg-violet-100 text-violet-700 border-violet-200',
  9:  'bg-purple-100 text-purple-700 border-purple-200',
  10: 'bg-amber-100 text-amber-700 border-amber-200',
  11: 'bg-orange-100 text-orange-700 border-orange-200',
  12: 'bg-rose-100 text-rose-700 border-rose-200',
  13: 'bg-red-100 text-red-700 border-red-200',
  14: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

/** Tom de status: cor da faixa do card, badge e dot */
export const STATUS_STYLE: Record<string, { strip: string; badge: string; dot: string }> = {
  'Ativo':     { strip: 'from-emerald-500 to-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Férias':    { strip: 'from-sky-500 to-sky-400',         badge: 'bg-sky-50 text-sky-700 border-sky-200',             dot: 'bg-sky-500' },
  'Afastado':  { strip: 'from-amber-500 to-amber-400',     badge: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  'Desligado': { strip: 'from-slate-400 to-slate-300',     badge: 'bg-slate-100 text-slate-500 border-slate-200',      dot: 'bg-slate-400' },
};

export const DEPARTMENTS = ['RH','Avicultura','Citricultura','Cafeicultura','Pecuária','Financeiro','Administrativo','Logística','TI'];
export const WORK_LOCATIONS = ['Tatuí (Sede)','Tatuí (Granja)','Tatuí (Fazenda Nova Aliança)','Buri - SP (Citros)','Itaí - SP (Café)','Leverger (MT)','Sorocaba (Distribuição)'];

export const deptClass  = (d: string) => DEPT_COLORS[d] || 'bg-slate-100 text-slate-700 border-slate-200';
export const avatarBg   = (id: number) => AVATAR_BG[id % AVATAR_BG.length];
export const levelClass = (l: number) => LEVEL_COLORS[l] || LEVEL_COLORS[1];
export const statusStyle = (s: string) => STATUS_STYLE[s] || STATUS_STYLE['Desligado'];

// ── Formatação ────────────────────────────────────────────────────────────────
export function yearsLabel(y?: number) {
  if (y === undefined || y === null) return '—';
  if (y === 0) return '< 1 ano';
  return `${y} ano${y !== 1 ? 's' : ''}`;
}

/** Dias até o próximo aniversário (0 = hoje), ou null se desconhecido */
export function birthdayIn(mmdd?: string): number | null {
  if (!mmdd) return null;
  const [mm, dd] = mmdd.split('-').map(Number);
  const t = new Date();
  let d = new Date(t.getFullYear(), mm - 1, dd);
  if (d < t) d.setFullYear(t.getFullYear() + 1);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function fmtDate(s?: string | null) {
  if (!s) return '—';
  const clean = String(s).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return '—';
  const d = new Date(clean + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export function fmtDateShort(s?: string | null) {
  if (!s) return '—';
  const clean = String(s).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return '—';
  const d = new Date(clean + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function fmtMoney(v?: number | null) {
  if (v === undefined || v === null) return '—';
  return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// ── Máscaras de input ─────────────────────────────────────────────────────────
export const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};

export const maskCpf = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').replace(/-$/, '');

export const maskCep = (v: string) =>
  v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
