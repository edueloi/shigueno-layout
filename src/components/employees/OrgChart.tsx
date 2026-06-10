import React from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  Shield, Download, Eye, Phone, Mail, MapPin, Clock, Users, Network
} from 'lucide-react';
import { Employee, deptClass, statusStyle, LEVEL_LABELS, yearsLabel, avatarBg } from './helpers';
import { Button, EmptyState } from '../ui';
import { Portal } from '../../hooks/usePortal';

/**
 * Organograma visual do Grupo Shigueno — árvore com fotos circulares e conectores,
 * mini-card de informações no hover, clique abre o perfil completo,
 * e exportação em PDF estilizado (html-to-image + jsPDF).
 */

function buildOrgTree(employees: Employee[], parentId: number | null): Employee[] {
  return employees
    .filter(e => (e.manager_id ?? null) === parentId)
    .sort((a, b) =>
      (b.hierarchy_level || 1) - (a.hierarchy_level || 1) ||
      (a.full_name > b.full_name ? 1 : -1)
    );
}

/** Anel tracejado por status */
const RING_BY_STATUS: Record<string, string> = {
  'Ativo':     'border-emerald-400/80',
  'Férias':    'border-sky-400/80',
  'Afastado':  'border-amber-400/80',
  'Desligado': 'border-slate-500/60',
};

