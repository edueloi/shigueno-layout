import React from 'react';
import {
  X, Edit, FileText, MapPin, Users, Layers, BadgeDollarSign,
  CalendarPlus, ClipboardList, ListChecks, Briefcase, Hash
} from 'lucide-react';
import { Vacancy, deptClass, levelClass, vacancyStatusStyle, LEVEL_LABELS, fmtCreatedAt, daysOpen } from './helpers';
import { Modal, Button } from '../ui';

/**
 * Detalhes completos da vaga — header escuro Shigueno com métricas,
 * descrição/requisitos formatados e atalho para o Cartaz A4.
 */
export default function VacancyDetailModal({ vacancy: v, candidateCount, canEdit, onClose, onEdit, onPoster }: {
  vacancy: Vacancy;
  candidateCount: number;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
  onPoster: () => void;
}) {
  const st = vacancyStatusStyle(v.status);
  const created = fmtCreatedAt(v.created_at);
  const days = daysOpen(v.created_at);
  const reqList = (v.requirements || '').split(/[;\n]+/).map(r => r.trim()).filter(Boolean);

  const header = (
    <div className="relative bg-gradient-to-br from-[#06150c] via-[#0a2316] to-[#0d3320] text-white px-5 sm:px-7 pt-6 pb-5 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-14 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer z-10">
        <X className="w-4.5 h-4.5" />
      </button>

      <div className="relative flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
          <Briefcase className="w-7 h-7 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${deptClass(v.department)}`}>{v.department}</span>
            {v.hierarchy_level ? (
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${levelClass(v.hierarchy_level)}`}>
                N{v.hierarchy_level} · {LEVEL_LABELS[v.hierarchy_level]}
              </span>
            ) : null}
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${st.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{v.status}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">{v.title}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] font-bold text-emerald-200">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" />{v.location}</span>
            {v.contract_type && <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-amber-400" />{v.contract_type}</span>}
            <span className="flex items-center gap-1.5 font-mono"><Hash className="w-3.5 h-3.5 text-amber-400" />Vaga {v.id}</span>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="relative grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-black text-white">{candidateCount}</p>
          <p className="text-[9px] text-emerald-300 uppercase font-black tracking-wider font-mono mt-0.5">Candidatos</p>
        </div>
        <div className="text-center border-x border-white/10">
          <p className="text-lg sm:text-2xl font-black text-amber-400">{v.openings || 1}</p>
          <p className="text-[9px] text-emerald-300 uppercase font-black tracking-wider font-mono mt-0.5">Posições</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-black text-white">{days !== null ? (days === 0 ? 'Hoje' : `${days}d`) : '—'}</p>
          <p className="text-[9px] text-emerald-300 uppercase font-black tracking-wider font-mono mt-0.5">No ar</p>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      header={header}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          <Button variant="gold" icon={FileText} onClick={onPoster}>Gerar Cartaz A4</Button>
          {canEdit && <Button variant="primary" icon={Edit} onClick={onEdit}>Editar Vaga</Button>}
        </>
      }
    >
      <div className="space-y-4">
        {/* Linha de dados rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {created && (
            <div className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest font-mono flex items-center gap-1"><CalendarPlus className="w-3 h-3" />Criada em</p>
              <p className="text-xs font-black text-slate-800 mt-1">{created}</p>
            </div>
          )}
          <div className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest font-mono flex items-center gap-1"><Users className="w-3 h-3" />Candidaturas</p>
            <p className="text-xs font-black text-slate-800 mt-1">{candidateCount} recebida{candidateCount !== 1 ? 's' : ''}</p>
          </div>
          {v.salary_range && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
              <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest font-mono flex items-center gap-1"><BadgeDollarSign className="w-3 h-3" />Faixa Salarial</p>
              <p className="text-xs font-black text-emerald-800 mt-1">{v.salary_range}</p>
            </div>
          )}
        </div>

        {/* Descrição */}
        <section className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Descrição das Atribuições</h3>
          </div>
          <p className="px-4 py-3.5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{v.description}</p>
        </section>

        {/* Requisitos em lista */}
        <section className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/60">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ListChecks className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Requisitos Técnicos / Cursos</h3>
          </div>
          <ul className="px-4 py-3.5 space-y-2">
            {reqList.length > 0 ? reqList.map((r, i) => (
              <li key={i} className="text-xs text-slate-700 font-semibold flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                {r}
              </li>
            )) : (
              <li className="text-xs text-slate-400 italic">Nenhum requisito cadastrado.</li>
            )}
          </ul>
        </section>
      </div>
    </Modal>
  );
}
