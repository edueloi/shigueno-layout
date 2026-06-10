import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Card padrão Shigueno — container branco com sombra suave e hover elegante.
 */
export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ElementType;
  /** Ações no canto direito do cabeçalho (botões, filtros) */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Remove o padding interno do corpo (tabelas full-bleed) */
  flush?: boolean;
  hover?: boolean;
}

export default function Card({ title, subtitle, icon: Icon, actions, children, className = '', flush = false, hover = true }: CardProps) {
  return (
    <div className={`
      bg-white rounded-2xl border border-slate-200/70
      shadow-[0_2px_12px_rgba(2,30,20,0.04)]
      ${hover ? 'hover:shadow-[0_8px_28px_rgba(2,30,20,0.08)] hover:border-slate-300/70 transition-all duration-300' : ''}
      ${className}
    `}>
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-emerald-800" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider truncate">{title}</h3>
              {subtitle && <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

/**
 * Card de KPI/estatística — número grande, ícone tonal, tendência opcional.
 *
 * <StatCard label="Vagas Ativas" value={12} icon={Briefcase} tone="emerald"
 *           trend={+8} hint="vs. mês anterior" />
 */
export type StatTone = 'emerald' | 'gold' | 'blue' | 'purple' | 'rose' | 'slate';

const STAT_TONES: Record<StatTone, { iconBox: string; accent: string; glow: string }> = {
  emerald: { iconBox: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/60', accent: 'from-emerald-600 to-emerald-400', glow: 'group-hover:shadow-emerald-600/15' },
  gold:    { iconBox: 'bg-amber-100/80 text-amber-700 border-amber-200/60',       accent: 'from-amber-500 to-amber-300',     glow: 'group-hover:shadow-amber-500/15' },
  blue:    { iconBox: 'bg-sky-100/80 text-sky-700 border-sky-200/60',             accent: 'from-sky-600 to-sky-400',         glow: 'group-hover:shadow-sky-600/15' },
  purple:  { iconBox: 'bg-violet-100/80 text-violet-700 border-violet-200/60',    accent: 'from-violet-600 to-violet-400',   glow: 'group-hover:shadow-violet-600/15' },
  rose:    { iconBox: 'bg-rose-100/80 text-rose-700 border-rose-200/60',          accent: 'from-rose-600 to-rose-400',       glow: 'group-hover:shadow-rose-600/15' },
  slate:   { iconBox: 'bg-slate-100 text-slate-600 border-slate-200/60',          accent: 'from-slate-500 to-slate-300',     glow: 'group-hover:shadow-slate-500/15' },
};

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  tone?: StatTone;
  /** Variação percentual (positiva = verde, negativa = vermelha) */
  trend?: number;
  hint?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon: Icon, tone = 'emerald', trend, hint, onClick }: StatCardProps) {
  const t = STAT_TONES[tone];
  const TrendIcon = trend === undefined ? Minus : trend >= 0 ? TrendingUp : TrendingDown;
  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white rounded-2xl border border-slate-200/70 p-5 overflow-hidden
        shadow-[0_2px_12px_rgba(2,30,20,0.04)] hover:shadow-[0_10px_30px_rgba(2,30,20,0.1)] ${t.glow}
        hover:-translate-y-0.5 transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Linha de acento no topo */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.accent} opacity-80`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 leading-none tracking-tight">{value}</p>
          {(trend !== undefined || hint) && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {trend !== undefined && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                }`}>
                  <TrendIcon className="w-3 h-3" />
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
              )}
              {hint && <span className="text-[10px] text-slate-400 font-bold">{hint}</span>}
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${t.iconBox}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

/**
 * Cabeçalho de seção reutilizável — título + subtítulo + ações alinhadas.
 */
export function SectionHeader({ title, subtitle, icon: Icon, actions }: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ElementType;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-700/40 flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/20">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold font-mono mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
