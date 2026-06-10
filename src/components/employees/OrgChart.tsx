import React from 'react';
import { ChevronDown, ChevronRight, Shield, Users } from 'lucide-react';
import { Employee, deptClass, levelClass, LEVEL_LABELS } from './helpers';
import Avatar from './Avatar';
import { EmptyState } from '../ui';

function buildOrgTree(employees: Employee[], parentId: number | null): Employee[] {
  return employees
    .filter(e => (e.manager_id ?? null) === parentId)
    .sort((a, b) =>
      (b.hierarchy_level || 1) - (a.hierarchy_level || 1) ||
      (a.full_name > b.full_name ? 1 : -1)
    );
}

// NodeRow declarado no topo do módulo — hooks funcionam corretamente na recursão.
function OrgNodeRow({ emp, depth, allEmployees, onView }: {
  emp: Employee;
  depth: number;
  allEmployees: Employee[];
  onView: (emp: Employee) => void;
  key?: any;
}) {
  const children: Employee[] = React.useMemo(
    () => buildOrgTree(allEmployees, emp.id),
    [allEmployees, emp.id]
  );
  const [open, setOpen] = React.useState(depth < 2);

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-xl transition-colors ${
          depth === 0
            ? 'bg-gradient-to-r from-emerald-50/80 to-slate-50 border border-emerald-100'
            : 'border-l-2 border-slate-200 mt-1 hover:bg-slate-50'
        }`}
        style={{ marginLeft: depth > 0 ? `${depth * 24}px` : undefined }}
      >
        <button onClick={() => onView(emp)} className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer text-left group">
          <Avatar emp={emp} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate group-hover:text-emerald-800 transition-colors">{emp.full_name}</p>
            <p className="text-[9px] text-slate-500 truncate">{emp.role}</p>
          </div>
        </button>
        {children.length > 0 && (
          <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
            <Users className="w-2.5 h-2.5" />{children.length}
          </span>
        )}
        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 hidden sm:inline ${levelClass(emp.hierarchy_level || 1)}`}>
          N{emp.hierarchy_level}·{LEVEL_LABELS[emp.hierarchy_level || 1]}
        </span>
        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border shrink-0 hidden xs:inline ${deptClass(emp.department)}`}>
          {emp.department}
        </span>
        {children.length > 0 ? (
          <button
            onClick={() => setOpen(v => !v)}
            className="p-1 rounded-lg cursor-pointer text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 shrink-0 transition-colors"
          >
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
      </div>

      {open && children.map(child => (
        <OrgNodeRow key={child.id} emp={child} depth={depth + 1} allEmployees={allEmployees} onView={onView} />
      ))}
    </div>
  );
}

export default function OrgChart({ employees, onView }: { employees: Employee[]; onView: (emp: Employee) => void }) {
  const roots = React.useMemo(() => buildOrgTree(employees, null), [employees]);

  if (roots.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/70">
        <EmptyState icon={Shield} title="Organograma vazio" message="Nenhum funcionário sem gestor encontrado para iniciar a árvore." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 space-y-1 overflow-x-auto shadow-[0_2px_12px_rgba(2,30,20,0.04)]">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Shield className="w-4 h-4 text-emerald-800" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Organograma Completo</p>
          <p className="text-[10px] text-slate-400 font-bold font-mono">Clique no nome para abrir o perfil · setas expandem/recolhem</p>
        </div>
      </div>
      {roots.map(root => (
        <OrgNodeRow key={root.id} emp={root} depth={0} allEmployees={employees} onView={onView} />
      ))}
    </div>
  );
}
