import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Estado vazio padrão — ilustração tonal + título + ação opcional.
 */
export default function EmptyState({ icon: Icon = Inbox, title, message, action }: {
  icon?: React.ElementType;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 space-y-3">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/70 flex items-center justify-center shadow-inner">
        <Icon className="w-7 h-7 text-slate-300" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">{title}</h3>
        {message && <p className="text-[11px] text-slate-400 font-semibold max-w-xs leading-relaxed">{message}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
