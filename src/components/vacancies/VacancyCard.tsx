import React from 'react';
import { MapPin, Users, Eye, Edit, Trash2, FileText, CalendarPlus, Layers, BadgeDollarSign } from 'lucide-react';
import { Vacancy, deptClass, levelClass, vacancyStatusStyle, LEVEL_LABELS, fmtCreatedAt, daysOpen } from './helpers';
import { Button } from '../ui';

/**
 * Card premium de vaga — faixa de status, badges de área/nível/contrato,
 * data de criação e ações rápidas.
 */
export default function VacancyCard({ vacancy: v, candidateCount, canEdit, onView, onPoster, onEdit, onDelete }: {
  vacancy: Vacancy;
  candidateCount: number;
  canEdit: boolean;
  onView: () => void;
  onPoster: () => void;
  onEdit: () => void;
  onDelete: () => void;
  key?: any;
}) {
  const st = vacancyStatusStyle(v.status);
  const created = fmtCreatedAt(v.created_at);
  const days = daysOpen(v.created_at);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/70 hover:border-emerald-300/60 shadow-[0_2px_12px_rgba(2,30,20,0.05)] hover:shadow-[0_14px_38px_rgba(2,30,20,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Faixa de status */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${st.strip}`} />

      <div className="p-5 flex flex-col flex-1 space-y-3">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border font-mono ${deptClass(v.department)}`}>
                {v.department}
              </span>
              {v.hierarchy_level ? (
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${levelClass(v.hierarchy_level)}`}>
                  N{v.hierarchy_level} · {LEVEL_LABELS[v.hierarchy_level]}
                </span>
              ) : null}
            </div>
            <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-emerald-900 transition-colors">{v.title}</h3>
          </div>
          <span className={`shrink-0 inline-flex items-center px-2 py-1 rounded-full text-[9px] font-black uppercase border ${st.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${st.dot} ${v.status === 'Ativa' ? 'animate-pulse' : ''}`} />
            {v.status}
          </span>
        </div>

        {/* Infos */}
        <div className="space-y-1.5 text-xs text-slate-600 cursor-pointer" onClick={onView}>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 font-bold">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{v.location}
            </span>
            {v.contract_type && (
              <span className="flex items-center gap-1 font-bold text-slate-500">
                <Layers className="w-3 h-3 text-slate-400" />{v.contract_type}
              </span>
            )}
            {v.salary_range && (
              <span className="flex items-center gap-1 font-bold text-emerald-700">
                <BadgeDollarSign className="w-3 h-3" />{v.salary_range}
              </span>
            )}
          </div>
          <p className="text-slate-500 line-clamp-2 leading-relaxed font-medium">{v.description}</p>
        </div>

        {/* Métricas */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
            <Users className="w-3 h-3" />
            {candidateCount} candidato{candidateCount !== 1 ? 's' : ''}
          </span>
          {(v.openings || 1) > 1 && (
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
              {v.openings} posições
            </span>
          )}
          {created && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 ml-auto" title={`Criada em ${created}`}>
              <CalendarPlus className="w-3 h-3" />
              {created}{days !== null && days > 0 ? ` · há ${days}d` : days === 0 ? ' · hoje' : ''}
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="pt-3 mt-auto border-t border-slate-100 flex items-center gap-1.5">
          <Button variant="outline" size="xs" icon={Eye} onClick={onView} className="flex-1">Detalhes</Button>
          <Button variant="success" size="xs" icon={FileText} onClick={onPoster}>Cartaz</Button>
          {canEdit && (
            <>
              <button onClick={onEdit} title="Editar"
                className="p-2 rounded-lg border border-slate-150 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={onDelete} title="Excluir"
                className="p-2 rounded-lg border border-slate-150 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