/** Foto circular com anel tracejado (estilo organograma clássico) */
function NodePhoto({ emp, size }: { emp: Employee; size: 'lg' | 'md' }) {
  const outer = size === 'lg' ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16 sm:w-18 sm:h-18';
  const inner = size === 'lg' ? 'w-16 h-16 sm:w-20 sm:h-20 text-xl' : 'w-12 h-12 sm:w-14 sm:h-14 text-base';
  const ring = RING_BY_STATUS[emp.status] || RING_BY_STATUS['Desligado'];
  return (
    <div className={`${outer} rounded-full border-2 border-dashed ${ring} flex items-center justify-center bg-white/5 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]`}>
      {emp.photo_path ? (
        <img src={`/api/employees/${emp.id}/photo`} alt={emp.full_name} className={`${inner} rounded-full object-cover ring-2 ring-white/90`} />
      ) : (
        <div className={`${inner} rounded-full ${avatarBg(emp.id)} flex items-center justify-center text-white font-black ring-2 ring-white/90`}>
          {emp.avatar_initials || emp.full_name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

/** Conteúdo do mini-card de informações do nó */
function HoverCardContent({ emp, onView }: { emp: Employee; onView: () => void }) {
  const st = statusStyle(emp.status);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_18px_50px_rgba(2,30,20,0.35)] p-4 text-left space-y-3 cursor-default">
        {/* Identificação */}
        <div className="flex items-center gap-2.5">
          {emp.photo_path ? (
            <img src={`/api/employees/${emp.id}/photo`} alt={emp.full_name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
          ) : (
            <div className={`w-10 h-10 rounded-xl ${avatarBg(emp.id)} flex items-center justify-center text-white text-sm font-black shrink-0`}>
              {emp.avatar_initials || emp.full_name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">{emp.full_name}</p>
            <p className="text-[10px] text-slate-500 font-semibold truncate">{emp.role}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${deptClass(emp.department)}`}>{emp.department}</span>
          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${st.badge}`}>
            <span className={`w-1 h-1 rounded-full ${st.dot}`} />{emp.status}
          </span>
          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border bg-slate-50 text-slate-500 border-slate-200">
            N{emp.hierarchy_level} · {LEVEL_LABELS[emp.hierarchy_level || 1]}
          </span>
        </div>

        {/* Infos rápidas */}
        <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
          {emp.phone && (
            <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-600 shrink-0" />{emp.phone}</p>
          )}
          {emp.email && (
            <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 text-sky-600 shrink-0" />{emp.email}</p>
          )}
          {emp.work_location && (
            <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-600 shrink-0" />{emp.work_location}</p>
          )}
          <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />{yearsLabel(emp.years_of_service)} de casa{emp.age ? ` · ${emp.age} anos` : ''}
          </p>
        </div>

        <Button variant="primary" size="xs" icon={Eye} fullWidth onClick={onView}>Ver Perfil Completo</Button>
    </div>
  );
}

const HOVER_CARD_HEIGHT = 340; // altura estimada do mini-card (px) para decidir abrir acima/abaixo

/** Nó da árvore (recursivo) — mini-card renderizado via Portal (nunca é cortado pelo scroll) */
function TreeNode({ emp, depth, allEmployees, onView }: {
  emp: Employee;
  depth: number;
  allEmployees: Employee[];
  onView: (emp: Employee) => void;
  key?: any;
}) {
  const children = React.useMemo(() => buildOrgTree(allEmployees, emp.id), [allEmployees, emp.id]);
  const [hover, setHover] = React.useState<{ x: number; y: number; above: boolean } | null>(null);
  const hideTimer = React.useRef<any>(null);

  const showCard = (e: any) => {
    clearTimeout(hideTimer.current);
    const r = e.currentTarget.getBoundingClientRect();
    const above = r.bottom + HOVER_CARD_HEIGHT > window.innerHeight;
    // Clampa o X para o card não vazar das bordas da janela
    const x = Math.min(Math.max(r.left + r.width / 2, 145), window.innerWidth - 145);
    setHover({ x, y: above ? r.top : r.bottom, above });
  };
  const hideCard = () => {
    hideTimer.current = setTimeout(() => setHover(null), 150);
  };
  const keepCard = () => clearTimeout(hideTimer.current);

  return (
    <li>
      <div
        className="group relative flex flex-col items-center cursor-pointer"
        onClick={() => onView(emp)}
        onMouseEnter={showCard}
        onMouseLeave={hideCard}
      >
        <NodePhoto emp={emp} size={depth === 0 ? 'lg' : 'md'} />
        <p className="mt-2 text-[11px] sm:text-xs font-black text-white text-center leading-tight max-w-[120px] group-hover:text-amber-300 transition-colors">
          {emp.full_name}
        </p>
        <p className="text-[9px] text-emerald-300/90 font-bold text-center max-w-[120px] leading-tight mt-0.5">{emp.role}</p>
        <span className="mt-1 text-[8px] font-black uppercase text-emerald-200/80 bg-white/5 border border-emerald-700/40 px-1.5 py-0.5 rounded-md font-mono">
          N{emp.hierarchy_level}{children.length > 0 ? ` · ${children.length} sub` : ''}
        </span>
      </div>

      {/* Mini-card flutuante — portal com posição fixa na tela */}
      {hover && (
        <Portal>
          <div
            className="hidden sm:block fixed z-[9990] w-72 animate-scale-in"
            style={{
              left: hover.x,
              transform: 'translateX(-50%)',
              ...(hover.above
                ? { bottom: window.innerHeight - hover.y + 10 }
                : { top: hover.y + 10 }),
            }}
            onMouseEnter={keepCard}
            onMouseLeave={hideCard}
          >
            <HoverCardContent emp={emp} onView={() => { setHover(null); onView(emp); }} />
          </div>
        </Portal>
      )}

      {children.length > 0 && (
        <ul>
          {children.map(child => (
            <TreeNode key={child.id} emp={child} depth={depth + 1} allEmployees={allEmployees} onView={onView} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function OrgChart({ employees, onView }: { employees: Employee[]; onView: (emp: Employee) => void }) {
  const roots = React.useMemo(() => buildOrgTree(employees, null), [employees]);
  const treeRef = React.useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = React.useState(false);

  const exportPdf = async () => {
    if (!treeRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(treeRef.current, {
        pixelRatio: 2.5,
        backgroundColor: '#071a10',
        cacheBust: true,
      });
      const img = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve({ w: im.width, h: im.height });
        im.onerror = reject;
        im.src = dataUrl;
      });

      const pdf = new jsPDF({ orientation: img.w >= img.h ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const now = new Date();

      // Faixa de cabeçalho verde Shigueno
      pdf.setFillColor(6, 21, 12);
      pdf.rect(0, 0, pw, 20, 'F');
      pdf.setFillColor(251, 191, 36);
      pdf.rect(0, 20, pw, 1.2, 'F');
      pdf.setTextColor(251, 191, 36);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('GRUPO SHIGUENO', 10, 9.5);
      pdf.setTextColor(167, 243, 208);
      pdf.setFontSize(8);
      pdf.text('Organograma Corporativo · Equipe & Hierarquia', 10, 15.5);
      pdf.setTextColor(203, 213, 225);
      pdf.setFontSize(8);
      pdf.text(now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), pw - 10, 12.5, { align: 'right' });

      // Árvore centralizada na área útil
      const margin = 8;
      const top = 26;
      const availW = pw - margin * 2;
      const availH = ph - top - margin - 8;
      const ratio = Math.min(availW / img.w, availH / img.h);
      const w = img.w * ratio;
      const h = img.h * ratio;
      pdf.addImage(dataUrl, 'PNG', (pw - w) / 2, top + (availH - h) / 2, w, h);

      // Rodapé
      pdf.setFontSize(7);
      pdf.setTextColor(130, 140, 150);
      pdf.text(
        `Documento gerado pelo Painel do Gestor Shigueno em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ${employees.length} colaborador(es)`,
        pw / 2, ph - 4, { align: 'center' }
      );

      const stamp = now.toISOString().slice(0, 10);
      pdf.save(`organograma-shigueno-${stamp}.pdf`);
    } catch (e) {
      console.error('Falha ao gerar PDF do organograma:', e);
    } finally {
      setExporting(false);
    }
  };

  if (roots.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/70">
        <EmptyState icon={Shield} title="Organograma vazio" message="Nenhum funcionário sem gestor encontrado para iniciar a árvore." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(2,30,20,0.04)] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Network className="w-4.5 h-4.5 text-emerald-800" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 uppercase tracking-wide">Organograma Corporativo</p>
            <p className="text-[10px] text-slate-400 font-bold font-mono truncate">
              Passe o mouse para detalhes · clique para o perfil completo
            </p>
          </div>
        </div>
        <Button variant="gold" size="sm" icon={Download} loading={exporting} onClick={exportPdf}>
          {exporting ? 'Gerando PDF...' : 'Baixar PDF'}
        </Button>
      </div>

      {/* Árvore — canvas escuro Shigueno com scroll horizontal */}
      <div className="overflow-auto rounded-3xl border border-emerald-900/40 shadow-[0_15px_45px_rgba(2,30,20,0.25)]">
        <div
          ref={treeRef}
          className="org-tree w-max min-w-full bg-gradient-to-br from-[#071a10] via-[#0a2316] to-[#0d3320] px-8 sm:px-14 pt-8 sm:pt-10 pb-12 sm:pb-16"
        >
          {/* Cabeçalho da empresa dentro do canvas (sai no PDF) */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-amber-400/90 flex items-center justify-center bg-white/5 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#06150c] ring-2 ring-white/90 flex items-center justify-center p-2.5">
                <img src="/images/shigueno-logo.png" alt="Shigueno" className="w-full h-full object-contain" />
              </div>
            </div>
            <p className="mt-2.5 text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300 uppercase tracking-widest">Grupo Shigueno</p>
            <p className="text-[9px] text-emerald-300 font-bold font-mono uppercase tracking-[0.25em] mt-0.5 flex items-center gap-1.5">
              <Users className="w-3 h-3" />Organograma · {employees.length} colaboradores
            </p>
          </div>

          {/* Árvore raiz: a empresa "vira" o nó pai dos sem-gestor */}
          <ul>
            <li>
              {/* Conector da empresa para os roots */}
              <div className="h-0" />
              <ul>
                {roots.map(root => (
                  <TreeNode key={root.id} emp={root} depth={0} allEmployees={employees} onView={onView} />
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
