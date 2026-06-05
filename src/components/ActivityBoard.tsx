import React from 'react';
import ReactDOM from 'react-dom';
import {
  Plus, Search, X, CheckCircle, RefreshCw, Lock, Globe,
  AlertCircle, Trash2, Edit, GripVertical, PlusCircle,
  CheckCircle2, Share2, ArrowLeft, ChevronDown, Calendar,
  Briefcase, UserCircle, Flag, LayoutGrid, List,
  Clock, Layers, ChevronRight, Tag, MessageSquare,
  MoreHorizontal, MoveRight, Eye, Users
} from 'lucide-react';

// ── Portal ────────────────────────────────────────────────────────────────────
function Portal({ children }: { children: React.ReactNode }) {
  return ReactDOM.createPortal(children, document.body);
}

// ── Custom Select — dropdown via Portal, nunca fica preso dentro do modal ─────
function Select({ value, onChange, options, placeholder = 'Selecione...', className = '' }: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0, openUp: false });
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const listH = Math.min(options.length * 40 + 8, 240);
    const openUp = spaceBelow < listH && spaceAbove > spaceBelow;
    setPos({
      top: openUp ? rect.top - listH - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUp,
    });
    setOpen(true);
  };

  const selected = options.find(o => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={open ? () => setOpen(false) : openMenu}
        className={`w-full flex items-center justify-between bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 outline-none transition-all cursor-pointer ${open ? 'border-emerald-500 ring-2 ring-emerald-100' : ''} ${className}`}>
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>{selected?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <Portal>
          <div
            className="fixed z-[99999] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-y-auto py-1"
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: 240 }}>
            {options.map(o => (
              <button key={o.value} type="button"
                onMouseDown={e => { e.preventDefault(); onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer hover:bg-emerald-50 hover:text-emerald-800 ${value === o.value ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-700'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </Portal>
      )}
    </>
  );
}

// ── Column type ───────────────────────────────────────────────────────────────
export interface BoardColumn {
  name: string;
  color: string; // hex or tailwind color key
}

// Normaliza colunas: aceita string[] (legado) ou BoardColumn[]
function parseCols(json: string): BoardColumn[] {
  try {
    const raw = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    return raw.map((c: any, i: number) =>
      typeof c === 'string'
        ? { name: c, color: COL_HEX[i % COL_HEX.length] }
        : { name: c.name || '', color: c.color || COL_HEX[i % COL_HEX.length] }
    );
  } catch { return []; }
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Board {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  columns_json: string;
  created_by: number | null;
  created_at: string;
  total_cards?: number;
  done_cards?: number;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  sector: string;
  status: string;
  priority: string;
  responsible: string;
  due_date: string | null;
  completed_at: string | null;
  created_by: number | null;
  created_by_name: string;
  visibility: 'public' | 'private';
  shared_with: number[] | null;
  board_id: number | null;
  created_at: string;
}

interface ActivityBoardProps {
  user: { id: number; name: string; role: string } | null;
  token: string;
  canEdit: boolean;
  permUsers: Array<{ id: number; name: string; username: string }>;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BOARD_COLORS: Record<string, { bg: string; light: string; text: string; border: string; dot: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-600', light: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', ring: 'ring-emerald-400' },
  sky:     { bg: 'bg-sky-600',     light: 'bg-sky-50',      text: 'text-sky-700',     border: 'border-sky-200',     dot: 'bg-sky-500',     ring: 'ring-sky-400' },
  violet:  { bg: 'bg-violet-600',  light: 'bg-violet-50',   text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500',  ring: 'ring-violet-400' },
  amber:   { bg: 'bg-amber-500',   light: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   ring: 'ring-amber-400' },
  rose:    { bg: 'bg-rose-600',    light: 'bg-rose-50',     text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    ring: 'ring-rose-400' },
  teal:    { bg: 'bg-teal-600',    light: 'bg-teal-50',     text: 'text-teal-700',    border: 'border-teal-200',    dot: 'bg-teal-500',    ring: 'ring-teal-400' },
  indigo:  { bg: 'bg-indigo-600',  light: 'bg-indigo-50',   text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500',  ring: 'ring-indigo-400' },
  orange:  { bg: 'bg-orange-500',  light: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',  ring: 'ring-orange-400' },
};
const DC = BOARD_COLORS.emerald;

const PRIORITY_MAP: Record<string, { cls: string; dot: string; label: string }> = {
  'Alta':  { cls: 'bg-red-50 text-red-700 border border-red-200',         dot: 'bg-red-500',    label: 'Alta' },
  'Média': { cls: 'bg-amber-50 text-amber-700 border border-amber-200',   dot: 'bg-amber-500',  label: 'Média' },
  'Baixa': { cls: 'bg-slate-100 text-slate-600 border border-slate-200',  dot: 'bg-slate-400',  label: 'Baixa' },
};

const PRESET_BOARDS = [
  { name: 'Compras',            color: 'sky',    description: 'Cotações, pedidos e aquisições de materiais' },
  { name: 'Ações Corporativas', color: 'violet', description: 'Iniciativas estratégicas e projetos da corporação' },
  { name: 'Contratações',       color: 'teal',   description: 'Processos seletivos e admissões de pessoal' },
  { name: 'Financeiro',         color: 'amber',  description: 'Pagamentos, cobranças e controle financeiro' },
  { name: 'Manutenção',         color: 'orange', description: 'Manutenção preventiva e corretiva de equipamentos' },
  { name: 'RH',                 color: 'rose',   description: 'Recursos humanos, treinamentos e benefícios' },
];

const DEFAULT_COLUMNS = ['A Fazer', 'Em Progresso', 'Em Revisão', 'Concluído'];
const COL_COLORS = ['bg-amber-500','bg-indigo-500','bg-emerald-500','bg-violet-500','bg-rose-500','bg-cyan-500','bg-teal-500'];

// Paleta de cores para colunas (hex para fácil uso inline)
const COL_PALETTE: Array<{ name: string; hex: string; text: string; bg: string; light: string; border: string }> = [
  { name: 'Cinza',    hex: '#94a3b8', text: 'text-slate-600',   bg: 'bg-slate-400',   light: 'bg-slate-100',  border: 'border-slate-300' },
  { name: 'Âmbar',   hex: '#f59e0b', text: 'text-amber-700',   bg: 'bg-amber-400',   light: 'bg-amber-50',   border: 'border-amber-300' },
  { name: 'Laranja',  hex: '#f97316', text: 'text-orange-700',  bg: 'bg-orange-400',  light: 'bg-orange-50',  border: 'border-orange-300' },
  { name: 'Rosa',     hex: '#f43f5e', text: 'text-rose-700',    bg: 'bg-rose-500',    light: 'bg-rose-50',    border: 'border-rose-300' },
  { name: 'Violeta',  hex: '#8b5cf6', text: 'text-violet-700',  bg: 'bg-violet-500',  light: 'bg-violet-50',  border: 'border-violet-300' },
  { name: 'Índigo',   hex: '#6366f1', text: 'text-indigo-700',  bg: 'bg-indigo-500',  light: 'bg-indigo-50',  border: 'border-indigo-300' },
  { name: 'Azul',     hex: '#3b82f6', text: 'text-blue-700',    bg: 'bg-blue-500',    light: 'bg-blue-50',    border: 'border-blue-300' },
  { name: 'Ciano',    hex: '#06b6d4', text: 'text-cyan-700',    bg: 'bg-cyan-500',    light: 'bg-cyan-50',    border: 'border-cyan-300' },
  { name: 'Teal',     hex: '#14b8a6', text: 'text-teal-700',    bg: 'bg-teal-500',    light: 'bg-teal-50',    border: 'border-teal-300' },
  { name: 'Verde',    hex: '#22c55e', text: 'text-green-700',   bg: 'bg-green-500',   light: 'bg-green-50',   border: 'border-green-300' },
  { name: 'Esmeralda',hex: '#10b981', text: 'text-emerald-700', bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-300' },
];
const COL_HEX = COL_PALETTE.map(c => c.hex);

function getColPalette(hex: string) {
  return COL_PALETTE.find(c => c.hex === hex) || COL_PALETTE[0];
}

function toDateOnly(val: any): string {
  if (!val) return '';
  const s = String(val);
  return s.includes('T') ? s.slice(0, 10) : s;
}
function formatDate(val: string | null): string {
  if (!val) return '';
  const d = toDateOnly(val);
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
function isOverdue(due: string | null): boolean {
  if (!due) return false;
  return toDateOnly(due) < new Date().toISOString().slice(0, 10);
}
function getBoardColor(color: string) { return BOARD_COLORS[color] || DC; }
function getPriority(p: string) { return PRIORITY_MAP[p] || PRIORITY_MAP['Baixa']; }

// ── Board Form Modal ──────────────────────────────────────────────────────────
function BoardFormModal({ open, onClose, onSave, editData, userId }: {
  open: boolean; onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editData: Board | null; userId: number | null;
}) {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [color, setColor] = React.useState('emerald');
  // Colunas sempre como BoardColumn[] — preserva cores durante toda edição
  const [columns, setColumns] = React.useState<BoardColumn[]>(
    DEFAULT_COLUMNS.map((n, i) => ({ name: n, color: COL_HEX[i % COL_HEX.length] }))
  );
  const [newCol, setNewCol] = React.useState('');
  const [newColColor, setNewColColor] = React.useState(COL_HEX[0]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (editData) {
      setName(editData.name); setDesc(editData.description); setColor(editData.color);
      setColumns(parseCols(editData.columns_json));
    } else {
      setName(''); setDesc(''); setColor('emerald');
      setColumns(DEFAULT_COLUMNS.map((n, i) => ({ name: n, color: COL_HEX[i % COL_HEX.length] })));
    }
    setNewCol(''); setNewColColor(COL_HEX[0]);
  }, [open, editData]);

  if (!open) return null;
  const cc = getBoardColor(color);

  const addCol = () => {
    const t = newCol.trim();
    if (t && !columns.some(c => c.name === t)) {
      setColumns(p => [...p, { name: t, color: newColColor }]);
      setNewCol('');
      setNewColColor(COL_HEX[columns.length % COL_HEX.length]);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || columns.length === 0) return;
    setSaving(true);
    try { await onSave({ name: name.trim(), description: desc, color, columns, created_by: userId }); }
    finally { setSaving(false); }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col" style={{ maxHeight: 'min(90vh, 700px)' }}>
          <div className="shrink-0 flex items-center justify-between px-7 py-5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">{editData ? 'Editar Quadro' : 'Novo Quadro'}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Configure nome, cor e colunas do Kanban</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
              {!editData && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Começar de um modelo</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_BOARDS.map(p => {
                      const c = getBoardColor(p.color);
                      return (
                        <button key={p.name} type="button" onClick={() => { setName(p.name); setDesc(p.description); setColor(p.color); }}
                          className={`flex items-center space-x-2 px-3 py-2.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${name === p.name ? `${c.light} ${c.border}` : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                          <span className="text-xs font-bold text-slate-700 truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Nome *</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Compras, Financeiro, RH..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Descrição</label>
                <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Objetivo e foco do quadro..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Cor</label>
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(BOARD_COLORS).map(([key, c]) => (
                    <button key={key} type="button" onClick={() => setColor(key)}
                      className={`w-8 h-8 rounded-full ${c.bg} transition-all cursor-pointer ${color === key ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Colunas *</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {columns.map(col => (
                    <div key={col.name} className="flex items-center space-x-2 border rounded-xl pl-2.5 pr-2 py-1.5" style={{ borderColor: col.color + '55', backgroundColor: col.color + '11' }}>
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                      <span className="text-xs font-bold text-slate-700">{col.name}</span>
                      {columns.length > 1 && <button type="button" onClick={() => setColumns(p => p.filter(x => x.name !== col.name))} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>}
                    </div>
                  ))}
                </div>
                {/* Nova coluna com seletor de cor */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {COL_PALETTE.map(p => (
                      <button key={p.hex} type="button" onClick={() => setNewColColor(p.hex)} title={p.name}
                        className="w-6 h-6 rounded-full transition-all cursor-pointer"
                        style={{ backgroundColor: p.hex, outline: newColColor === p.hex ? `2px solid ${p.hex}` : 'none', outlineOffset: '2px', transform: newColColor === p.hex ? 'scale(1.2)' : 'scale(1)' }} />
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input value={newCol} onChange={e => setNewCol(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCol(); } }}
                      placeholder="Nome da nova coluna..." className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-400 px-3 py-2 rounded-xl text-xs font-semibold outline-none" />
                    <button type="button" onClick={addCol} className="px-3 py-2 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center space-x-1 transition-opacity hover:opacity-90" style={{ backgroundColor: newColColor }}>
                      <Plus className="w-3.5 h-3.5" /><span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-between px-7 py-5 border-t border-slate-100 bg-white rounded-b-3xl">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${cc.light} ${cc.border} border`}>
                <div className={`w-3 h-3 rounded-full ${cc.dot}`} />
                <span className={`text-xs font-bold ${cc.text}`}>{name || 'Quadro'}</span>
              </div>
              <div className="flex space-x-2.5">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl cursor-pointer">Cancelar</button>
                <button type="submit" disabled={saving || !name.trim()} className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl cursor-pointer flex items-center space-x-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{saving ? 'Salvando...' : editData ? 'Salvar' : 'Criar Quadro'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

// ── Board-specific extra fields config ───────────────────────────────────────
const BOARD_EXTRA_FIELDS: Record<string, Array<{ key: string; label: string; type: 'text' | 'number' | 'select' | 'date'; options?: string[]; placeholder?: string; icon?: string }>> = {
  'RH': [
    { key: 'cargo',           label: 'Cargo / Função',       type: 'text',   placeholder: 'Ex: Operador Rural, Tratorista...', icon: '👔' },
    { key: 'departamento',    label: 'Departamento',          type: 'text',   placeholder: 'Ex: Avicultura, Citricultura...', icon: '🏢' },
    { key: 'tipo_processo',   label: 'Tipo de Processo',      type: 'select', options: ['Admissão','Demissão','Férias','Treinamento','Benefício','Outro'], icon: '📋' },
    { key: 'num_vagas',       label: 'Nº de Vagas',           type: 'number', placeholder: '1', icon: '👥' },
    { key: 'salario_previsto',label: 'Salário Previsto (R$)', type: 'number', placeholder: 'Ex: 2500', icon: '💰' },
  ],
  'Financeiro': [
    { key: 'valor',           label: 'Valor (R$)',            type: 'number', placeholder: 'Ex: 15000.00', icon: '💵' },
    { key: 'tipo',            label: 'Tipo',                  type: 'select', options: ['Pagamento','Recebimento','Transferência','Orçamento','Outro'], icon: '📊' },
    { key: 'fornecedor',      label: 'Fornecedor / Credor',   type: 'text',   placeholder: 'Nome da empresa ou pessoa', icon: '🏦' },
    { key: 'nota_fiscal',     label: 'Nota Fiscal / Ref.',    type: 'text',   placeholder: 'Nº NF ou referência', icon: '🧾' },
    { key: 'vencimento',      label: 'Vencimento',            type: 'date',   icon: '📅' },
    { key: 'centro_custo',    label: 'Centro de Custo',       type: 'text',   placeholder: 'Ex: Avicultura, Geral...', icon: '🏷️' },
  ],
  'Compras': [
    { key: 'produto',         label: 'Produto / Material',    type: 'text',   placeholder: 'Ex: Ração, Insumo, Peça...', icon: '📦' },
    { key: 'quantidade',      label: 'Quantidade',            type: 'text',   placeholder: 'Ex: 15 toneladas, 50 unid...', icon: '⚖️' },
    { key: 'valor_estimado',  label: 'Valor Estimado (R$)',   type: 'number', placeholder: 'Ex: 8500', icon: '💵' },
    { key: 'fornecedor',      label: 'Fornecedor',            type: 'text',   placeholder: 'Nome do fornecedor', icon: '🏪' },
    { key: 'urgencia',        label: 'Urgência',              type: 'select', options: ['Normal','Urgente','Crítico'], icon: '⚡' },
  ],
  'Contratações': [
    { key: 'cargo',           label: 'Cargo',                 type: 'text',   placeholder: 'Ex: Tratorista Especializado', icon: '👔' },
    { key: 'setor_destino',   label: 'Setor de Destino',      type: 'text',   placeholder: 'Ex: Avicultura, Citricultura', icon: '🏢' },
    { key: 'num_vagas',       label: 'Nº de Vagas',           type: 'number', placeholder: '1', icon: '👥' },
    { key: 'salario_previsto',label: 'Faixa Salarial (R$)',   type: 'text',   placeholder: 'Ex: 2.000 - 2.800', icon: '💰' },
    { key: 'tipo_contrato',   label: 'Tipo de Contrato',      type: 'select', options: ['CLT','Temporário','PJ','Estágio','Terceirizado'], icon: '📋' },
    { key: 'data_inicio',     label: 'Início Previsto',       type: 'date',   icon: '📅' },
  ],
  'Manutenção': [
    { key: 'equipamento',     label: 'Equipamento',           type: 'text',   placeholder: 'Ex: Trator John Deere 5075E', icon: '🔧' },
    { key: 'tipo_manutencao', label: 'Tipo',                  type: 'select', options: ['Preventiva','Corretiva','Calibração','Inspeção'], icon: '🛠️' },
    { key: 'local',           label: 'Local / Unidade',       type: 'text',   placeholder: 'Ex: Granja, Fazenda Nova Aliança', icon: '📍' },
    { key: 'tecnico',         label: 'Técnico Responsável',   type: 'text',   placeholder: 'Nome do técnico ou empresa', icon: '👷' },
    { key: 'custo_estimado',  label: 'Custo Estimado (R$)',   type: 'number', placeholder: 'Ex: 1200', icon: '💵' },
  ],
  'Ações Corporativas': [
    { key: 'objetivo',        label: 'Objetivo Estratégico',  type: 'text',   placeholder: 'Ex: Aumentar produção 20%...', icon: '🎯' },
    { key: 'area_impacto',    label: 'Área de Impacto',       type: 'text',   placeholder: 'Ex: Toda a corporação, MT...', icon: '🌐' },
    { key: 'orcamento',       label: 'Orçamento (R$)',        type: 'number', placeholder: 'Ex: 50000', icon: '💼' },
    { key: 'stakeholders',    label: 'Stakeholders',          type: 'text',   placeholder: 'Ex: Diretoria, Gestores...', icon: '👥' },
    { key: 'prazo_entrega',   label: 'Prazo de Entrega',      type: 'date',   icon: '📅' },
  ],
};

const INPUT_CLS = 'w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all';

// ── Card Create/Edit Modal ─────────────────────────────────────────────────────
function CardFormModal({ open, onClose, onSave, editData, board, defaultColumn }: {
  open: boolean; onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editData: Activity | null; board: Board;
  defaultColumn?: string;
}) {
  const columns: string[] = React.useMemo(() => parseCols(board.columns_json).map(c => c.name), [board.columns_json]);
  const extraFields = BOARD_EXTRA_FIELDS[board.name] || [];

  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [priority, setPriority] = React.useState('Média');
  const [responsible, setResponsible] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [extras, setExtras] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (editData) {
      setTitle(editData.title); setDesc(editData.description || ''); setStatus(editData.status);
      setPriority(editData.priority); setResponsible(editData.responsible || ''); setDueDate(toDateOnly(editData.due_date));
      try {
        const ed = typeof (editData as any).extra_data === 'string' ? JSON.parse((editData as any).extra_data) : ((editData as any).extra_data || {});
        setExtras(ed);
      } catch { setExtras({}); }
    } else {
      setTitle(''); setDesc(''); setStatus(defaultColumn || columns[0] || 'A Fazer');
      setPriority('Média'); setResponsible(''); setDueDate(''); setExtras({});
    }
  }, [open, editData, columns, defaultColumn]);

  if (!open) return null;
  const cc = getBoardColor(board.color);

  const setExtra = (key: string, val: string) => setExtras(p => ({ ...p, [key]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(), description: desc, category: board.name, sector: board.name,
        status, priority, responsible, due_date: dueDate,
        visibility: 'public', board_id: board.id,
        extra_data: Object.keys(extras).length > 0 ? extras : null,
        board_type: board.name,
      });
    } finally { setSaving(false); }
  };

  const hasExtras = extraFields.length > 0;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col" style={{ maxHeight: 'min(92vh, 720px)' }}>
          {/* Header */}
          <div className={`shrink-0 flex items-center justify-between px-7 py-5 rounded-t-3xl ${cc.light} border-b ${cc.border}`}>
            <div>
              <div className="flex items-center space-x-2 mb-0.5">
                <div className={`w-2.5 h-2.5 rounded-full ${cc.dot}`} />
                <span className={`text-[11px] font-bold ${cc.text} uppercase tracking-wide`}>{board.name}</span>
              </div>
              <h2 className="text-base font-black text-slate-900">{editData ? 'Editar Card' : 'Novo Card'}</h2>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/60 rounded-xl text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">

              {/* ── Campos base ── */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Título *</label>
                  <input required autoFocus value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="O que precisa ser feito?"
                    className={INPUT_CLS.replace('py-2.5', 'py-3').replace('rounded-xl', 'rounded-2xl').replace('focus:ring-2 focus:ring-emerald-100 ', '')} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Descrição</label>
                  <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="Contexto, detalhes, observações..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Coluna</label>
                    <div className="relative">
                      <Select value={status} onChange={setStatus}
                        options={columns.map(c => ({ value: c, label: c }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Prioridade</label>
                    <div className="flex space-x-1">
                      {(['Alta','Média','Baixa'] as const).map(p => (
                        <button key={p} type="button" onClick={() => setPriority(p)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${priority === p ? getPriority(p).cls : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center space-x-1"><UserCircle className="w-3.5 h-3.5" /><span>Responsável</span></label>
                    <input value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Nome..."
                      className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>Prazo</span></label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={INPUT_CLS} />
                  </div>
                </div>
              </div>

              {/* ── Campos específicos do quadro ── */}
              {hasExtras && (
                <div className={`space-y-3 pt-4 border-t border-slate-100`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${cc.dot}`} />
                    <span className={`text-xs font-black ${cc.text} uppercase tracking-wide`}>Campos específicos — {board.name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {extraFields.map(field => (
                      <div key={field.key}>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                          {field.icon} {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <Select
                            value={extras[field.key] || ''}
                            onChange={v => setExtra(field.key, v)}
                            options={[...(field.options || [])].map(o => ({ value: o, label: o }))}
                          />
                        ) : field.type === 'date' ? (
                          <input type="date" value={extras[field.key] || ''} onChange={e => setExtra(field.key, e.target.value)} className={INPUT_CLS} />
                        ) : (
                          <input type={field.type === 'number' ? 'number' : 'text'} value={extras[field.key] || ''} onChange={e => setExtra(field.key, e.target.value)}
                            placeholder={field.placeholder} min={field.type === 'number' ? '0' : undefined} step={field.type === 'number' ? 'any' : undefined}
                            className={INPUT_CLS} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center justify-end space-x-2.5 px-7 py-5 border-t border-slate-100 bg-white rounded-b-3xl">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl cursor-pointer">Cancelar</button>
              <button type="submit" disabled={saving || !title.trim()} className={`px-6 py-2.5 ${cc.bg} hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl cursor-pointer flex items-center space-x-2`}>
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{saving ? 'Salvando...' : editData ? 'Salvar Alterações' : 'Criar Card'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

// ── Card Detail Modal ─────────────────────────────────────────────────────────
function CardDetailModal({ card, board, columns, onClose, onEdit, onDelete, onMarkDone, onMoveCol, canEdit, permUsers, user, authFetch, onSaved }: {
  card: Activity | null; board: Board | null; columns: BoardColumn[];
  onClose: () => void; onEdit: () => void; onDelete: () => void;
  onMarkDone: () => void; onMoveCol: (col: string) => void;
  canEdit: boolean;
  permUsers: Array<{ id: number; name: string; username: string }>;
  user: { id: number; name: string; role: string } | null;
  authFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  onSaved: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<'details' | 'share'>('details');
  const [sharedWith, setSharedWith] = React.useState<number[]>([]);
  const [visibility, setVisibility] = React.useState<'public' | 'private'>('public');
  const [savingShare, setSavingShare] = React.useState(false);
  const [showMoveMenu, setShowMoveMenu] = React.useState(false);

  React.useEffect(() => {
    if (!card) return;
    setVisibility(card.visibility || 'public');
    setSharedWith(card.shared_with || []);
    setActiveTab('details');
    setShowMoveMenu(false);
  }, [card?.id]);

  if (!card || !board) return null;

  const cc = getBoardColor(board.color);
  const pm = getPriority(card.priority);
  const overdue = isOverdue(card.due_date);
  const isOwner = !user || card.created_by === user.id || user.role === 'admin';

  const saveShare = async () => {
    setSavingShare(true);
    try {
      await authFetch(`/api/activities/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...card, sector: card.sector || '', visibility, shared_with: visibility === 'private' ? sharedWith : null }),
      });
      onSaved();
    } finally { setSavingShare(false); }
  };

  const toggleShared = (uid: number) => setSharedWith(p => p.includes(uid) ? p.filter(x => x !== uid) : [...p, uid]);

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-xl flex flex-col" style={{ maxHeight: 'min(92vh, 720px)' }}>

          {/* Header */}
          <div className={`shrink-0 rounded-t-3xl ${cc.light} border-b ${cc.border}`}>
            {/* Board + status badges */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg ${cc.light} border ${cc.border}`}>
                  <div className={`w-2 h-2 rounded-full ${cc.dot}`} />
                  <span className={`text-[10px] font-black ${cc.text} uppercase tracking-wide`}>{board.name}</span>
                </div>
                <span className={`flex items-center space-x-1 text-[10px] font-black px-2.5 py-1 rounded-lg border ${pm.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} /><span>{card.priority}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">{card.status}</span>
                {card.visibility === 'private' && <span className="flex items-center space-x-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg"><Lock className="w-3 h-3" /><span>Privado</span></span>}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/70 rounded-xl text-slate-500 cursor-pointer shrink-0"><X className="w-5 h-5" /></button>
            </div>
            {/* Title */}
            <div className="px-6 pb-5">
              <h2 className="text-lg font-black text-slate-900 leading-snug">{card.title}</h2>
              <div className="flex items-center space-x-3 mt-2 flex-wrap gap-y-1">
                {card.responsible && (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-black text-emerald-700">{card.responsible.charAt(0)}</div>
                    <span className="text-xs font-semibold text-slate-600">{card.responsible}</span>
                  </div>
                )}
                {card.due_date && (
                  <span className={`flex items-center space-x-1 text-xs font-bold ${overdue ? 'text-rose-600' : 'text-amber-700'}`}>
                    <Clock className="w-3.5 h-3.5" /><span>{formatDate(card.due_date)}</span>
                    {overdue && <span className="text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-black uppercase ml-0.5">Atrasado</span>}
                  </span>
                )}
                {card.created_by_name && <span className="text-[10px] text-slate-400 font-mono">por {card.created_by_name} · {card.created_at?.slice(0, 10)}</span>}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-6 space-x-1">
              {(['details', 'share'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : `${cc.text} hover:bg-white/50`}`}>
                  {tab === 'details' ? '📋 Detalhes' : '🔒 Acesso'}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="p-6 space-y-5">
                {card.description ? (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Descrição</label>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 whitespace-pre-line">{card.description}</p>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic bg-slate-50 border border-dashed border-slate-200 rounded-2xl px-4 py-3">Sem descrição.</div>
                )}

                {/* Campos extras específicos do quadro */}
                {(() => {
                  const extraFields = BOARD_EXTRA_FIELDS[board?.name || ''] || [];
                  let extraData: Record<string, string> = {};
                  try { extraData = typeof (card as any).extra_data === 'string' ? JSON.parse((card as any).extra_data) : ((card as any).extra_data || {}); } catch {}
                  const filledExtras = extraFields.filter(f => extraData[f.key]);
                  if (!filledExtras.length) return null;
                  return (
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                        <div className={`w-2 h-2 rounded-full ${cc.dot}`} /><span>Dados de {board?.name}</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {filledExtras.map(f => (
                          <div key={f.key} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 space-y-0.5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{f.icon} {f.label}</p>
                            <p className="text-xs font-bold text-slate-800">
                              {f.type === 'date' ? formatDate(extraData[f.key]) : extraData[f.key]}
                              {(f.key === 'valor' || f.key === 'valor_estimado' || f.key === 'orcamento' || f.key === 'custo_estimado' || f.key === 'salario_previsto') && extraData[f.key] ? ` R$` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Coluna atual</p>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <p className="text-sm font-bold text-slate-800">{card.status}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Prioridade</p>
                    <span className={`inline-flex items-center space-x-1 text-xs font-black px-2 py-0.5 rounded-lg ${pm.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} /><span>{card.priority}</span>
                    </span>
                  </div>
                  {card.responsible && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Responsável</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700">{card.responsible.charAt(0)}</div>
                        <p className="text-sm font-bold text-slate-800 truncate">{card.responsible}</p>
                      </div>
                    </div>
                  )}
                  {card.due_date && (
                    <div className={`border rounded-2xl px-4 py-3 space-y-1 ${overdue ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Prazo</p>
                      <p className={`text-sm font-bold ${overdue ? 'text-rose-700' : 'text-slate-800'}`}>{formatDate(card.due_date)}{overdue && <span className="ml-1.5 text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-black uppercase">Atrasado</span>}</p>
                    </div>
                  )}
                </div>

                {/* Mover coluna */}
                {canEdit && columns.filter(c => c.name !== card.status).length > 0 && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Mover para coluna</label>
                    <div className="flex flex-wrap gap-2">
                      {columns.filter(c => c.name !== card.status).map(col => (
                        <button key={col.name} onClick={() => onMoveCol(col.name)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer bg-white hover:shadow-sm hover:-translate-y-0.5"
                          style={{ borderColor: col.color + '66', color: col.color }}>
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                          <MoveRight className="w-3.5 h-3.5" />
                          <span>{col.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'share' && (
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Visibilidade</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setVisibility('public')}
                      className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${visibility === 'public' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <Globe className={`w-5 h-5 ${visibility === 'public' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <p className={`text-xs font-black ${visibility === 'public' ? 'text-emerald-800' : 'text-slate-700'}`}>Público</p>
                        <p className="text-[10px] text-slate-500 leading-tight">Todos com acesso ao quadro</p>
                      </div>
                    </button>
                    <button type="button" onClick={() => setVisibility('private')}
                      className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${visibility === 'private' ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <Lock className={`w-5 h-5 ${visibility === 'private' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div>
                        <p className={`text-xs font-black ${visibility === 'private' ? 'text-indigo-800' : 'text-slate-700'}`}>Privado</p>
                        <p className="text-[10px] text-slate-500 leading-tight">Só você e convidados</p>
                      </div>
                    </button>
                  </div>
                </div>

                {visibility === 'private' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5"><Share2 className="w-3.5 h-3.5" /><span>Compartilhar com</span></label>
                    {permUsers.filter(u => u.id !== user?.id).length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 border border-dashed border-slate-200 rounded-2xl px-4 py-3">Nenhum outro usuário cadastrado.</p>
                    ) : (
                      <div className="space-y-2">
                        {permUsers.filter(u => u.id !== user?.id).map(u => (
                          <button key={u.id} type="button" onClick={() => toggleShared(u.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all cursor-pointer ${sharedWith.includes(u.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-black text-slate-600">{u.name.charAt(0)}</div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800">{u.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{u.username}</p>
                              </div>
                            </div>
                            {sharedWith.includes(u.id) ? <CheckCircle2 className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={saveShare} disabled={savingShare}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl cursor-pointer flex items-center justify-center space-x-2">
                  {savingShare ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{savingShare ? 'Salvando...' : 'Salvar Configurações de Acesso'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer de ações */}
          {canEdit && isOwner && (
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
              <div className="flex items-center space-x-2">
                <button onClick={onEdit} className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all hover:shadow-sm">
                  <Edit className="w-3.5 h-3.5" /><span>Editar</span>
                </button>
                <button onClick={onMarkDone} className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl cursor-pointer transition-all">
                  <CheckCircle className="w-3.5 h-3.5" /><span>Concluir</span>
                </button>
              </div>
              <button onClick={onDelete} className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl cursor-pointer transition-all">
                <Trash2 className="w-3.5 h-3.5" /><span>Excluir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-3xl p-7 shadow-2xl max-w-sm w-full">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-rose-600" /></div>
            <div><h3 className="font-black text-slate-900 text-sm">{title}</h3><p className="text-[11px] text-slate-500">Esta ação não pode ser desfeita</p></div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-slate-700 leading-snug">{message}</p>
          </div>
          <div className="flex space-x-2.5">
            <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl cursor-pointer">Confirmar</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ActivityBoard({ user, token, canEdit, permUsers }: ActivityBoardProps) {
  const [view, setView] = React.useState<'boards' | 'kanban' | 'history'>('boards');
  const [activeBoard, setActiveBoard] = React.useState<Board | null>(null);
  const activeBoardRef = React.useRef<Board | null>(null);
  const setActiveBoardSafe = (b: Board | null) => { activeBoardRef.current = b; setActiveBoard(b); };
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [cards, setCards] = React.useState<Activity[]>([]);
  const [completedCards, setCompletedCards] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [search, setSearch] = React.useState('');
  const [boardSearch, setBoardSearch] = React.useState('');

  // Kanban drag
  const [draggedId, setDraggedId] = React.useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = React.useState<string | null>(null);
  const [renamingCol, setRenamingCol] = React.useState<string | null>(null);
  const [renamingVal, setRenamingVal] = React.useState('');
  const [renamingColor, setRenamingColor] = React.useState(COL_HEX[0]);
  const [addingColInline, setAddingColInline] = React.useState(false);
  const [newColName, setNewColName] = React.useState('');
  const [newColColor, setNewColColor] = React.useState(COL_HEX[0]);

  // Modals
  const [boardFormOpen, setBoardFormOpen] = React.useState(false);
  const [editingBoard, setEditingBoard] = React.useState<Board | null>(null);
  const [cardFormOpen, setCardFormOpen] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<Activity | null>(null);
  const [defaultColForNew, setDefaultColForNew] = React.useState<string | undefined>();
  const [detailCard, setDetailCard] = React.useState<Activity | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const [toast, setToast] = React.useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), 'Authorization': token } });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBoards = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/boards');
      const data = await res.json();
      if (data.success) setBoards(data.boards || []);
    } finally { setLoading(false); }
  }, []);

  const fetchCards = React.useCallback(async (boardId: number) => {
    const uid = user?.id && user.role !== 'admin' ? `&userId=${user.id}` : '';
    const [a, h] = await Promise.all([
      fetch(`/api/activities?boardId=${boardId}${uid}`).then(r => r.json()),
      fetch(`/api/activities?boardId=${boardId}&history=1${uid}`).then(r => r.json()),
    ]);
    if (a.success) setCards(a.activities || []);
    if (h.success) setCompletedCards(h.activities || []);
    // refresh board counts
    fetchBoards();
  }, [user?.id, user?.role]);

  React.useEffect(() => { fetchBoards(); }, [fetchBoards]);
  React.useEffect(() => { if (activeBoard) fetchCards(activeBoard.id); }, [activeBoard?.id]);

  // ── Board CRUD ────────────────────────────────────────────────────────────
  const saveBoard = async (data: any) => {
    const url = editingBoard ? `/api/boards/${editingBoard.id}` : '/api/boards';
    const method = editingBoard ? 'PUT' : 'POST';
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = await res.json();
    if (json.success) {
      showToast(editingBoard ? 'Quadro atualizado.' : `Quadro "${data.name}" criado!`);
      setBoardFormOpen(false); setEditingBoard(null); fetchBoards();
    }
  };

  const deleteBoard = (board: Board) => setConfirmModal({
    title: 'Excluir Quadro',
    message: `Excluir "${board.name}" e seus ${board.total_cards || 0} cards permanentemente?`,
    onConfirm: async () => {
      await authFetch(`/api/boards/${board.id}`, { method: 'DELETE' });
      showToast(`Quadro "${board.name}" excluído.`);
      setConfirmModal(null);
      if (activeBoard?.id === board.id) { setView('boards'); setActiveBoardSafe(null); }
      fetchBoards();
    },
  });

  // ── Card CRUD ────────────────────────────────────────────────────────────
  const saveCard = async (data: any) => {
    const isEdit = !!editingCard;
    const url = isEdit ? `/api/activities/${editingCard!.id}` : '/api/activities';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, created_by: user?.id || null, created_by_name: user?.name || '' }) });
    const json = await res.json();
    if (json.success) {
      showToast(isEdit ? 'Card atualizado.' : 'Card criado!');
      setCardFormOpen(false); setEditingCard(null);
      const board = activeBoardRef.current;
      if (board) fetchCards(board.id);
    }
  };

  const markDone = async (card: Activity) => {
    await authFetch(`/api/activities/${card.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...card, sector: card.sector || '', mark_completed: true }) });
    showToast(`"${card.title}" concluído.`);
    setDetailCard(null);
    const board = activeBoardRef.current;
    if (board) fetchCards(board.id);
  };

  const restoreCard = async (card: Activity) => {
    await authFetch(`/api/activities/${card.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...card, sector: card.sector || '', mark_completed: false }) });
    showToast(`"${card.title}" restaurado.`);
    const board = activeBoardRef.current;
    if (board) fetchCards(board.id);
  };

  const deleteCard = (card: Activity) => setConfirmModal({
    title: 'Excluir Card',
    message: `"${card.title}"`,
    onConfirm: async () => {
      await authFetch(`/api/activities/${card.id}`, { method: 'DELETE' });
      showToast('Card excluído.'); setConfirmModal(null); setDetailCard(null);
      const board = activeBoardRef.current;
      if (board) fetchCards(board.id);
    },
  });

  const moveCardToCol = async (card: Activity, col: string) => {
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: col } : c));
    await authFetch(`/api/activities/${card.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...card, sector: card.sector || '', status: col }) });
    setDetailCard(prev => prev?.id === card.id ? { ...prev, status: col } : prev);
    const board = activeBoardRef.current;
    if (board) fetchCards(board.id);
  };

  // ── Kanban columns ────────────────────────────────────────────────────────
  const getColumns = (): BoardColumn[] => {
    if (!activeBoard) return DEFAULT_COLUMNS.map((name, i) => ({ name, color: COL_HEX[i % COL_HEX.length] }));
    return parseCols(activeBoard.columns_json);
  };

  const updateColumns = async (cols: BoardColumn[]) => {
    if (!activeBoard) return;
    const updated = { ...activeBoard, columns_json: JSON.stringify(cols) };
    setActiveBoardSafe(updated); setBoards(prev => prev.map(b => b.id === activeBoard.id ? updated : b));
    await authFetch(`/api/boards/${activeBoard.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: activeBoard.name, description: activeBoard.description, color: activeBoard.color, icon: activeBoard.icon, columns: cols }) });
  };

  const handleDrop = async (e: React.DragEvent, target: string) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('text/plain') || draggedId);
    setDraggedId(null); setDragOverCol(null);
    if (!id) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.status === target) return;
    setCards(prev => prev.map(c => c.id === id ? { ...c, status: target } : c));
    await authFetch(`/api/activities/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...card, sector: card.sector || '', status: target }) }).catch(() => { const b = activeBoardRef.current; if (b) fetchCards(b.id); });
  };

  const handleRenameCol = async (oldName: string) => {
    const n = renamingVal.trim();
    if (!n) { setRenamingCol(null); return; }
    const cols = getColumns().map(c => c.name === oldName ? { name: n, color: renamingColor } : c);
    if (n !== oldName) {
      for (const card of cards.filter(c => c.status === oldName))
        await authFetch(`/api/activities/${card.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...card, sector: card.sector || '', status: n }) }).catch(() => {});
    }
    await updateColumns(cols); setRenamingCol(null); const _b = activeBoardRef.current; if (_b) fetchCards(_b.id);
  };

  const addColumnInline = async () => {
    const t = newColName.trim();
    if (!t || getColumns().some(c => c.name === t)) { setAddingColInline(false); setNewColName(''); return; }
    await updateColumns([...getColumns(), { name: t, color: newColColor }]);
    showToast(`Coluna "${t}" criada.`);
    setAddingColInline(false); setNewColName(''); setNewColColor(COL_HEX[0]);
  };

  // Muda só a cor de uma coluna existente
  const changeColColor = async (colName: string, hex: string) => {
    const cols = getColumns().map(c => c.name === colName ? { ...c, color: hex } : c);
    await updateColumns(cols);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-0 relative">
      {/* Toast */}
      {toast && (
        <Portal>
          <div className="fixed bottom-6 right-6 z-[9998] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>{toast}</span>
          </div>
        </Portal>
      )}

      {/* Modals */}
      <BoardFormModal open={boardFormOpen} onClose={() => { setBoardFormOpen(false); setEditingBoard(null); }} onSave={saveBoard} editData={editingBoard} userId={user?.id || null} />
      {activeBoard && (
        <CardFormModal open={cardFormOpen} onClose={() => { setCardFormOpen(false); setEditingCard(null); }} onSave={saveCard}
          editData={editingCard} board={activeBoard} defaultColumn={defaultColForNew} />
      )}
      {activeBoard && (
        <CardDetailModal
          card={detailCard} board={activeBoard} columns={getColumns()}
          onClose={() => setDetailCard(null)}
          onEdit={() => { setEditingCard(detailCard); setCardFormOpen(true); setDetailCard(null); }}
          onDelete={() => { if (detailCard) deleteCard(detailCard); }}
          onMarkDone={() => { if (detailCard) markDone(detailCard); }}
          onMoveCol={(col) => { if (detailCard) moveCardToCol(detailCard, col); }}
          canEdit={canEdit} permUsers={permUsers} user={user}
          authFetch={authFetch}
          onSaved={() => { showToast('Configurações salvas.'); if (activeBoard) fetchCards(activeBoard.id); }}
        />
      )}
      <ConfirmModal open={!!confirmModal} title={confirmModal?.title || ''} message={confirmModal?.message || ''} onConfirm={confirmModal?.onConfirm || (() => {})} onCancel={() => setConfirmModal(null)} />

      {/* Modal — Editar Coluna */}
      {renamingCol && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setRenamingCol(null); }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="h-2 w-full transition-colors" style={{ backgroundColor: renamingColor }} />
              <div className="px-7 py-6 space-y-5">
                <div>
                  <h2 className="text-base font-black text-slate-900">Editar Coluna</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Altere o nome e a cor da coluna</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Nome *</label>
                  <input autoFocus value={renamingVal} onChange={e => setRenamingVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && renamingVal.trim()) handleRenameCol(renamingCol); if (e.key === 'Escape') setRenamingCol(null); }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Cor</label>
                  <div className="grid grid-cols-6 gap-3">
                    {COL_PALETTE.map(p => (
                      <button key={p.hex} type="button" onClick={() => setRenamingColor(p.hex)}
                        title={p.name}
                        className="relative w-full aspect-square rounded-xl transition-all cursor-pointer hover:scale-105 flex items-center justify-center"
                        style={{ backgroundColor: p.hex }}>
                        {renamingColor === p.hex && (
                          <div className="w-3 h-3 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.hex }} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center space-x-2 px-3 py-2 rounded-xl border-2" style={{ borderColor: renamingColor + '44', backgroundColor: renamingColor + '11' }}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: renamingColor }} />
                    <span className="text-xs font-bold" style={{ color: renamingColor }}>{renamingVal || 'Coluna'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2.5 px-7 py-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                <button type="button" onClick={() => setRenamingCol(null)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 cursor-pointer transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={() => renamingVal.trim() && handleRenameCol(renamingCol)} disabled={!renamingVal.trim()}
                  className="px-6 py-2.5 text-white font-extrabold text-sm rounded-2xl cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 hover:opacity-90"
                  style={{ backgroundColor: renamingColor }}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal — Nova Coluna */}
      {addingColInline && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) { setAddingColInline(false); setNewColName(''); } }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              {/* Preview da cor no topo */}
              <div className="h-2 w-full transition-colors" style={{ backgroundColor: newColColor }} />

              <div className="px-7 py-6 space-y-5">
                <div>
                  <h2 className="text-base font-black text-slate-900">Nova Coluna</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Adicione uma etapa ao Kanban</p>
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Nome da Coluna *</label>
                  <input autoFocus value={newColName} onChange={e => setNewColName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addColumnInline(); if (e.key === 'Escape') { setAddingColInline(false); setNewColName(''); } }}
                    placeholder="Ex: Em Revisão, Aprovado, Bloqueado..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all placeholder:text-slate-400" />
                </div>

                {/* Cor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Cor da Coluna</label>
                  <div className="grid grid-cols-6 gap-3">
                    {COL_PALETTE.map(p => (
                      <button key={p.hex} type="button" onClick={() => setNewColColor(p.hex)}
                        title={p.name}
                        className="relative w-full aspect-square rounded-xl transition-all cursor-pointer hover:scale-105 flex items-center justify-center"
                        style={{ backgroundColor: p.hex }}>
                        {newColColor === p.hex && (
                          <div className="w-3 h-3 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.hex }} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Preview */}
                  <div className="mt-3 flex items-center space-x-2 px-3 py-2 rounded-xl border-2" style={{ borderColor: newColColor + '44', backgroundColor: newColColor + '11' }}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: newColColor }} />
                    <span className="text-xs font-bold" style={{ color: newColColor }}>{newColName || 'Nova Coluna'}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: newColColor + '22', color: newColColor }}>0</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 px-7 py-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                <button type="button" onClick={() => { setAddingColInline(false); setNewColName(''); }}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 cursor-pointer transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={addColumnInline} disabled={!newColName.trim()}
                  className="px-6 py-2.5 text-white font-extrabold text-sm rounded-2xl cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 hover:opacity-90"
                  style={{ backgroundColor: newColColor }}>
                  <Plus className="w-4 h-4" />
                  <span>Criar Coluna</span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ═══════════════ BOARDS LIST ═══════════════ */}
      {view === 'boards' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-150">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Quadros de Atividades</h2>
              <p className="text-xs text-slate-500 mt-0.5">{boards.length} quadros · {boards.reduce((s, b) => s + (b.total_cards || 0), 0)} cards ativos</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={fetchBoards} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {user?.role === 'admin' && (
                <button onClick={() => { setEditingBoard(null); setBoardFormOpen(true); }}
                  className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-sm cursor-pointer transition-colors">
                  <Plus className="w-4 h-4" /><span>Novo Quadro</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input value={boardSearch} onChange={e => setBoardSearch(e.target.value)} placeholder="Buscar quadro..."
              className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold outline-none transition-all" />
            {boardSearch && <button onClick={() => setBoardSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center space-y-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
              <span className="text-xs">Carregando quadros...</span>
            </div>
          ) : boards.length === 0 ? (
            <div className="py-20 flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center"><Layers className="w-8 h-8 text-slate-300" /></div>
              <div className="text-center"><p className="text-sm font-bold text-slate-500">Nenhum quadro criado</p><p className="text-xs text-slate-400 mt-1">Um administrador pode criar os primeiros quadros.</p></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {boards.filter(b => !boardSearch || b.name.toLowerCase().includes(boardSearch.toLowerCase()) || (b.description || '').toLowerCase().includes(boardSearch.toLowerCase())).map(board => {
                const cc = getBoardColor(board.color);
                const cols = parseCols(board.columns_json);
                const progress = board.total_cards ? Math.round(((board.done_cards || 0) / board.total_cards) * 100) : 0;
                return (
                  <div key={board.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer" onClick={() => {
                      setActiveBoardSafe(board); setView('kanban'); setSearch('');
                      window.history.replaceState(null, '', `/admin#atividades/board/${board.id}`);
                      document.title = `${board.name} | Painel Shigueno`;
                    }}>
                    <div className={`h-1.5 w-full ${cc.bg}`} />
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-9 h-9 rounded-2xl ${cc.light} ${cc.border} border flex items-center justify-center shrink-0`}>
                            <span className={`text-sm font-black ${cc.text}`}>{board.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight truncate">{board.name}</h3>
                            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{board.description || 'Sem descrição'}</p>
                          </div>
                        </div>
                        {user?.role === 'admin' && (
                          <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setEditingBoard(board); setBoardFormOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteBoard(board)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold"><LayoutGrid className="w-3.5 h-3.5" /><span>{cols.length} colunas</span></span>
                        <span className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold"><List className="w-3.5 h-3.5" /><span>{board.total_cards || 0} cards</span></span>
                        {(board.done_cards || 0) > 0 && <span className="flex items-center space-x-1.5 text-emerald-600 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /><span>{board.done_cards} concluídos</span></span>}
                      </div>
                      {(board.total_cards || 0) > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-500">Progresso</span><span className={`text-[10px] font-extrabold ${progress === 100 ? 'text-emerald-600' : 'text-slate-600'}`}>{progress}%</span></div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${cc.bg} transition-all`} style={{ width: `${progress}%` }} /></div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="flex -space-x-1">
                          {cols.slice(0, 4).map((c) => (
                            <div key={c.name} className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: c.color }}>
                              <span className="text-[7px] font-black text-white">{c.name.charAt(0)}</span>
                            </div>
                          ))}
                          {cols.length > 4 && <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center"><span className="text-[7px] font-black text-slate-600">+{cols.length - 4}</span></div>}
                        </div>
                        <span className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
                          <span>Abrir</span><ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ KANBAN / HISTORY ═══════════════ */}
      {(view === 'kanban' || view === 'history') && activeBoard && (() => {
        const cc = getBoardColor(activeBoard.color);
        const columns = getColumns();
        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-150">
              <div className="flex items-center space-x-3">
                <button onClick={() => {
                  setView('boards'); setActiveBoardSafe(null);
                  window.history.replaceState(null, '', '/admin#atividades');
                  document.title = 'Atividades | Painel Shigueno';
                }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${cc.dot}`} />
                    <h2 className="text-lg font-black text-slate-900">{activeBoard.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{activeBoard.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
                {/* View tabs */}
                <div className="flex bg-slate-100 rounded-2xl p-1">
                  <button onClick={() => setView('kanban')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${view === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <LayoutGrid className="w-3.5 h-3.5" /><span>Kanban</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${view === 'kanban' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{cards.length}</span>
                  </button>
                  <button onClick={() => setView('history')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${view === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /><span>Concluídos</span>
                    {completedCards.length > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${view === 'history' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>{completedCards.length}</span>}
                  </button>
                </div>

                <button onClick={() => { if (activeBoard) fetchCards(activeBoard.id); }} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 cursor-pointer">
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Adicionar coluna — abre modal */}
                {canEdit && view === 'kanban' && (
                  <button onClick={() => { setNewColColor(COL_HEX[getColumns().length % COL_HEX.length]); setNewColName(''); setAddingColInline(true); }}
                    className="flex items-center space-x-1.5 px-3.5 py-2.5 border border-dashed border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 text-slate-500 hover:text-emerald-700 font-bold text-xs rounded-2xl cursor-pointer transition-all">
                    <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Coluna</span>
                  </button>
                )}

                {canEdit && view === 'kanban' && (
                  <button onClick={() => { setEditingCard(null); setDefaultColForNew(getColumns()[0]?.name); setCardFormOpen(true); }}
                    className={`flex items-center space-x-1.5 ${cc.bg} hover:opacity-90 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-sm cursor-pointer transition-all`}>
                    <Plus className="w-4 h-4" /><span>Novo Card</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            {view === 'kanban' && (
              <div className="relative max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar cards..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold placeholder:text-slate-400 outline-none focus:border-emerald-500 transition-all" />
                {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
              </div>
            )}

            {/* ── Kanban columns ── */}
            {view === 'kanban' && (
              <div className="flex gap-4 overflow-x-auto pb-4 items-start scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent" style={{ minHeight: 'calc(100vh - 320px)' }}>
                {getColumns().map((col, colIdx) => {
                  const colColor = getColPalette(col.color);
                  const colCards = cards.filter(c => {
                    if (c.status !== col.name) return false;
                    const q = search.trim().toLowerCase();
                    return !q || c.title.toLowerCase().includes(q) || (c.responsible || '').toLowerCase().includes(q);
                  });
                  const isOver = dragOverCol === col.name;
                  return (
                    <div key={col.name}
                      onDragOver={e => { e.preventDefault(); setDragOverCol(col.name); }}
                      onDragLeave={() => setDragOverCol(null)}
                      onDrop={e => handleDrop(e, col.name)}
                      className={`w-72 shrink-0 flex flex-col rounded-2xl transition-all duration-150 ${isOver ? 'ring-2 ring-offset-1' : ''}`}
                      style={isOver ? { '--tw-ring-color': col.color } as any : {}}>

                      {/* Faixa colorida no topo da coluna */}
                      <div className="h-1 rounded-t-2xl" style={{ backgroundColor: col.color }} />

                      {/* Column header — sem inline de edição */}
                      <div className={`flex items-center justify-between px-4 py-3 rounded-none border border-b-0 border-t-0 ${isOver ? colColor.light + ' ' + colColor.border : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between w-full group/hdr">
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate max-w-[120px]">{col.name}</span>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: col.color + '22', color: col.color }}>{colCards.length}</span>
                          </div>
                          <div className="flex items-center space-x-0.5 opacity-0 group-hover/hdr:opacity-100 transition-opacity">
                            <button onClick={() => { setRenamingCol(col.name); setRenamingVal(col.name); setRenamingColor(col.color); }}
                              className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer" title="Editar coluna">
                              <Edit className="w-3 h-3" />
                            </button>
                            <button onClick={() => setConfirmModal({ title: 'Excluir Coluna', message: `Excluir "${col.name}"? Cards serão movidos para a primeira coluna.`, onConfirm: async () => {
                              const filtered = getColumns().filter(c => c.name !== col.name);
                              const fallback = filtered[0]?.name || 'A Fazer';
                              for (const card of cards.filter(c => c.status === col.name))
                                await authFetch(`/api/activities/${card.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...card, sector: card.sector || '', status: fallback }) }).catch(() => {});
                              await updateColumns(filtered); setConfirmModal(null); if (activeBoard) fetchCards(activeBoard.id);
                            }})} className="p-1 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer" title="Excluir coluna">
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => { setEditingCard(null); setDefaultColForNew(col.name); setCardFormOpen(true); }}
                              className="p-1 hover:bg-emerald-100 rounded-lg text-slate-400 hover:text-emerald-600 cursor-pointer" title="Novo card aqui">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Cards */}
                      <div className={`flex-1 p-2 space-y-2 rounded-b-2xl border border-t-0 overflow-y-auto scrollbar-thin ${isOver ? colColor.light + ' ' + colColor.border + ' border-2 border-t-0' : 'bg-white/80 border-slate-200'}`}
                        style={{ minHeight: 120, maxHeight: 'calc(100vh - 380px)' }}>
                        {colCards.length === 0 ? (
                          <button onClick={() => { setEditingCard(null); setDefaultColForNew(col.name); setCardFormOpen(true); }}
                            className="w-full py-6 flex flex-col items-center space-y-1 text-slate-300 hover:text-slate-400 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-dashed border-slate-200 hover:border-slate-300">
                            <Plus className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Adicionar card</span>
                          </button>
                        ) : colCards.map(card => {
                          const pm = getPriority(card.priority);
                          const overdue = isOverdue(card.due_date);
                          const isDragging = draggedId === card.id;
                          return (
                            <div key={card.id} draggable
                              onDragStart={e => { setDraggedId(card.id); e.dataTransfer.setData('text/plain', String(card.id)); e.dataTransfer.effectAllowed = 'move'; }}
                              onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                              onClick={() => setDetailCard(card)}
                              className={`bg-white rounded-xl border p-3.5 shadow-xs hover:shadow-md cursor-pointer transition-all group/card relative ${isDragging ? 'opacity-25 scale-95' : 'hover:-translate-y-0.5'}`}
                              style={{ borderColor: col.color + '55' }}>
                              {/* Column color stripe — muda com a coluna */}
                              <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: col.color }} />
                              <div className="pl-3 space-y-2">
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="flex items-center space-x-1.5 min-w-0">
                                    <GripVertical className="w-3 h-3 text-slate-300 shrink-0" />
                                    {card.visibility === 'private' && <Lock className="w-2.5 h-2.5 text-indigo-400 shrink-0" />}
                                    <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{card.title}</h4>
                                  </div>
                                  <span className={`shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-lg ${pm.cls}`}>{card.priority}</span>
                                </div>
                                {card.description && <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed pl-0.5">{card.description}</p>}
                                <div className="flex items-center justify-between pt-0.5">
                                  {card.responsible ? (
                                    <div className="flex items-center space-x-1.5">
                                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-black text-emerald-700 shrink-0">{card.responsible.charAt(0)}</div>
                                      <span className="text-[9px] font-semibold text-slate-600 truncate max-w-[70px]">{card.responsible}</span>
                                    </div>
                                  ) : <div />}
                                  {card.due_date && (
                                    <span className={`flex items-center space-x-0.5 text-[9px] font-mono font-bold ${overdue ? 'text-rose-600' : 'text-slate-500'}`}>
                                      <Clock className="w-3 h-3" /><span>{formatDate(card.due_date)}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── History view ── */}
            {view === 'history' && (
              completedCards.length === 0 ? (
                <div className="py-16 flex flex-col items-center space-y-3 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center"><CheckCircle className="w-7 h-7 text-slate-300" /></div>
                  <p className="text-sm font-bold text-slate-500">Nenhum card concluído ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {completedCards.map(card => {
                    const cc2 = getBoardColor(activeBoard.color);
                    return (
                      <div key={card.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs group space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <h4 className="font-extrabold text-slate-500 text-sm line-through decoration-slate-300 truncate">{card.title}</h4>
                          </div>
                          <span className="shrink-0 bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg border border-emerald-200 uppercase">Concluído</span>
                        </div>
                        {card.description && <p className="text-[11px] text-slate-400 line-clamp-2">{card.description}</p>}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                          <div className="flex items-center space-x-2">
                            {card.responsible && <span className="flex items-center space-x-1.5 text-[9px] text-slate-500"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-black text-emerald-700">{card.responsible.charAt(0)}</div><span>{card.responsible}</span></span>}
                            {card.completed_at && <span className={`text-[9px] font-mono font-bold ${cc2.text} ${cc2.light} px-2 py-0.5 rounded-lg border ${cc2.border}`}>✅ {formatDate(card.completed_at)}</span>}
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => restoreCard(card)} className="flex items-center space-x-1 px-2 py-1 text-[9px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg cursor-pointer">
                              <RefreshCw className="w-2.5 h-2.5" /><span>Restaurar</span>
                            </button>
                            <button onClick={() => deleteCard(card)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        );
      })()}
    </div>
  );
}
