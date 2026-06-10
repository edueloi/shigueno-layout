import React from 'react';
import { Eye, Edit, Trash2, ChevronUp, MapPin, Phone, Mail, Cake, Clock } from 'lucide-react';
import { Employee, deptClass, levelClass, statusStyle, LEVEL_LABELS, yearsLabel, birthdayIn, fmtDateShort } from './helpers';
import Avatar from './Avatar';
import { Button } from '../ui';

/**
 * Card premium do funcionário — banner com cor do status, avatar sobreposto,
 * contato rápido e métricas. Clique abre o perfil completo.
 */
export default function EmployeeCard({ emp, onView, onEdit, onDelete, canEdit }: {
  emp: Employee;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  key?: any;
}) {
  const days = birthdayIn(emp.birth_mmdd);
  const isBday = days === 0;
  const bdaySoon = days !== null && days > 0 && days <= 7;
  const st = statusStyle(emp.status);

  return (
    <div className={`
      group bg-white rounded-2xl border overflow-hidden flex flex-col
      shadow-[0_2px_12px_rgba(2,30,20,0.05)] transition-all duration-300
      hover:shadow-[0_14px_38px_rgba(2,30,20,0.12)] hover:-translate-y-1
      ${isBday ? 'border-amber-300 ring-2 ring-amber-200/60' : 'border-slate-200/70 hover:border-emerald-300/60'}
    `}>
      {/* Banner com cor do status */}
      <div className={`relative h-16 bg-gradient-to-r ${isBday ? 'from-amber-400 to-amber-300' : st.strip} overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/15 pointer-events-none" />
        <div className="absolute -bottom-10 left-12 w-20 h-20 rounded-full bg-black/5 pointer-events-none" />

        {/* Status + aniversário */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {isBday && (
            <span className="text-[9px] font-black uppercase bg-white text-amber-600 px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
              <Cake className="w-3 h-3" />Hoje!
            </span>
          )}
          {bdaySoon && !isBday && (
            <span className="text-[9px] font-black uppercase bg-white/90 text-amber-600 px-2 py-1 rounded-lg flex items-center gap-1">
              <Cake className="w-3 h-3" />{days}d
            </span>
          )}
          <span className="text-[9px] font-black uppercase bg-white/95 text-slate-700 px-2 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${emp.status === 'Ativo' ? 'animate-pulse' : ''}`} />
            {emp.status}
          </span>
        </div>
      </div>

      {/* Avatar sobreposto + identificação */}
      <div className="px-4 -mt-8 cursor-pointer" onClick={onView}>
        <div className="flex items-end justify-between">
          <Avatar emp={emp} size="lg" ring />
          <div className="flex flex-wrap gap-1 justify-end pb-0.5 max-w-[55%]">
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${deptClass(emp.department)}`}>{emp.department}</span>
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${levelClass(emp.hierarchy_level)}`}>N{emp.hierarchy_level} · {LEVEL_LABELS[emp.hierarchy_level]}</span>
          </div>
        </div>
        <div className="mt-2.5">
          <p className="text-sm font-black text-slate-900 leading-tight truncate group-hover:text-emerald-900 transition-colors">{emp.full_name}</p>
          <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">{emp.role}</p>
          {emp.manager_name && (
            <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate mt-1">
              <ChevronUp className="w-3 h-3 shrink-0 text-slate-300" />
              Responde para <span className="font-bold text-slate-500">{emp.manager_name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="px-4 mt-3 mb-3 grid grid-cols-3 gap-1.5">
        <div className="bg-slate-50 rounded-xl px-2 py-2 text-center">
          <Clock className="w-3 h-3 text-slate-300 mx-auto mb-1" />
          <p className="text-[10px] font-black text-slate-800 leading-none">{yearsLabel(emp.years_of_service)}</p>
          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Casa</p>
        </div>
        <div className={`rounded-xl px-2 py-2 text-center ${isBday ? 'bg-amber-50' : 'bg-slate-50'}`}>
          <Cake className={`w-3 h-3 mx-auto mb-1 ${isBday ? 'text-amber-500' : 'text-slate-300'}`} />
          <p className={`text-[10px] font-black leading-none ${isBday ? 'text-amber-600' : 'text-slate-800'}`}>
            {isBday ? '🎂 Hoje' : bdaySoon && days !== null ? `${days}d` : fmtDateShort(emp.birth_date)}
          </p>
          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Aniv.</p>
        </div>
        <div className="bg-slate-50 rounded-xl px-2 py-2 text-center">
          <MapPin className="w-3 h-3 text-slate-300 mx-auto mb-1" />
          <p className="text-[10px] font-black text-slate-800 leading-none truncate" title={emp.work_location}>
            {emp.work_location ? emp.work_location.split(' (')[0] : '—'}
          </p>
          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Local</p>
        </div>
      </div>

      {/* Ações */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-1.5 mt-auto">
        <Button variant="outline" size="xs" icon={Eye} onClick={onView} className="flex-1">
          Ver Perfil
        </Button>
        {/* Contato rápido */}
        {emp.phone && (
          <a href={`tel:${emp.phone}`} onClick={e => e.stopPropagation()} title={emp.phone}
            className="p-2 rounded-lg border border-slate-150 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer">
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
        {emp.email && (
          <a href={`mailto:${emp.email}`} onClick={e => e.stopPropagation()} title={emp.email}
            className="p-2 rounded-lg border border-slate-150 text-slate-400 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-colors cursor-pointer">
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        {canEdit && (
          <>
            <button onClick={e => { e.stopPropagation(); onEdit(); }} title="Editar"
              className="p-2 rounded-lg border border-slate-150 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer">
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }} title="Remover"
              className="p-2 rounded-lg border border-slate-150 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
