import React from 'react';
import { Bell, Users, ClipboardList, AlertTriangle, CalendarClock, ChevronRight } from 'lucide-react';

/**
 * Sino de notificações do topbar — gera alertas a partir dos dados já carregados:
 * candidatos novos, atividades vencidas e vencendo em breve.
 */
export interface NotificationItem {
  id: string;
  icon: React.ElementType;
  tone: 'emerald' | 'gold' | 'rose' | 'blue';
  title: string;
  detail: string;
  onClick?: () => void;
}

const TONE_BOX: Record<NotificationItem['tone'], string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  gold:    'bg-amber-50 text-amber-700 border-amber-100',
  rose:    'bg-rose-50 text-rose-600 border-rose-100',
  blue:    'bg-sky-50 text-sky-700 border-sky-100',
};

/** Monta a lista de alertas a partir dos estados do painel. */
export function buildNotifications(opts: {
  candidates: Array<{ id: number; name: string; status: string; applied_at: string }>;
  activities: Array<{ id: number; title: string; due_date?: string | null; status?: string }>;
  onGoTo: (tab: string) => void;
}): NotificationItem[] {
  const items: NotificationItem[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const newCands = opts.candidates.filter(c => c.status === 'Novo' && new Date(c.applied_at) >= weekAgo);
  if (newCands.length > 0) {
    items.push({
      id: 'cand-new',
      icon: Users,
      tone: 'blue',
      title: `${newCands.length} candidato${newCands.length > 1 ? 's' : ''} novo${newCands.length > 1 ? 's' : ''}`,
      detail: 'Currículos recebidos nos últimos 7 dias aguardando triagem.',
      onClick: () => opts.onGoTo('candidates'),
    });
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in3days = new Date(today.getTime() + 3 * 24 * 3600 * 1000);
  const pending = opts.activities.filter(a => a.status !== 'Concluído' && a.due_date);
  const overdue = pending.filter(a => new Date(a.due_date as string) < today);
  const dueSoon = pending.filter(a => {
    const d = new Date(a.due_date as string);
    return d >= today && d <= in3days;
  });

  if (overdue.length > 0) {
    items.push({
      id: 'act-overdue',
      icon: AlertTriangle,
      tone: 'rose',
      title: `${overdue.length} atividade${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''}`,
      detail: overdue.slice(0, 2).map(a => a.title).join(' · '),
      onClick: () => opts.onGoTo('suppliers'),
    });
  }
  if (dueSoon.length > 0) {
    items.push({
      id: 'act-soon',
      icon: CalendarClock,
      tone: 'gold',
      title: `${dueSoon.length} atividade${dueSoon.length > 1 ? 's' : ''} vencendo`,
      detail: 'Prazo nos próximos 3 dias — confira o quadro.',
      onClick: () => opts.onGoTo('suppliers'),
    });
  }

  return items;
}

export default function NotificationBell({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Notificações"
        className="relative p-2 rounded-xl border border-slate-150 hover:bg-amber-50 hover:border-amber-200 text-slate-500 hover:text-amber-700 transition-all shadow-2xs cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white animate-pulse">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[88vw] max-w-xs sm:w-80 bg-white rounded-2xl border border-slate-200/80 shadow-[0_18px_50px_rgba(2,30,20,0.18)] overflow-hidden z-50 animate-scale-in origin-top-right">
          <div className="px-4 py-3 bg-gradient-to-r from-[#06150c] to-[#0d2818] flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono">Central de Alertas</span>
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-slate-50">
            {items.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <ClipboardList className="w-8 h-8 text-slate-200 mx-auto" />
                <p className="text-[11px] text-slate-400 font-bold">Tudo em dia! Nenhum alerta pendente.</p>
              </div>
            ) : items.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                  className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${TONE_BOX[item.tone]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-slate-800 leading-tight">{item.title}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 line-clamp-2">{item.detail}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
