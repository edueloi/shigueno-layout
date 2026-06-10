import React from 'react';
import {
  Users, Briefcase, TrendingUp, Phone, MapPin, Plus, Trash2,
  Edit, CheckCircle2, ChevronRight, X, AlertCircle, RefreshCw, BarChart2,
  FileText, Calendar, Filter, Leaf, Download, Menu, Home, LogOut,
  Truck, Navigation, Compass, Map, Activity, Play, CheckCircle, Clock, Settings,
  LayoutGrid, Search, Sparkles, PlusCircle, Award, GripVertical, ChevronDown,
  Building2, UserCog, Layers, BookOpen, DollarSign, Eye, EyeOff, Shield,
  ShieldCheck, ShieldOff, Key, Mail, User, Lock, UserPlus, ChevronUp
} from 'lucide-react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { Portal } from '../hooks/usePortal';
import EmployeesTab from './EmployeesTab';
import CandidatesTab from './CandidatesTab';
import CandidatePage from './CandidatePage';
import FinanceiroTab from './FinanceiroTab';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Vacancy, Candidate, Supplier, DashboardStats, DashboardSummary } from '../types';
import BlogManager from './BlogManager';
import A4PosterModal from './A4PosterModal';
import TrackingPanel from './TrackingPanel';
import ActivityBoard from './ActivityBoard';
import { StatCard, NotificationBell, buildNotifications, QuickNotes, SkeletonDashboard } from './ui';

interface AdminPanelProps {
  onLogout: () => void;
  onNavigate: (viewKey: string, param?: any) => void;
  onSettingsUpdate?: () => void;
  user?: { id: number; username: string; name: string; role: string } | null;
  token?: string;
}

const COLORS = ['#047857', '#fbbf24', '#065f46', '#f59e0b', '#1e3a8a', '#dc2626'];

const PRESET_COORDS: Record<string, { lat: number; lng: number }> = {
  'Tatuí (Granja)': { lat: -23.3556, lng: -47.8556 },
  'Tatuí (Sede)': { lat: -23.3556, lng: -47.8556 },
  'Tatuí (Fazenda Nova Aliança)': { lat: -23.3556, lng: -47.8556 },
  'Santo Antônio do Leverger (MT)': { lat: -15.8656, lng: -56.0781 },
  'Santo Antônio do Leverger': { lat: -15.8656, lng: -56.0781 },
  'Sorocaba (Distribuição)': { lat: -23.5015, lng: -47.4522 },
  'São Paulo (Mercado Municipal)': { lat: -23.5489, lng: -46.6388 },
  'Mogi das Cruzes (Avicultura)': { lat: -23.5222, lng: -46.1889 },
  'Buri - SP (Citros)': { lat: -23.7975, lng: -48.5133 },
  'Itaí - SP (Café)': { lat: -23.4167, lng: -49.0167 }
};

const getAiData = (candidate: any) => {
  if (!candidate || !candidate.ai_analysis) return null;
  if (typeof candidate.ai_analysis === 'string') {
    try {
      return JSON.parse(candidate.ai_analysis);
    } catch (e) {
      return null;
    }
  }
  return candidate.ai_analysis;
};

// ── Admin sub-route mapping ────────────────────────────────────────────────────
type SubTab = 'reports' | 'suppliers' | 'vacancies' | 'candidates' | 'equipe' | 'financeiro' | 'tracking' | 'blog' | 'settings' | 'permissions';

const ADMIN_HASH: Record<string, SubTab> = {
  '#dashboard':   'reports',
  '#atividades':  'suppliers',
  '#rastreamento':'tracking',
  '#blog':        'blog',
  '#vagas':       'vacancies',
  '#candidatos':  'candidates',
  '#equipe':      'equipe',
  '#financeiro':  'financeiro',
  '#configuracoes':'settings',
  '#permissoes':  'permissions',
};
const TAB_TO_HASH: Record<SubTab, string> = {
  reports:     '/admin#dashboard',
  suppliers:   '/admin#atividades',
  tracking:    '/admin#rastreamento',
  blog:        '/admin#blog',
  vacancies:   '/admin#vagas',
  candidates:  '/admin#candidatos',
  equipe:      '/admin#equipe',
  financeiro:  '/admin#financeiro',
  settings:    '/admin#configuracoes',
  permissions: '/admin#permissoes',
};
const TAB_TITLES: Record<SubTab, string> = {
  reports:     'Dashboard | Painel Shigueno',
  suppliers:   'Atividades | Painel Shigueno',
  tracking:    'Rastreamento | Painel Shigueno',
  blog:        'Blog | Painel Shigueno',
  vacancies:   'Vagas | Painel Shigueno',
  candidates:  'Candidatos | Painel Shigueno',
  equipe:      'Equipe | Painel Shigueno',
  financeiro:  'Financeiro | Painel Shigueno',
  settings:    'Configurações | Painel Shigueno',
  permissions: 'Permissões | Painel Shigueno',
};

function hashToTab(): SubTab {
  return ADMIN_HASH[window.location.hash] || 'reports';
}

// ── Permission toggles component ─────────────────────────────────────────────
const MENU_PERMS = [
  { key: 'can_view_reports',    label: 'Dashboard',       icon: '📊', edit: null },
  { key: 'can_view_activities', label: 'Atividades',      icon: '📋', edit: 'can_edit_activities' },
  { key: 'can_view_tracking',   label: 'Rastreamento',    icon: '🗺️', edit: 'can_edit_tracking' },
  { key: 'can_view_blog',       label: 'Blog',            icon: '✍️', edit: 'can_edit_blog' },
  { key: 'can_view_vacancies',  label: 'Vagas',           icon: '💼', edit: 'can_edit_vacancies' },
  { key: 'can_view_candidates', label: 'Candidatos',      icon: '👤', edit: 'can_edit_candidates' },
  { key: 'can_view_settings',   label: 'Dados do Site',   icon: '⚙️', edit: 'can_edit_settings' },
] as const;

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  admin:    { label: 'Administrador', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  gestor:   { label: 'Gestor',        color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: <Shield className="w-3.5 h-3.5" /> },
  operador: { label: 'Operador',      color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: <ShieldOff className="w-3.5 h-3.5" /> },
};

