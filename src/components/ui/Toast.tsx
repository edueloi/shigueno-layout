import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Portal } from '../../hooks/usePortal';

/**
 * Toast flutuante padrão Shigueno — canto superior direito, com barra de progresso.
 *
 * {success && <Toast tone="success" message={success} onClose={() => setSuccess(null)} />}
 */
export type ToastTone = 'success' | 'error' | 'info';

const TONES: Record<ToastTone, { bg: string; icon: React.ElementType; iconColor: string; bar: string }> = {
  success: { bg: 'bg-gradient-to-r from-emerald-800 to-emerald-700', icon: CheckCircle2, iconColor: 'text-emerald-300', bar: 'bg-emerald-400' },
  error:   { bg: 'bg-gradient-to-r from-rose-700 to-rose-600',       icon: AlertCircle,  iconColor: 'text-rose-200',    bar: 'bg-rose-300' },
  info:    { bg: 'bg-gradient-to-r from-slate-800 to-slate-700',     icon: Info,         iconColor: 'text-sky-300',     bar: 'bg-sky-400' },
};

export default function Toast({ message, tone = 'success', onClose, duration = 4000 }: {
  message: React.ReactNode;
  tone?: ToastTone;
  onClose: () => void;
  /** ms até fechar sozinho; 0 desativa */
  duration?: number;
}) {
  const t = TONES[tone];
  const ToneIcon = t.icon;

  React.useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <Portal>
      <div className="fixed top-5 right-5 left-5 sm:left-auto z-[99999] animate-slide-in">
        <div className={`${t.bg} text-white rounded-2xl px-5 py-3.5 text-xs font-bold flex items-center gap-3 shadow-[0_15px_40px_rgba(2,30,20,0.35)] sm:min-w-[280px] sm:max-w-sm overflow-hidden relative border border-white/10`}>
          <ToneIcon className={`w-5 h-5 shrink-0 ${t.iconColor}`} />
          <span className="flex-1 leading-snug">{message}</span>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          {duration > 0 && (
            <div
              className={`absolute bottom-0 left-0 h-0.5 ${t.bar}`}
              style={{ animation: `toastBar ${duration}ms linear forwards` }}
            />
          )}
        </div>
      </div>
    </Portal>
  );
}
