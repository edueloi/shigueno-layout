import React from 'react';
import { Portal } from '../hooks/usePortal';
import {
  DollarSign, Users, Package, Truck, Calendar, Plus, Edit,
  Trash2, X, RefreshCw, AlertCircle, CheckCircle2, Search,
  TrendingUp, TrendingDown, AlertTriangle, ChevronDown,
  FileText, BarChart2, ArrowUpCircle, ArrowDownCircle, Clock
} from 'lucide-react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type FinTab = 'folha' | 'ferias' | 'fornecedores' | 'estoque';

interface PayrollRow {
  id: number;
  employee_id: number;
  full_name: string;
  role: string;
  department: string;
  reference_month: string;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_salary: number;
  status: 'Rascunho' | 'Processado' | 'Pago';
  paid_at?: string;
  notes?: string;
}

interface Vacation {
  id: number;
  employee_id: number;
  full_name: string;
  department: string;
  role: string;
  days_requested: number;
  start_date: string;
  end_date: string;
  days_count: number;
  has_pecuniary: boolean | number;
  pecuniary_days: number;
  has_advance_13: boolean | number;
  has_salary_advance: boolean | number;
  salary_advance_value: number;
  acquisition_start?: string;
  acquisition_end?: string;
  status: string;
  approved_by?: string;
  notes?: string;
}

interface Supplier {
  id: number;
  name: string;
  cnpj?: string;
  category?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  status: 'Ativo' | 'Inativo';
  notes?: string;
}

interface StockItem {
  id: number;
  name: string;
  category?: string;
  unit?: string;
  quantity: number;
  min_quantity: number;
  location?: string;
  supplier_id?: number;
  supplier_name?: string;
  unit_cost?: number;
  notes?: string;
}

