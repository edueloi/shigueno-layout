import React from 'react';

/**
 * Badge/etiqueta de status padrão Shigueno.
 *
 * <Badge tone="emerald" dot>Ativa</Badge>
 */
export type BadgeTone = 'emerald' | 'gold' | 'blue' | 'purple' | 'rose' | 'slate' | 'dark';

const TONES: Record<BadgeTone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  gold:    'bg-amber-50 text-amber-700 border-amber-200',
  blue:    'bg-sky-50 text-sky-700 border-sky-200',
  purple:  'bg-violet-50 text-violet-700 border-violet-200',
  rose:    'bg-rose-50 text-rose-700 border-rose-200',
  slate:   'bg-slate-100 text-slate-600 border-slate-200',
  dark:    'bg-[#0a1e13] text-emerald-300 border-emerald-900',
};

const DOT_TONES: Record<BadgeTone, string> = {
  emerald: 'bg-emerald-500',
  gold:    'bg-amber-500',
  blue:    'bg-sky-500',
  purple:  'bg-violet-500',
  rose:    'bg-rose-500',
  slate:   'bg-slate-400',
  dark:    'bg-emerald-400',
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: React.ElementType;
  /** Bolinha de status pulsante */
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ tone = 'slate', icon: Icon, dot = false, children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide border px-2.5 py-1 rounded-lg ${TONES[tone]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${DOT_TONES[tone]}`} />}
      {Icon && <Icon className="w-3 h-3" />}
      <span>{children}</span>
    </span>
  );
}

/** Mapeia status comuns do sistema para o tom certo do badge. */
export function statusTone(status: string): BadgeTone {
  const s = (status || '').toLowerCase();
  if (['ativa', 'ativo', 'aprovado', 'contratado', 'concluída', 'concluído', 'pago'].some(k => s.includes(k))) return 'emerald';
  if (['novo', 'agendada', 'em análise', 'em analise'].some(k => s.includes(k))) return 'blue';
  if (['pausada', 'pendente', 'aguard'].some(k => s.includes(k))) return 'gold';
  if (['reprovado', 'inativo', 'cancelad', 'vencid', 'atrasad'].some(k => s.includes(k))) return 'rose';
  if (['entrevista', 'triagem'].some(k => s.includes(k))) return 'purple';
  return 'slate';
}
