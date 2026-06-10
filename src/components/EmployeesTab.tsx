import React from 'react';
import {
  Users, Plus, Search, Edit, Trash2, RefreshCw, Cake, TrendingUp,
  Layers, LayoutGrid, List, Network, UserPlus
} from 'lucide-react';
import {
  Employee, deptClass, levelClass, statusStyle, LEVEL_LABELS,
  yearsLabel, birthdayIn, fmtDate, fmtDateShort
} from './employees/helpers';
import Avatar from './employees/Avatar';
import EmployeeCard from './employees/EmployeeCard';
import EmployeeDetailModal from './employees/EmployeeDetailModal';
import EmployeeFormModal from './employees/EmployeeFormModal';
import OrgChart from './employees/OrgChart';
import { StatCard, Card, Button, Input, Select, ConfirmModal, Toast, EmptyState, Skeleton } from './ui';

/**
 * Equipe & Hierarquia — tela de RH componentizada.
 * Cadastro/edição e perfil completo abrem em modais responsivos.
 */
export default function EmployeesTab({ token, canEdit }: { token: string; canEdit: boolean }) {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('Todos');
  const [statusFilter, setStatusFilter] = React.useState('Ativo');
  const [viewMode, setViewMode] = React.useState<'cards' | 'list' | 'org'>('cards');

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingEmp, setEditingEmp] = React.useState<Employee | undefined>(undefined);
  const [viewingEmp, setViewingEmp] = React.useState<(Employee & { reports?: Employee[] }) | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; name: string } | null>(null);

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: token } });

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams();
      if (deptFilter !== 'Todos') p.set('dept', deptFilter);
      if (statusFilter !== 'Todos') p.set('status', statusFilter);
      if (search.trim()) p.set('search', search.trim());
      const res = await fetch(`/api/employees?${p}`);
      const d = await res.json();
      if (d.success) { setEmployees(d.employees || []); setUpcomingBirthdays(d.upcoming_birthdays || []); }
    } catch { setError('Erro ao carregar equipe.'); }
    finally { setLoading(false); }
  }, [deptFilter, statusFilter, search]);

  React.useEffect(() => { load(); }, [load]);

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
      const photoFile: File | null = data._photoFile || null;
      delete data._photoFile;
      const url = editingEmp ? `/api/employees/${editingEmp.id}` : '/api/employees';
      const method = editingEmp ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      if (photoFile) {
        const empId = editingEmp?.id || json.id;
        const fd = new FormData();
        fd.append('photo', photoFile);
        await authFetch(`/api/employees/${empId}/photo`, { method: 'POST', body: fd });
      }
      setSuccess(editingEmp ? 'Funcionário atualizado com sucesso.' : 'Funcionário cadastrado com sucesso!');
      setFormOpen(false); setEditingEmp(undefined); load();
    } catch { setError('Erro de rede ao salvar.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await authFetch(`/api/employees/${deleteTarget.id}`, { method: 'DELETE' });
      setSuccess('Funcionário removido.');
      if (viewingEmp?.id === deleteTarget.id) setViewingEmp(null);
      load();
    } catch { setError('Erro ao remover.'); }
    finally { setDeleteTarget(null); }
  };

  const allDepts = React.useMemo(() => {
    const s = new Set(employees.map(e => e.department));
    return ['Todos', ...Array.from(s).sort()];
  }, [employees]);

  const totalActive = employees.filter(e => e.status === 'Ativo').length;
  const avgYears = (() => {
    const v = employees.map(e => e.years_of_service).filter((y): y is number => y !== undefined && y !== null);
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
  })();

  const openNew = () => { setEditingEmp(undefined); setFormOpen(true); };
  const openEdit = (emp: Employee) => { setEditingEmp(emp); setFormOpen(true); setViewingEmp(null); };

  const VIEW_MODES = [
    { key: 'cards' as const, label: 'Cards', icon: LayoutGrid },
    { key: 'list' as const,  label: 'Lista', icon: List },
    { key: 'org' as const,   label: 'Org',   icon: Network },
  ];

  return (
    <div className="space-y-5">
      {/* Toasts */}
      {success && <Toast tone="success" message={success} onClose={() => setSuccess(null)} />}
      {error && <Toast tone="error" message={error} onClose={() => setError(null)} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Funcionários" value={totalActive} icon={Users} tone="emerald" hint="ativos na equipe" />
        <StatCard label="Departamentos" value={new Set(employees.map(e => e.department)).size} icon={Layers} tone="blue" hint="áreas do grupo" />
        <StatCard label="Tempo Médio" value={`${avgYears} ano${avgYears !== 1 ? 's' : ''}`} icon={TrendingUp} tone="gold" hint="de casa" />
        <StatCard label="Aniversários" value={upcomingBirthdays.length} icon={Cake} tone="rose" hint="próximos 30 dias" />
      </div>

      {/* Aniversários próximos */}
      {upcomingBirthdays.length > 0 && (
        <Card title="Aniversários nos Próximos 30 Dias" subtitle="Clique para abrir o perfil" icon={Cake}>
          <div className="flex flex-wrap gap-2">
            {upcomingBirthdays.map(e => {
              const d = birthdayIn(e.birth_mmdd);
              const today = d === 0;
              return (
                <button key={e.id} onClick={() => openDetail(e)}
                  className={`rounded-xl px-3 py-2 flex items-center gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md border ${
                    today ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-200' : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}>
                  <Avatar emp={e} size="sm" />
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-slate-900">{e.full_name}</p>
                    <p className={`text-[9px] font-black ${today ? 'text-amber-600' : 'text-amber-500'}`}>
                      {today ? '🎂 Hoje!' : `em ${d}d`}{e.birth_date ? ` · ${fmtDateShort(e.birth_date)}` : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Barra de filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(2,30,20,0.04)] p-3 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Buscar nome, cargo ou departamento..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={deptFilter} onChange={(e: any) => setDeptFilter(e.target.value)} className="w-auto min-w-[120px]">
            {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)} className="w-auto min-w-[110px]">
            <option value="Todos">Todos</option><option>Ativo</option><option>Afastado</option><option>Férias</option><option>Desligado</option>
          </Select>

          {/* Alternador de visualização */}
          <div className="flex bg-slate-100 rounded-xl p-0.5">
            {VIEW_MODES.map(({ key, label, icon: VIcon }) => (
              <button key={key} onClick={() => setViewMode(key)}
                className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === key ? 'bg-white shadow-sm text-emerald-800' : 'text-slate-400 hover:text-slate-600'
                }`}>
                <VIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" icon={RefreshCw} loading={loading} onClick={load} title="Recarregar" />
          {canEdit && (
            <Button variant="primary" size="sm" icon={Plus} onClick={openNew}>
              Novo Funcionário
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl">
          <EmptyState
            icon={Users}
            title="Nenhum funcionário encontrado"
            message={canEdit ? 'Cadastre a equipe para montar a hierarquia do Grupo Shigueno.' : 'Ajuste os filtros para encontrar quem procura.'}
            action={canEdit ? <Button variant="primary" icon={UserPlus} onClick={openNew}>Cadastrar Primeiro Funcionário</Button> : undefined}
          />
        </div>
      ) : (
        <>
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {employees.map(e => (
                <EmployeeCard
                  key={e.id}
                  emp={e}
                  canEdit={canEdit}
                  onView={() => openDetail(e)}
                  onEdit={() => openEdit(e)}
                  onDelete={() => setDeleteTarget({ id: e.id, name: e.full_name })}
                />
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(2,30,20,0.04)] overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gradient-to-r from-slate-50 to-emerald-50/40 border-b border-slate-100">
                  <tr>{['Funcionário', 'Cargo', 'Depto', 'Nível', 'Gestor', 'Admissão', 'Tempo', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap font-mono">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map(e => {
                    const d = birthdayIn(e.birth_mmdd); const bd = d !== null && d <= 7;
                    const st = statusStyle(e.status);
                    return (
                      <tr key={e.id} className="hover:bg-emerald-50/30 cursor-pointer transition-colors" onClick={() => openDetail(e)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar emp={e} size="sm" />
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 truncate">{e.full_name}</p>
                              {bd && <p className="text-[9px] text-amber-600 font-bold">🎂 {d === 0 ? 'Hoje!' : 'em ' + d + 'd'}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-semibold whitespace-nowrap">{e.role}</td>
                        <td className="px-4 py-3"><span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${deptClass(e.department)}`}>{e.department}</span></td>
                        <td className="px-4 py-3"><span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${levelClass(e.hierarchy_level || 1)}`}>N{e.hierarchy_level}·{LEVEL_LABELS[e.hierarchy_level || 1]}</span></td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{e.manager_name || <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">{fmtDate(e.hire_date)}</td>
                        <td className="px-4 py-3 font-bold whitespace-nowrap">{yearsLabel(e.years_of_service)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${st.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{e.status}
                          </span>
                        </td>
                        {canEdit && <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteTarget({ id: e.id, name: e.full_name })} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'org' && <OrgChart employees={employees} onView={openDetail} />}
        </>
      )}

      {/* Modal de perfil completo */}
      {viewingEmp && (
        <EmployeeDetailModal
          emp={viewingEmp}
          canEdit={canEdit}
          onClose={() => setViewingEmp(null)}
          onEdit={() => openEdit(viewingEmp)}
        />
      )}

      {/* Modal de cadastro/edição */}
      {formOpen && canEdit && (
        <EmployeeFormModal
          initial={editingEmp}
          employees={employees}
          onSave={handleSave}
          onCancel={() => { setFormOpen(false); setEditingEmp(undefined); }}
          saving={saving}
        />
      )}

      {/* Confirmação de exclusão */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        tone="danger"
        title="Remover Funcionário"
        message={<>Deseja remover <strong>{deleteTarget?.name}</strong>? Subordinados terão o vínculo de gestor removido automaticamente.</>}
        confirmLabel="Confirmar Exclusão"
      />
    </div>
  );
}