function PermissionEditor({ userId, initialPerms, saving, onSave }: {
  userId: number;
  initialPerms: Record<string, number>;
  saving: boolean;
  onSave: (p: Record<string, number>) => void;
}) {
  const [perms, setPerms] = React.useState<Record<string, number>>({ ...initialPerms });
  const toggle = (key: string) => setPerms(p => ({ ...p, [key]: p[key] ? 0 : 1 }));

  const allOn = MENU_PERMS.every(({ key }) => perms[key]);
  const toggleAll = () => {
    const next = allOn ? 0 : 1;
    const updates: Record<string, number> = {};
    MENU_PERMS.forEach(({ key, edit }) => {
      updates[key] = next;
      if (edit) updates[edit] = next;
    });
    setPerms(p => ({ ...p, ...updates }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Módulos de Acesso</span>
        <button
          type="button"
          onClick={toggleAll}
          className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-colors cursor-pointer ${allOn ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}
        >
          {allOn ? 'Revogar Todos' : 'Liberar Todos'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {MENU_PERMS.map(({ key, label, icon, edit }) => (
          <div key={key} className={`rounded-2xl border p-3 space-y-2 transition-all ${perms[key] ? 'border-emerald-200 bg-emerald-50/50 shadow-sm' : 'border-slate-150 bg-white'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm leading-none">{icon}</span>
                <span className={`text-[11px] font-bold truncate ${perms[key] ? 'text-emerald-900' : 'text-slate-500'}`}>{label}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nowOn = !!perms[key];
                  setPerms(p => ({ ...p, [key]: nowOn ? 0 : 1, ...(nowOn && edit ? { [edit]: 0 } : {}) }));
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${perms[key] ? 'bg-emerald-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 ${perms[key] ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            {edit && perms[key] === 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/70">
                <span className="text-[10px] text-emerald-700 font-semibold">Pode editar</span>
                <button
                  type="button"
                  onClick={() => toggle(edit)}
                  className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${perms[edit] ? 'bg-indigo-500' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-150 ${perms[edit] ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-1">
        <button
          onClick={() => onSave(perms)}
          disabled={saving}
          className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{saving ? 'Salvando...' : 'Salvar Permissões'}</span>
        </button>
      </div>
    </div>
  );
}

function AddUserForm({ authFetch, onCreated, showSuccess }: {
  authFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  onCreated: () => void;
  showSuccess: (msg: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState('operador');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, role })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Usuário "${name}" criado com sucesso.`);
        setOpen(false);
        setName(''); setUsername(''); setPassword(''); setRole('operador'); setShowPassword(false);
        onCreated();
      } else {
        setError(data.error || 'Erro ao criar usuário.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG['operador'];
  const initials = name.trim().split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('') || '?';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-500 hover:text-emerald-700 font-bold text-xs py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>Adicionar Novo Usuário ao Painel</span>
      </button>
    );
  }

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-800 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Novo Usuário</p>
            <p className="text-[10px] text-slate-500">Preencha os dados e defina o perfil de acesso</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={submit} className="p-5 space-y-5">
        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <p className="text-xs text-rose-600 font-bold">{error}</p>
          </div>
        )}

        {/* Preview do avatar */}
        <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-sm ${role === 'admin' ? 'bg-amber-500' : role === 'gestor' ? 'bg-indigo-600' : 'bg-emerald-700'}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-slate-900 truncate">{name || 'Nome do usuário'}</p>
            <p className="text-[10px] text-slate-500 font-mono truncate">@{username || 'login'}</p>
            <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConf.color} ${roleConf.bg} ${roleConf.border}`}>
              {roleConf.icon}
              {roleConf.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Nome Completo *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Gisela Shigueno"
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Login (Username) *</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                required
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, '.'))}
                placeholder="Ex: gisela.shigueno"
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Senha Inicial *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 pl-9 pr-10 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="text-[10px] text-rose-500 font-semibold mt-1">Mínimo 6 caracteres</p>
            )}
          </div>

          {/* Perfil */}
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Perfil de Acesso</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="operador">Operador — permissões manuais</option>
                <option value="gestor">Gestor — acesso expandido</option>
                <option value="admin">Administrador — acesso total</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {role === 'admin' ? 'Acesso irrestrito a todas as seções e dados.' : role === 'gestor' ? 'Acesso às principais seções com permissões amplas.' : 'Configure manualmente cada permissão após criar.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => { setOpen(false); setError(''); }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>{loading ? 'Criando...' : 'Criar Usuário'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Editor inline de dados reais de produção ─────────────────────────────────

function ProductionEditor({ productionStats, onSaved, showSuccess }: {
  productionStats: Array<{ month: string; year?: number; ovos: number; citros: number; cafe: number; nelore?: number }>;
  onSaved: () => void;
  showSuccess: (msg: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  type ProdRow = { ovos: number; citros: number; cafe: number; nelore: number };
  const [editing, setEditing] = React.useState<Record<string, ProdRow>>(() => {
    const init: Record<string, any> = {};
    for (const s of productionStats) {
      init[s.month] = { ovos: s.ovos, citros: Number(s.citros), cafe: s.cafe, nelore: s.nelore || 0 };
    }
    return init;
  });
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const month of Object.keys(editing)) {
        const vals = editing[month];
        const row = productionStats.find(s => s.month === month);
        await fetch(`/api/dashboard/production/${month}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: row?.year || 2025, ovos: vals.ovos, citros: vals.citros, cafe: vals.cafe, nelore: vals.nelore }),
        });
      }
      showSuccess('Dados de produção atualizados no banco com sucesso!');
      setOpen(false);
      onSaved();
    } catch { /* silently log */ } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Edit className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-wide">Atualizar Dados Reais de Produção</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Edite os valores mensais reais diretamente no banco de dados MySQL</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-6 py-5 space-y-4 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="text-left py-2 pr-4 font-mono">Mês</th>
                  <th className="text-right py-2 px-3">Ovos (cx)</th>
                  <th className="text-right py-2 px-3">Citros (t)</th>
                  <th className="text-right py-2 px-3">Café (sc)</th>
                  <th className="text-right py-2 pl-3">Nelore (cab)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productionStats.map(s => (
                  <tr key={s.month} className="group hover:bg-slate-50/50">
                    <td className="py-2.5 pr-4 font-black text-slate-900 font-mono">{s.month}</td>
                    {(['ovos', 'citros', 'cafe', 'nelore'] as const).map(field => (
                      <td key={field} className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={editing[s.month]?.[field] ?? 0}
                          onChange={e => setEditing(prev => ({
                            ...prev,
                            [s.month]: { ...prev[s.month], [field]: Number(e.target.value) }
                          }))}
                          className="w-24 text-right bg-white border border-slate-200 group-hover:border-emerald-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center space-x-2"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Salvando...' : 'Salvar Dados Reais'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar Nav com grupos acordeão ──────────────────────────────────────────

type NavGroup = {
  groupLabel: string;
  groupIcon: React.ElementType;
  items: Array<{ key: SubTab; label: string; icon: React.ElementType; permKey: string }>;
};

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: 'Visão Geral',
    groupIcon: BarChart2,
    items: [
      { key: 'reports',    label: 'Dashboard & KPIs',       icon: BarChart2,  permKey: 'can_view_reports' },
    ],
  },
  {
    groupLabel: 'Recursos Humanos',
    groupIcon: Users,
    items: [
      { key: 'equipe',     label: 'Equipe & Hierarquia',    icon: UserCog,    permKey: 'can_view_candidates' },
      { key: 'vacancies',  label: 'Gestão de Vagas',        icon: Briefcase,  permKey: 'can_view_vacancies' },
      { key: 'candidates', label: 'Seleção & Currículos',   icon: Users,      permKey: 'can_view_candidates' },
    ],
  },
  {
    groupLabel: 'Financeiro',
    groupIcon: DollarSign,
    items: [
      { key: 'financeiro', label: 'Módulo Financeiro',      icon: DollarSign, permKey: 'can_view_reports' },
    ],
  },
  {
    groupLabel: 'Gestão Operacional',
    groupIcon: Layers,
    items: [
      { key: 'suppliers',  label: 'Quadro de Atividades',   icon: LayoutGrid, permKey: 'can_view_activities' },
      { key: 'tracking',   label: 'Rastreamento & Frotas',  icon: Truck,      permKey: 'can_view_tracking' },
    ],
  },
  {
    groupLabel: 'Conteúdo & Site',
    groupIcon: BookOpen,
    items: [
      { key: 'blog',       label: 'Gestor do Blog',         icon: FileText,   permKey: 'can_view_blog' },
      { key: 'settings',   label: 'Dados do Site',          icon: Settings,   permKey: 'can_view_settings' },
    ],
  },
  {
    groupLabel: 'Administração',
    groupIcon: UserCog,
    items: [
      { key: 'permissions', label: 'Usuários & Permissões', icon: Award,      permKey: 'admin_only' },
    ],
  },
];

function SidebarNav({ activeSubTab, currentUserRole, canView, onNavigate }: {
  activeSubTab: SubTab;
  currentUserRole: string;
  canView: (key: string) => boolean;
  onNavigate: (tab: SubTab) => void;
}) {
  // Abre o grupo que contém a aba ativa por padrão
  const defaultOpen = NAV_GROUPS.findIndex(g => g.items.some(i => i.key === activeSubTab));
  const [openGroups, setOpenGroups] = React.useState<Set<number>>(() => new Set([defaultOpen >= 0 ? defaultOpen : 0]));

  const toggleGroup = (idx: number) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
      {NAV_GROUPS.map((group, groupIdx) => {
        const visibleItems = group.items.filter(item => {
          if (item.permKey === 'admin_only') return currentUserRole === 'admin';
          return canView(item.permKey);
        });
        if (visibleItems.length === 0) return null;

        const isOpen = openGroups.has(groupIdx);
        const GroupIcon = group.groupIcon;
        const hasActive = visibleItems.some(i => i.key === activeSubTab);

        return (
          <div key={groupIdx} className="space-y-0.5">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(groupIdx)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer font-mono ${
                hasActive
                  ? 'text-amber-400 bg-emerald-900/40'
                  : 'text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-900/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{group.groupLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Items */}
            {isOpen && (
              <div className="pl-2 space-y-0.5 animate-fade-in">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const active = activeSubTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => onNavigate(item.key)}
                      className={`relative w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-200 cursor-pointer group ${
                        active
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/25'
                          : 'text-emerald-200 hover:bg-emerald-900/50 hover:text-white hover:translate-x-0.5'
                      }`}
                    >
                      {active && <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />}
                      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${active ? 'text-slate-950 scale-110' : 'text-emerald-400 group-hover:scale-110'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function AdminPanel({ onLogout, onNavigate, onSettingsUpdate, user, token = '' }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<SubTab>(hashToTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Relógio ao vivo do topbar (atualiza a cada 30s)
  const [clock, setClock] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  // Sub-view de ficha completa do candidato (renderizada dentro do painel, sidebar preservada)
  const [viewingCandidateUid, setViewingCandidateUid] = React.useState<string | null>(null);

  // Current user identity from props (no localStorage)
  const currentUserRole = user?.role || 'operador';
  const currentUserId = user?.id ?? null;
  const currentUserName = user?.name || 'Gestor';

  // Preferências do usuário persistidas no backend (sem localStorage)
  const { prefs: userPrefs, setPref: saveUserPref } = useUserPreferences(currentUserId);

  // Load current user permissions from backend
  const [currentUserPerms, setCurrentUserPerms] = React.useState<Record<string, number> | null>(null);

  React.useEffect(() => {
    if (currentUserRole === 'admin' || !currentUserId) return;
    fetch(`/api/permissions?userId=${currentUserId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.permissions?.length) setCurrentUserPerms(d.permissions[0]);
      })
      .catch(() => {});
  }, [currentUserId, currentUserRole]);

  const canView = (permKey: string): boolean => {
    if (currentUserRole === 'admin') return true;
    if (!currentUserPerms) return false;
    return !!currentUserPerms[permKey];
  };

  // Sync hash → tab (browser back/forward)
  React.useEffect(() => {
    const onHash = () => { setActiveSubTab(hashToTab()); setViewingCandidateUid(null); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Sync tab → URL + title
  React.useEffect(() => {
    window.history.replaceState(null, '', TAB_TO_HASH[activeSubTab]);
    document.title = TAB_TITLES[activeSubTab];
  }, [activeSubTab]);

  // Navegação programática entre abas (notificações, cards do dashboard)
  const goToTab = (tab: SubTab) => {
    window.history.pushState(null, '', TAB_TO_HASH[tab]);
    setActiveSubTab(tab);
    setViewingCandidateUid(null);
  };

  // Authenticated fetch helper — uses token from props (no localStorage)
  const authFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': token
      }
    });
  };
  
  // Real database states
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([]);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [evaluatingId, setEvaluatingId] = React.useState<number | null>(null);
  
  const [loading, setLoading] = React.useState(true);
  const [errorNotice, setErrorNotice] = React.useState<string | null>(null);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  // Real-time tracking fleet states
  const [routes, setRoutes] = React.useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = React.useState<number | null>(null);
  const [simulationActive, setSimulationActive] = React.useState<boolean>(true);

  // Create Route Form Overlay
  const [routeFormOpen, setRouteFormOpen] = React.useState(false);
  const [driverName, setDriverName] = React.useState('');
  const [vehiclePlate, setVehiclePlate] = React.useState('');
  const [vehicleType, setVehicleType] = React.useState('Caminhão Baú (Ovos)');
  const [startLocation, setStartLocation] = React.useState('Tatuí (Granja)');
  const [destination, setDestination] = React.useState('Sorocaba (Distribuição)');
  const [cargoDesc, setCargoDesc] = React.useState('');
  const [customEventText, setCustomEventText] = React.useState('');

  // Modal / Form triggers for CRUD
  const [activityFormOpen, setActivityFormOpen] = React.useState(false);
  const [selectedActivityId, setSelectedActivityId] = React.useState<number | null>(null);
  const [actTitle, setActTitle] = React.useState('');
  const [actDescription, setActDescription] = React.useState('');
  const [actCategory, setActCategory] = React.useState('Ações');
  const [actSector, setActSector] = React.useState('');
  const [actStatus, setActStatus] = React.useState('A Fazer');
  const [actPriority, setActPriority] = React.useState('Média');
  const [actResponsible, setActResponsible] = React.useState('');
  const [actDueDate, setActDueDate] = React.useState('');

  // Kanban view mode: 'board' = ativas | 'history' = concluídas
  const [activityView, setActivityView] = React.useState<'board' | 'history'>('board');
  const [completedActivities, setCompletedActivities] = React.useState<any[]>([]);
  const [activitySectorFilter, setActivitySectorFilter] = React.useState('Todos');
  const [activityDateFrom, setActivityDateFrom] = React.useState('');
  const [activityDateTo, setActivityDateTo] = React.useState('');

  // Permissions management state
  const [permUsers, setPermUsers] = React.useState<any[]>([]);
  const [permSaving, setPermSaving] = React.useState<number | null>(null);

  const [vacancyFormOpen, setVacancyFormOpen] = React.useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = React.useState<number | null>(null);
  const [vacTitle, setVacTitle] = React.useState('');
  const [vacDept, setVacDept] = React.useState('');
  const [vacDesc, setVacDesc] = React.useState('');
  const [vacLoc, setVacLoc] = React.useState('Tatuí - SP');
  const [vacReq, setVacReq] = React.useState('');
  const [vacStatus, setVacStatus] = React.useState('Ativa');

  // Poster generator states
  const [selectedVacancyForPoster, setSelectedVacancyForPoster] = React.useState<Vacancy | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = React.useState(false);

  // Candidate detail viewer
  const [viewingCandidate, setViewingCandidate] = React.useState<Candidate | null>(null);
  const [recruiterNotes, setRecruiterNotes] = React.useState('');

  React.useEffect(() => {
    if (viewingCandidate) {
      const key = `recruiter-notes-${viewingCandidate.id}`;
      setRecruiterNotes(userPrefs[key] || '');
    } else {
      setRecruiterNotes('');
    }
  }, [viewingCandidate?.id, userPrefs]);

  const handleSaveNotes = async () => {
    if (viewingCandidate) {
      const key = `recruiter-notes-${viewingCandidate.id}`;
      await saveUserPref(key, recruiterNotes);
      showSuccess('Parecer interno salvo no servidor com sucesso!');
    }
  };

  // Filters
  const [cityFilter, setCityFilter] = React.useState('Todos');
  const [activityCategoryFilter, setActivityCategoryFilter] = React.useState('Todos');
  const [activitySearchQuery, setActivitySearchQuery] = React.useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = React.useState('Todos');
  const [candidateSearchQuery, setCandidateSearchQuery] = React.useState('');
  const [candidateVacancyFilter, setCandidateVacancyFilter] = React.useState('Todos');

  // Sectors list (dynamic, derived from activities)
  const activitySectors = React.useMemo(() => {
    const s = new Set<string>();
    activities.forEach(a => { if (a.sector) s.add(a.sector); });
    return Array.from(s).sort();
  }, [activities]);
  
  // Manual candidate registration states
  const [manualCandidateModalOpen, setManualCandidateModalOpen] = React.useState(false);
  const [manualCandName, setManualCandName] = React.useState('');
  const [manualCandEmail, setManualCandEmail] = React.useState('');
  const [manualCandPhone, setManualCandPhone] = React.useState('');
  const [manualCandVacancyId, setManualCandVacancyId] = React.useState('');
  const [manualCandCvText, setManualCandCvText] = React.useState('');

  const [reportPeriod, setReportPeriod] = React.useState('Todos');
  const [reportStartMonth, setReportStartMonth] = React.useState('Dez');
  const [reportEndMonth, setReportEndMonth] = React.useState('Mai');
  const [reportMinCattle, setReportMinCattle] = React.useState(0);
  const [reportBreed, setReportBreed] = React.useState('Todos');

  // Editable settings fields state
  const [siteMotto, setSiteMotto] = React.useState('');
  const [siteAboutIntro, setSiteAboutIntro] = React.useState('');
  const [siteAboutFull, setSiteAboutFull] = React.useState('');
  const [siteAboutDiversification, setSiteAboutDiversification] = React.useState('');
  const [siteContactEmail, setSiteContactEmail] = React.useState('');
  const [siteContactPhone, setSiteContactPhone] = React.useState('');
  const [siteProdAvicultura, setSiteProdAvicultura] = React.useState('');
  const [siteProdCitricultura, setSiteProdCitricultura] = React.useState('');
  const [siteProdCafeicultura, setSiteProdCafeicultura] = React.useState('');
  const [siteProdNelore, setSiteProdNelore] = React.useState('');
  const [activeEditTab, setActiveEditTab] = React.useState<'home' | 'sobre' | 'produtos' | 'contato'>('home');

  // Dynamic Kanban column and drag states
  const [kanbanColumns, setKanbanColumns] = React.useState<string[]>([
    'A Fazer', 'Em Progresso', 'Concluído', 'Novas Contratações', 'Ações Financeiras'
  ]);
  const [newColumnName, setNewColumnName] = React.useState('');
  const [isAddingColumn, setIsAddingColumn] = React.useState(false);
  const [renamingColumn, setRenamingColumn] = React.useState<string | null>(null);
  const [renamingColumnValue, setRenamingColumnValue] = React.useState('');
  const [draggedCardId, setDraggedCardId] = React.useState<number | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = React.useState<string | null>(null);

  // Modern Confirmation Modals for Activities, Columns & Vacancies
  const [activityToDelete, setActivityToDelete] = React.useState<any | null>(null);
  const [columnToDelete, setColumnToDelete] = React.useState<string | null>(null);
  const [vacancyToDelete, setVacancyToDelete] = React.useState<Vacancy | null>(null);

  React.useEffect(() => {
    fetchInitialData();
  }, [activeSubTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setErrorNotice(null);
      
      // Fetch Dashboard stats
      const reportsRes = await fetch('/api/dashboard/reports');
      const reportsData = await reportsRes.json();
      if (reportsData.success) {
        setStats(reportsData.stats);
      }

      // Fetch Dashboard summary (equipe, financeiro, estoque, atividades)
      const summaryRes = await fetch('/api/dashboard/summary');
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.summary);
      }

      // Fetch Activities list (active)
      const activitiesRes = await fetch('/api/activities');
      const activitiesData = await activitiesRes.json();
      if (activitiesData.success) {
        setActivities(activitiesData.activities || []);
      }

      // Fetch completed activities (history)
      const histRes = await fetch('/api/activities?history=1');
      const histData = await histRes.json();
      if (histData.success) {
        setCompletedActivities(histData.activities || []);
      }

      // Fetch users with permissions (for permissions tab)
      const permRes = await fetch('/api/permissions/users');
      const permData = await permRes.json();
      if (permData.success) {
        setPermUsers(permData.users || []);
      }

      // Fetch MT Cattle Suppliers list (for consolidated reports)
      const suppliersRes = await fetch('/api/suppliers');
      const suppliersData = await suppliersRes.json();
      if (suppliersData.success) {
        setSuppliers(suppliersData.suppliers || []);
      }

      // Fetch Vacancies list
      const vacanciesRes = await fetch('/api/vacancies');
      const vacanciesData = await vacanciesRes.json();
      if (vacanciesData.success) {
        setVacancies(vacanciesData.vacancies || []);
      }

      // Fetch Candidates list
      const candidatesRes = await fetch('/api/candidates');
      const candidatesData = await candidatesRes.json();
      if (candidatesData.success) {
        setCandidates(candidatesData.candidates || []);
      }

      // Fetch Tracking routes list
      const routesRes = await fetch('/api/routes');
      const routesData = await routesRes.json();
      if (routesData.success) {
        const loadedRoutes = routesData.routes || [];
        setRoutes(loadedRoutes);
        
        // Autoselect first active route if nothing is selected yet
        if (loadedRoutes.length > 0) {
          const activeOnes = loadedRoutes.filter((r: any) => r.status === 'Ativa');
          if (activeOnes.length > 0) {
            setSelectedRouteId(prev => prev !== null ? prev : activeOnes[0].id);
          } else {
            setSelectedRouteId(prev => prev !== null ? prev : loadedRoutes[0].id);
          }
        }
      }

      // Fetch current site settings
      const settingsRes = await fetch('/api/site-settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.config) {
        setSiteMotto(settingsData.config.company_motto || '');
        setSiteAboutIntro(settingsData.config.about_text_intro || '');
        setSiteAboutFull(settingsData.config.about_text_full || '');
        setSiteAboutDiversification(settingsData.config.about_diversification || '');
        setSiteContactEmail(settingsData.config.contact_email || '');
        setSiteContactPhone(settingsData.config.contact_phone || '');
        setSiteProdAvicultura(settingsData.config.prod_avicultura_desc || '');
        setSiteProdCitricultura(settingsData.config.prod_citricultura_desc || '');
        setSiteProdCafeicultura(settingsData.config.prod_cafeicultura_desc || '');
        setSiteProdNelore(settingsData.config.prod_nelore_desc || '');
        
        if (settingsData.config.kanban_columns) {
          try {
            const parsedCols = JSON.parse(settingsData.config.kanban_columns);
            if (Array.isArray(parsedCols) && parsedCols.length > 0) {
              setKanbanColumns(parsedCols);
            }
          } catch(e) {
            console.error('Falha ao ler colunas do kanban:', e);
          }
        }
      }

    } catch (e) {
      console.error(e);
      setErrorNotice('Falha de sincronização de rede com o servidor SQLite de Tatuí.');
    } finally {
      setLoading(false);
    }
  };

  // Modern live analytics computations based on chosen filters
  const monthOrder = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];

  const filteredProductionStats = React.useMemo(() => {
    if (!stats?.productionStats) return [];
    let list = [...stats.productionStats];
    
    if (reportPeriod === '3m') {
      // Last 3 months: Mar, Abr, Mai
      list = list.filter(item => ['Mar', 'Abr', 'Mai'].includes(item.month));
    } else if (reportPeriod === '6m') {
      // Last 6 months: Dez, Jan, Fev, Mar, Abr, Mai
      list = list.filter(item => ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'].includes(item.month));
    } else if (reportPeriod === 'custom') {
      const startIdx = monthOrder.indexOf(reportStartMonth);
      const endIdx = monthOrder.indexOf(reportEndMonth);
      list = list.filter(item => {
        const idx = monthOrder.indexOf(item.month);
        if (startIdx !== -1 && endIdx !== -1) {
          return idx >= startIdx && idx <= endIdx;
        }
        return true;
      });
    }
    return list;
  }, [stats?.productionStats, reportPeriod, reportStartMonth, reportEndMonth]);

  const filteredSuppliersForReports = React.useMemo(() => {
    let list = [...suppliers];
    if (reportBreed !== 'Todos') {
      list = list.filter(s => s.cattle_breed.toLowerCase() === reportBreed.toLowerCase());
    }
    if (reportMinCattle > 0) {
      list = list.filter(s => s.cattle_count >= reportMinCattle);
    }
    return list;
  }, [suppliers, reportBreed, reportMinCattle]);

  const computedCattleHead = React.useMemo(() => {
    return filteredSuppliersForReports.reduce((sum, s) => sum + s.cattle_count, 0);
  }, [filteredSuppliersForReports]);

  const computedTotalOvos = React.useMemo(() => {
    return filteredProductionStats.reduce((sum, item) => sum + item.ovos, 0);
  }, [filteredProductionStats]);

  const computedTotalCitros = React.useMemo(() => {
    return filteredProductionStats.reduce((sum, item) => sum + item.citros, 0);
  }, [filteredProductionStats]);

  const computedTotalCafe = React.useMemo(() => {
    return filteredProductionStats.reduce((sum, item) => sum + item.cafe, 0);
  }, [filteredProductionStats]);

  const computedCityDistribution = React.useMemo(() => {
    const distributionMap: { [key: string]: { value: number; supplier_count: number } } = {};
    filteredSuppliersForReports.forEach(s => {
      const city = s.city || 'Desconhecido';
      if (!distributionMap[city]) {
        distributionMap[city] = { value: 0, supplier_count: 0 };
      }
      distributionMap[city].value += s.cattle_count;
      distributionMap[city].supplier_count += 1;
    });

    return Object.entries(distributionMap)
      .map(([city, data]) => ({
        city,
        value: data.value,
        supplier_count: data.supplier_count
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSuppliersForReports]);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // --- CRUD SITE SETTINGS COMPONENT ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorNotice(null);
      const res = await authFetch('/api/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_motto: siteMotto,
          about_text_intro: siteAboutIntro,
          about_text_full: siteAboutFull,
          about_diversification: siteAboutDiversification,
          contact_email: siteContactEmail,
          contact_phone: siteContactPhone,
          prod_avicultura_desc: siteProdAvicultura,
          prod_citricultura_desc: siteProdCitricultura,
          prod_cafeicultura_desc: siteProdCafeicultura,
          prod_nelore_desc: siteProdNelore
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Configurações e dados do site gravados no SQLite com sucesso!');
        if (typeof onSettingsUpdate === 'function') {
          onSettingsUpdate();
        }
      } else {
        setErrorNotice(data.error || 'Erro ao gravar configurações.');
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Erro de rede ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD QUADRO DE ATIVIDADES ---
  const saveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle || !actDescription || !actResponsible || !actDueDate) {
      alert('Favor preencher todos os campos obrigatórios da atividade.');
      return;
    }

    const payload = {
      title: actTitle,
      description: actDescription,
      category: actCategory,
      sector: actSector,
      status: actStatus,
      priority: actPriority,
      responsible: actResponsible,
      due_date: actDueDate
    };

    try {
      let res;
      if (selectedActivityId) {
        res = await authFetch(`/api/activities/${selectedActivityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showSuccess(selectedActivityId ? 'Atividade atualizada com sucesso.' : 'Nova atividade cadastrada com sucesso.');
        setActivityFormOpen(false);
        resetActivityForm();
        fetchInitialData();
      } else {
        alert('Erro ao salvar atividade: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar atividade.');
    }
  };

  const deleteActivity = (act: any) => {
    setActivityToDelete(act);
  };

  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return;
    const id = activityToDelete.id;
    try {
      const res = await authFetch(`/api/activities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Atividade removida com sucesso do quadro.');
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActivityToDelete(null);
    }
  };

  const openEditActivity = (act: any) => {
    setSelectedActivityId(act.id);
    setActTitle(act.title);
    setActDescription(act.description);
    setActCategory(act.category);
    setActSector(act.sector || '');
    setActStatus(act.status);
    setActPriority(act.priority);
    setActResponsible(act.responsible);
    setActDueDate(act.due_date);
    setActivityFormOpen(true);
  };

  const resetActivityForm = () => {
    setSelectedActivityId(null);
    setActTitle('');
    setActDescription('');
    setActCategory('Ações');
    setActSector('');
    setActStatus(kanbanColumns[0] || 'A Fazer');
    setActPriority('Média');
    setActResponsible('');
    setActDueDate('');
  };

  // Mark activity as completed (moves to history)
  const markActivityDone = async (act: any) => {
    try {
      await authFetch(`/api/activities/${act.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...act, sector: act.sector || '', mark_completed: true })
      });
      showSuccess(`"${act.title}" marcada como concluída e movida ao histórico.`);
      fetchInitialData();
    } catch (e) { console.error(e); }
  };

  // Restore activity from history back to board
  const restoreActivity = async (act: any) => {
    try {
      await authFetch(`/api/activities/${act.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...act, sector: act.sector || '', mark_completed: false })
      });
      showSuccess(`"${act.title}" restaurada ao quadro ativo.`);
      fetchInitialData();
    } catch (e) { console.error(e); }
  };

  // Save permissions for a user
  const savePermissions = async (userId: number, perms: any) => {
    setPermSaving(userId);
    try {
      const res = await authFetch(`/api/permissions/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perms)
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Permissões salvas com sucesso.');
        fetchInitialData();
      }
    } catch (e) { console.error(e); } finally { setPermSaving(null); }
  };

  // --- KANBAN COLUMN & DRAG AND DROP HANDLERS ---
  const updateKanbanColumns = async (updatedColumns: string[]) => {
    setKanbanColumns(updatedColumns);
    try {
      await authFetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kanban_columns: JSON.stringify(updatedColumns)
        })
      });
    } catch (e) {
      console.warn('Falha ao salvar colunas customizadas no servidor:', e);
    }
  };

  const handleAddColumn = async () => {
    const trimmed = newColumnName.trim();
    if (!trimmed) {
      setIsAddingColumn(false);
      return;
    }
    if (kanbanColumns.includes(trimmed)) {
      alert('Já existe uma coluna com esse nome.');
      return;
    }
    
    const updated = [...kanbanColumns, trimmed];
    await updateKanbanColumns(updated);
    setIsAddingColumn(false);
    setNewColumnName('');
    showSuccess(`Coluna "${trimmed}" criada!`);
  };

  const handleSaveColumnRename = async (oldName: string) => {
    const trimmedNewName = renamingColumnValue.trim();
    if (!trimmedNewName || trimmedNewName === oldName) {
      setRenamingColumn(null);
      return;
    }
    
    // Update columns array
    const updatedCols = kanbanColumns.map(col => col === oldName ? trimmedNewName : col);
    
    // Update all activities belonging to old static status
    const cardsToRename = activities.filter(a => a.status === oldName);
    for (const card of cardsToRename) {
      try {
        await authFetch(`/api/activities/${card.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...card, status: trimmedNewName })
        });
      } catch (e) {
        console.error('Falha ao atualizar atividade durante o renomeamento da coluna:', e);
      }
    }
    
    await updateKanbanColumns(updatedCols);
    setRenamingColumn(null);
    fetchInitialData();
    showSuccess(`Coluna renomeada de "${oldName}" para "${trimmedNewName}".`);
  };

  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return;
    
    // Filter out this column from list
    const filteredColumns = kanbanColumns.filter(col => col !== columnToDelete);
    
    // Reassigned status of items belonging to deleted column to move them to the first remaining column
    const fallbackCol = filteredColumns[0] || 'A Fazer';
    const cardsToMove = activities.filter(a => a.status === columnToDelete);
    
    for (const card of cardsToMove) {
      try {
        await authFetch(`/api/activities/${card.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...card, status: fallbackCol })
        });
      } catch (e) {
        console.error('Falha ao mover atividade de coluna excluída:', e);
      }
    }
    
    await updateKanbanColumns(filteredColumns);
    setColumnToDelete(null);
    fetchInitialData();
    showSuccess(`Coluna "${columnToDelete}" excluída. Atividades movidas para "${fallbackCol}".`);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedCardId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
  };

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    if (draggedOverColumn !== colStatus) {
      setDraggedOverColumn(colStatus);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const cardIdStr = e.dataTransfer.getData('text/plain') || String(draggedCardId);
    const id = Number(cardIdStr);
    
    setDraggedCardId(null);
    setDraggedOverColumn(null);
    
    if (!id) return;
    
    const act = activities.find(a => a.id === id);
    if (!act || act.status === targetStatus) return;
    
    // Optimistic UI update: immediately move the card to the target column locally
    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: targetStatus } : a));
    
    try {
      const res = await authFetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...act, status: targetStatus })
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Erro ao atualizar status da atividade no servidor:', data.error);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
      fetchInitialData();
    }
  };

  // --- CRUD VAGAS ---
  const saveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacTitle || !vacDept || !vacDesc || !vacReq) {
      alert('Preencha os campos essenciais da vaga corporativa.');
      return;
    }

    const payload = {
      title: vacTitle,
      department: vacDept,
      description: vacDesc,
      location: vacLoc,
      requirements: vacReq,
      status: vacStatus
    };

    try {
      let res;
      if (selectedVacancyId) {
        res = await authFetch(`/api/vacancies/${selectedVacancyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/vacancies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showSuccess(selectedVacancyId ? 'Vaga corrigida e atualizada.' : 'Nova vaga publicada no portal do Trabalhe Conosco.');
        setVacancyFormOpen(false);
        resetVacancyForm();
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteVacancy = async () => {
    if (!vacancyToDelete) return;
    const id = vacancyToDelete.id;
    setVacancyToDelete(null);
    try {
      const res = await authFetch(`/api/vacancies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Vaga excluída com êxito.');
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteVacancy = (vac: Vacancy) => {
    setVacancyToDelete(vac);
  };

  const openEditVacancy = (vac: Vacancy) => {
    setSelectedVacancyId(vac.id);
    setVacTitle(vac.title);
    setVacDept(vac.department);
    setVacDesc(vac.description);
    setVacLoc(vac.location);
    setVacReq(vac.requirements);
    setVacStatus(vac.status);
    setVacancyFormOpen(true);
  };

  const resetVacancyForm = () => {
    setSelectedVacancyId(null);
    setVacTitle('');
    setVacDept('');
    setVacDesc('');
    setVacLoc('Tatuí - SP');
    setVacReq('');
    setVacStatus('Ativa');
  };

  // --- RECRUTAMENTO GERENCIAR CURRÍCULOS ---
  const updateCandidateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await authFetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Ficha atualizada para status: ${newStatus}`);
        if (viewingCandidate && viewingCandidate.id === id) {
          setViewingCandidate({ ...viewingCandidate, status: newStatus });
        }
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCandidate = async (id: number) => {
    if (!confirm('Deseja purgar este currículo da lixeira interna? Esta operação é irreversível.')) return;
    try {
      const res = await authFetch(`/api/candidates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Currículo expurgado do banco.');
        setViewingCandidate(null);
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runAiEvaluation = async (candidateId: number) => {
    setEvaluatingId(candidateId);
    try {
      const response = await authFetch(`/api/candidates/${candidateId}/evaluate`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        showSuccess('Triagem inteligente e análise de currículo por IA concluídas!');
        const updatedAnalysis = data.ai_analysis;
        
        // Find existing candidate and update it in place
        setCandidates(prev => prev.map(c => 
          c.id === candidateId ? { ...c, ai_analysis: updatedAnalysis } : c
        ));
        
        if (viewingCandidate && viewingCandidate.id === candidateId) {
          setViewingCandidate(prev => prev ? { ...prev, ai_analysis: updatedAnalysis } : null);
        }
        
        fetchInitialData();
      } else {
        alert('Erro ao realizar a triagem por IA: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      console.error('AI evaluation failed:', err);
      alert('Erro na conexão de rede para triagem por IA: ' + err.message);
    } finally {
      setEvaluatingId(null);
    }
  };

  const registerManualCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCandName || !manualCandEmail || !manualCandPhone || !manualCandCvText) {
      alert('Por favor, preencha todos os campos obrigatórios do currículo.');
      return;
    }
    try {
      const res = await authFetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: manualCandName,
          email: manualCandEmail,
          phone: manualCandPhone,
          vacancy_id: manualCandVacancyId ? Number(manualCandVacancyId) : null,
          cv_text: manualCandCvText
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Candidato registrado manualmente com sucesso no Banco de Talentos!');
        setManualCandName('');
        setManualCandEmail('');
        setManualCandPhone('');
        setManualCandVacancyId('');
        setManualCandCvText('');
        setManualCandidateModalOpen(false);
        fetchInitialData();
      } else {
        alert('Erro ao registrar candidato: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao contatar servidor: ' + err.message);
    }
  };

  // --- RASTREAMENTO CORRIDA SIMULATOR AND MUTATIONS ---
  
  const createRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !vehiclePlate || !cargoDesc) {
      alert('Por favor, preencha o Nome do Motorista, a Placa do Veículo e a Descrição da Carga.');
      return;
    }

    try {
      const startPreset = PRESET_COORDS[startLocation] || { lat: -23.3556, lng: -47.8556 };
      
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_name: driverName,
          vehicle_plate: vehiclePlate.toUpperCase(),
          vehicle_type: vehicleType,
          start_location: startLocation,
          destination: destination,
          current_lat: startPreset.lat,
          current_lng: startPreset.lng,
          cargo_description: cargoDesc
        })
      });

      const data = await res.json();
      if (data.success) {
        showSuccess('Rota e rastreamento GPS em tempo real iniciados com sucesso!');
        setRouteFormOpen(false);
        setDriverName('');
        setVehiclePlate('');
        setCargoDesc('');
        
        const freshRes = await fetch('/api/routes');
        const freshData = await freshRes.json();
        if (freshData.success) {
          const loaded = freshData.routes || [];
          setRoutes(loaded);
          setSelectedRouteId(data.id);
        }
      }
    } catch (e) {
      console.error(e);
      setErrorNotice('Falha de rede ao tentar iniciar a rota.');
    }
  };

  const deleteRoute = async (id: number) => {
    if (!confirm('Deseja purgar este registro de rota finalizada? O histórico será excluído.')) return;
    try {
      const res = await fetch(`/api/routes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Registro de rota expurgado do sistema.');
        if (selectedRouteId === id) setSelectedRouteId(null);
        const freshRes = await fetch('/api/routes');
        const freshData = await freshRes.json();
        if (freshData.success) {
          setRoutes(freshData.routes || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const manualEventReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId || !customEventText.trim()) return;

    try {
      const currentRoute = routes.find(r => r.id === selectedRouteId);
      if (!currentRoute) return;

      const res = await fetch(`/api/routes/${selectedRouteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          last_event: customEventText,
          event_occurred: customEventText
        })
      });

      const data = await res.json();
      if (data.success) {
        showSuccess('Evento e posicionamento gravados no histórico!');
        setCustomEventText('');
        const freshRes = await fetch('/api/routes');
        const freshData = await freshRes.json();
        if (freshData.success) {
          setRoutes(freshData.routes || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerStepProgress = async (id: number, forcedProgressAdd?: number) => {
    try {
      const currentRoute = routes.find(r => r.id === id);
      if (!currentRoute || currentRoute.status !== 'Ativa') return;

      const prevProgress = currentRoute.progress || 0;
      const addVal = forcedProgressAdd !== undefined ? forcedProgressAdd : 5;
      const newProgress = Math.min(prevProgress + addVal, 100);

      const startPreset = PRESET_COORDS[currentRoute.start_location] || { lat: -23.3556, lng: -47.8556 };
      const endPreset = PRESET_COORDS[currentRoute.destination] || { lat: -23.7975, lng: -48.5133 };

      const latVal = startPreset.lat + (endPreset.lat - startPreset.lat) * (newProgress / 100);
      const lngVal = startPreset.lng + (endPreset.lng - startPreset.lng) * (newProgress / 100);

      const statusVal = newProgress >= 100 ? 'Concluída' : 'Ativa';
      const speedVal = statusVal === 'Concluída' ? 0 : (65 + Math.floor(Math.random() * 25));
      const fuelVal = Math.max(currentRoute.fuel_level - (forcedProgressAdd !== undefined ? 2 : 1), 5);

      let logMsg = currentRoute.last_event;
      if (newProgress === 100) {
        logMsg = 'Destino alcançado. Carga entregue com sucesso e comprovante assinado.';
      } else if (newProgress % 20 === 0) {
        logMsg = `Veículo cruzando rodovia a ${speedVal} km/h. Condição estável.`;
      }

      const res = await fetch(`/api/routes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_lat: latVal,
          current_lng: lngVal,
          progress: newProgress,
          speed: speedVal,
          fuel_level: fuelVal,
          last_event: logMsg,
          status: statusVal,
          event_occurred: forcedProgressAdd !== undefined ? `Progresso alterado manualmente para ${newProgress}%` : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        const freshRes = await fetch('/api/routes');
        const freshData = await freshRes.json();
        if (freshData.success) {
          setRoutes(freshData.routes || []);
        }
      }
    } catch (e) {
      console.error('Falha de simulação GPS:', e);
    }
  };

  // Automated GPS Simulator Clock (Every 6 seconds)
  React.useEffect(() => {
    let intervalId: any = null;
    if (simulationActive && activeSubTab === 'tracking') {
      intervalId = setInterval(() => {
        const activeRoutes = routes.filter(r => r.status === 'Ativa');
        activeRoutes.forEach(route => {
          triggerStepProgress(route.id);
        });
      }, 6000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [simulationActive, routes, activeSubTab]);

  // Filter lists
  const filteredSuppliers = suppliers.filter(s => cityFilter === 'Todos' || s.city === cityFilter);
  const filteredCandidates = candidates.filter(c => {
    const matchesStatus = candidateStatusFilter === 'Todos' || c.status === candidateStatusFilter;
    const matchesVacancy = candidateVacancyFilter === 'Todos' || String(c.vacancy_id) === String(candidateVacancyFilter);
    
    const query = candidateSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.cv_text.toLowerCase().includes(query) ||
      (c.vacancy_title && c.vacancy_title.toLowerCase().includes(query));
      
    return matchesStatus && matchesVacancy && matchesSearch;
  });

  // Distinct cities in MT for dropdown filter
  const uniqueMTCities = Array.from(new Set(suppliers.map(s => s.city)));

  // Alertas derivados para o sino de notificações do topbar
  const notifItems = buildNotifications({
    candidates: candidates as any,
    activities,
    onGoTo: (tab) => goToTab(tab as SubTab),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/40 flex font-sans w-full" id="manager-panel-container">
      {/* MOBILE SIDEBAR BACKDROP */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* PORTAL SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#06150c] via-[#0a1e13] to-[#0b2417] text-emerald-100 flex flex-col h-screen border-r border-emerald-900/70 shadow-[8px_0_35px_rgba(2,30,20,0.4)] transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* SIDEBAR HEADER / BRANDING */}
        <div className="relative p-6 border-b border-emerald-900/60 bg-[#06150c]/80 flex items-center justify-between overflow-hidden">
          {/* Glow ambiente atrás do logo */}
          <div className="absolute -top-6 -left-6 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-md" />
              <img src="/images/shigueno-logo.png" alt="Shigueno" className="relative w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
            </div>
            <div>
              <h2 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500 text-xs uppercase tracking-widest leading-none">Grupo Shigueno</h2>
              <span className="text-[10px] text-emerald-300 font-bold uppercase font-mono mt-1 block tracking-wider">Painel do Gestor</span>
            </div>
          </div>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-emerald-300 hover:bg-emerald-900 hover:text-white transition-colors relative"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGGED IN USER PROFILE */}
        <div className="p-3.5 mx-4 my-3 bg-gradient-to-br from-emerald-900/40 to-emerald-950/30 rounded-2xl border border-emerald-700/30 flex items-center space-x-3 shadow-inner">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-600/50 flex items-center justify-center text-sm font-black text-amber-400 shadow-md">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a1e13] animate-pulse" title="Online" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-extrabold text-white truncate">{currentUserName}</p>
            <span className="text-[9px] text-emerald-400 font-bold font-mono tracking-widest uppercase inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />{currentUserRole}
            </span>
          </div>
        </div>

        {/* NAVIGATION MENUS — grupos acordeão por departamento */}
        <SidebarNav
          activeSubTab={activeSubTab}
          currentUserRole={currentUserRole}
          canView={canView}
          onNavigate={(tab) => {
            window.history.pushState(null, '', TAB_TO_HASH[tab]);
            setActiveSubTab(tab);
            setViewingCandidateUid(null);
            setMobileSidebarOpen(false);
          }}
        />

        {/* BOTTOM NAV / ACTIONS */}
        <div className="p-4 border-t border-emerald-900/60 bg-[#06150c]/80 space-y-1.5">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/40 transition-colors text-[11px] font-bold cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Voltar ao Site</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-red-400 hover:text-red-100 hover:bg-red-950/45 transition-colors text-[11px] font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-400" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* PORTAL MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* CUSTOM PORTAL TOPBAR */}
        <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/70 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_16px_rgba(2,30,20,0.05)]">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-650 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  activeSubTab === 'reports' ? 'bg-emerald-500' :
                  activeSubTab === 'vacancies' || activeSubTab === 'candidates' || activeSubTab === 'equipe' ? 'bg-blue-500' :
                  activeSubTab === 'suppliers' ? 'bg-purple-500' :
                  activeSubTab === 'tracking' ? 'bg-amber-500' :
                  'bg-slate-400'
                } animate-pulse`} />
                <h1 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-none">
                  {activeSubTab === 'reports' && 'Dashboard & KPIs'}
                  {activeSubTab === 'suppliers' && 'Quadro de Atividades'}
                  {activeSubTab === 'tracking' && 'Rastreamento & Frotas'}
                  {activeSubTab === 'blog' && 'Gestor do Blog'}
                  {activeSubTab === 'vacancies' && 'Gestão de Vagas'}
                  {activeSubTab === 'candidates' && !viewingCandidateUid && 'Seleção & Currículos'}
                  {activeSubTab === 'candidates' && viewingCandidateUid && 'Ficha do Candidato'}
                  {activeSubTab === 'equipe' && 'Equipe & Hierarquia'}
                  {activeSubTab === 'financeiro' && 'Módulo Financeiro'}
                  {activeSubTab === 'settings' && 'Dados do Site'}
                  {activeSubTab === 'permissions' && 'Usuários & Permissões'}
                </h1>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 hidden sm:block">
                Grupo Shigueno · {currentUserName} · {currentUserRole}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Relógio ao vivo */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0a1e13] border border-emerald-900/60 mr-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black text-emerald-300 font-mono tracking-wider tabular-nums">
                {clock.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 font-mono uppercase border-l border-emerald-900 pl-2">
                {clock.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
              </span>
            </div>

            {/* Badges de resumo rápido */}
            {stats && (
              <div className="hidden md:flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3 h-3" />
                  <span>{stats.totalVacancies} vagas</span>
                </span>
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg">
                  <Users className="w-3 h-3" />
                  <span>{stats.totalCandidates} candidatos</span>
                </span>
              </div>
            )}

            {/* Central de alertas */}
            <NotificationBell items={notifItems} />

            <button
              onClick={fetchInitialData}
              title="Sincronizar banco de dados"
              className={`p-2 px-3 rounded-xl transition-all hover:bg-slate-50 hover:text-emerald-800 text-slate-500 flex items-center space-x-1.5 border border-slate-150 shadow-2xs text-[11px] font-bold cursor-pointer ${loading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="p-2 px-3 border border-slate-150 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 text-slate-600 text-xs font-bold shadow-2xs hidden xs:inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ir ao Site</span>
            </button>
          </div>
        </header>

        {/* CONTAINER WORKSPACE */}
        <main className={`flex-grow w-full ${viewingCandidateUid ? 'p-0' : 'p-4 md:p-8 space-y-6'}`}>
          {/* ── Ficha completa inline (sidebar preservada) ── */}
          {viewingCandidateUid && (
            <CandidatePage
              uid={viewingCandidateUid}
              token={token}
              userName={currentUserName}
              onBack={() => {
                setViewingCandidateUid(null);
                // Restaura o hash na URL para candidatos
                window.history.replaceState(null, '', TAB_TO_HASH['candidates']);
              }}
            />
          )}

          {!viewingCandidateUid && (<>
          {successNotice && (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-905 rounded-xl p-4 text-xs font-bold shadow-xs animate-slide-in flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}
          {errorNotice && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs font-bold leading-relaxed shadow-xs animate-pulse flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {loading ? (
            <SkeletonDashboard />
          ) : (
            <div className="animate-fade-in font-sans">
            
              {/* SUBTAB 1: RELATÓRIOS EM TEMPO REAL */}
              {activeSubTab === 'reports' && stats && (
              <div className="space-y-6">

                {/* ── HERO DE BOAS-VINDAS ── */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06150c] via-[#0a2316] to-[#0d3320] border border-emerald-900/50 p-6 sm:p-8 shadow-[0_15px_45px_rgba(2,30,20,0.3)]">
                  {/* Brilho dourado de fundo */}
                  <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-gold-shine" />
                  <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] font-mono">
                        {clock.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                        {clock.getHours() < 12 ? 'Bom dia' : clock.getHours() < 18 ? 'Boa tarde' : 'Boa noite'},{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                          {currentUserName.split(' ')[0]}
                        </span> 👋
                      </h2>
                      <p className="text-xs text-emerald-300/80 font-semibold max-w-md leading-relaxed">
                        Aqui está o panorama do Grupo Shigueno em tempo real. Operação centralizada de Tatuí/SP.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="px-4 py-3 rounded-2xl bg-white/5 border border-emerald-700/30 backdrop-blur-sm text-center min-w-[88px]">
                        <p className="text-xl font-black text-amber-400 leading-none">{stats.totalVacancies}</p>
                        <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest font-mono mt-1.5">Vagas</p>
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white/5 border border-emerald-700/30 backdrop-blur-sm text-center min-w-[88px]">
                        <p className="text-xl font-black text-white leading-none">{stats.totalCandidates}</p>
                        <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest font-mono mt-1.5">Candidatos</p>
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white/5 border border-emerald-700/30 backdrop-blur-sm text-center min-w-[88px]">
                        <p className="text-xl font-black text-emerald-300 leading-none">{summary?.employees?.ativos ?? '—'}</p>
                        <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest font-mono mt-1.5">Equipe Ativa</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARDS KPI ── */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Vagas Ativas"
                    value={stats.totalVacancies}
                    icon={Briefcase}
                    tone="emerald"
                    hint="Gestão de vagas"
                    onClick={() => goToTab('vacancies')}
                  />
                  <StatCard
                    label="Candidatos"
                    value={stats.totalCandidates}
                    icon={Users}
                    tone="blue"
                    hint="Banco de currículos"
                    onClick={() => goToTab('candidates')}
                  />
                  <StatCard
                    label="Equipe Ativa"
                    value={summary?.employees?.ativos ?? '—'}
                    icon={UserCog}
                    tone="gold"
                    hint={summary?.employees ? `${summary.employees.total} colaboradores no total` : 'Equipe & hierarquia'}
                    onClick={() => goToTab('equipe')}
                  />
                  <StatCard
                    label="Atividades"
                    value={stats.totalActivities ?? activities.length}
                    icon={LayoutGrid}
                    tone="purple"
                    hint={summary?.activities?.overdue ? `${summary.activities.overdue} vencida(s) ⚠️` : 'Quadro em dia'}
                    onClick={() => goToTab('suppliers')}
                  />
                </div>

                {/* ── NOTAS RÁPIDAS + ACESSO RÁPIDO ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <QuickNotes userId={currentUserId} token={token} />
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(2,30,20,0.04)] p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Acesso Rápido</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {([
                        { tab: 'equipe' as SubTab,     label: 'Equipe',     icon: UserCog,    tone: 'hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700' },
                        { tab: 'vacancies' as SubTab,  label: 'Vagas',      icon: Briefcase,  tone: 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700' },
                        { tab: 'candidates' as SubTab, label: 'Seleção',    icon: Users,      tone: 'hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700' },
                        { tab: 'suppliers' as SubTab,  label: 'Atividades', icon: LayoutGrid, tone: 'hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700' },
                        { tab: 'financeiro' as SubTab, label: 'Financeiro', icon: DollarSign, tone: 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700' },
                        { tab: 'tracking' as SubTab,   label: 'Frotas',     icon: Truck,      tone: 'hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700' },
                      ]).map(({ tab, label, icon: QIcon, tone }) => (
                        <button
                          key={tab}
                          onClick={() => goToTab(tab)}
                          className={`flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl border border-slate-150 bg-slate-50/60 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${tone}`}
                        >
                          <QIcon className="w-4.5 h-4.5" />
                          <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modern Filter Board */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-all">
                  {/* Date/Time Filter Column */}
                  <div className="md:col-span-6 space-y-3.5">
                    <div className="flex items-center space-x-2 text-emerald-900">
                      <Calendar className="w-4 h-4 text-emerald-800" />
                      <span className="text-xs font-black uppercase tracking-wider font-mono">Filtro de Período e Datas (Safra)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Selecionar Recorte:</label>
                        <select
                          value={reportPeriod}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReportPeriod(val);
                            if (val === '3m') {
                              setReportStartMonth('Mar');
                              setReportEndMonth('Mai');
                            } else if (val === '6m' || val === 'Todos') {
                              setReportStartMonth('Dez');
                              setReportEndMonth('Mai');
                            }
                          }}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-750 focus:outline-emerald-800 cursor-pointer shadow-3xs transition-colors"
                        >
                          <option value="Todos">Todo Histórico (6 meses)</option>
                          <option value="3m">Último Trimestre (Mar - Mai)</option>
                          <option value="custom">Período Customizado 📅</option>
                        </select>
                      </div>

                      {reportPeriod === 'custom' && (
                        <div className="grid grid-cols-2 gap-2 animate-fade-in">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Início:</label>
                            <select
                              value={reportStartMonth}
                              onChange={(e) => setReportStartMonth(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-700 focus:outline-emerald-800 cursor-pointer"
                            >
                              {monthOrder.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Fim:</label>
                            <select
                              value={reportEndMonth}
                              onChange={(e) => setReportEndMonth(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-700 focus:outline-emerald-800 cursor-pointer"
                            >
                              {monthOrder.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agricultural / Livestock Filter Column */}
                  <div className="md:col-span-6 space-y-3.5 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
                    <div className="flex items-center space-x-2 text-amber-900">
                      <Filter className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black uppercase tracking-wider font-mono">Filtro Nelores & Microrregião (Pecuária)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Raça do Gado:</label>
                        <select
                          value={reportBreed}
                          onChange={(e) => setReportBreed(e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-755 focus:outline-emerald-800 cursor-pointer shadow-3xs transition-colors"
                        >
                          <option value="Todos">Qualquer Raça</option>
                          <option value="Nelore">Nelore Pura</option>
                          <option value="Angus">Angus</option>
                          <option value="Senepol">Senepol</option>
                          <option value="Misto">Misto / Cruzamentos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Tamanho de Rebanho Mín:</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={reportMinCattle === 0 ? '' : reportMinCattle}
                            onChange={(e) => setReportMinCattle(Number(e.target.value))}
                            placeholder="Ex: 100 cab."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-emerald-800 shadow-3xs"
                          />
                          {reportMinCattle > 0 && (
                            <button 
                              type="button"
                              onClick={() => setReportMinCattle(0)}
                              className="absolute right-2.5 top-2.5 text-[10px] font-black text-red-500 hover:text-red-700"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Micro KPIs Section - Produção Consolidada */}
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center space-x-2 text-emerald-950">
                    <TrendingUp className="w-4 h-4 text-emerald-855" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-mono">Performance de Produção (Agropecuária & Postura)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Nelore */}
                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Pecuária Nelore (MT)</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{computedCattleHead.toLocaleString('pt-BR')} cab.</h4>
                        <p className="text-[9px] text-emerald-700 font-semibold italic">Rebanho ativo filtrado</p>
                      </div>
                    </div>

                    {/* Ovos Nova Aliança */}
                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0 w-11 h-11 flex items-center justify-center select-none text-[20px]">
                        🥚
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Ovos Nova Aliança</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{computedTotalOvos.toLocaleString('pt-BR')} cx.</h4>
                        <p className="text-[9px] text-amber-600 font-semibold">Postura coletada</p>
                      </div>
                    </div>

                    {/* Laranjas Citros */}
                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shrink-0 w-11 h-11 flex items-center justify-center select-none text-[20px]">
                        🍊
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Laranjas Tatuí/Buri</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{computedTotalCitros.toLocaleString('pt-BR')} t</h4>
                        <p className="text-[9px] text-emerald-700 font-semibold">Colheita escoada</p>
                      </div>
                    </div>

                    {/* Café Arábica */}
                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-amber-100/50 text-amber-850 rounded-xl w-11 h-11 shrink-0 flex items-center justify-center select-none text-[20px]">
                        ☕
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Café Arábica Itaí</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{computedTotalCafe.toLocaleString('pt-BR')} sc.</h4>
                        <p className="text-[9px] text-amber-800 font-semibold">Sacarias processadas</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* KPIs Corporativos — Vagas, RH, Atividades & Parceiros */}
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center space-x-2 text-slate-950">
                    <Building2 className="w-4 h-4 text-slate-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-mono">Gestão Corporativa — Indicadores Gerais</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

                    {/* Vagas ativas */}
                    <button
                      onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['vacancies']); setActiveSubTab('vacancies'); setViewingCandidateUid(null); }}
                      className="bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] hover:border-blue-200 border border-transparent transition-all duration-300 select-none cursor-pointer text-left group"
                    >
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-100 transition-colors">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Vagas Abertas</p>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalVacancies}</h4>
                        <p className="text-[9px] text-blue-600 font-bold">Ver vagas →</p>
                      </div>
                    </button>

                    {/* Currículos */}
                    <button
                      onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['candidates']); setActiveSubTab('candidates'); setViewingCandidateUid(null); }}
                      className="bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] hover:border-indigo-200 border border-transparent transition-all duration-300 select-none cursor-pointer text-left group"
                    >
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:bg-indigo-100 transition-colors">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Candidatos</p>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalCandidates}</h4>
                        <p className="text-[9px] text-indigo-600 font-bold">Banco talentos →</p>
                      </div>
                    </button>

                    {/* Atividades */}
                    <button
                      onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['suppliers']); setActiveSubTab('suppliers'); setViewingCandidateUid(null); }}
                      className="bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] hover:border-purple-200 border border-transparent transition-all duration-300 select-none cursor-pointer text-left group"
                    >
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit group-hover:bg-purple-100 transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Atividades</p>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalActivities || 0}</h4>
                        <p className="text-[9px] text-purple-600 font-bold">{stats.doneActivities || 0} concluídas →</p>
                      </div>
                    </button>

                    {/* Parceiros */}
                    <div className="bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] border border-transparent transition-all duration-300 select-none">
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Pecuaristas</p>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">{filteredSuppliersForReports.length}</h4>
                        <p className="text-[9px] text-slate-400 font-mono">de {stats.totalSuppliers} total</p>
                      </div>
                    </div>

                    {/* Rebanho total */}
                    <div className="bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] border border-transparent transition-all duration-300 select-none">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit text-lg leading-none">🐂</div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Rebanho Nelore</p>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">{computedCattleHead.toLocaleString('pt-BR')}</h4>
                        <p className="text-[9px] text-amber-600 font-bold">cabeças</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Candidatos recentes */}
                {stats.recentCandidates && stats.recentCandidates.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Últimas Candidaturas Recebidas</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">5 mais recentes cadastradas no banco de talentos</p>
                      </div>
                      <button
                        onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['candidates']); setActiveSubTab('candidates'); setViewingCandidateUid(null); }}
                        className="text-[10px] text-emerald-700 font-extrabold hover:underline cursor-pointer"
                      >
                        Ver todos →
                      </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {stats.recentCandidates.map((c) => (
                        <div key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{c.vacancy_title || 'Espontâneo'}</p>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:block">{c.applied_at ? String(c.applied_at).slice(0,10) : ''}</span>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              c.status === 'Novo' ? 'bg-blue-50 text-blue-800' :
                              c.status === 'Em Análise' ? 'bg-amber-50 text-amber-800' :
                              c.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-800' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {c.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real-time Production Charts block */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Production chart */}
                  <div className="bg-white p-6 rounded-2xl space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Escoamento de Safra Consolidado</h3>
                        <p className="text-[10px] text-slate-500">Colheita e postura monitoradas em tempo real (meses selecionados).</p>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 font-black px-2 py-0.5 rounded-lg font-mono uppercase tracking-wider">{reportPeriod === 'Todos' ? 'Histórico Completo' : 'Período Filtrado'}</span>
                    </div>

                    <div className="h-64 sm:h-72">
                      {filteredProductionStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredProductionStats} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="ovos" name="Ovos Nova Aliança (caixas)" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="citros" name="Laranjas Tatuí/Buri (tons)" stroke="#047857" strokeWidth={3} />
                            <Line type="monotone" dataKey="cafe" name="Café Arábica Itaí (sacas)" stroke="#8b5a2b" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs italic text-slate-400">Nenhum dado produtivo para o recorte escolhido.</div>
                      )}
                    </div>
                  </div>

                  {/* Cattle distribution Chart */}
                  <div className="bg-white p-6 rounded-2xl space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Distribuição Regional de Nelores</h3>
                        <p className="text-[10px] text-slate-500">Por microrregião e propriedade parceira sob os filtros agro.</p>
                      </div>
                      <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2 py-0.5 rounded-lg font-mono uppercase tracking-wider">Raça: {reportBreed}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="h-56">
                        {computedCityDistribution.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={computedCityDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                fill="#8884d8"
                                paddingAngle={3}
                                dataKey="value"
                                nameKey="city"
                              >
                                {computedCityDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs italic text-slate-400">Nenhum pecuarista elegível nos filtros atuais.</div>
                        )}
                      </div>

                      {/* Map Legends of MT cattle suppliers distribution */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2">Foco por Município:</p>
                        {computedCityDistribution.length > 0 ? (
                          computedCityDistribution.map((cityRow, i) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1 last:border-0 font-sans">
                              <div className="flex items-center space-x-2 truncate">
                                <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                <span className="font-bold text-slate-700 truncate">{cityRow.city}</span>
                              </div>
                              <span className="font-mono text-slate-600 shrink-0 select-none">
                                <strong className="text-amber-850 font-black">{cityRow.value}</strong> cab. ({cityRow.supplier_count} faz.)
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Sem registros para legendar.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Applicants by Job vacancy distribution */}
                <div className="bg-white p-6 rounded-2xl space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Estatísticas De Recrutamento</h3>
                    <p className="text-[10px] text-slate-500 font-sans">Volume de fichas de candidaturas em tempo real por anúncio ou interesse espontâneo.</p>
                  </div>

                  <div className="h-64">
                    {stats.candidatesByVacancy.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.candidatesByVacancy} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                          <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                          <Bar dataKey="value" name="Número de Fichas" fill="#047857" radius={[6, 6, 0, 0]}>
                            {stats.candidatesByVacancy.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#047857' : '#059669'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs italic text-slate-400">Nenhum currículo cadastrado na base ainda.</div>
                    )}
                  </div>
                </div>

                {/* PAINEL DE ATUALIZAÇÃO DE DADOS REAIS DE PRODUÇÃO */}
                {currentUserRole === 'admin' && stats?.productionStats && stats.productionStats.length > 0 && (
                  <ProductionEditor
                    productionStats={stats.productionStats}
                    onSaved={fetchInitialData}
                    showSuccess={showSuccess}
                  />
                )}

                {/* PAINEL EQUIPE & FINANCEIRO — dados reais do banco */}
                {summary && (
                  <div className="space-y-6">

                    {/* Equipe */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-slate-800">
                        <Users className="w-4 h-4 text-blue-600" />
                        <h3 className="text-xs font-black uppercase tracking-wider font-mono">Equipe & Recursos Humanos</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <button
                          onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['equipe']); setActiveSubTab('equipe'); setViewingCandidateUid(null); }}
                          className="bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] border border-transparent hover:border-blue-200 transition-all cursor-pointer text-left group"
                        >
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-100 transition-colors">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Funcionários Ativos</p>
                            <h4 className="text-xl font-black text-slate-900">{summary.employees.ativos}</h4>
                            <p className="text-[9px] text-blue-600 font-bold">de {summary.employees.total} total →</p>
                          </div>
                        </button>

                        <button
                          onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['equipe']); setActiveSubTab('equipe'); setViewingCandidateUid(null); }}
                          className="bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] border border-transparent hover:border-indigo-200 transition-all cursor-pointer text-left group"
                        >
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:bg-indigo-100 transition-colors">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Departamentos</p>
                            <h4 className="text-xl font-black text-slate-900">{summary.employees.departments}</h4>
                            <p className="text-[9px] text-indigo-600 font-bold">ativos →</p>
                          </div>
                        </button>

                        <div className="bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] border border-transparent transition-all">
                          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit text-lg leading-none">🎂</div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Aniversários</p>
                            <h4 className="text-xl font-black text-slate-900">{summary.employees.birthdaysMonth}</h4>
                            <p className="text-[9px] text-amber-600 font-bold">neste mês</p>
                          </div>
                        </div>

                        <div className={`bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] border transition-all ${summary.employees.onVacation > 0 ? 'border-sky-200' : 'border-transparent'}`}>
                          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl w-fit">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Em Férias Agora</p>
                            <h4 className="text-xl font-black text-slate-900">{summary.employees.onVacation}</h4>
                            <p className="text-[9px] text-sky-600 font-bold">funcionários</p>
                          </div>
                        </div>

                        <div className={`bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] border transition-all ${summary.employees.upcomingVacations > 0 ? 'border-amber-200' : 'border-transparent'}`}>
                          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Férias Próximas</p>
                            <h4 className="text-xl font-black text-slate-900">{summary.employees.upcomingVacations}</h4>
                            <p className="text-[9px] text-amber-600 font-bold">nos próx. 30 dias</p>
                          </div>
                        </div>

                        <div className={`bg-white p-4 rounded-2xl flex flex-col space-y-2 shadow-[0_4px_18px_rgba(0,0,0,0.03)] border transition-all ${summary.activities.overdue > 0 ? 'border-red-200' : 'border-transparent'}`}>
                          <div className={`p-2.5 rounded-xl w-fit ${summary.activities.overdue > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Ativ. Vencidas</p>
                            <h4 className={`text-xl font-black ${summary.activities.overdue > 0 ? 'text-red-700' : 'text-slate-900'}`}>{summary.activities.overdue}</h4>
                            <p className={`text-[9px] font-bold ${summary.activities.overdue > 0 ? 'text-red-500' : 'text-slate-400'}`}>prazo expirado</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financeiro */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-slate-800">
                        <DollarSign className="w-4 h-4 text-emerald-700" />
                        <h3 className="text-xs font-black uppercase tracking-wider font-mono">Financeiro — Folha & Estoque</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Folha do mês atual */}
                        <button
                          onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['financeiro']); setActiveSubTab('financeiro'); setViewingCandidateUid(null); }}
                          className="bg-white p-5 rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] border border-transparent hover:border-emerald-200 transition-all cursor-pointer text-left group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Folha do Mês</p>
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-black px-2 py-0.5 rounded font-mono">{summary.payroll.currentMonth}</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 font-mono">
                            {summary.payroll.totalNet > 0
                              ? `R$ ${Number(summary.payroll.totalNet).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : <span className="text-slate-400 text-sm">Sem registros</span>
                            }
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-1">{summary.payroll.totalEmps} funcionários · {summary.payroll.paidCount} pagos</p>
                          {summary.payroll.prevMonthNet > 0 && (
                            <p className="text-[9px] text-emerald-600 font-bold mt-1">
                              Mês anterior: R$ {Number(summary.payroll.prevMonthNet).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          )}
                          <p className="text-[9px] text-emerald-700 font-bold mt-1 group-hover:underline">Ver folha →</p>
                        </button>

                        {/* Atividades com prazo próximo */}
                        <button
                          onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['suppliers']); setActiveSubTab('suppliers'); setViewingCandidateUid(null); }}
                          className={`bg-white p-5 rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] border transition-all cursor-pointer text-left group ${summary.activities.dueSoon > 0 ? 'border-amber-200' : 'border-transparent hover:border-amber-200'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Ativ. Urgentes</p>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded font-mono ${summary.activities.dueSoon > 0 ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-500'}`}>7 dias</span>
                          </div>
                          <h4 className={`text-xl font-black ${summary.activities.dueSoon > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{summary.activities.dueSoon}</h4>
                          <p className="text-[9px] text-slate-400 mt-1">atividades com prazo próximo</p>
                          {summary.activities.overdue > 0 && (
                            <p className="text-[9px] text-red-600 font-bold mt-1">{summary.activities.overdue} vencidas sem conclusão</p>
                          )}
                          <p className="text-[9px] text-amber-700 font-bold mt-1 group-hover:underline">Ver quadro →</p>
                        </button>

                        {/* Vagas por departamento */}
                        {summary.recruitment.vacanciesByDept.length > 0 ? (
                          <div className="bg-white p-5 rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.03)] border border-transparent transition-all">
                            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide mb-3">Vagas por Depto</p>
                            <div className="space-y-1.5">
                              {summary.recruitment.vacanciesByDept.slice(0, 4).map((d, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-700 font-semibold truncate pr-2">{d.label || 'Geral'}</span>
                                  <span className="font-black text-blue-700 shrink-0">{d.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white p-5 rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.03)] border border-transparent flex items-center justify-center text-xs italic text-slate-400">
                            Nenhuma vaga ativa
                          </div>
                        )}

                        {/* Estoque */}
                        <button
                          onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['financeiro']); setActiveSubTab('financeiro'); setViewingCandidateUid(null); }}
                          className={`bg-white p-5 rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] border transition-all cursor-pointer text-left group ${summary.stock.lowStockCount > 0 ? 'border-red-200' : 'border-transparent hover:border-slate-200'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Estoque</p>
                            {summary.stock.lowStockCount > 0 && (
                              <span className="text-[9px] bg-red-50 text-red-700 font-black px-2 py-0.5 rounded font-mono">Alerta</span>
                            )}
                          </div>
                          <h4 className="text-xl font-black text-slate-900">{summary.stock.totalItems}</h4>
                          <p className="text-[9px] text-slate-400 mt-1">itens cadastrados</p>
                          {summary.stock.lowStockCount > 0 ? (
                            <p className="text-[9px] text-red-600 font-bold mt-1">{summary.stock.lowStockCount} abaixo do mínimo</p>
                          ) : (
                            <p className="text-[9px] text-emerald-600 font-bold mt-1">Níveis normais</p>
                          )}
                          <p className="text-[9px] text-slate-500 font-bold mt-1 group-hover:underline">Ver estoque →</p>
                        </button>

                      </div>
                    </div>

                    {/* Candidatos recentes por status (últimos 30 dias) */}
                    {summary.recruitment.recentByStatus.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
                        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Candidatos — Últimos 30 Dias</h3>
                            <p className="text-[10px] text-slate-500">Distribuição por status das candidaturas recentes.</p>
                          </div>
                          <button
                            onClick={() => { window.history.pushState(null, '', TAB_TO_HASH['candidates']); setActiveSubTab('candidates'); setViewingCandidateUid(null); }}
                            className="text-[10px] text-emerald-700 font-extrabold hover:underline cursor-pointer"
                          >
                            Ver todos →
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {summary.recruitment.recentByStatus.map((s, i) => {
                            const colorMap: Record<string, string> = {
                              'Novo': 'bg-blue-50 text-blue-800 border-blue-100',
                              'Em Análise': 'bg-amber-50 text-amber-800 border-amber-100',
                              'Aprovado': 'bg-emerald-50 text-emerald-800 border-emerald-100',
                              'Reprovado': 'bg-red-50 text-red-700 border-red-100',
                            };
                            const cls = colorMap[s.label] || 'bg-slate-50 text-slate-700 border-slate-100';
                            return (
                              <div key={i} className={`p-3 rounded-xl border ${cls} text-center`}>
                                <h4 className="text-lg font-black">{s.value}</h4>
                                <p className="text-[10px] font-bold mt-0.5">{s.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* SUBTAB 2: QUADRO DE ATIVIDADES */}
            {activeSubTab === 'suppliers' && (
              <div className="animate-fade-in">
                <ActivityBoard
                  user={user ? { id: user.id, name: user.name, role: user.role } : null}
                  token={token}
                  canEdit={canView('can_edit_activities') || currentUserRole === 'admin'}
                  permUsers={permUsers.map(u => ({ id: u.id, name: u.name, username: u.username }))}
                />
              </div>
            )}

            {/* SUBTAB 2b: OLD KANBAN PLACEHOLDER — KEPT FOR REFERENCE */}
            {false && (
              <div className="space-y-6 animate-fade-in">

                {/* Header + view toggle */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-150 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Quadro de Atividades Shigueno</h2>
                    <p className="text-xs text-slate-500">Fluxo Kanban integrado para planejar ações, compras, contratações gerais e finanças da corporação.</p>
                    {/* Board / History tabs */}
                    <div className="flex items-center space-x-1 mt-3">
                      <button
                        onClick={() => setActivityView('board')}
                        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${activityView === 'board' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Quadro Ativo
                      </button>
                      <button
                        onClick={() => setActivityView('history')}
                        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center space-x-1.5 ${activityView === 'history' ? 'bg-indigo-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Histórico Concluídos</span>
                        {completedActivities.length > 0 && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${activityView === 'history' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                            {completedActivities.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative min-w-[200px]">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        value={activitySearchQuery}
                        onChange={(e) => setActivitySearchQuery(e.target.value)}
                        placeholder="Buscar título ou responsável..."
                        className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold focus:outline-emerald-850 placeholder:text-slate-400/90"
                      />
                      {activitySearchQuery && (
                        <button type="button" onClick={() => setActivitySearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category filter */}
                    <select
                      value={activityCategoryFilter}
                      onChange={(e) => setActivityCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-emerald-850"
                    >
                      <option value="Todos">Categoria: Todos</option>
                      <option value="Compras">Compras</option>
                      <option value="Ações">Ações</option>
                      <option value="Contratações Gerais">Contratações Gerais</option>
                      <option value="Financeiro">Financeiro</option>
                    </select>

                    {/* Sector filter */}
                    <select
                      value={activitySectorFilter}
                      onChange={(e) => setActivitySectorFilter(e.target.value)}
                      className="bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-emerald-850"
                    >
                      <option value="Todos">Setor: Todos</option>
                      {activitySectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Date range */}
                    <div className="flex items-center space-x-1">
                      <input
                        type="date"
                        value={activityDateFrom}
                        onChange={(e) => setActivityDateFrom(e.target.value)}
                        title="Data de início"
                        className="bg-white border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-emerald-850 w-[130px]"
                      />
                      <span className="text-slate-400 text-[10px] font-bold">até</span>
                      <input
                        type="date"
                        value={activityDateTo}
                        onChange={(e) => setActivityDateTo(e.target.value)}
                        title="Data de fim"
                        className="bg-white border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-emerald-850 w-[130px]"
                      />
                      {(activityDateFrom || activityDateTo) && (
                        <button type="button" onClick={() => { setActivityDateFrom(''); setActivityDateTo(''); }} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" title="Limpar datas">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {activityView === 'board' && (
                      <button
                        onClick={() => { resetActivityForm(); setActivityFormOpen(true); }}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Atividade</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Activity CRUD Form Dialog */}
                {activityFormOpen && activityView === 'board' && (
                  <div className="bg-[#fafbfa] border border-emerald-355 rounded-3xl p-6 shadow-xs animate-slide-in">
                    <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-tight">
                      {selectedActivityId ? 'Editar Atividade' : 'Cadastrar Nova Atividade'}
                    </h3>

                    <form onSubmit={saveActivity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Título da Atividade *</label>
                        <input type="text" required value={actTitle} onChange={(e) => setActTitle(e.target.value)} placeholder="Ex: Contratação de tratorista para colheita..." className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Descrição Detalhada *</label>
                        <textarea required rows={3} value={actDescription} onChange={(e) => setActDescription(e.target.value)} placeholder="Detalhes sobre escopo, parceiros ou prazos envolvidos..." className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Categoria *</label>
                        <select value={actCategory} onChange={(e) => setActCategory(e.target.value)} className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-emerald-850">
                          <option value="Compras">Compras</option>
                          <option value="Ações">Ações</option>
                          <option value="Contratações Gerais">Contratações Gerais</option>
                          <option value="Financeiro">Financeiro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Setor / Área</label>
                        <input type="text" value={actSector} onChange={(e) => setActSector(e.target.value)} placeholder="Ex: Avicultura, Citricultura, Financeiro..." className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850" list="sector-suggestions" />
                        <datalist id="sector-suggestions">
                          {activitySectors.map(s => <option key={s} value={s} />)}
                          <option value="Avicultura" /><option value="Citricultura" /><option value="Cafeicultura" />
                          <option value="Pecuária Nelore" /><option value="Financeiro" /><option value="RH" />
                          <option value="TI" /><option value="Logística" /><option value="Administrativo" />
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status Kanban *</label>
                        <select value={actStatus} onChange={(e) => setActStatus(e.target.value)} className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-emerald-850">
                          {kanbanColumns.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Prioridade *</label>
                        <select value={actPriority} onChange={(e) => setActPriority(e.target.value)} className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-emerald-850">
                          <option value="Alta">Alta</option>
                          <option value="Média">Média</option>
                          <option value="Baixa">Baixa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Responsável *</label>
                        <input type="text" required value={actResponsible} onChange={(e) => setActResponsible(e.target.value)} placeholder="Ex: Gisela Shigueno" className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Prazo (Data Limite) *</label>
                        <input type="date" required value={actDueDate} onChange={(e) => setActDueDate(e.target.value)} className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850" />
                      </div>

                      <div className="md:col-span-2 flex items-end justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => { setActivityFormOpen(false); resetActivityForm(); }} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer">Salvar Atividade</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Kanban Columns — board view only */}
                {activityView === 'board' && (
                <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-6 pt-2 items-start scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-slate-100">
                  {kanbanColumns.map((columnStatus, columnIndex) => {
                    const filteredList = activities.filter((act) => {
                      const matchesStatus = act.status === columnStatus;
                      const matchesCategory = activityCategoryFilter === 'Todos' || act.category === activityCategoryFilter;
                      const matchesSector = activitySectorFilter === 'Todos' || act.sector === activitySectorFilter;
                      const searchStr = activitySearchQuery.trim().toLowerCase();
                      const matchesSearch = !searchStr ||
                        (act.title && act.title.toLowerCase().includes(searchStr)) ||
                        (act.responsible && act.responsible.toLowerCase().includes(searchStr));
                      const matchesDateFrom = !activityDateFrom || (act.due_date && act.due_date >= activityDateFrom);
                      const matchesDateTo = !activityDateTo || (act.due_date && act.due_date <= activityDateTo);
                      return matchesStatus && matchesCategory && matchesSector && matchesSearch && matchesDateFrom && matchesDateTo;
                    });

                    const isOver = draggedOverColumn === columnStatus;

                    return (
                      <div
                        key={columnStatus}
                        onDragOver={(e) => handleDragOver(e, columnStatus)}
                        onDragLeave={() => setDraggedOverColumn(null)}
                        onDrop={(e) => handleDrop(e, columnStatus)}
                        className={`w-full md:w-80 shrink-0 border rounded-2xl p-4 flex flex-col min-h-[550px] transition-all duration-200 ${
                          isOver 
                            ? 'bg-emerald-50/50 border-emerald-400 shadow-md ring-2 ring-emerald-400/20' 
                            : 'bg-[#fafafa] border-slate-200/60 shadow-xs'
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
                          {renamingColumn === columnStatus ? (
                            <div className="flex items-center space-x-1 w-full animate-scale-in">
                              <input
                                type="text"
                                value={renamingColumnValue}
                                onChange={(e) => setRenamingColumnValue(e.target.value)}
                                className="w-full bg-white border border-emerald-350 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-emerald-800"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveColumnRename(columnStatus);
                                  if (e.key === 'Escape') setRenamingColumn(null);
                                }}
                              />
                              <button
                                onClick={() => handleSaveColumnRename(columnStatus)}
                                className="p-1 px-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-2xs font-extrabold cursor-pointer"
                                title="Salvar"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setRenamingColumn(null)}
                                className="p-1 px-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-2xs font-extrabold cursor-pointer"
                                title="Cancelar"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full group/header">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  columnIndex === 0 ? 'bg-amber-500' :
                                  columnIndex === 1 ? 'bg-indigo-600' :
                                  columnIndex === 2 ? 'bg-emerald-600' :
                                  'bg-purple-600'
                                }`} />
                                <h3 className="font-sans font-black text-[#1e293b] text-xs sm:text-sm uppercase tracking-tight truncate max-w-[155px]">
                                  {columnStatus}
                                </h3>
                              </div>
                              
                              <div className="flex items-center space-x-1.5 ml-2 shrink-0">
                                <span className="bg-slate-200/80 text-[#0f172a] text-[10px] font-black px-2 py-0.5 rounded-full">
                                  {filteredList.length}
                                </span>
                                
                                {/* Edit and Delete column operations inside of header */}
                                <button
                                  onClick={() => {
                                    setRenamingColumn(columnStatus);
                                    setRenamingColumnValue(columnStatus);
                                  }}
                                  className="text-slate-400 hover:text-emerald-800 opacity-0 group-hover/header:opacity-100 p-0.5 hover:bg-slate-100 rounded transition-all cursor-pointer"
                                  title="Renomear coluna"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => setColumnToDelete(columnStatus)}
                                  className="text-slate-400 hover:text-rose-600 opacity-0 group-hover/header:opacity-100 p-0.5 hover:bg-slate-100 rounded transition-all cursor-pointer"
                                  title="Excluir coluna"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Column Cards List */}
                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-0.5 scrollbar-thin">
                          {filteredList.length > 0 ? (
                            filteredList.map((act) => {
                              const isDragging = draggedCardId === act.id;
                              return (
                                <div
                                  key={act.id}
                                  draggable={true}
                                  onDragStart={(e) => handleDragStart(e, act.id)}
                                  onDragEnd={() => {
                                    setDraggedCardId(null);
                                    setDraggedOverColumn(null);
                                  }}
                                  className={`bg-white border hover:border-emerald-250/70 rounded-xl p-4 space-y-3 shadow-[0_3px_10px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_24px_rgba(4,120,87,0.06)] border-slate-100 cursor-grab active:cursor-grabbing transition-all duration-300 relative overflow-hidden group ${
                                    isDragging ? 'opacity-30 border-dashed border-emerald-400 scale-95' : 'opacity-100 scale-100'
                                  }`}
                                >
                                  {/* Category vertical indicator flag */}
                                  <div className={`absolute top-0 left-0 w-1 h-full ${
                                    act.category === 'Compras' ? 'bg-sky-500' :
                                    act.category === 'Ações' ? 'bg-purple-500' :
                                    act.category === 'Contratações Gerais' ? 'bg-teal-500' :
                                    'bg-emerald-500'
                                  }`} />

                                  <div className="flex items-start justify-between gap-2.5 pl-1.5">
                                    <div className="flex items-center space-x-2">
                                      {/* Drag indicator handle */}
                                      <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-450 shrink-0 cursor-grab" />
                                      <h4 className="font-extrabold text-[#0f172a] text-xs sm:text-sm tracking-tight leading-snug">{act.title}</h4>
                                    </div>
                                    <span className={`shrink-0 inline-block px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${
                                      act.priority === 'Alta' ? 'bg-red-50 text-red-750 border border-red-100' :
                                      act.priority === 'Média' ? 'bg-amber-50 text-amber-750 border border-amber-100' :
                                      'bg-[#f1f5f9] text-slate-700 border border-slate-200'
                                    }`}>
                                      {act.priority}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-[#475569] leading-relaxed font-sans pl-1.5 flex-1">
                                    {act.description}
                                  </p>

                                  <div className="flex flex-wrap gap-1.5 pl-1.5">
                                    <span className="bg-slate-100 text-[#334155] text-[9px] font-bold px-2 py-0.5 rounded-md font-sans">
                                      📁 {act.category}
                                    </span>
                                    {act.sector && (
                                      <span className="bg-violet-50 text-violet-800 text-[9px] font-bold px-2 py-0.5 rounded-md font-sans border border-violet-100">
                                        🏢 {act.sector}
                                      </span>
                                    )}
                                    {act.responsible && (
                                      <span className="bg-emerald-50/70 text-emerald-900 text-[9px] font-bold px-2 py-0.5 rounded-md font-sans">
                                        👤 {act.responsible}
                                      </span>
                                    )}
                                    {act.due_date && (
                                      <span className="bg-amber-50/40 text-amber-900 font-mono text-[8px] font-extrabold px-2 py-0.5 rounded-md border border-amber-105">
                                        ⏱️ {act.due_date}
                                      </span>
                                    )}
                                  </div>

                                  {/* Card bottom actions */}
                                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1.5 pl-1.5 gap-2">
                                    <div className="flex items-center space-x-1.5">
                                      <button onClick={() => openEditActivity(act)} className="p-1 px-2 text-slate-550 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50/50 rounded-lg text-[10px] font-extrabold transition-all border border-slate-200/60 cursor-pointer">Editar</button>
                                      <button onClick={() => deleteActivity(act)} className="p-1 px-2 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg text-[10px] font-extrabold transition-all border border-rose-100 cursor-pointer">Excluir</button>
                                      <button onClick={() => markActivityDone(act)} title="Marcar como concluída e mover ao histórico" className="p-1 px-2 text-emerald-700 hover:text-white hover:bg-emerald-700 rounded-lg text-[10px] font-extrabold transition-all border border-emerald-200 cursor-pointer flex items-center space-x-0.5">
                                        <CheckCircle className="w-3 h-3" /><span>Concluir</span>
                                      </button>
                                    </div>

                                    {/* Quick shift controllers */}
                                    <div className="flex items-center space-x-1 font-mono text-xs text-slate-400">
                                      {columnIndex > 0 && (
                                        <button title="Mover para esquerda" onClick={async () => {
                                          const prevStatus = kanbanColumns[columnIndex - 1];
                                          setActivities(prev => prev.map(a => a.id === act.id ? { ...a, status: prevStatus } : a));
                                          await authFetch(`/api/activities/${act.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...act, sector: act.sector || '', status: prevStatus }) });
                                          fetchInitialData();
                                        }} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[9px] text-slate-700 font-bold transition-all cursor-pointer">◀</button>
                                      )}
                                      {columnIndex < kanbanColumns.length - 1 && (
                                        <button title="Mover para direita" onClick={async () => {
                                          const nextStatus = kanbanColumns[columnIndex + 1];
                                          setActivities(prev => prev.map(a => a.id === act.id ? { ...a, status: nextStatus } : a));
                                          await authFetch(`/api/activities/${act.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...act, sector: act.sector || '', status: nextStatus }) });
                                          fetchInitialData();
                                        }} className="p-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-[9px] text-emerald-800 font-bold transition-all cursor-pointer">▶</button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-12 text-center text-slate-400 text-[11px] italic bg-white/40 border border-dashed border-slate-200 rounded-xl font-sans font-medium">
                              Nenhuma atividade nesta etapa
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Column Button Card */}
                  <div className="w-full md:w-80 shrink-0 select-none">
                    {isAddingColumn ? (
                      <div className="bg-slate-50 border border-slate-350 border-dashed rounded-2xl p-4 space-y-3 animate-scale-in">
                        <label className="block text-[10px] font-bold text-[#1e293b] uppercase mb-1">Nova Coluna/Etapa</label>
                        <input
                          type="text"
                          placeholder="Ex: Novos Contratos..."
                          value={newColumnName}
                          onChange={(e) => setNewColumnName(e.target.value)}
                          className="w-full bg-white border border-slate-250 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-emerald-850"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddColumn();
                            if (e.key === 'Escape') setIsAddingColumn(false);
                          }}
                        />
                        <div className="flex justify-end space-x-1.5 pt-1">
                          <button
                            onClick={() => setIsAddingColumn(false)}
                            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl text-2xs font-extrabold cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleAddColumn}
                            className="px-3.5 py-1.5 text-white bg-emerald-800 hover:bg-emerald-950 rounded-xl text-2xs font-extrabold shadow-sm cursor-pointer"
                          >
                            Criar Coluna
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNewColumnName('');
                          setIsAddingColumn(true);
                        }}
                        className="w-full h-28 border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-emerald-850 transition-all font-sans cursor-pointer group"
                      >
                        <PlusCircle className="w-6 h-6 mb-1.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                        <span className="text-2xs font-black uppercase tracking-wider text-slate-550 group-hover:text-emerald-900">Adicionar Coluna</span>
                      </button>
                    )}
                  </div>
                </div>
                )}

                {/* --- HISTÓRICO DE CONCLUÍDOS --- */}
                {activityView === 'history' && (
                  <div className="space-y-4 animate-fade-in">
                    {completedActivities.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 text-sm italic bg-white border border-dashed border-slate-200 rounded-2xl font-sans">
                        Nenhuma atividade concluída ainda. Complete atividades no quadro ativo para vê-las aqui.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {completedActivities
                          .filter(act => {
                            const matchesCategory = activityCategoryFilter === 'Todos' || act.category === activityCategoryFilter;
                            const matchesSector = activitySectorFilter === 'Todos' || act.sector === activitySectorFilter;
                            const searchStr = activitySearchQuery.trim().toLowerCase();
                            const matchesSearch = !searchStr || (act.title && act.title.toLowerCase().includes(searchStr)) || (act.responsible && act.responsible.toLowerCase().includes(searchStr));
                            const matchesDateFrom = !activityDateFrom || (act.completed_at && act.completed_at.slice(0,10) >= activityDateFrom);
                            const matchesDateTo = !activityDateTo || (act.completed_at && act.completed_at.slice(0,10) <= activityDateTo);
                            return matchesCategory && matchesSector && matchesSearch && matchesDateFrom && matchesDateTo;
                          })
                          .map((act) => (
                            <div key={act.id} className="bg-white border border-slate-200/60 rounded-2xl p-4 space-y-3 shadow-xs relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-1 h-full ${act.category === 'Compras' ? 'bg-sky-500' : act.category === 'Ações' ? 'bg-purple-500' : act.category === 'Contratações Gerais' ? 'bg-teal-500' : 'bg-emerald-500'}`} />
                              <div className="flex items-start justify-between gap-2 pl-1.5">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <h4 className="font-extrabold text-slate-700 text-xs tracking-tight line-through decoration-slate-400">{act.title}</h4>
                                </div>
                                <span className="shrink-0 bg-emerald-50 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded-md border border-emerald-200 uppercase">Concluída</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed pl-1.5 line-clamp-2">{act.description}</p>
                              <div className="flex flex-wrap gap-1.5 pl-1.5">
                                <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md">📁 {act.category}</span>
                                {act.sector && <span className="bg-violet-50 text-violet-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-violet-100">🏢 {act.sector}</span>}
                                {act.responsible && <span className="bg-emerald-50 text-emerald-900 text-[9px] font-bold px-2 py-0.5 rounded-md">👤 {act.responsible}</span>}
                                {act.completed_at && <span className="bg-indigo-50 text-indigo-800 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md border border-indigo-100">✅ {act.completed_at.slice(0,10)}</span>}
                              </div>
                              <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between pl-1.5">
                                <button onClick={() => restoreActivity(act)} className="p-1 px-2 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg text-[10px] font-extrabold transition-all border border-indigo-200 cursor-pointer flex items-center space-x-1">
                                  <RefreshCw className="w-3 h-3" /><span>Restaurar ao Quadro</span>
                                </button>
                                <button onClick={() => deleteActivity(act)} className="p-1 px-2 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg text-[10px] font-extrabold transition-all border border-rose-100 cursor-pointer">Excluir</button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                )}

                {/* --- MODERN KANBAN CONFIRMATION MODALS --- */}
                
                {/* Deletion of Card Modal overlay */}
                {activityToDelete && (
                  <Portal><div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-sm w-full animate-scale-in">
                      <div className="flex items-center space-x-3 text-rose-600 mb-4">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="font-sans font-black text-slate-905 text-sm uppercase tracking-tight">Excluir Atividade</h3>
                      </div>
                      
                      <p className="text-xs text-slate-600 space-y-1 mb-6 leading-relaxed">
                        <span>Você está prestes a excluir permanentemente a atividade:</span>
                        <strong className="block text-slate-850 mt-1 font-bold text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          {activityToDelete.title}
                        </strong>
                        <span className="block text-[10px] text-rose-500 mt-2 font-mono font-medium uppercase tracking-wider">▲ Esta ação é definitiva e não poderá ser desfeita.</span>
                      </p>
                      
                      <div className="flex justify-end space-x-2.5">
                        <button
                          onClick={() => setActivityToDelete(null)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-2xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirmDeleteActivity}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-2xs px-4  py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
                        >
                          Confirmar Exclusão
                        </button>
                      </div>
                    </div>
                  </div></Portal>
                )}

                {/* Deletion of Column Modal overlay */}
                {columnToDelete && (
                  <Portal><div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-sm w-full animate-scale-in">
                      <div className="flex items-center space-x-3 text-rose-600 mb-4">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="font-sans font-black text-slate-905 text-sm uppercase tracking-tight">Excluir Coluna do Kanban</h3>
                      </div>
                      
                      <p className="text-xs text-slate-600 space-y-2 mb-6 leading-relaxed">
                        <span>Deseja realmente remover a coluna <strong>{columnToDelete}</strong> do quadro?</span>
                        <span className="block text-[10px] text-slate-500 italic">
                          O fluxo de atividades continuará íntegro. Todos os cartões associados a ela serão recategorizados para a coluna inicial (<strong>{kanbanColumns[0]}</strong>).
                        </span>
                      </p>
                      
                      <div className="flex justify-end space-x-2.5">
                        <button
                          onClick={() => setColumnToDelete(null)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-2xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Não, Cancelar
                        </button>
                        <button
                          onClick={confirmDeleteColumn}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-2xs px-4 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
                        >
                          Sim, Excluir Coluna
                        </button>
                      </div>
                    </div>
                  </div></Portal>
                )}

              </div>
            )}

            {/* Modal de confirmação de exclusão de vaga */}
            {vacancyToDelete && (
              <Portal>
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
                  <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-sm w-full animate-scale-in">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-rose-600" />
                      </div>
                      <h3 className="font-sans font-black text-slate-900 text-sm uppercase tracking-tight">Excluir Vaga</h3>
                    </div>
                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                      Você está prestes a excluir permanentemente a vaga:
                    </p>
                    <strong className="block text-slate-850 mb-2 font-bold text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      {vacancyToDelete.title}
                    </strong>
                    <p className="text-[10px] text-slate-500 mb-1">Departamento: <span className="font-semibold">{vacancyToDelete.department}</span></p>
                    <p className="text-[10px] text-slate-500 mb-4">Candidaturas vinculadas terão esta vaga desvinculada.</p>
                    <span className="block text-[10px] text-rose-500 mb-5 font-mono font-medium uppercase tracking-wider">▲ Esta ação é definitiva e não poderá ser desfeita.</span>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setVacancyToDelete(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-2xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmDeleteVacancy}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-2xs px-4 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
                      >
                        Sim, Excluir Vaga
                      </button>
                    </div>
                  </div>
                </div>
              </Portal>
            )}

            {/* SUBTAB: USUÁRIOS & PERMISSÕES */}
            {activeSubTab === 'permissions' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-5">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Usuários & Controle de Acesso</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Gerencie quem pode acessar cada seção do painel. Defina visibilidade e permissões por usuário.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-black text-slate-700">{permUsers.length} {permUsers.length === 1 ? 'usuário' : 'usuários'}</span>
                    </div>
                  </div>
                </div>

                {/* Users list */}
                <div className="space-y-4">
                  {permUsers.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic text-sm bg-white border border-dashed border-slate-200 rounded-2xl">
                      <Users className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                      Nenhum usuário cadastrado ainda.
                    </div>
                  ) : (
                    permUsers.map((u) => {
                      const p = u.permissions || {
                        can_view_reports: 1, can_view_activities: 1, can_view_tracking: 0,
                        can_view_blog: 0, can_view_vacancies: 1, can_view_candidates: 0,
                        can_view_settings: 0, can_edit_activities: 0, can_edit_vacancies: 0,
                        can_edit_candidates: 0, can_edit_blog: 0, can_edit_tracking: 0, can_edit_settings: 0
                      };
                      const isAdmin = u.role === 'admin';
                      const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG['operador'];
                      const initials = u.name.trim().split(' ').filter(Boolean).map((w: string) => w[0].toUpperCase()).slice(0, 2).join('');
                      const activePerms = MENU_PERMS.filter(({ key }) => p[key]).length;
                      return (
                        <div key={u.id} className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all ${isAdmin ? 'border-amber-200' : 'border-slate-200/80'}`}>
                          {/* User header */}
                          <div className={`flex items-center justify-between px-5 py-4 ${isAdmin ? 'bg-gradient-to-r from-amber-50 to-white' : 'bg-gradient-to-r from-slate-50 to-white'}`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0 ${isAdmin ? 'bg-amber-500' : u.role === 'gestor' ? 'bg-indigo-600' : 'bg-emerald-700'}`}>
                                {initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-extrabold text-slate-900">{u.name}</p>
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConf.color} ${roleConf.bg} ${roleConf.border}`}>
                                    {roleConf.icon}
                                    {roleConf.label}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">@{u.username}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {!isAdmin && (
                                <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span className="text-[10px] font-bold text-slate-600">{activePerms}/{MENU_PERMS.length} módulos</span>
                                </div>
                              )}
                              {isAdmin && (
                                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-xl border border-amber-200">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Acesso Total
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Permissions */}
                          {!isAdmin && (
                            <div className="px-5 pb-5 pt-4 border-t border-slate-100">
                              <PermissionEditor
                                userId={u.id}
                                initialPerms={p}
                                saving={permSaving === u.id}
                                onSave={(perms) => savePermissions(u.id, perms)}
                              />
                            </div>
                          )}

                          {/* Admin full access note */}
                          {isAdmin && (
                            <div className="px-5 pb-4 pt-3 border-t border-amber-100 bg-amber-50/30">
                              <p className="text-[10px] text-amber-700 font-semibold">
                                Administradores têm acesso irrestrito a todas as seções, módulos e configurações do painel.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add new user form */}
                <AddUserForm authFetch={authFetch} onCreated={fetchInitialData} showSuccess={showSuccess} />
              </div>
            )}

            {/* ── VAGAS ─────────────────────────────────────────────────────── */}
            {activeSubTab === 'vacancies' && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Gerenciador de Vagas de Recrutamento</h2>
                    <p className="text-xs text-slate-500">Crie, altere e publique novas demandas do site unificado "Trabalhe Conosco".</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      resetVacancyForm();
                      setVacancyFormOpen(true);
                    }}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Nova Vaga</span>
                  </button>
                </div>

                {vacancyFormOpen && (
                  <div className="bg-[#fafbfa] border border-emerald-350 rounded-3xl p-6 shadow-xs animate-slide-in">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
                      <h3 className="font-extrabold text-emerald-950 text-sm">
                        {selectedVacancyId ? '✏ Editar Vaga' : '➕ Cadastrar Nova Vaga'}
                      </h3>
                      <button 
                        onClick={() => {
                          setVacancyFormOpen(false);
                          resetVacancyForm();
                        }}
                        className="text-xs text-slate-400 hover:text-slate-655 font-bold"
                      >
                        Cancelar [X]
                      </button>
                    </div>

                    <form onSubmit={saveVacancy} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Título do Cargo *</label>
                          <input
                            type="text"
                            required
                            value={vacTitle}
                            onChange={(e) => setVacTitle(e.target.value)}
                            placeholder="Ex: Tratorista Agrícola especializado"
                            className="w-full bg-white border border-slate-250 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Setor / Departamento *</label>
                          <input
                            type="text"
                            required
                            value={vacDept}
                            onChange={(e) => setVacDept(e.target.value)}
                            placeholder="Ex: Citricultura, Avicultura"
                            className="w-full bg-white border border-slate-250 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Localização *</label>
                          <input
                            type="text"
                            required
                            value={vacLoc}
                            onChange={(e) => setVacLoc(e.target.value)}
                            placeholder="Ex: Tatuí - SP"
                            className="w-full bg-white border border-slate-250 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Descrição das Atribuições *</label>
                        <textarea
                          rows={3}
                          required
                          value={vacDesc}
                          onChange={(e) => setVacDesc(e.target.value)}
                          placeholder="Responsabilidades do empregado diárias, cuidados rurais..."
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-emerald-850 font-sans leading-relaxed"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Requisitos Técnicos / Cursos *</label>
                        <textarea
                          rows={2}
                          required
                          value={vacReq}
                          onChange={(e) => setVacReq(e.target.value)}
                          placeholder="Ex: Disponibilidade para residir em Tatuí. Conhecimento de adubação."
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-emerald-850 font-sans leading-relaxed"
                        ></textarea>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status Interno</label>
                          <select
                            value={vacStatus}
                            onChange={(e) => setVacStatus(e.target.value)}
                            className="bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-emerald-850"
                          >
                            <option value="Ativa">Ativa (Visível para candidatos)</option>
                            <option value="Pausada">Pausada (Oculta no site)</option>
                          </select>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVacancyFormOpen(false);
                              resetVacancyForm();
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-colors"
                          >
                            Publicar Vaga
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Grid de Vagas — cards responsivos aprimorados */}
                {vacancies.length === 0 ? (
                  <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">Nenhuma vaga cadastrada ainda.</p>
                    <p className="text-xs text-slate-400 mt-1">Clique em "Cadastrar Nova Vaga" para começar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {vacancies.map((v) => {
                      const candidateCount = candidates.filter(c => String(c.vacancy_id) === String(v.id)).length;
                      return (
                        <div
                          key={v.id}
                          className="bg-white rounded-2xl border border-slate-100 hover:border-emerald-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(4,120,87,0.08)] transition-all duration-300 flex flex-col overflow-hidden"
                        >
                          {/* Card top accent bar */}
                          <div className={`h-1 w-full ${v.status === 'Ativa' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-slate-200'}`} />

                          <div className="p-5 flex flex-col flex-1 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-mono mb-1.5">
                                  {v.department}
                                </span>
                                <h3 className="text-sm font-extrabold text-slate-900 leading-snug truncate">{v.title}</h3>
                              </div>
                              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                v.status === 'Ativa'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${v.status === 'Ativa' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                {v.status}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 text-xs text-slate-600">
                              <div className="flex items-center space-x-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold">{v.location}</span>
                              </div>
                              <p className="text-slate-500 line-clamp-2 leading-relaxed">{v.description}</p>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-3 pt-1">
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                <Users className="w-3 h-3" />
                                <span>{candidateCount} candidato{candidateCount !== 1 ? 's' : ''}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">#{v.id}</span>
                            </div>

                            {/* Actions */}
                            <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() => { setSelectedVacancyForPoster(v); setIsPosterModalOpen(true); }}
                                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] rounded-lg hover:bg-emerald-800 hover:text-white transition-all"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Cartaz A4</span>
                              </button>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => openEditVacancy(v)}
                                  className="p-1.5 px-3 border border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => deleteVacancy(v)}
                                  className="p-1.5 px-2.5 border border-rose-100 text-rose-600 font-bold text-[10px] rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ── CANDIDATOS ────────────────────────────────────────────────── */}
            {activeSubTab === 'candidates' && (
              <CandidatesTab
                token={token}
                vacancies={vacancies}
                userName={currentUserName}
                canEdit={canView('can_edit_candidates') || currentUserRole === 'admin'}
                onOpenPage={(uid) => setViewingCandidateUid(uid)}
              />
            )}
            {false && (() => {
              const totalCandidates = candidates.length;
              const candidatesWithAi = candidates.filter(c => getAiData(c) !== null).length;
              const pendingCandidates = candidates.filter(c => c.status === 'Novo').length;
              const averageAiScore = (() => {
                const evaluated = candidates.map(c => getAiData(c)).filter(Boolean);
                if (evaluated.length === 0) return 0;
                const sum = evaluated.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
                return Math.round(sum / evaluated.length);
              })();

              return (
                <div className="space-y-6 animate-in fade-in duration-300 w-full text-left font-sans" id="recruitment-ats-dashboard">
                  {/* METRICS GRID FOR RECRUITMENT */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="recruitment-stats-grid">
                    <div className="bg-slate-50 rounded-2xl p-4 transition-all flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">Total Inscritos</p>
                        <h4 className="text-lg font-black text-slate-900">{totalCandidates}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 transition-all flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-700 shrink-0">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">Triados por IA</p>
                        <h4 className="text-lg font-black text-slate-900">{candidatesWithAi}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 transition-all flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-amber-50 rounded-xl text-amber-650 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">Aguardando IA</p>
                        <h4 className="text-lg font-black text-slate-900">{pendingCandidates}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 transition-all flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-emerald-950 rounded-xl text-emerald-400 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">Aderência Média</p>
                        <h4 className="text-lg font-black text-slate-900">{averageAiScore}%</h4>
                      </div>
                    </div>
                  </div>

                  {/* ADVANCED RECRUITMENT FILTER PANEL */}
                  <div className="bg-white rounded-2xl p-4.5 flex flex-col xl:flex-row items-center gap-3 justify-between">
                    <div className="relative w-full xl:max-w-md">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={candidateSearchQuery}
                        onChange={(e) => setCandidateSearchQuery(e.target.value)}
                        placeholder="Pesquisar por nome, contato, vaga ou currículo..."
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-800 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 transition-all outline-none"
                      />
                      {candidateSearchQuery && (
                        <button 
                          type="button" 
                          onClick={() => setCandidateSearchQuery('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 font-bold text-slate-450 hover:text-red-500 text-[10px]"
                        >
                          ✕ Limpar
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-end">
                      {/* Filter by Vaga */}
                      <select
                        value={candidateVacancyFilter}
                        onChange={(e) => setCandidateVacancyFilter(e.target.value)}
                        className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-800 border-0"
                      >
                        <option value="Todos">Todas as Vagas</option>
                        {vacancies.map(v => (
                          <option key={v.id} value={v.id}>{v.title}</option>
                        ))}
                        <option value="null">Espontâneas / Banco</option>
                      </select>

                      {/* Filter by Status */}
                      <select
                        value={candidateStatusFilter}
                        onChange={(e) => setCandidateStatusFilter(e.target.value)}
                        className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-800 border-0"
                      >
                        <option value="Todos">Filtrar Status</option>
                        <option value="Novo">Novo</option>
                        <option value="Em Análise">Em Análise</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Recusado">Recusado</option>
                      </select>

                      {/* Action: Registrar Candidato Manual */}
                      <button
                        type="button"
                        onClick={() => setManualCandidateModalOpen(true)}
                        className="px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs border-0 shrink-0"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Incluir Manual</span>
                      </button>
                    </div>
                  </div>

                  {/* MASTER-DETAIL SPLIT GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* List of candidates column */}
                    <div className={`${viewingCandidate ? 'hidden lg:block lg:col-span-6' : 'lg:col-span-12'} space-y-3.5 text-left`}>
                      <div className="flex items-center justify-between pb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                          Currículos Registrados: {filteredCandidates.length}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((cand) => {
                            const candAi = getAiData(cand);
                            const isSelected = viewingCandidate?.id === cand.id;

                            return (
                              <div
                                key={cand.id}
                                id={`candidate-row-${cand.id}`}
                                onClick={() => setViewingCandidate(cand)}
                                className={`p-5 rounded-2xl text-left cursor-pointer transition-all duration-300 select-none ${
                                  isSelected
                                    ? 'bg-emerald-100/30'
                                    : 'bg-white hover:bg-slate-50'
                                }`}
                              >
                                {/* Top Badge Line / Border-less clean interface with soft spacing as requested */}
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{cand.name}</h4>
                                    <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                                      🎯 {cand.vacancy_title || 'Candidatura Espontânea / Geral'}
                                    </p>
                                  </div>

                                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider ${
                                      cand.status === 'Novo' ? 'bg-blue-105 text-blue-800' :
                                      cand.status === 'Em Análise' ? 'bg-amber-100 text-amber-850' :
                                      cand.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
                                      'bg-slate-100 text-slate-500'
                                    }`}>
                                      {cand.status}
                                    </span>

                                    {candAi ? (
                                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded text-[9px] font-black">
                                        <Sparkles className="w-2.5 h-2.5 text-indigo-700" />
                                        <span>Compatibilidade: {candAi.score}%</span>
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-semibold text-slate-400 italic">Análise IA Pendente</span>
                                    )}
                                  </div>
                                </div>

                                {/* Summary contacts info */}
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-400 font-mono">
                                  <span className="truncate">📧 {cand.email}</span>
                                  <span className="truncate">📞 {cand.phone}</span>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                  <span>📅 Submetido em: {cand.applied_at}</span>
                                  <span className="text-emerald-850 font-black flex items-center">
                                    Ver Ficha Seletiva
                                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-16 bg-white text-center rounded-2xl text-xs italic text-slate-400 font-medium">
                            Nenhum currículo encontrado sob as condições.
                          </div>
                        )}
                      </div>
                    </div>

                {/* Candidate detailed view Column */}
                {viewingCandidate && (
                  <div className="lg:col-span-6 bg-[#fafbfa] border-0 rounded-3xl p-6.5 space-y-6.5 animate-slide-in relative select-none" id="candidate-detail-spot">
                    {/* Voltar para Lista no Mobile */}
                    <button
                      type="button"
                      onClick={() => setViewingCandidate(null)}
                      className="lg:hidden w-full flex items-center justify-center space-x-1.5 py-3 border border-slate-200 bg-white hover:bg-slate-55 active:bg-slate-100 rounded-xl text-slate-650 font-bold text-xs transition-colors shadow-2xs cursor-pointer mb-2"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180 text-emerald-800" />
                      <span>Voltar para Lista de Currículos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewingCandidate(null)}
                      className="hidden lg:block absolute top-5 right-5 text-xs font-black text-slate-400 hover:text-red-500 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      FECHAR [X]
                    </button>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-amber-700 uppercase font-mono tracking-wider">Ficha Seletiva de RH</span>
                      <h3 className="text-xl font-black text-slate-950 font-sans tracking-tight">{viewingCandidate.name}</h3>
                      <p className="text-xs text-slate-500 font-semibold font-mono">📅 Recebido via portal em {viewingCandidate.applied_at}</p>
                    </div>

                    {/* ADVANCED RECRUITMENT PIPELINE BAR */}
                    <div className="bg-slate-50 p-4.5 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Etapa Atual do Fluxo seletivo (Pipeline interativo)</p>
                      <div className="flex items-center justify-between relative pl-1.5 pr-1.5">
                        {/* Connecting track line */}
                        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-slate-200 z-0"></div>
                        
                        {/* Interactive status steps */}
                        {[
                          { key: 'Novo', label: 'Novo', icon: '📩' },
                          { key: 'Em Análise', label: 'Em Análise', icon: '🔍' },
                          { key: 'Aprovado', label: 'Contratar', icon: '🟢' },
                          { key: 'Recusado', label: 'Reprovado', icon: '✕' }
                        ].map((step) => {
                          const isCurrent = viewingCandidate.status === step.key;
                          let isCompleted = false;
                          if (viewingCandidate.status === 'Aprovado' && step.key !== 'Recusado') isCompleted = true;
                          if (viewingCandidate.status === 'Em Análise' && step.key === 'Novo') isCompleted = true;
                          if (isCurrent) isCompleted = true;

                          const nodeClass = isCurrent
                            ? 'bg-emerald-800 text-white border-2 border-emerald-950 ring-4 ring-emerald-100/70 scale-105 z-10 font-bold'
                            : isCompleted
                              ? 'bg-emerald-600 text-white z-10'
                              : 'bg-white text-slate-400 border border-slate-200 z-10';

                          return (
                            <button
                              key={step.key}
                              type="button"
                              onClick={() => updateCandidateStatus(viewingCandidate.id, step.key)}
                              className="flex flex-col items-center focus:outline-none cursor-pointer group select-none relative border-0 bg-transparent"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${nodeClass}`}>
                                {step.icon}
                              </div>
                              <span className={`text-[8px] font-black mt-1.5 transition-all tracking-tight ${isCurrent ? 'text-emerald-900 font-extrabold' : 'text-slate-400'}`}>
                                {step.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Applicant details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4.5 rounded-2xl">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Endereço de E-mail</p>
                        <a href={`mailto:${viewingCandidate.email}`} className="font-bold text-emerald-800 hover:underline break-all mt-0.5 block font-mono">
                          {viewingCandidate.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Celular WhatsApp</p>
                        <a href={`tel:${viewingCandidate.phone}`} className="font-bold text-slate-800 hover:underline mt-0.5 block font-mono">
                          {viewingCandidate.phone}
                        </a>
                      </div>
                      <div className="sm:col-span-2 border-t border-slate-100 pt-2.5 mt-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Vaga Alvo do Candidato</p>
                        <p className="font-bold text-slate-900 mt-0.5">{viewingCandidate.vacancy_title || 'Envio Espontâneo / Banco de Talentos Geral'}</p>
                      </div>
                    </div>

                     {/* PERSISTED RECRUITER OPINION DIARY */}
                     <div className="bg-amber-50/20 border border-amber-200/40 rounded-2xl p-4.5 space-y-3">
                       <div className="flex items-center justify-between">
                         <h5 className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center">
                           <span>📝 Parecer & Diário de Entrevista</span>
                         </h5>
                         
                         <button
                           type="button"
                           onClick={handleSaveNotes}
                           className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0"
                         >
                           Gravar Notas
                         </button>
                       </div>
                       
                       <textarea
                         value={recruiterNotes}
                         onChange={(e) => setRecruiterNotes(e.target.value)}
                         placeholder="Adicione observações da conversa telefônica... Ex: agendou teste prático de campo."
                         className="w-full bg-white border border-amber-100 rounded-xl p-3 text-xs font-normal text-slate-800 outline-none focus:border-amber-500 h-18 placeholder-slate-400 resize-none leading-relaxed font-sans"
                       />
                     </div>

                    {/* Parsing text CV content */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-700 uppercase">Resumo da Experiência / Texto do Currículo:</p>
                        {viewingCandidate.cv_filename && (
                          <a
                            href={`/api/candidates/${viewingCandidate.id}/cv`}
                            download={viewingCandidate.cv_filename}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                            Baixar CV Anexado
                          </a>
                        )}
                      </div>
                      <div className="bg-white border-0 rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-650 h-40 overflow-y-auto">
                        {viewingCandidate.cv_text || (viewingCandidate.cv_filename ? `Arquivo anexado: ${viewingCandidate.cv_filename}` : '—')}
                      </div>
                    </div>

                    {/* SEÇÃO ANALISE INTELIGENTE IA (GEMINI) */}
                    <div className="bg-emerald-50/20 border-0 rounded-2xl p-6.5 space-y-5 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-100/50 pb-4">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-650"></span>
                          </span>
                          <span className="text-[11px] font-black uppercase text-emerald-850 tracking-wider">Módulo Integrado Gemini IA | Grupo Shigueno</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => runAiEvaluation(viewingCandidate.id)}
                          disabled={evaluatingId === viewingCandidate.id}
                          className="px-3.5 py-1.5 bg-emerald-800 text-white hover:bg-emerald-950 disabled:bg-slate-205 disabled:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 shrink-0 inline-flex items-center space-x-1.5"
                        >
                          {evaluatingId === viewingCandidate.id ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-slate-100 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Triando...</span>
                            </>
                          ) : (
                            <>
                              <span>✨ Rodar IA do Grupo Shigueno</span>
                            </>
                          )}
                        </button>
                      </div>

                      {(() => {
                        const aiData = getAiData(viewingCandidate);
                        if (!aiData) {
                          return (
                            <div className="py-2 space-y-1">
                              <p className="text-xs text-slate-650 font-bold">Esta ficha seletiva ainda não possui análise por IA no sistema.</p>
                              <p className="text-[10px] text-slate-450 leading-relaxed">Clique em <strong>"Rodar IA do Grupo Shigueno"</strong> para calibrar a aderência do candidato com a vaga agrícola selecionada ou outras vagas em aberto.</p>
                            </div>
                          );
                        }

                        // We have aiData! Let's render it styled wonderfully
                        return (
                          <div className="space-y-4">
                            {/* Score and Summary banner */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center bg-white p-4.5 rounded-2xl">
                              <div className="sm:col-span-3 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 min-h-[64px]">
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none animate-pulse">Aderência</span>
                                <span className="text-2xl font-black mt-1 text-emerald-800 leading-none">{aiData.score}%</span>
                              </div>
                              <div className="sm:col-span-9">
                                <p className="text-[9px] uppercase font-black text-emerald-800 mb-0.5">Diagnóstico Técnico</p>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{aiData.summary}</p>
                              </div>
                            </div>

                            {/* Strengths & Gaps */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Strengths */}
                              <div className="bg-white p-4 rounded-xl space-y-1.5 border-0">
                                <h5 className="text-[9px] font-black uppercase text-emerald-805 tracking-wider flex items-center">
                                  <span className="mr-1 text-xs">💪</span> Pontos Fortes
                                </h5>
                                <ul className="space-y-1 list-none pl-0 text-[10px] sm:text-xs">
                                  {aiData.strengths?.map((str: string, idx: number) => (
                                    <li key={idx} className="flex items-start text-slate-650 leading-relaxed font-sans text-left">
                                      <span className="text-emerald-600 mr-1.5 font-bold">•</span>
                                      <span>{str}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Gaps */}
                              <div className="bg-white p-4 rounded-xl space-y-1.5 border-0">
                                <h5 className="text-[9px] font-black uppercase text-amber-750 tracking-wider flex items-center">
                                  <span className="mr-1 text-xs">⚠️</span> Pontos de Atenção
                                </h5>
                                <ul className="space-y-1 list-none pl-0 text-[10px] sm:text-xs">
                                  {aiData.gaps?.map((gp: string, idx: number) => (
                                    <li key={idx} className="flex items-start text-slate-655 leading-relaxed font-sans text-left">
                                      <span className="text-amber-600 mr-1.5 font-bold">•</span>
                                      <span>{gp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Recommendations & matching spots */}
                            <div className="bg-white p-4.5 rounded-xl space-y-1.5 border-0">
                              <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider leading-none">Recomendação de Próximos Passos:</p>
                              <p className="text-xs text-slate-800 font-black leading-relaxed">{aiData.recommendations}</p>
                              {aiData.matchingVacancies && aiData.matchingVacancies.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[9px] font-black uppercase text-slate-400">Alternativas do Grupo:</span>
                                  {aiData.matchingVacancies.map((mv: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg text-[9px] font-black">
                                      {mv}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Suggested Questions */}
                            <div className="bg-emerald-950 text-white p-4.5 rounded-2xl space-y-2 border-0">
                              <h5 className="text-[9px] font-black uppercase text-emerald-350 tracking-wider flex items-center">
                                💬 Perguntas Técnicas Estratégicas para o Recrutador
                              </h5>
                              <div className="space-y-1.5">
                                {aiData.questions?.map((q: string, idx: number) => (
                                  <div key={idx} className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/20 text-[10px] leading-relaxed flex items-start">
                                    <span className="font-extrabold text-emerald-300 mr-2">{idx + 1}.</span>
                                    <span className="text-emerald-100">{q}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Change Recruitment Status */}
                    <div className="pt-2 space-y-3">
                      <p className="text-[10px] font-black text-slate-655 uppercase">Alterar Status Seletivo:</p>
                      <div className="flex flex-wrap gap-2">
                        {['Novo', 'Em Análise', 'Aprovado', 'Recusado'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateCandidateStatus(viewingCandidate.id, st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                              viewingCandidate.status === st
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-2">
                        <button
                          type="button"
                          onClick={() => deleteCandidate(viewingCandidate.id)}
                          className="flex items-center space-x-1 text-red-650 hover:text-red-750 font-bold text-xs border-0 bg-transparent cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover do Banco</span>
                        </button>
                        
                        <p className="text-[9px] text-slate-400 font-mono italic">Ficha: #{viewingCandidate.id}</p>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )})()}

            {/* ── EQUIPE & HIERARQUIA ───────────────────────────────────────── */}
            {activeSubTab === 'equipe' && (
              <EmployeesTab
                token={token}
                canEdit={canView('can_edit_candidates') || currentUserRole === 'admin'}
              />
            )}

            {/* ── FINANCEIRO ───────────────────────────────────────────────── */}
            {activeSubTab === 'financeiro' && (
              <FinanceiroTab token={token} />
            )}

            {/* ── RASTREAMENTO & FROTAS ─────────────────────────────────────── */}
            {activeSubTab === 'tracking' && (
              <TrackingPanel
                routes={routes}
                selectedRouteId={selectedRouteId}
                simulationActive={simulationActive}
                setSelectedRouteId={setSelectedRouteId}
                setSimulationActive={setSimulationActive}
                onCreateRoute={(_e, data) => {
                  const startPreset = (PRESET_COORDS as any)[data.startLoc] || { lat: -23.3556, lng: -47.8556 };
                  fetch('/api/routes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      driver_name: data.driverName,
                      vehicle_plate: data.vehiclePlate.toUpperCase(),
                      vehicle_type: data.vehicleType,
                      start_location: data.startLoc,
                      destination: data.destLoc,
                      current_lat: startPreset.lat,
                      current_lng: startPreset.lng,
                      cargo_description: data.cargoDesc
                    })
                  }).then(r => r.json()).then(d => {
                    if (d.success) {
                      showSuccess('Rota iniciada com rastreamento GPS ativo!');
                      fetch('/api/routes').then(r => r.json()).then(fd => {
                        if (fd.success) { setRoutes(fd.routes || []); setSelectedRouteId(d.id); }
                      });
                    }
                  });
                }}
                onDeleteRoute={deleteRoute}
                onTriggerProgress={triggerStepProgress}
                onManualEvent={(_e, text) => {
                  if (!selectedRouteId || !text.trim()) return;
                  const cur = routes.find(r => r.id === selectedRouteId);
                  if (!cur) return;
                  fetch(`/api/routes/${selectedRouteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ last_event: text, event_occurred: text })
                  }).then(r => r.json()).then(d => {
                    if (d.success) fetch('/api/routes').then(r => r.json()).then(fd => {
                      if (fd.success) setRoutes(fd.routes || []);
                    });
                  });
                }}
              />
            )}

            {/* SUBTAB 6: DADOS E DIVULGAÇÃO DA INSTITUIÇÃO */}
            {activeSubTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Header Banner - Border Only, No Shadow */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-850">
                      <Settings className="w-5 h-5 text-emerald-800 shrink-0" />
                      <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">Dados de Divulgação do Site</h2>
                    </div>
                    <p className="text-xs text-slate-550 leading-relaxed font-sans max-w-2xl">
                      Atualize textos de recepção, legados históricos, abas de produtos e contatos corporativos das fazendas em tempo real diretamente no banco de dados SQLite.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                      ⚙️ Sincronizado com SQLite
                    </span>
                  </div>
                </div>

                {/* Responsive Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Subtab Nav cards (Border and clean indicators, no shadow) */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Canais Selecionáveis
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { key: 'home', label: 'Canal Início (Home)', icon: Home, desc: 'Slogans da página de recepção' },
                        { key: 'sobre', label: 'Institucional (Sobre)', icon: Users, desc: 'Legado e imigração do patriarca' },
                        { key: 'produtos', label: 'Segmentos (Produtos)', icon: Leaf, desc: 'Avicultura, citros e bovinos' },
                        { key: 'contato', label: 'Canais de Contato', icon: Phone, desc: 'E-mails e contatos corporativos' }
                      ].map((sub) => {
                        const Icon = sub.icon;
                        const isSelected = activeEditTab === sub.key;
                        return (
                          <button
                            key={sub.key}
                            type="button"
                            onClick={() => setActiveEditTab(sub.key as any)}
                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 focus:outline-none ${
                              isSelected
                                ? 'bg-emerald-50/10 border-emerald-600/80 text-emerald-950 font-black ring-1 ring-emerald-600/20'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-750 font-bold'
                            }`}
                          >
                            <span className={`p-2 rounded-lg shrink-0 ${
                              isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="truncate">
                              <span className="block text-xs uppercase tracking-wider font-extrabold">{sub.label}</span>
                              <span className="block text-[10px] text-slate-400 font-medium mt-0.5 whitespace-normal leading-tight">{sub.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Dynamic Form Workspace (Border only, no heavy shadow) */}
                  <form onSubmit={handleSaveSettings} className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                    
                    {/* Dynamic Tabs Content */}
                    
                    {/* TAB 1: HOME */}
                    {activeEditTab === 'home' && (
                      <div className="space-y-5 animate-fade-in text-left">
                        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
                          <Home className="w-4.5 h-4.5 text-emerald-800 shrink-0" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Visualização Canal Início (Home)</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Configure slogans e termos destacados que acolhem visitantes e representantes comerciais na página de recepção da marca Shigueno.
                        </p>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                            Slogan Principal da Família Shigueno
                          </label>
                          <input
                            type="text"
                            value={siteMotto}
                            onChange={(e) => setSiteMotto(e.target.value)}
                            className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-4 py-3 text-xs font-bold text-slate-855 focus:outline-none placeholder-slate-400"
                            placeholder="Ex: Uma empresa sempre preocupada com a qualidade de vida."
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB 2: OVER / HISTÓRIA */}
                    {activeEditTab === 'sobre' && (
                      <div className="space-y-5 animate-fade-in text-left">
                        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
                          <Users className="w-4.5 h-4.5 text-emerald-800 shrink-0" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Configuração Institucional (Sobre Nós)</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Edite os textos do legado corporativo originados a partir da imigração do patriarca Haruo Shigueno desde 1932.
                        </p>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest flex justify-between">
                            <span>Introdução Histórica (Chegada em 1932)</span>
                            <span className="text-slate-400 text-[9px] lowercase font-normal">parágrafo em destaque</span>
                          </label>
                          <textarea
                            rows={3}
                            value={siteAboutIntro}
                            onChange={(e) => setSiteAboutIntro(e.target.value)}
                            className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed placeholder-slate-400"
                            placeholder="Breve sumário sobre a imigração em 1932..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest flex justify-between">
                            <span>História de Fundação (Avicultura & Desenvolvimento)</span>
                            <span className="text-slate-400 text-[9px] lowercase font-normal">corpo de texto principal</span>
                          </label>
                          <textarea
                            rows={5}
                            value={siteAboutFull}
                            onChange={(e) => setSiteAboutFull(e.target.value)}
                            className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed placeholder-slate-400"
                            placeholder="Detalhes completos sobre Mogi das Cruzes, São José dos Campos e Tatuí..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest flex justify-between">
                            <span>Diversificação Agrícola e Progresso das Fazendas</span>
                            <span className="text-slate-400 text-[9px] lowercase font-normal">seção final de legados</span>
                          </label>
                          <textarea
                            rows={4}
                            value={siteAboutDiversification}
                            onChange={(e) => setSiteAboutDiversification(e.target.value)}
                            className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed placeholder-slate-400"
                            placeholder="Explicação sobre a citricultura, café e adubo de postura das aves..."
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB 3: PRODUTOS */}
                    {activeEditTab === 'produtos' && (
                      <div className="space-y-5 animate-fade-in text-left">
                        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
                          <Leaf className="w-4.5 h-4.5 text-emerald-800 shrink-0" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Segmentos de Produção das Fazendas</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Gerencie os resumos explicativos apresentados nos catálogos de produtos e negócios nas seções públicas do site.
                        </p>

                        <div className="grid grid-cols-1 gap-5">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest flex justify-between">
                              <span>🥚 Avicultura de Postura - Descrição</span>
                              <span className="text-emerald-800 text-[9px] font-bold font-sans">Tatuí (SP)</span>
                            </label>
                            <textarea
                              rows={3}
                              value={siteProdAvicultura}
                              onChange={(e) => setSiteProdAvicultura(e.target.value)}
                              className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed placeholder-slate-400"
                              placeholder="Descrição da produção seletiva de ovos..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest flex justify-between">
                              <span>🍊 Citricultura Técnica - Descrição</span>
                              <span className="text-emerald-800 text-[9px] font-bold font-sans">Buri / Aliança</span>
                            </label>
                            <textarea
                              rows={3}
                              value={siteProdCitricultura}
                              onChange={(e) => setSiteProdCitricultura(e.target.value)}
                              className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed placeholder-slate-400"
                              placeholder="Descrição do cultivo orgânico de citros com esterco aviário..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest flex justify-between">
                              <span>☕ Cafeicultura de Altitude - Descrição</span>
                              <span className="text-emerald-800 text-[9px] font-bold font-sans">Itaí (SP)</span>
                            </label>
                            <textarea
                              rows={3}
                              value={siteProdCafeicultura}
                              onChange={(e) => setSiteProdCafeicultura(e.target.value)}
                              className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed placeholder-slate-400"
                              placeholder="Descrição das linhagens de café arábica e microclima..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest flex justify-between">
                              <span>🐂 Nelore Agropecuária - Descrição</span>
                              <span className="text-emerald-800 text-[9px] font-bold font-sans">Leverger (MT)</span>
                            </label>
                            <textarea
                              rows={3}
                              value={siteProdNelore}
                              onChange={(e) => setSiteProdNelore(e.target.value)}
                              className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed placeholder-slate-400"
                              placeholder="Descrição do manejo racional do rebanho Nelore..."
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: CONTATO */}
                    {activeEditTab === 'contato' && (
                      <div className="space-y-5 animate-fade-in text-left">
                        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
                          <Phone className="w-4.5 h-4.5 text-emerald-800 shrink-0" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Canais de Contato Institucional</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Especifique os canais comerciais públicos que representantes e clientes usam no formulário e no rodapé do portal.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                              E-mail Geral de Atendimento (SAC)
                            </label>
                            <input
                              type="email"
                              value={siteContactEmail}
                              onChange={(e) => setSiteContactEmail(e.target.value)}
                              className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-3.5 py-3 text-xs font-mono font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
                              placeholder="Ex: sac@shigueno.com.br"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                              Telefone Comercial (Sede Tatuí)
                            </label>
                            <input
                              type="text"
                              value={siteContactPhone}
                              onChange={(e) => setSiteContactPhone(e.target.value)}
                              className="w-full bg-[#fafafa] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-700/10 transition-all rounded-xl px-3.5 py-3 text-xs font-mono font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
                              placeholder="Ex: (15) 3259-9710"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ACTION CONTROLS */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={fetchInitialData}
                        disabled={loading}
                        className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold rounded-xl text-xs flex items-center space-x-2 transition-all focus:outline-none cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reverter</span>
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm tracking-wide uppercase flex items-center space-x-2 cursor-pointer"
                      >
                        <span>Gravar Dados</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* SUBTAB GESTÃO DO BLOG */}
            {activeSubTab === 'blog' && (
              <BlogManager authFetch={authFetch} onSettingsUpdate={onSettingsUpdate} />
            )}
            
          </div>
        )}
          </>)}
        </main>
      </div>

      {/* A4 Job Poster Generator Overlay */}
      <A4PosterModal
        isOpen={isPosterModalOpen}
        onClose={() => {
          setIsPosterModalOpen(false);
          setSelectedVacancyForPoster(null);
        }}
        vacancy={selectedVacancyForPoster}
      />
    </div>
  );
}