// ── Helpers visuais ───────────────────────────────────────────────────────────

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtR = (v: number) => `R$ ${fmt(v)}`;
const fmtDate = (s?: string) => s ? new Date(s + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

const STATUS_PAY: Record<string, string> = {
  'Rascunho':   'bg-slate-100 text-slate-600 border-slate-200',
  'Processado': 'bg-amber-50  text-amber-700 border-amber-200',
  'Pago':       'bg-emerald-50 text-emerald-700 border-emerald-200',
};
const STATUS_VAC: Record<string, string> = {
  'Solicitado': 'bg-blue-50 text-blue-700 border-blue-200',
  'Aprovado':   'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Em curso':   'bg-sky-50 text-sky-700 border-sky-200',
  'Concluído':  'bg-slate-100 text-slate-600 border-slate-200',
  'Cancelado':  'bg-rose-50 text-rose-600 border-rose-200',
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

function inp(extra = '') {
  return `w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors ${extra}`;
}
const lbl = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';

// ── Folha de Pagamento ────────────────────────────────────────────────────────

function FolhaPagamento({ token }: { token: string }) {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = React.useState(defaultMonth);
  const [rows, setRows] = React.useState<PayrollRow[]>([]);
  const [totals, setTotals] = React.useState({ base: 0, bonuses: 0, deductions: 0, net: 0 });
  const [employees, setEmployees] = React.useState<{ id: number; full_name: string; role: string; department: string; salary?: number }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Partial<PayrollRow> | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: token } });

  const load = async () => {
    setLoading(true);
    try {
      const [pr, emp] = await Promise.all([
        fetch(`/api/financeiro/payroll?month=${month}`).then(r => r.json()),
        fetch('/api/employees?status=Ativo').then(r => r.json()),
      ]);
      if (pr.success) { setRows(pr.payroll); setTotals(pr.totals); }
      if (emp.success) setEmployees(emp.employees);
    } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, [month]);

  const showOk = (m: string) => { setSuccess(m); setTimeout(() => setSuccess(''), 4000); };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const url = editing.id ? `/api/financeiro/payroll/${editing.id}` : '/api/financeiro/payroll';
      const method = editing.id ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editing, reference_month: month }) });
      const d = await res.json();
      if (d.success) { showOk('Registro salvo.'); setFormOpen(false); setEditing(null); load(); }
      else setError(d.error);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este registro da folha?')) return;
    await authFetch(`/api/financeiro/payroll/${id}`, { method: 'DELETE' });
    load();
  };

  const openNew = () => {
    setEditing({ base_salary: 0, bonuses: 0, deductions: 0, status: 'Rascunho' });
    setFormOpen(true);
  };

  // Gerar folha automática com base nos salários dos funcionários
  const generateAll = async () => {
    if (!confirm(`Gerar entradas de folha para todos os funcionários ativos em ${month}? Existentes serão mantidos.`)) return;
    setSaving(true);
    for (const emp of employees) {
      await authFetch('/api/financeiro/payroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: emp.id, reference_month: month, base_salary: emp.salary || 0, bonuses: 0, deductions: 0, status: 'Rascunho' }),
      });
    }
    setSaving(false);
    showOk('Folha gerada para todos os funcionários ativos.');
    load();
  };

  return (
    <div className="space-y-5">
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-3.5 h-3.5" /></button></div>}

      {/* Cabeçalho + filtro de mês */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Folha de Pagamento</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Gerencie salários, bônus e descontos mensais da equipe</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600" />
          <button onClick={generateAll} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
            <FileText className="w-3.5 h-3.5" />Gerar Folha
          </button>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
            <Plus className="w-3.5 h-3.5" />Novo Registro
          </button>
        </div>
      </div>

      {/* KPIs totais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Salário Base Total', value: fmtR(totals.base), color: 'text-slate-900', bg: 'bg-white', icon: DollarSign },
          { label: 'Bônus / Adicionais', value: fmtR(totals.bonuses), color: 'text-emerald-700', bg: 'bg-emerald-50', icon: TrendingUp },
          { label: 'Descontos',          value: fmtR(totals.deductions), color: 'text-rose-700', bg: 'bg-rose-50', icon: TrendingDown },
          { label: 'Líquido Total',      value: fmtR(totals.net), color: 'text-emerald-800', bg: 'bg-emerald-50', icon: BarChart2 },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`${bg} border border-slate-100 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wide">{label}</p>
            </div>
            <p className={`text-base font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Formulário */}
      {formOpen && editing && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black text-slate-900 uppercase">
              {editing.id ? 'Editar Registro' : 'Novo Registro de Folha'}
            </h4>
            <button type="button" onClick={() => { setFormOpen(false); setEditing(null); }} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {!editing.id && (
              <div className="sm:col-span-2">
                <label className={lbl}>Funcionário *</label>
                <select required className={inp()} value={editing.employee_id || ''} onChange={e => {
                  const emp = employees.find(em => em.id === Number(e.target.value));
                  setEditing(prev => ({ ...prev, employee_id: Number(e.target.value), base_salary: emp?.salary || 0 }));
                }}>
                  <option value="">— Selecione —</option>
                  {employees.map(em => <option key={em.id} value={em.id}>{em.full_name} · {em.department}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className={lbl}>Status</label>
              <select className={inp()} value={editing.status || 'Rascunho'} onChange={e => setEditing(p => ({ ...p, status: e.target.value as any }))}>
                <option>Rascunho</option><option>Processado</option><option>Pago</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Salário Base (R$)</label>
              <input type="number" min="0" step="0.01" required className={inp()} value={editing.base_salary || 0} onChange={e => setEditing(p => ({ ...p, base_salary: Number(e.target.value) }))} />
            </div>
            <div>
              <label className={lbl}>Bônus / Adicionais (R$)</label>
              <input type="number" min="0" step="0.01" className={inp()} value={editing.bonuses || 0} onChange={e => setEditing(p => ({ ...p, bonuses: Number(e.target.value) }))} />
            </div>
            <div>
              <label className={lbl}>Descontos (R$)</label>
              <input type="number" min="0" step="0.01" className={inp()} value={editing.deductions || 0} onChange={e => setEditing(p => ({ ...p, deductions: Number(e.target.value) }))} />
            </div>
            {editing.status === 'Pago' && (
              <div>
                <label className={lbl}>Data de Pagamento</label>
                <input type="date" className={inp()} value={editing.paid_at || ''} onChange={e => setEditing(p => ({ ...p, paid_at: e.target.value }))} />
              </div>
            )}
            <div className="sm:col-span-3">
              <label className={lbl}>Observações</label>
              <textarea rows={2} className={inp()} value={editing.notes || ''} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => { setFormOpen(false); setEditing(null); }} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      )}

      {/* Tabela */}
      {loading ? (
        <div className="py-12 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-700" /></div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-400">Nenhum registro para {month}.</p>
          <p className="text-xs text-slate-400 mt-1">Clique em "Gerar Folha" para criar automaticamente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Funcionário', 'Dept.', 'Base', 'Bônus', 'Descontos', 'Líquido', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-extrabold text-slate-900 whitespace-nowrap">{r.full_name}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.department}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{fmtR(Number(r.base_salary))}</td>
                  <td className="px-4 py-3 font-mono text-emerald-700">{r.bonuses > 0 ? `+${fmtR(Number(r.bonuses))}` : '—'}</td>
                  <td className="px-4 py-3 font-mono text-rose-600">{r.deductions > 0 ? `-${fmtR(Number(r.deductions))}` : '—'}</td>
                  <td className="px-4 py-3 font-mono font-black text-emerald-800">{fmtR(Number(r.net_salary))}</td>
                  <td className="px-4 py-3"><Badge label={r.status} cls={STATUS_PAY[r.status] || STATUS_PAY['Rascunho']} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(r); setFormOpen(true); }} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Férias ────────────────────────────────────────────────────────────────────

// Calcula data fim a partir da data início + dias solicitados (pula fins de semana opcional)
function calcEndDate(startDate: string, days: number): string {
  if (!startDate || !days) return '';
  const d = new Date(startDate + 'T00:00:00');
  d.setDate(d.getDate() + days - 1);
  return d.toISOString().slice(0, 10);
}

function VacationForm({ initial, employees, onSave, onCancel, saving }: {
  initial: Partial<Vacation>;
  employees: { id: number; full_name: string; department: string; salary?: number }[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [employee_id,          setEmployeeId]        = React.useState(initial.employee_id ? String(initial.employee_id) : '');
  const [days_requested,       setDaysRequested]     = React.useState<number>(initial.days_requested || 30);
  const [start_date,           setStartDate]         = React.useState(initial.start_date ? String(initial.start_date).slice(0,10) : '');
  const [status,               setStatus]            = React.useState(initial.status || 'Solicitado');
  const [approved_by,          setApprovedBy]        = React.useState(initial.approved_by || '');
  const [has_pecuniary,        setHasPecuniary]      = React.useState(!!initial.has_pecuniary);
  const [pecuniary_days,       setPecuniaryDays]     = React.useState<number>(initial.pecuniary_days || 0);
  const [has_advance_13,       setHasAdv13]          = React.useState(!!initial.has_advance_13);
  const [has_salary_advance,   setHasSalaryAdv]      = React.useState(!!initial.has_salary_advance);
  const [salary_advance_value, setSalaryAdvVal]      = React.useState(initial.salary_advance_value ? String(initial.salary_advance_value) : '');
  const [acquisition_start,    setAcqStart]          = React.useState(initial.acquisition_start ? String(initial.acquisition_start).slice(0,10) : '');
  const [acquisition_end,      setAcqEnd]            = React.useState(initial.acquisition_end ? String(initial.acquisition_end).slice(0,10) : '');
  const [notes,                setNotes]             = React.useState(initial.notes || '');

  // Data fim calculada automaticamente
  const end_date = React.useMemo(() => calcEndDate(start_date, days_requested), [start_date, days_requested]);

  // Dias disponíveis para abono (máx 1/3 dos dias solicitados, máx 10)
  const maxPecuniaryDays = Math.min(10, Math.floor(days_requested / 3));

  const selectedEmp = employees.find(e => e.id === Number(employee_id));

  const iField = 'w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors';
  const iLbl   = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';

  const toggleRow = (label: string, checked: boolean, onChange: (v: boolean) => void, children?: React.ReactNode) => (
    <div className={`rounded-xl border p-3.5 transition-all ${checked ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-800">{label}</span>
        <button type="button" onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors cursor-pointer ${checked ? 'bg-emerald-700' : 'bg-slate-300'}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}/>
        </button>
      </div>
      {checked && children && <div className="mt-3 pt-3 border-t border-emerald-100">{children}</div>}
    </div>
  );

  const handle = async () => {
    if (!start_date || !days_requested || (!initial.id && !employee_id)) return;
    // end_date calculado no frontend e enviado ao backend (compatível com servidor antigo e novo)
    const computed_end = calcEndDate(start_date, days_requested);
    await onSave({
      employee_id: employee_id ? Number(employee_id) : initial.employee_id,
      days_requested,
      start_date,
      end_date: computed_end,
      has_pecuniary, pecuniary_days: has_pecuniary ? pecuniary_days : 0,
      has_advance_13, has_salary_advance,
      salary_advance_value: has_salary_advance ? (Number(salary_advance_value) || 0) : 0,
      acquisition_start: acquisition_start || null,
      acquisition_end: acquisition_end || null,
      status, approved_by: approved_by || null, notes: notes || null,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
            {initial.id ? 'Editar Registro de Férias' : 'Nova Solicitação de Férias'}
          </h4>
          {selectedEmp && <p className="text-[10px] text-slate-400 mt-0.5">{selectedEmp.full_name} · {selectedEmp.department}</p>}
        </div>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-4 h-4"/></button>
      </div>

      <div className="p-5 space-y-5">
        {/* Funcionário + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!initial.id && (
            <div className="sm:col-span-2">
              <label className={iLbl}>Funcionário *</label>
              <select className={iField} value={employee_id} onChange={e => setEmployeeId(e.target.value)}>
                <option value="">— Selecione o funcionário —</option>
                {employees.map(em => <option key={em.id} value={em.id}>{em.full_name} · {em.department}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={iLbl}>Status</label>
            <select className={iField} value={status} onChange={e => setStatus(e.target.value)}>
              {['Solicitado','Aprovado','Em curso','Concluído','Cancelado'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Datas — o grande diferencial: dias → data fim calculada */}
        <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Período de Férias</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={iLbl}>Qtd. de Dias *</label>
              <input type="number" min="1" max="30" className={iField}
                value={days_requested}
                onChange={e => setDaysRequested(Math.min(30, Math.max(1, Number(e.target.value))))}/>
              <p className="text-[9px] text-slate-400 mt-1">Máx. 30 dias por período</p>
            </div>
            <div>
              <label className={iLbl}>Data de Início *</label>
              <input type="date" className={iField} value={start_date} onChange={e => setStartDate(e.target.value)}/>
            </div>
            <div>
              <label className={iLbl}>Data de Retorno (calculada)</label>
              <div className={`${iField} bg-emerald-50 border-emerald-200 text-emerald-800 font-black flex items-center gap-2`}>
                <Calendar className="w-3.5 h-3.5 shrink-0"/>
                {end_date ? new Date(end_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
              </div>
              <p className="text-[9px] text-emerald-700 font-bold mt-1">
                {end_date && start_date ? `Retorna dia ${new Date(end_date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}` : ''}
              </p>
            </div>
          </div>

          {/* Resumo visual do período */}
          {start_date && end_date && (
            <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"/>
                Início: <strong>{new Date(start_date + 'T00:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-slate-400"/>
                Retorno: <strong>{new Date(end_date + 'T00:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}</strong>
              </span>
              <span className="flex items-center gap-1.5 font-black text-emerald-700">
                <Calendar className="w-3.5 h-3.5"/>
                {days_requested} dias corridos
              </span>
              {has_pecuniary && pecuniary_days > 0 && (
                <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                  💰 Abono: {pecuniary_days} dia{pecuniary_days !== 1 ? 's' : ''} vendidos
                </span>
              )}
            </div>
          )}
        </div>

        {/* Período aquisitivo */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Período Aquisitivo (opcional)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={iLbl}>Início do período aquisitivo</label>
              <input type="date" className={iField} value={acquisition_start} onChange={e => setAcqStart(e.target.value)}/>
            </div>
            <div>
              <label className={iLbl}>Fim do período aquisitivo</label>
              <input type="date" className={iField} value={acquisition_end} onChange={e => setAcqEnd(e.target.value)}/>
            </div>
          </div>
        </div>

        {/* Benefícios — toggles */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Benefícios & Adiantamentos</p>

          {toggleRow(
            '💰 Abono Pecuniário — Venda de dias de férias (1/3)',
            has_pecuniary,
            setHasPecuniary,
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={iLbl}>Dias a vender (máx {maxPecuniaryDays})</label>
                <input type="number" min="1" max={maxPecuniaryDays} className={iField}
                  value={pecuniary_days}
                  onChange={e => setPecuniaryDays(Math.min(maxPecuniaryDays, Math.max(1, Number(e.target.value))))}/>
              </div>
              <div className="flex items-end">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Funcionário receberá remuneração proporcional por {pecuniary_days} dia{pecuniary_days !== 1 ? 's' : ''} não gozados.
                </p>
              </div>
            </div>
          )}

          {toggleRow(
            '📋 Adiantamento do 13º Salário',
            has_advance_13,
            setHasAdv13,
            <p className="text-[10px] text-slate-500">O funcionário receberá a 1ª parcela do 13º salário junto com o pagamento das férias.</p>
          )}

          {toggleRow(
            '💵 Adiantamento Salarial',
            has_salary_advance,
            setHasSalaryAdv,
            <div>
              <label className={iLbl}>Valor do adiantamento (R$)</label>
              <input type="number" min="0" step="0.01" className={iField}
                value={salary_advance_value}
                onChange={e => setSalaryAdvVal(e.target.value)}
                placeholder="Ex: 1500,00"/>
            </div>
          )}
        </div>

        {/* Aprovação + Observações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={iLbl}>Aprovado Por</label>
            <input className={iField} value={approved_by} onChange={e => setApprovedBy(e.target.value)} placeholder="Nome do gestor aprovador"/>
          </div>
          <div>
            <label className={iLbl}>Observações</label>
            <input className={iField} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Informações adicionais..."/>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="px-5 pb-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer">Cancelar</button>
        <button type="button" disabled={saving || !start_date || !days_requested} onClick={handle}
          className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
          {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin"/>}
          <span>{saving ? 'Salvando...' : 'Salvar Férias'}</span>
        </button>
      </div>
    </div>
  );
}

function FeriasTab({ token }: { token: string }) {
  const [vacations, setVacations] = React.useState<Vacation[]>([]);
  const [employees, setEmployees] = React.useState<{ id: number; full_name: string; department: string; salary?: number }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Partial<Vacation> | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('Todos');

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: token } });

  const load = async () => {
    setLoading(true);
    const [vac, emp] = await Promise.all([
      fetch('/api/financeiro/vacations').then(r => r.json()),
      fetch('/api/employees?status=Ativo').then(r => r.json()),
    ]);
    if (vac.success) setVacations(vac.vacations);
    if (emp.success) setEmployees(emp.employees);
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const showOk = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const url = editing?.id ? `/api/financeiro/vacations/${editing.id}` : '/api/financeiro/vacations';
      const method = editing?.id ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const d = await res.json();
      if (d.success) { showOk('Férias salvas com sucesso!'); setFormOpen(false); setEditing(null); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este registro de férias?')) return;
    await authFetch(`/api/financeiro/vacations/${id}`, { method: 'DELETE' });
    showOk('Registro removido.');
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const inProgress = vacations.filter(v =>
    v.status === 'Em curso' ||
    (v.start_date <= today && v.end_date >= today && v.status === 'Aprovado')
  );

  const filtered = filterStatus === 'Todos' ? vacations : vacations.filter(v => v.status === filterStatus);

  return (
    <div className="space-y-5">
      {/* Toast sucesso */}
      {success && (
        <Portal>
          <div className="fixed top-5 right-5 z-[99999]">
            <div className="bg-emerald-800 text-white rounded-2xl px-5 py-3.5 text-xs font-bold flex items-center gap-3 shadow-2xl min-w-[260px]">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300"/>
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto text-emerald-300 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        </Portal>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900">Controle de Férias</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Gerencie solicitações com abono pecuniário, adiantamentos e período aquisitivo</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer">
            {['Todos','Solicitado','Aprovado','Em curso','Concluído','Cancelado'].map(s => <option key={s}>{s}</option>)}
          </select>
          {!formOpen && (
            <button onClick={() => { setEditing({ status: 'Solicitado', days_requested: 30 }); setFormOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
              <Plus className="w-3.5 h-3.5"/>Nova Solicitação
            </button>
          )}
        </div>
      </div>

      {/* Banner: férias em andamento */}
      {inProgress.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
          <p className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4"/>Férias em andamento agora ({inProgress.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {inProgress.map(v => (
              <div key={v.id} className="bg-white border border-sky-200 rounded-xl px-3 py-2.5">
                <p className="text-xs font-extrabold text-slate-900">{v.full_name}</p>
                <p className="text-[9px] text-sky-600 font-bold">
                  {fmtDate(v.start_date)} → {fmtDate(v.end_date)} · {v.days_count ?? v.days_requested}d
                  {v.has_pecuniary ? ' · 💰 Abono' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário */}
      {formOpen && editing && (
        <VacationForm
          initial={editing}
          employees={employees}
          onSave={handleSave}
          onCancel={() => { setFormOpen(false); setEditing(null); }}
          saving={saving}
        />
      )}

      {/* Lista */}
      {loading ? (
        <div className="py-12 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-700"/></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2"/>
          <p className="text-sm font-bold text-slate-400">Nenhuma férias registrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => {
            const days = v.days_count ?? v.days_requested ?? 0;
            return (
              <div key={v.id} className={`bg-white rounded-2xl border transition-all ${
                v.status === 'Em curso' || (v.start_date <= today && v.end_date >= today)
                  ? 'border-sky-300 shadow-[0_2px_12px_rgba(14,165,233,0.1)]'
                  : 'border-slate-100 hover:border-emerald-200/60'
              } overflow-hidden`}>
                {/* Barra de status */}
                <div className={`h-1 w-full ${
                  v.status === 'Aprovado'   ? 'bg-emerald-500' :
                  v.status === 'Em curso'   ? 'bg-sky-500 animate-pulse' :
                  v.status === 'Solicitado' ? 'bg-blue-400' :
                  v.status === 'Concluído'  ? 'bg-slate-300' : 'bg-rose-300'
                }`}/>

                <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Info principal */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-extrabold text-slate-900">{v.full_name}</p>
                      <span className="text-[9px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">{v.department}</span>
                      <Badge label={v.status} cls={STATUS_VAC[v.status] || 'bg-slate-100 text-slate-600 border-slate-200'}/>
                    </div>

                    {/* Período */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600"/>
                        <strong>{fmtDate(v.start_date)}</strong> → <strong>{fmtDate(v.end_date)}</strong>
                      </span>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        {days} dias
                      </span>
                    </div>

                    {/* Benefícios ativos */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {v.has_pecuniary ? (
                        <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                          💰 Abono: {v.pecuniary_days}d vendidos
                        </span>
                      ) : null}
                      {v.has_advance_13 ? (
                        <span className="text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                          📋 Adiant. 13º
                        </span>
                      ) : null}
                      {v.has_salary_advance ? (
                        <span className="text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                          💵 Adiant. Salarial: {fmtR(Number(v.salary_advance_value))}
                        </span>
                      ) : null}
                      {v.acquisition_start ? (
                        <span className="text-[9px] font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md">
                          Aquisitivo: {fmtDate(v.acquisition_start)} → {fmtDate(v.acquisition_end)}
                        </span>
                      ) : null}
                      {v.approved_by && (
                        <span className="text-[9px] text-slate-500">✓ {v.approved_by}</span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => { setEditing(v); setFormOpen(true); }}
                      className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border border-slate-200 cursor-pointer">
                      <Edit className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => handleDelete(v.id)}
                      className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Fornecedores ──────────────────────────────────────────────────────────────

function FornecedoresTab({ token }: { token: string }) {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('Ativo');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Partial<Supplier> | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState('');

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: token } });

  const load = async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (statusFilter !== 'Todos') p.set('status', statusFilter);
    if (search.trim()) p.set('search', search.trim());
    const d = await fetch(`/api/financeiro/suppliers?${p}`).then(r => r.json());
    if (d.success) setSuppliers(d.suppliers);
    setLoading(false);
  };

  React.useEffect(() => { load(); }, [search, statusFilter]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const url = editing.id ? `/api/financeiro/suppliers/${editing.id}` : '/api/financeiro/suppliers';
    const method = editing.id ? 'PUT' : 'POST';
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
    const d = await res.json();
    if (d.success) { setSuccess('Fornecedor salvo.'); setTimeout(() => setSuccess(''), 4000); setFormOpen(false); setEditing(null); load(); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este fornecedor?')) return;
    await authFetch(`/api/financeiro/suppliers/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-5">
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Fornecedores</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Cadastro de parceiros e fornecedores do grupo</p>
        </div>
        <button onClick={() => { setEditing({ status: 'Ativo' }); setFormOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
          <Plus className="w-3.5 h-3.5" />Novo Fornecedor
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, categoria..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-600 rounded-xl text-xs font-semibold text-slate-800 outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer">
          <option value="Todos">Todos</option><option>Ativo</option><option>Inativo</option>
        </select>
      </div>

      {/* Form */}
      {formOpen && editing && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black text-slate-900 uppercase">{editing.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h4>
            <button type="button" onClick={() => { setFormOpen(false); setEditing(null); }} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2"><label className={lbl}>Razão Social / Nome *</label><input required className={inp()} value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Cooperativa Agrícola..." /></div>
            <div><label className={lbl}>CNPJ</label><input className={inp()} value={editing.cnpj || ''} onChange={e => setEditing(p => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" /></div>
            <div><label className={lbl}>Categoria</label><input className={inp()} value={editing.category || ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} list="cat-list" placeholder="Ex: Insumos, Maquinário..." /><datalist id="cat-list">{['Insumos Agrícolas','Maquinário','Veterinário','Embalagens','Combustível','Serviços Gerais','TI','Alimentos','Outros'].map(c => <option key={c} value={c} />)}</datalist></div>
            <div><label className={lbl}>Responsável</label><input className={inp()} value={editing.contact_name || ''} onChange={e => setEditing(p => ({ ...p, contact_name: e.target.value }))} /></div>
            <div><label className={lbl}>Status</label><select className={inp()} value={editing.status || 'Ativo'} onChange={e => setEditing(p => ({ ...p, status: e.target.value as any }))}><option>Ativo</option><option>Inativo</option></select></div>
            <div><label className={lbl}>E-mail</label><input type="email" className={inp()} value={editing.email || ''} onChange={e => setEditing(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label className={lbl}>Telefone</label><input className={inp()} value={editing.phone || ''} onChange={e => setEditing(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><label className={lbl}>Cidade</label><input className={inp()} value={editing.city || ''} onChange={e => setEditing(p => ({ ...p, city: e.target.value }))} /></div>
            <div><label className={lbl}>UF</label><input className={inp()} maxLength={2} value={editing.state || ''} onChange={e => setEditing(p => ({ ...p, state: e.target.value }))} placeholder="SP" /></div>
            <div className="sm:col-span-3"><label className={lbl}>Observações</label><textarea rows={2} className={inp()} value={editing.notes || ''} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => { setFormOpen(false); setEditing(null); }} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}Salvar
            </button>
          </div>
        </form>
      )}

      {/* Grid de cards */}
      {loading ? <div className="py-12 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-700" /></div>
        : suppliers.length === 0 ? (
          <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">Nenhum fornecedor encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 hover:border-emerald-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-5 space-y-3 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{s.name}</p>
                    {s.category && <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{s.category}</span>}
                  </div>
                  <Badge label={s.status} cls={s.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'} />
                </div>
                <div className="space-y-1 text-[10px] text-slate-500">
                  {s.cnpj && <p>CNPJ: <span className="font-mono">{s.cnpj}</span></p>}
                  {s.contact_name && <p>Contato: <strong className="text-slate-700">{s.contact_name}</strong></p>}
                  {s.email && <a href={`mailto:${s.email}`} className="block text-emerald-700 hover:underline truncate">{s.email}</a>}
                  {s.phone && <p>{s.phone}</p>}
                  {(s.city || s.state) && <p>{[s.city, s.state].filter(Boolean).join(' - ')}</p>}
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-end gap-1">
                  <button onClick={() => { setEditing(s); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ── Estoque ───────────────────────────────────────────────────────────────────

function EstoqueTab({ token }: { token: string }) {
  const [items, setItems] = React.useState<StockItem[]>([]);
  const [lowStock, setLowStock] = React.useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = React.useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [catFilter, setCatFilter] = React.useState('Todos');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Partial<StockItem> | null>(null);
  const [moveItem, setMoveItem] = React.useState<StockItem | null>(null);
  const [moveType, setMoveType] = React.useState<'Entrada' | 'Saída'>('Entrada');
  const [moveQty, setMoveQty] = React.useState('');
  const [moveReason, setMoveReason] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState('');

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: token } });

  const load = async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (catFilter !== 'Todos') p.set('category', catFilter);
    if (search.trim()) p.set('search', search.trim());
    const [st, sp] = await Promise.all([
      fetch(`/api/financeiro/stock?${p}`).then(r => r.json()),
      fetch('/api/financeiro/suppliers?status=Ativo').then(r => r.json()),
    ]);
    if (st.success) { setItems(st.items); setLowStock(st.low_stock); }
    if (sp.success) setSuppliers(sp.suppliers);
    setLoading(false);
  };

  React.useEffect(() => { load(); }, [search, catFilter]);

  const allCats = React.useMemo(() => ['Todos', ...Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[]], [items]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const url = editing.id ? `/api/financeiro/stock/${editing.id}` : '/api/financeiro/stock';
    const method = editing.id ? 'PUT' : 'POST';
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
    const d = await res.json();
    if (d.success) { setSuccess('Item salvo.'); setTimeout(() => setSuccess(''), 4000); setFormOpen(false); setEditing(null); load(); }
    setSaving(false);
  };

  const handleMove = async () => {
    if (!moveItem || !moveQty) return;
    setSaving(true);
    await authFetch(`/api/financeiro/stock/${moveItem.id}/move`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: moveType, quantity: Number(moveQty), reason: moveReason }),
    });
    setSuccess(`Movimentação de ${moveType} registrada.`);
    setTimeout(() => setSuccess(''), 4000);
    setMoveItem(null); setMoveQty(''); setMoveReason('');
    setSaving(false); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este item do estoque?')) return;
    await authFetch(`/api/financeiro/stock/${id}`, { method: 'DELETE' });
    load();
  };

  const totalValue = items.reduce((a, i) => a + (Number(i.quantity) * (Number(i.unit_cost) || 0)), 0);

  return (
    <div className="space-y-5">
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-black text-slate-900">Controle de Estoque</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Insumos, materiais e produtos em estoque</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 text-[10px] font-black text-emerald-700">
            Valor total: {fmtR(totalValue)}
          </div>
          <button onClick={() => { setEditing({ quantity: 0, min_quantity: 0 }); setFormOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
            <Plus className="w-3.5 h-3.5" />Novo Item
          </button>
        </div>
      </div>

      {/* Alerta estoque baixo */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-black text-amber-800 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" />Estoque abaixo do mínimo ({lowStock.length} ite{lowStock.length !== 1 ? 'ns' : 'm'})
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(i => (
              <span key={i.id} className="bg-white border border-amber-200 rounded-lg px-2.5 py-1 text-[10px] font-bold text-amber-800">
                {i.name} — {i.quantity}{i.unit ? ` ${i.unit}` : ''} (mín: {i.min_quantity})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar item..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-600 rounded-xl text-xs font-semibold text-slate-800 outline-none" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer">
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Formulário item */}
      {formOpen && editing && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black text-slate-900 uppercase">{editing.id ? 'Editar Item' : 'Novo Item'}</h4>
            <button type="button" onClick={() => { setFormOpen(false); setEditing(null); }} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2"><label className={lbl}>Nome do Item *</label><input required className={inp()} value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className={lbl}>Categoria</label><input className={inp()} value={editing.category || ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} list="scat-list" /><datalist id="scat-list">{['Insumos Agrícolas','Veterinário','Ferramentas','EPI','Combustível','Embalagens','Limpeza','Escritório'].map(c => <option key={c} value={c} />)}</datalist></div>
            <div><label className={lbl}>Unidade</label><input className={inp()} value={editing.unit || ''} onChange={e => setEditing(p => ({ ...p, unit: e.target.value }))} placeholder="kg, L, un..." /></div>
            <div><label className={lbl}>Qtd. Atual</label><input type="number" min="0" step="0.001" className={inp()} value={editing.quantity || 0} onChange={e => setEditing(p => ({ ...p, quantity: Number(e.target.value) }))} /></div>
            <div><label className={lbl}>Qtd. Mínima</label><input type="number" min="0" step="0.001" className={inp()} value={editing.min_quantity || 0} onChange={e => setEditing(p => ({ ...p, min_quantity: Number(e.target.value) }))} /></div>
            <div><label className={lbl}>Custo Unitário (R$)</label><input type="number" min="0" step="0.01" className={inp()} value={editing.unit_cost || ''} onChange={e => setEditing(p => ({ ...p, unit_cost: Number(e.target.value) }))} /></div>
            <div><label className={lbl}>Local de Armazenamento</label><input className={inp()} value={editing.location || ''} onChange={e => setEditing(p => ({ ...p, location: e.target.value }))} placeholder="Ex: Depósito Tatuí" /></div>
            <div><label className={lbl}>Fornecedor</label><select className={inp()} value={editing.supplier_id || ''} onChange={e => setEditing(p => ({ ...p, supplier_id: e.target.value ? Number(e.target.value) : undefined }))}><option value="">— Nenhum —</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="sm:col-span-3"><label className={lbl}>Observações</label><textarea rows={2} className={inp()} value={editing.notes || ''} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => { setFormOpen(false); setEditing(null); }} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}Salvar
            </button>
          </div>
        </form>
      )}

      {/* Modal movimentação */}
      {moveItem && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-slate-900">Movimentar Estoque</h4>
                <button onClick={() => setMoveItem(null)} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs font-bold text-slate-700 mb-4">{moveItem.name} — atual: <strong>{moveItem.quantity} {moveItem.unit}</strong></p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(['Entrada', 'Saída'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setMoveType(t)}
                      className={`flex-1 py-2 text-xs font-black rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${moveType === t ? t === 'Entrada' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                      {t === 'Entrada' ? <ArrowUpCircle className="w-3.5 h-3.5" /> : <ArrowDownCircle className="w-3.5 h-3.5" />}{t}
                    </button>
                  ))}
                </div>
                <div>
                  <label className={lbl}>Quantidade</label>
                  <input type="number" min="0.001" step="0.001" className={inp()} value={moveQty} onChange={e => setMoveQty(e.target.value)} placeholder={`Em ${moveItem.unit || 'unidades'}`} />
                </div>
                <div>
                  <label className={lbl}>Motivo / Observação</label>
                  <input className={inp()} value={moveReason} onChange={e => setMoveReason(e.target.value)} placeholder="Ex: Compra, uso na produção..." />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setMoveItem(null)} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                <button onClick={handleMove} disabled={saving || !moveQty}
                  className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}Confirmar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Tabela estoque */}
      {loading ? <div className="py-12 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-700" /></div>
        : items.length === 0 ? (
          <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">Nenhum item no estoque.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Item', 'Categoria', 'Qtd.', 'Mín.', 'Un.', 'Custo Unit.', 'Valor Total', 'Local', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(i => {
                  const isLow = Number(i.quantity) <= Number(i.min_quantity) && Number(i.min_quantity) > 0;
                  return (
                    <tr key={i.id} className={`hover:bg-slate-50/50 ${isLow ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3 font-extrabold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {i.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{i.category || '—'}</td>
                      <td className={`px-4 py-3 font-black ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>{i.quantity}</td>
                      <td className="px-4 py-3 text-slate-400">{i.min_quantity}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{i.unit || '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{i.unit_cost ? fmtR(Number(i.unit_cost)) : '—'}</td>
                      <td className="px-4 py-3 font-mono font-black text-emerald-800">{i.unit_cost ? fmtR(Number(i.quantity) * Number(i.unit_cost)) : '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{i.location || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setMoveItem(i)} title="Movimentar" className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-700 cursor-pointer">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setEditing(i); setFormOpen(true); }} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(i.id)} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

// ── Componente principal Financeiro ───────────────────────────────────────────

export default function FinanceiroTab({ token }: { token: string }) {
  const [activeTab, setActiveTab] = React.useState<FinTab>('folha');

  const tabs: { key: FinTab; label: string; icon: React.ElementType; desc: string }[] = [
    { key: 'folha',        label: 'Folha de Pagamento', icon: DollarSign, desc: 'Salários e descontos' },
    { key: 'ferias',       label: 'Férias',             icon: Calendar,   desc: 'Controle de férias' },
    { key: 'fornecedores', label: 'Fornecedores',       icon: Truck,      desc: 'Parceiros e fornecedores' },
    { key: 'estoque',      label: 'Estoque',            icon: Package,    desc: 'Insumos e materiais' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs do módulo financeiro */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tabs.map(({ key, label, icon: Icon, desc }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === key
                ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-200'
                : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50'
            } shadow-[0_2px_10px_rgba(0,0,0,0.04)]`}>
            <div className={`p-2 rounded-xl w-fit mb-2 ${activeTab === key ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className={`text-xs font-extrabold ${activeTab === key ? 'text-emerald-900' : 'text-slate-800'}`}>{label}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Conteúdo da sub-aba */}
      <div className="animate-fade-in">
        {activeTab === 'folha'        && <FolhaPagamento   token={token} />}
        {activeTab === 'ferias'       && <FeriasTab        token={token} />}
        {activeTab === 'fornecedores' && <FornecedoresTab  token={token} />}
        {activeTab === 'estoque'      && <EstoqueTab       token={token} />}
      </div>
    </div>
  );
}
