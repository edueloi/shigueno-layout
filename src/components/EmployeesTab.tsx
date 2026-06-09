import React from 'react';
import {
  Users, Plus, Search, Edit, Trash2, X, ChevronRight,
  MapPin, Phone, Mail, Calendar, Award, CheckCircle2,
  RefreshCw, AlertCircle, Cake, Clock, TrendingUp,
  UserCheck, Layers, ChevronDown, Heart, BookOpen,
  Home, DollarSign, Baby, Droplets, Camera, Eye,
  Building2, ChevronUp, Star, Shield
} from 'lucide-react';
import { Portal } from '../hooks/usePortal';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Employee {
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
const DEPT_COLORS: Record<string, string> = {
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
const AVATAR_BG = ['bg-emerald-700','bg-blue-700','bg-purple-700','bg-amber-600','bg-rose-700','bg-indigo-700','bg-teal-700','bg-cyan-700'];
// Níveis 1–14 (crescente: quanto maior, mais alto na hierarquia)
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
const LEVEL_COLORS: Record<number, string> = {
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

const deptClass = (d: string) => DEPT_COLORS[d] || 'bg-slate-100 text-slate-700 border-slate-200';
const avatarBg  = (id: number) => AVATAR_BG[id % AVATAR_BG.length];
const levelClass = (l: number) => LEVEL_COLORS[l] || LEVEL_COLORS[1];

function yearsLabel(y?: number) {
  if (y === undefined || y === null) return '—';
  if (y === 0) return '< 1 ano';
  return `${y} ano${y !== 1 ? 's' : ''}`;
}

function birthdayIn(mmdd?: string): number | null {
  if (!mmdd) return null;
  const [mm, dd] = mmdd.split('-').map(Number);
  const t = new Date();
  let d = new Date(t.getFullYear(), mm - 1, dd);
  if (d < t) d.setFullYear(t.getFullYear() + 1);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

function fmtDate(s?: string | null) {
  if (!s) return '—';
  // Normaliza: pega apenas YYYY-MM-DD independente de vir com hora ou como objeto
  const clean = String(s).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return '—';
  const d = new Date(clean + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

function fmtDateShort(s?: string | null) {
  if (!s) return '—';
  const clean = String(s).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return '—';
  const d = new Date(clean + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function Avatar({ emp, size = 'md' }: { emp: Pick<Employee,'id'|'full_name'|'avatar_initials'|'photo_path'>; size?: 'sm'|'md'|'lg'|'xl' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-20 h-20 text-xl';
  const rounded = size === 'xl' ? 'rounded-2xl' : 'rounded-xl';
  if (emp.photo_path) {
    return <img src={`/api/employees/${emp.id}/photo`} alt={emp.full_name} className={`${sz} ${rounded} object-cover shrink-0`} />;
  }
  return (
    <div className={`${sz} ${rounded} ${avatarBg(emp.id)} flex items-center justify-center text-white font-black shrink-0`}>
      {emp.avatar_initials || emp.full_name.slice(0,2).toUpperCase()}
    </div>
  );
}

// ── Modal de detalhes do funcionário ─────────────────────────────────────────
function EmployeeModal({ emp, onClose, onEdit, canEdit }: {
  emp: Employee & { reports?: Employee[] };
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}) {
  const days = birthdayIn(emp.birth_mmdd);
  const isBday = days === 0;

  const row = (label: string, value: React.ReactNode, icon?: React.ReactNode) => (
    <div className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
      {icon && <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>}
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wide w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs font-semibold text-slate-800 flex-1">{value || <span className="text-slate-300 italic">—</span>}</span>
    </div>
  );

  return (
    <Portal>
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9998] p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-3xl h-[92vh] sm:max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header fixo */}
        <div className="bg-gradient-to-br from-[#0a1e13] to-[#0d3320] text-white p-5 sm:p-6 rounded-t-3xl shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar emp={emp} size="xl" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${levelClass(emp.hierarchy_level)}`}>
                    Nível {emp.hierarchy_level} · {LEVEL_LABELS[emp.hierarchy_level] || 'Operacional'}
                  </span>
                  {isBday && <span className="text-[10px] bg-amber-400 text-slate-900 font-black px-2 py-0.5 rounded-md">🎂 Aniversário hoje!</span>}
                </div>
                <h2 className="text-xl font-black text-white leading-tight">{emp.full_name}</h2>
                <p className="text-emerald-300 text-sm font-semibold mt-0.5">{emp.role}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${deptClass(emp.department)}`}>{emp.department}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    emp.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : emp.status === 'Férias' ? 'bg-sky-100 text-sky-700 border-sky-200'
                    : emp.status === 'Afastado' ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-slate-200 text-slate-500 border-slate-300'
                  }`}>{emp.status}</span>
                  {emp.work_location && (
                    <span className="text-[9px] text-emerald-200 flex items-center gap-1"><MapPin className="w-2.5 h-2.5"/>{emp.work_location}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0">
              <X className="w-5 h-5"/>
            </button>
          </div>
          {/* Métricas rápidas */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{yearsLabel(emp.years_of_service)}</p>
              <p className="text-[9px] text-emerald-300 uppercase font-bold tracking-wider">Tempo de casa</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-2xl font-black text-white">{emp.age ? `${emp.age} anos` : '—'}</p>
              <p className="text-[9px] text-emerald-300 uppercase font-bold tracking-wider">Idade</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">
                {days === 0 ? '🎂 Hoje' : days !== null ? `${days}d` : '—'}
              </p>
              <p className="text-[9px] text-emerald-300 uppercase font-bold tracking-wider">Próx. aniversário</p>
            </div>
          </div>
        </div>

        {/* Body — scrollável independente do header */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Gestor + cadeia */}
          {emp.manager_name && (
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 text-xs">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0"/>
              <span className="text-slate-500">Responde para</span>
              <strong className="text-slate-800">{emp.manager_name}</strong>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{emp.manager_role}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contato */}
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/>Contato</h3>
              <div className="bg-white border border-slate-100 rounded-xl px-3 divide-y divide-slate-50">
                {row('E-mail', emp.email ? <a href={`mailto:${emp.email}`} className="text-emerald-700 hover:underline">{emp.email}</a> : null)}
                {row('Telefone', emp.phone ? <a href={`tel:${emp.phone}`} className="text-slate-800">{emp.phone}</a> : null)}
                {row('Tel. 2', emp.phone2)}
              </div>
            </section>

            {/* Dados pessoais + documentos */}
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5"/>Dados Pessoais</h3>
              <div className="bg-white border border-slate-100 rounded-xl px-3 divide-y divide-slate-50">
                {row('CPF', emp.cpf ? <span className="font-mono">{emp.cpf}</span> : null)}
                {row('RG', emp.rg ? <span className="font-mono">{emp.rg}</span> : null)}
                {row('Sexo', emp.sex)}
                {row('Nasc.', fmtDate(emp.birth_date))}
                {row('Tipo sanguíneo', emp.blood_type ? <span className="font-black text-red-700">{emp.blood_type}</span> : null)}
                {row('Est. Civil', emp.marital_status)}
                {row('Filhos', emp.has_children ? `${emp.children_count || 0} filho${(emp.children_count||0) !== 1 ? 's' : ''}` : 'Não')}
                {row('Escolaridade', emp.education)}
                {row('CNH', emp.has_cnh ? <span className="font-black text-emerald-700">Sim — Cat. {emp.cnh_category || '—'}</span> : 'Não')}
              </div>
            </section>

            {/* Saúde */}
            {(emp.is_pcd || emp.has_continuous_medication || emp.has_chronic_disease || emp.allergies || emp.emergency_contact_name) && (
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5"/>Saúde & Emergência
                </h3>
                <div className="bg-white border border-slate-100 rounded-xl px-3 divide-y divide-slate-50">
                  {emp.is_pcd && row('PCD', <span className="font-bold text-purple-700">Sim — {emp.pcd_type || 'Não especificado'}</span>)}
                  {emp.has_continuous_medication && row('Medicação', emp.medications)}
                  {emp.has_chronic_disease && row('Doenças crônicas', emp.chronic_diseases)}
                  {emp.allergies && row('Alergias', emp.allergies)}
                  {emp.emergency_contact_name && row('Emergência', `${emp.emergency_contact_name} · ${emp.emergency_contact_phone || '—'}`)}
                </div>
              </section>
            )}

            {/* Endereço */}
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Home className="w-3.5 h-3.5"/>Endereço</h3>
              <div className="bg-white border border-slate-100 rounded-xl px-3 divide-y divide-slate-50">
                {row('CEP', emp.cep)}
                {row('Rua', emp.street ? `${emp.street}, ${emp.street_number || 'S/N'}${emp.complement ? ` (${emp.complement})` : ''}` : null)}
                {row('Bairro', emp.neighborhood)}
                {row('Cidade/UF', emp.city ? `${emp.city}${emp.state ? ` - ${emp.state}` : ''}` : null)}
                {row('País', emp.country)}
              </div>
            </section>

            {/* Vínculo empregatício */}
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5"/>Vínculo Empregatício</h3>
              <div className="bg-white border border-slate-100 rounded-xl px-3 divide-y divide-slate-50">
                {row('Admissão', fmtDate(emp.hire_date))}
                {emp.termination_date && row('Desligamento', fmtDate(emp.termination_date))}
                {row('Local', emp.work_location)}
                {emp.salary && row('Salário', <span className="font-black text-emerald-700">R$ {Number(emp.salary).toLocaleString('pt-BR', { minimumFractionDigits:2 })}</span>)}
              </div>
            </section>
          </div>

          {/* Observações */}
          {emp.notes && (
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Observações Internas</h3>
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{emp.notes}</div>
            </section>
          )}

          {/* Subordinados */}
          {emp.reports && emp.reports.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5"/>Subordinados Diretos ({emp.reports.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(emp.reports as Employee[]).map(r => (
                  <div key={r.id} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                    <Avatar emp={r} size="sm"/>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{r.full_name}</p>
                      <p className="text-[9px] text-slate-500 truncate">{r.role} · {r.department}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${levelClass(r.hierarchy_level||1)}`}>{LEVEL_LABELS[r.hierarchy_level||1]}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ações — sempre visíveis */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 sticky bottom-0 bg-white pb-1">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer">Fechar</button>
            {canEdit && (
              <button onClick={onEdit} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer flex items-center gap-1.5">
                <Edit className="w-3.5 h-3.5"/>Editar Funcionário
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}

// ── Formulário completo ───────────────────────────────────────────────────────
function EmployeeForm({ initial, employees, onSave, onCancel, saving }: {
  initial?: Partial<Employee>;
  employees: Employee[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = React.useState<'basico'|'pessoal'|'saude'|'endereco'|'trabalho'>('basico');

  const [full_name,       setFullName]       = React.useState(initial?.full_name       || '');
  const [role,            setRole]           = React.useState(initial?.role            || '');
  const [department,      setDept]           = React.useState(initial?.department      || '');
  const [hierarchy_level, setLevel]          = React.useState<number>(initial?.hierarchy_level || 1);
  const [manager_id,      setManagerId]      = React.useState(initial?.manager_id ? String(initial.manager_id) : '');
  const [email,           setEmail]          = React.useState(initial?.email           || '');
  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g,'').slice(0,11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'');
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'');
  };
  const maskCpf = (v: string) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,'$1.$2.$3-$4').replace(/-$/,'');
  const maskCep = (v: string) => v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d{0,3})/,'$1-$2').replace(/-$/,'');

  const [phone,           setPhone]          = React.useState(maskPhone(initial?.phone  || ''));
  const [phone2,          setPhone2]         = React.useState(maskPhone(initial?.phone2 || ''));
  const [status,          setStatus]         = React.useState<string>(initial?.status  || 'Ativo');
  const [hire_date,       setHireDate]       = React.useState(initial?.hire_date       ? String(initial.hire_date).slice(0,10) : '');
  const [termination_date,setTermDate]       = React.useState(initial?.termination_date? String(initial.termination_date).slice(0,10) : '');
  const [work_location,   setWorkLoc]        = React.useState(initial?.work_location   || '');
  const [salary,          setSalary]         = React.useState(initial?.salary ? String(initial.salary) : '');
  const [notes,           setNotes]          = React.useState(initial?.notes           || '');
  // Documentos
  const [cpf,             setCpf]            = React.useState(maskCpf(initial?.cpf || ''));
  const [rg,              setRg]             = React.useState(initial?.rg              || '');
  const [has_cnh,         setHasCnh]         = React.useState<boolean>(!!initial?.has_cnh);
  const [cnh_category,    setCnhCategory]    = React.useState(initial?.cnh_category    || '');
  // Pessoal
  const [sex,             setSex]            = React.useState(initial?.sex             || '');
  const [birth_date,      setBirthDate]      = React.useState(initial?.birth_date      ? String(initial.birth_date).slice(0,10) : '');
  const [blood_type,      setBloodType]      = React.useState(initial?.blood_type      || '');
  const [marital_status,  setMaritalStatus]  = React.useState(initial?.marital_status  || '');
  const [has_children,    setHasChildren]    = React.useState<boolean>(!!initial?.has_children);
  const [children_count,  setChildrenCount]  = React.useState<number>(initial?.children_count || 0);
  const [education,       setEducation]      = React.useState(initial?.education       || '');
  // PCD & Saúde
  const [is_pcd,          setIsPcd]          = React.useState<boolean>(!!initial?.is_pcd);
  const [pcd_type,        setPcdType]        = React.useState(initial?.pcd_type        || '');
  const [has_med,         setHasMed]         = React.useState<boolean>(!!initial?.has_continuous_medication);
  const [medications,     setMedications]    = React.useState(initial?.medications     || '');
  const [has_chronic,     setHasChronic]     = React.useState<boolean>(!!initial?.has_chronic_disease);
  const [chronic_diseases,setChronicDis]     = React.useState(initial?.chronic_diseases|| '');
  const [allergies,       setAllergies]      = React.useState(initial?.allergies       || '');
  const [emerg_name,      setEmergName]      = React.useState(initial?.emergency_contact_name  || '');
  const [emerg_phone,     setEmergPhone]     = React.useState(initial?.emergency_contact_phone || '');
  // Endereço
  const [cep,             setCep]            = React.useState(initial?.cep             || '');
  const [street,          setStreet]         = React.useState(initial?.street          || '');
  const [street_number,   setStreetNum]      = React.useState(initial?.street_number   || '');
  const [complement,      setComplement]     = React.useState(initial?.complement      || '');
  const [neighborhood,    setNeighborhood]   = React.useState(initial?.neighborhood    || '');
  const [city,            setCity]           = React.useState(initial?.city            || '');
  const [state,           setState]          = React.useState(initial?.state           || '');
  const [country,         setCountry]        = React.useState(initial?.country         || 'Brasil');
  const [cepLoading,      setCepLoading]     = React.useState(false);

  // Foto
  const [photoFile,       setPhotoFile]      = React.useState<File|null>(null);
  const [photoPreview,    setPhotoPreview]   = React.useState<string|null>(initial?.photo_path ? `/api/employees/${initial.id}/photo` : null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const possibleManagers = employees.filter(e => e.id !== initial?.id && e.status !== 'Desligado');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const fetchCep = async () => {
    const clean = cep.replace(/\D/g,'');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
        setCountry('Brasil');
      }
    } catch { /* silently */ }
    finally { setCepLoading(false); }
  };

  const handle = async () => {
    if (!full_name.trim() || !role.trim() || !department.trim()) return;
    const payload = {
      full_name, role, department, hierarchy_level,
      manager_id: manager_id || null,
      email, phone, phone2,
      cpf, rg, has_cnh, cnh_category: has_cnh ? cnh_category : null,
      sex, birth_date, blood_type, marital_status,
      has_children, children_count: has_children ? children_count : 0, education,
      is_pcd, pcd_type: is_pcd ? pcd_type : null,
      has_continuous_medication: has_med, medications: has_med ? medications : null,
      has_chronic_disease: has_chronic, chronic_diseases: has_chronic ? chronic_diseases : null,
      allergies,
      emergency_contact_name: emerg_name, emergency_contact_phone: emerg_phone,
      cep, street, street_number, complement, neighborhood, city, state, country,
      status, hire_date, termination_date,
      work_location, salary: salary ? Number(salary) : null, notes,
    };
    await onSave({ ...payload, _photoFile: photoFile });
  };

  const goNext = () => {
    const idx = tabs.findIndex(t => t.key === tab);
    const next = tabs[idx + 1];
    if (next) setTab(next.key);
  };
  const goPrev = () => {
    const idx = tabs.findIndex(t => t.key === tab);
    const prev = tabs[idx - 1];
    if (prev) setTab(prev.key);
  };

  const inp = 'w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors';
  const lbl = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';

  const tabs = [
    { key:'basico',   label:'Básico' },
    { key:'pessoal',  label:'Pessoal' },
    { key:'saude',    label:'Saúde' },
    { key:'endereco', label:'Endereço' },
    { key:'trabalho', label:'Trabalho' },
  ] as const;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden animate-fade-in max-h-[85vh] flex flex-col">
      {/* Cabeçalho */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
          {initial?.id ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
        </h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-4 h-4"/></button>
      </div>

      {/* Abas internas */}
      <div className="flex border-b border-slate-200 bg-white">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-[11px] font-black uppercase tracking-wide cursor-pointer border-b-2 transition-colors ${
              tab === t.key ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >{t.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* ── ABA BÁSICO ── */}
        {tab === 'basico' && (
          <div className="space-y-4">
            {/* Foto */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {photoPreview
                  ? <img src={photoPreview} alt="foto" className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200"/>
                  : <div className={`w-20 h-20 rounded-2xl ${initial?.id ? avatarBg(initial.id) : 'bg-slate-200'} flex items-center justify-center text-white text-xl font-black`}>
                      {full_name ? full_name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() : <Camera className="w-6 h-6 text-slate-400"/>}
                    </div>
                }
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 bg-emerald-700 text-white rounded-lg p-1 hover:bg-emerald-800 cursor-pointer shadow-sm">
                  <Camera className="w-3 h-3"/>
                </button>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Foto do funcionário</p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG ou WebP · máx 4 MB</p>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer">
                  Selecionar arquivo
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange}/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className={lbl}>Nome Completo *</label>
                <input className={inp} value={full_name} onChange={e=>setFullName(e.target.value)} placeholder="Ex: João da Silva"/>
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select className={inp} value={status} onChange={e=>setStatus(e.target.value)}>
                  <option>Ativo</option><option>Afastado</option><option>Férias</option><option>Desligado</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Cargo / Função *</label>
                <input className={inp} value={role} onChange={e=>setRole(e.target.value)} placeholder="Ex: Operador de Máquinas"/>
              </div>
              <div>
                <label className={lbl}>Departamento *</label>
                <input className={inp} value={department} onChange={e=>setDept(e.target.value)} list="dept-list" placeholder="Ex: Avicultura"/>
                <datalist id="dept-list">{['RH','Avicultura','Citricultura','Cafeicultura','Pecuária','Financeiro','Administrativo','Logística','TI'].map(d=><option key={d} value={d}/>)}</datalist>
              </div>
              <div>
                <label className={lbl}>Nível Hierárquico</label>
                <select className={inp} value={hierarchy_level} onChange={e=>setLevel(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(l=><option key={l} value={l}>{l} · {LEVEL_LABELS[l]}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Gestor / Superior Imediato</label>
                <select className={inp} value={manager_id} onChange={e=>setManagerId(e.target.value)}>
                  <option value="">— Sem gestor (nível raiz) —</option>
                  {possibleManagers.map(m=>(
                    <option key={m.id} value={m.id}>{m.full_name} · {m.role} · Nível {m.hierarchy_level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>E-mail</label>
                <input type="email" className={inp} value={email} onChange={e=>setEmail(e.target.value)} placeholder="joao@shigueno.com.br"/>
              </div>
              <div>
                <label className={lbl}>Telefone / WhatsApp</label>
                <input className={inp} value={phone} onChange={e=>setPhone(maskPhone(e.target.value))} placeholder="(15) 99999-0000" maxLength={15}/>
              </div>
              <div>
                <label className={lbl}>Telefone 2</label>
                <input className={inp} value={phone2} onChange={e=>setPhone2(maskPhone(e.target.value))} placeholder="Opcional" maxLength={15}/>
              </div>
            </div>
          </div>
        )}

        {/* ── ABA PESSOAL ── */}
        {tab === 'pessoal' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Documentos */}
            <div>
              <label className={lbl}>CPF</label>
              <input className={inp} value={cpf} onChange={e=>setCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14}/>
            </div>
            <div>
              <label className={lbl}>RG</label>
              <input className={inp} value={rg} onChange={e=>setRg(e.target.value.replace(/[^0-9Xx\-\.]/g,'').slice(0,18))} placeholder="00.000.000-0"/>
            </div>
            <div>
              <label className={lbl}>Sexo</label>
              <select className={inp} value={sex} onChange={e=>setSex(e.target.value)}>
                <option value="">—</option>
                <option>Masculino</option><option>Feminino</option>
                <option>Outro</option><option>Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Data de Nascimento</label>
              <input type="date" className={inp} value={birth_date} onChange={e=>setBirthDate(e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Tipo Sanguíneo</label>
              <select className={inp} value={blood_type} onChange={e=>setBloodType(e.target.value)}>
                <option value="">—</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Estado Civil</label>
              <select className={inp} value={marital_status} onChange={e=>setMaritalStatus(e.target.value)}>
                <option value="">—</option>
                {['Solteiro','Casado','União Estável','Divorciado','Viúvo','Outro'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Tem filhos?</label>
              <select className={inp} value={has_children ? 'sim' : 'nao'} onChange={e=>setHasChildren(e.target.value==='sim')}>
                <option value="nao">Não</option><option value="sim">Sim</option>
              </select>
            </div>
            {has_children && (
              <div>
                <label className={lbl}>Quantos filhos?</label>
                <input type="number" min="1" max="20" className={inp} value={children_count} onChange={e=>setChildrenCount(Number(e.target.value))}/>
              </div>
            )}
            <div className={has_children ? '' : 'sm:col-span-2'}>
              <label className={lbl}>Escolaridade</label>
              <select className={inp} value={education} onChange={e=>setEducation(e.target.value)}>
                <option value="">—</option>
                {['Fundamental Incompleto','Fundamental Completo','Médio Incompleto','Médio Completo','Superior Incompleto','Superior Completo','Pós-Graduação','Mestrado','Doutorado'].map(e=><option key={e}>{e}</option>)}
              </select>
            </div>

            {/* CNH */}
            <div className="sm:col-span-3 border-t border-slate-100 pt-4 mt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Habilitação (CNH)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>Possui CNH?</label>
                  <select className={inp} value={has_cnh ? 'sim' : 'nao'} onChange={e=>setHasCnh(e.target.value==='sim')}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </select>
                </div>
                {has_cnh && (
                  <div className="sm:col-span-2">
                    <label className={lbl}>Categoria(s) — pode selecionar múltiplas</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['A','B','C','D','E','AB','AC','AD','AE','ACC'].map(cat => (
                        <button key={cat} type="button"
                          onClick={() => {
                            const current = cnh_category.split(',').map(s=>s.trim()).filter(Boolean);
                            const next = current.includes(cat) ? current.filter(c=>c!==cat) : [...current, cat];
                            setCnhCategory(next.join(', '));
                          }}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg border cursor-pointer transition-all ${
                            cnh_category.split(',').map(s=>s.trim()).includes(cat)
                              ? 'bg-emerald-800 text-white border-emerald-800'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                          }`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    {cnh_category && <p className="text-[9px] text-emerald-700 font-bold mt-1.5">Selecionado: {cnh_category}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ABA SAÚDE ── */}
        {tab === 'saude' && (
          <div className="space-y-5">
            {/* PCD */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pessoa com Deficiência (PCD)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>É PCD?</label>
                  <select className={inp} value={is_pcd ? 'sim' : 'nao'} onChange={e=>setIsPcd(e.target.value==='sim')}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </select>
                </div>
                {is_pcd && (
                  <div className="sm:col-span-2">
                    <label className={lbl}>Tipo de Deficiência</label>
                    <input className={inp} value={pcd_type} onChange={e=>setPcdType(e.target.value)}
                      list="pcd-list" placeholder="Ex: Física, Visual, Auditiva..."/>
                    <datalist id="pcd-list">
                      {['Física','Visual','Auditiva','Intelectual','Múltipla','Transtorno do Espectro Autista (TEA)','Baixa Visão','Surdez','Surdocegueira'].map(p=><option key={p} value={p}/>)}
                    </datalist>
                  </div>
                )}
              </div>
            </div>

            {/* Medicação contínua */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Medicação Contínua</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>Toma remédio contínuo?</label>
                  <select className={inp} value={has_med ? 'sim' : 'nao'} onChange={e=>setHasMed(e.target.value==='sim')}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </select>
                </div>
                {has_med && (
                  <div className="sm:col-span-2">
                    <label className={lbl}>Quais medicamentos?</label>
                    <textarea rows={2} className={inp} value={medications} onChange={e=>setMedications(e.target.value)}
                      placeholder="Ex: Metformina 500mg, Losartana 50mg..."/>
                  </div>
                )}
              </div>
            </div>

            {/* Doenças crônicas */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Doenças Crônicas / Condições de Saúde</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>Possui doença crônica?</label>
                  <select className={inp} value={has_chronic ? 'sim' : 'nao'} onChange={e=>setHasChronic(e.target.value==='sim')}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </select>
                </div>
                {has_chronic && (
                  <div className="sm:col-span-2">
                    <label className={lbl}>Descrever condições</label>
                    <textarea rows={2} className={inp} value={chronic_diseases} onChange={e=>setChronicDis(e.target.value)}
                      placeholder="Ex: Diabetes tipo 2, Hipertensão, Asma..."/>
                  </div>
                )}
              </div>
            </div>

            {/* Alergias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Alergias conhecidas</label>
                <input className={inp} value={allergies} onChange={e=>setAllergies(e.target.value)}
                  placeholder="Ex: Dipirona, Penicilina, látex... ou Nenhuma"/>
              </div>
            </div>

            {/* Contato de emergência */}
            <div className="border-t border-slate-200 pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Contato de Emergência</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Nome</label>
                  <input className={inp} value={emerg_name} onChange={e=>setEmergName(e.target.value)} placeholder="Ex: Maria da Silva (mãe)"/>
                </div>
                <div>
                  <label className={lbl}>Telefone</label>
                  <input className={inp} value={emerg_phone}
                    onChange={e=>setEmergPhone(maskPhone(e.target.value))} placeholder="(15) 99999-0000"/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ABA ENDEREÇO ── */}
        {tab === 'endereco' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={lbl}>CEP</label>
              <div className="flex gap-2">
                <input className={inp} value={cep} onChange={e=>setCep(maskCep(e.target.value))} placeholder="00000-000" maxLength={9}
                  onBlur={fetchCep}/>
                <button type="button" onClick={fetchCep} disabled={cepLoading}
                  className="px-3 py-2 bg-emerald-800 text-white rounded-xl text-[10px] font-black hover:bg-emerald-900 cursor-pointer disabled:opacity-60 shrink-0 flex items-center gap-1">
                  {cepLoading ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Search className="w-3 h-3"/>}
                  Buscar
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Rua / Logradouro</label>
              <input className={inp} value={street} onChange={e=>setStreet(e.target.value)} placeholder="Rua, Avenida..."/>
            </div>
            <div>
              <label className={lbl}>Número</label>
              <input className={inp} value={street_number} onChange={e=>setStreetNum(e.target.value)} placeholder="123 / S/N"/>
            </div>
            <div>
              <label className={lbl}>Complemento</label>
              <input className={inp} value={complement} onChange={e=>setComplement(e.target.value)} placeholder="Apto, Bloco..."/>
            </div>
            <div>
              <label className={lbl}>Bairro</label>
              <input className={inp} value={neighborhood} onChange={e=>setNeighborhood(e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Cidade</label>
              <input className={inp} value={city} onChange={e=>setCity(e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Estado (UF)</label>
              <input className={inp} value={state} onChange={e=>setState(e.target.value)} maxLength={2} placeholder="SP"/>
            </div>
            <div>
              <label className={lbl}>País</label>
              <input className={inp} value={country} onChange={e=>setCountry(e.target.value)}/>
            </div>
          </div>
        )}

        {/* ── ABA TRABALHO ── */}
        {tab === 'trabalho' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Data de Admissão</label>
              <input type="date" className={inp} value={hire_date} onChange={e=>setHireDate(e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Data de Desligamento</label>
              <input type="date" className={inp} value={termination_date} onChange={e=>setTermDate(e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Local de Trabalho</label>
              <input className={inp} value={work_location} onChange={e=>setWorkLoc(e.target.value)} list="loc-list" placeholder="Tatuí (Sede)"/>
              <datalist id="loc-list">{['Tatuí (Sede)','Tatuí (Granja)','Tatuí (Fazenda Nova Aliança)','Buri - SP (Citros)','Itaí - SP (Café)','Leverger (MT)','Sorocaba (Distribuição)'].map(l=><option key={l} value={l}/>)}</datalist>
            </div>
            <div>
              <label className={lbl}>Salário (R$)</label>
              <input type="number" min="0" step="0.01" className={inp} value={salary} onChange={e=>setSalary(e.target.value)} placeholder="0,00"/>
            </div>
            <div className="sm:col-span-3">
              <label className={lbl}>Observações Internas</label>
              <textarea rows={3} className={inp} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Habilidades, histórico, equipamentos..."/>
            </div>
          </div>
        )}
      </div>

      {/* Navegação e ações */}
      <div className="px-6 pb-6 border-t border-slate-100 pt-4 flex items-center justify-between">
        {/* Dots de progresso */}
        <div className="flex items-center gap-1.5">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`h-2 rounded-full transition-all cursor-pointer ${tab === t.key ? 'bg-emerald-700 w-5' : 'bg-slate-200 w-2 hover:bg-slate-300'}`}
              title={t.label}/>
          ))}
          <span className="text-[10px] text-slate-400 font-bold ml-2">
            {tabs.findIndex(t=>t.key===tab)+1} / {tabs.length} — {tabs.find(t=>t.key===tab)?.label}
          </span>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer">
            Cancelar
          </button>
          {tabs.findIndex(t=>t.key===tab) > 0 && (
            <button type="button" onClick={goPrev}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer">
              ← Anterior
            </button>
          )}
          {tab !== 'trabalho'
            ? <button type="button" onClick={goNext}
                className="px-5 py-2 text-xs font-black bg-slate-800 hover:bg-slate-900 text-white rounded-xl cursor-pointer">
                Próximo →
              </button>
            : <button type="button" disabled={saving} onClick={handle}
                className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin"/>}
                <span>{saving ? 'Salvando...' : 'Salvar Funcionário'}</span>
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Card compacto do funcionário ──────────────────────────────────────────────
function EmpCard({ emp, onClick, onEdit, onDelete, canEdit }: {
  emp: Employee;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}): React.ReactElement {
  const days = birthdayIn(emp.birth_mmdd);
  const bday = days !== null && days <= 7;
  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden group ${
      days === 0 ? 'border-amber-400 ring-1 ring-amber-200'
      : bday ? 'border-amber-200 hover:border-amber-300'
      : 'border-slate-100 hover:border-emerald-200/70 hover:shadow-[0_4px_20px_rgba(4,120,87,0.08)]'
    } shadow-[0_2px_10px_rgba(0,0,0,0.04)]`}>
      <div className={`h-1 w-full ${emp.status==='Ativo'?'bg-emerald-500':emp.status==='Férias'?'bg-sky-400':emp.status==='Afastado'?'bg-amber-400':'bg-slate-300'}`}/>
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Avatar + nome */}
        <div className="flex items-start gap-3 cursor-pointer" onClick={onClick}>
          <Avatar emp={emp} size="md"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1.5">
              <p className="text-sm font-extrabold text-slate-900 leading-tight truncate">{emp.full_name}</p>
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${
                emp.status==='Ativo'?'bg-emerald-50 text-emerald-700 border-emerald-200':emp.status==='Férias'?'bg-sky-50 text-sky-700 border-sky-200':emp.status==='Afastado'?'bg-amber-50 text-amber-700 border-amber-200':'bg-slate-100 text-slate-400 border-slate-200'
              }`}>{emp.status}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{emp.role}</p>
          </div>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${deptClass(emp.department)}`}>{emp.department}</span>
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${levelClass(emp.hierarchy_level)}`}>N{emp.hierarchy_level}·{LEVEL_LABELS[emp.hierarchy_level]}</span>
        </div>
        {/* Gestor */}
        {emp.manager_name && (
          <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
            <ChevronUp className="w-3 h-3 shrink-0"/>{emp.manager_name}
          </p>
        )}
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="bg-slate-50 rounded-lg px-2 py-1.5">
            <p className="text-[8px] text-slate-400 font-bold uppercase">Casa</p>
            <p className="text-[11px] font-black text-slate-800">{yearsLabel(emp.years_of_service)}</p>
          </div>
          <div className={`rounded-lg px-2 py-1.5 ${days===0?'bg-amber-50':'bg-slate-50'}`}>
            <p className="text-[8px] text-slate-400 font-bold uppercase">Aniv.</p>
            <p className={`text-[11px] font-black ${days===0?'text-amber-600':'text-slate-800'}`}>
              {days===0?'🎂 Hoje':bday&&days!==null?`${days}d`:fmtDateShort(emp.birth_date)}
            </p>
          </div>
        </div>
        {/* Ações */}
        <div className="pt-2 mt-auto border-t border-slate-100 flex items-center justify-between">
          <button onClick={onClick} className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer">
            <Eye className="w-3 h-3"/>Ver detalhes
          </button>
          {canEdit && (
            <div className="flex gap-1">
              <button onClick={e=>{e.stopPropagation();onEdit();}} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"><Edit className="w-3.5 h-3.5"/></button>
              <button onClick={e=>{e.stopPropagation();onDelete();}} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── OrgChart — NodeRow como componente React de primeiro nível ───────────────
// NodeRow DEVE ser declarado fora de OrgChart para que os hooks funcionem corretamente.
// Chamar uma função com hooks como NodeRow({...}) viola as regras dos hooks.

function buildOrgTree(employees: Employee[], parentId: number | null): Employee[] {
  return employees
    .filter(e => (e.manager_id ?? null) === parentId)
    .sort((a, b) =>
      (b.hierarchy_level || 1) - (a.hierarchy_level || 1) ||
      (a.full_name > b.full_name ? 1 : -1)
    );
}

function OrgNodeRow({
  emp,
  depth,
  allEmployees,
}: {
  emp: Employee;
  depth: number;
  allEmployees: Employee[];
}) {
  const children: Employee[] = React.useMemo(
    () => buildOrgTree(allEmployees, emp.id),
    [allEmployees, emp.id]
  );
  const [open, setOpen] = React.useState(depth < 2);

  return (
    <div>
      {/* Linha do nó */}
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default ${
          depth === 0
            ? 'bg-slate-50 border border-slate-200'
            : 'border-l-2 border-slate-200 mt-1'
        }`}
        style={{ marginLeft: depth > 0 ? `${depth * 24}px` : undefined }}
      >
        <Avatar emp={emp} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-slate-900 truncate">{emp.full_name}</p>
          <p className="text-[9px] text-slate-500 truncate">{emp.role}</p>
        </div>
        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${levelClass(emp.hierarchy_level || 1)}`}>
          N{emp.hierarchy_level}·{LEVEL_LABELS[emp.hierarchy_level || 1]}
        </span>
        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${deptClass(emp.department)}`}>
          {emp.department}
        </span>
        {children.length > 0 ? (
          <button
            onClick={() => setOpen(v => !v)}
            className="p-1 rounded cursor-pointer text-slate-400 hover:text-slate-700 shrink-0"
          >
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
      </div>

      {/* Filhos recursivos */}
      {open && children.map(child =>
        <React.Fragment key={child.id}>
          <OrgNodeRow emp={child} depth={depth + 1} allEmployees={allEmployees} />
        </React.Fragment>
      )}
    </div>
  );
}

function OrgChart({ employees }: { employees: Employee[] }) {
  const roots = React.useMemo(() => buildOrgTree(employees, null), [employees]);

  if (roots.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic text-center py-8">
        Nenhum funcionário sem gestor encontrado.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-1 overflow-x-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Shield className="w-4 h-4 text-slate-500" />
        <p className="text-xs font-black text-slate-600 uppercase tracking-wide">
          Organograma completo — clique nas setas para expandir/recolher
        </p>
      </div>
      {roots.map(root =>
        <React.Fragment key={root.id}>
          <OrgNodeRow emp={root} depth={0} allEmployees={employees} />
        </React.Fragment>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function EmployeesTab({ token, canEdit }: { token: string; canEdit: boolean }) {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string|null>(null);
  const [success, setSuccess] = React.useState<string|null>(null);

  const [search, setSearch] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('Todos');
  const [statusFilter, setStatusFilter] = React.useState('Ativo');
  const [viewMode, setViewMode] = React.useState<'cards'|'list'|'org'>('cards');

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingEmp, setEditingEmp] = React.useState<Employee|undefined>(undefined);
  const [viewingEmp, setViewingEmp] = React.useState<(Employee & {reports?:Employee[]})|null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{id:number;name:string}|null>(null);

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers||{}), Authorization: token } });

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams();
      if (deptFilter !== 'Todos') p.set('dept', deptFilter);
      if (statusFilter !== 'Todos') p.set('status', statusFilter);
      if (search.trim()) p.set('search', search.trim());
      const res = await fetch(`/api/employees?${p}`);
      const d = await res.json();
      if (d.success) { setEmployees(d.employees||[]); setUpcomingBirthdays(d.upcoming_birthdays||[]); }
    } catch { setError('Erro ao carregar equipe.'); }
    finally { setLoading(false); }
  }, [deptFilter, statusFilter, search]);

  React.useEffect(() => { load(); }, [load]);

  const showOk = (msg: string) => { setSuccess(msg); setTimeout(()=>setSuccess(null), 4000); };

  const openDetail = async (emp: Employee) => {
    try {
      const r = await fetch(`/api/employees/${emp.id}`);
      const d = await r.json();
      if (d.success) setViewingEmp({ ...d.employee, reports: d.reports });
    } catch { setViewingEmp(emp); }
  };

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const photoFile: File|null = data._photoFile || null;
      delete data._photoFile;
      const url = editingEmp ? `/api/employees/${editingEmp.id}` : '/api/employees';
      const method = editingEmp ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      // Upload de foto se houver
      if (photoFile) {
        const empId = editingEmp?.id || json.id;
        const fd = new FormData();
        fd.append('photo', photoFile);
        await authFetch(`/api/employees/${empId}/photo`, { method:'POST', body: fd });
      }
      showOk(editingEmp ? 'Funcionário atualizado.' : 'Funcionário cadastrado!');
      setFormOpen(false); setEditingEmp(undefined); load();
    } catch { setError('Erro de rede.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await authFetch(`/api/employees/${deleteTarget.id}`, { method:'DELETE' });
      showOk('Funcionário removido.');
      if (viewingEmp?.id === deleteTarget.id) setViewingEmp(null);
      load();
    } catch { setError('Erro ao remover.'); }
    finally { setDeleteTarget(null); }
  };

  const allDepts = React.useMemo(() => {
    const s = new Set(employees.map(e=>e.department));
    return ['Todos', ...Array.from(s).sort()];
  }, [employees]);

  const totalActive = employees.filter(e=>e.status==='Ativo').length;
  const avgYears = (() => {
    const v = employees.map(e=>e.years_of_service).filter((y): y is number => y!==undefined&&y!==null);
    return v.length ? Math.round(v.reduce((a,b)=>a+b,0)/v.length) : 0;
  })();

  return (
    <div className="space-y-6">
      {/* Toast fixo no canto superior direito */}
      {success && (
        <Portal>
          <div className="fixed top-5 right-5 z-[99999] animate-fade-in">
            <div className="bg-emerald-800 text-white rounded-2xl px-5 py-3.5 text-xs font-bold flex items-center gap-3 shadow-2xl min-w-[260px]">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300"/>
              <span>{success}</span>
              <button onClick={()=>setSuccess(null)} className="ml-auto text-emerald-300 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        </Portal>
      )}
      {error && (
        <Portal>
          <div className="fixed top-5 right-5 z-[99999] animate-fade-in">
            <div className="bg-rose-700 text-white rounded-2xl px-5 py-3.5 text-xs font-bold flex items-center gap-3 shadow-2xl min-w-[260px]">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-300"/>
              <span>{error}</span>
              <button onClick={()=>setError(null)} className="ml-auto text-rose-300 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        </Portal>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users,     color:'bg-emerald-50 text-emerald-700', label:'Funcionários',    value: totalActive },
          { icon: Layers,    color:'bg-blue-50 text-blue-700',       label:'Departamentos',   value: new Set(employees.map(e=>e.department)).size },
          { icon: TrendingUp,color:'bg-amber-50 text-amber-700',     label:'Tempo médio',     value: `${avgYears} ano${avgYears!==1?'s':''}` },
          { icon: Cake,      color:'bg-rose-50 text-rose-600',       label:'Aniv. 30 dias',   value: upcomingBirthdays.length },
        ].map(({ icon:Icon, color, label, value })=>(
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className={`p-2.5 rounded-xl shrink-0 ${color}`}><Icon className="w-4 h-4"/></div>
            <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-wide">{label}</p><p className="text-lg font-black text-slate-900">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Aniversários próximos */}
      {upcomingBirthdays.length>0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-2 mb-3"><Cake className="w-4 h-4"/>Aniversários nos próximos 30 dias</p>
          <div className="flex flex-wrap gap-2">
            {upcomingBirthdays.map(e=>{
              const d = birthdayIn(e.birth_mmdd);
              return (
                <button key={e.id} onClick={()=>openDetail(e)} className="bg-white border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2 hover:border-amber-400 cursor-pointer transition-colors">
                  <Avatar emp={e} size="sm"/>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">{e.full_name}</p>
                    <p className="text-[9px] text-amber-600 font-bold">{d===0?'🎂 Hoje!':`em ${d}d`}{e.birth_date?` · ${fmtDateShort(e.birth_date)}`:''}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar nome, cargo ou departamento..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all"/>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer">
            {allDepts.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer">
            <option value="Todos">Todos</option><option>Ativo</option><option>Afastado</option><option>Férias</option><option>Desligado</option>
          </select>
          <div className="flex bg-slate-100 rounded-xl p-0.5">
            {(['cards','list','org'] as const).map(v=>(
              <button key={v} onClick={()=>setViewMode(v)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${viewMode===v?'bg-white shadow-sm text-slate-800':'text-slate-400 hover:text-slate-600'}`}>
                {v==='cards'?'Cards':v==='list'?'Lista':'Org'}
              </button>
            ))}
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin':''}`}/>
          </button>
          {canEdit && !formOpen && (
            <button onClick={()=>{setEditingEmp(undefined);setFormOpen(true);}} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
              <Plus className="w-3.5 h-3.5"/>Novo Funcionário
            </button>
          )}
        </div>
      </div>

      {/* Formulário */}
      {formOpen && canEdit && (
        <EmployeeForm initial={editingEmp} employees={employees} onSave={handleSave}
          onCancel={()=>{setFormOpen(false);setEditingEmp(undefined);}} saving={saving}/>
      )}

      {/* Lista */}
      {loading ? (
        <div className="py-20 flex flex-col items-center text-slate-400 gap-3">
          <RefreshCw className="w-7 h-7 animate-spin text-emerald-700"/>
          <span className="text-sm">Carregando equipe...</span>
        </div>
      ) : employees.length===0 ? (
        <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
          <p className="text-sm font-bold text-slate-500">Nenhum funcionário encontrado.</p>
          {canEdit && <p className="text-xs text-slate-400 mt-1">Clique em "Novo Funcionário" para cadastrar a equipe.</p>}
        </div>
      ) : (
        <>
          {viewMode==='cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {employees.map((e: Employee) => {
                const card = EmpCard({
                  emp: e, canEdit,
                  onClick: () => openDetail(e),
                  onEdit: () => { setEditingEmp(e); setFormOpen(true); },
                  onDelete: () => setDeleteTarget({ id:e.id, name:e.full_name }),
                });
                return <React.Fragment key={e.id}>{card}</React.Fragment>;
              })}
            </div>
          )}

          {viewMode==='list' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>{['Funcionário','Cargo','Depto','Nível','Gestor','Admissão','Tempo','Status',''].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map(e=>{
                    const d=birthdayIn(e.birth_mmdd); const bd=d!==null&&d<=7;
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={()=>openDetail(e)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar emp={e} size="sm"/>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 truncate">{e.full_name}</p>
                              {bd&&<p className="text-[9px] text-amber-600 font-bold">🎂 {d===0?'Hoje!':'em '+d+'d'}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-semibold whitespace-nowrap">{e.role}</td>
                        <td className="px-4 py-3"><span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${deptClass(e.department)}`}>{e.department}</span></td>
                        <td className="px-4 py-3"><span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${levelClass(e.hierarchy_level||1)}`}>N{e.hierarchy_level}·{LEVEL_LABELS[e.hierarchy_level||1]}</span></td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{e.manager_name||<span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">{fmtDate(e.hire_date)}</td>
                        <td className="px-4 py-3 font-bold whitespace-nowrap">{yearsLabel(e.years_of_service)}</td>
                        <td className="px-4 py-3"><span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${e.status==='Ativo'?'bg-emerald-50 text-emerald-700 border-emerald-200':e.status==='Férias'?'bg-sky-50 text-sky-700 border-sky-200':e.status==='Afastado'?'bg-amber-50 text-amber-700 border-amber-200':'bg-slate-100 text-slate-400 border-slate-200'}`}>{e.status}</span></td>
                        {canEdit&&<td className="px-4 py-3" onClick={ev=>ev.stopPropagation()}>
                          <div className="flex gap-1">
                            <button onClick={()=>{setEditingEmp(e);setFormOpen(true);}} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"><Edit className="w-3.5 h-3.5"/></button>
                            <button onClick={()=>setDeleteTarget({id:e.id,name:e.full_name})} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                        </td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {viewMode==='org' && <OrgChart employees={employees}/>}
        </>
      )}

      {/* Modal de detalhes */}
      {viewingEmp && (
        <EmployeeModal
          emp={viewingEmp}
          canEdit={canEdit}
          onClose={()=>setViewingEmp(null)}
          onEdit={()=>{setEditingEmp(viewingEmp);setFormOpen(true);setViewingEmp(null);}}
        />
      )}

      {/* Modal de exclusão */}
      {deleteTarget && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-rose-600 mb-3"><AlertCircle className="w-5 h-5"/><h3 className="font-black text-slate-900 text-sm">Remover Funcionário</h3></div>
              <p className="text-xs text-slate-600 mb-1">Deseja remover <strong>{deleteTarget.name}</strong>?</p>
              <p className="text-[10px] text-rose-400 font-mono mb-5">Subordinados terão o vínculo de gestor removido automaticamente.</p>
              <div className="flex justify-end gap-2">
                <button onClick={()=>setDeleteTarget(null)} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer">Cancelar</button>
                <button onClick={handleDelete} className="px-4 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer">Confirmar Exclusão</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
