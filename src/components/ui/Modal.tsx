import React from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Portal } from '../../hooks/usePortal';
import Button from './Button';

/**
 * Modal padrão Shigueno — totalmente responsivo.
 * Desktop: centralizado com scale-in. Celular: bottom-sheet deslizando de baixo.
 *
 * Uso:
 *  <Modal open={open} onClose={...} title="Título" icon={Users} size="md"
 *         footer={<><Button variant="secondary">Cancelar</Button><Button>Salvar</Button></>}>
 *    conteúdo...
 *  </Modal>
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZE_MAP: Record<ModalSize, string> = {
  sm:   'sm:max-w-sm',
  md:   'sm:max-w-lg',
  lg:   'sm:max-w-2xl',
  xl:   'sm:max-w-4xl',
  full: 'sm:max-w-[92vw]',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ElementType;
  size?: ModalSize;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Impede fechar clicando no backdrop (forms longos) */
  lockBackdrop?: boolean;
  /** Tom do cabeçalho: emerald (padrão), gold, danger */
  headerTone?: 'emerald' | 'gold' | 'danger' | 'plain';
  /** Cabeçalho 100% customizado — substitui o cabeçalho padrão (fica fixo, fora do scroll) */
  header?: React.ReactNode;
  /** Remove o padding padrão do corpo */
  flushBody?: boolean;
}

const HEADER_TONES = {
  emerald: 'bg-gradient-to-r from-[#06150c] via-[#0a1e13] to-[#0d2818] text-white',
  gold:    'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950',
  danger:  'bg-gradient-to-r from-rose-700 to-rose-600 text-white',
  plain:   'bg-white text-slate-900 border-b border-slate-100',
};

export default function Modal({
  open, onClose, title, subtitle, icon: Icon, size = 'md',
  footer, children, lockBackdrop = false, headerTone = 'emerald',
  header, flushBody = false,
}: ModalProps) {
  // Fecha com tecla Esc
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Trava scroll do body enquanto aberto
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const isDarkHeader = headerTone === 'emerald' || headerTone === 'danger';

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-sm animate-fade-in p-0 sm:p-6"
        onClick={lockBackdrop ? undefined : onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-white w-full ${SIZE_MAP[size]} flex flex-col overflow-hidden
            max-h-[94dvh] sm:max-h-[88vh]
            rounded-t-3xl sm:rounded-3xl shadow-[0_25px_70px_rgba(2,30,20,0.35)]
            animate-sheet-up sm:animate-scale-in
          `}
        >
          {/* Cabeçalho customizado — fixo, com alça de arrastar sobreposta no celular */}
          {header ? (
            <div className="relative shrink-0">
              <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/30 z-10 pointer-events-none" />
              {header}
            </div>
          ) : (
            /* Alça de arrastar (visível só no celular) */
            <div className={`sm:hidden flex justify-center pt-2.5 ${HEADER_TONES[headerTone]}`}>
              <div className={`w-10 h-1 rounded-full ${isDarkHeader ? 'bg-white/30' : 'bg-slate-950/20'}`} />
            </div>
          )}

          {/* Cabeçalho padrão */}
          {!header && (title || Icon) && (
            <div className={`px-5 sm:px-6 py-4 flex items-center justify-between gap-3 shrink-0 ${HEADER_TONES[headerTone]}`}>
              <div className="flex items-center gap-3 min-w-0">
                {Icon && (
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isDarkHeader ? 'bg-white/10 border border-white/15' : 'bg-slate-950/10'
                  }`}>
                    <Icon className={`w-4.5 h-4.5 ${headerTone === 'emerald' ? 'text-amber-400' : ''}`} />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-black uppercase tracking-wide truncate leading-tight">{title}</h3>
                  {subtitle && (
                    <p className={`text-[10px] font-bold font-mono mt-0.5 truncate ${
                      isDarkHeader ? 'text-emerald-300/90' : 'opacity-70'
                    }`}>{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
                  isDarkHeader ? 'hover:bg-white/15 text-white/80 hover:text-white' : 'hover:bg-slate-950/10'
                }`}
                title="Fechar"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Corpo com scroll */}
          <div className={`flex-1 overflow-y-auto scrollbar-thin ${flushBody ? '' : 'px-5 sm:px-6 py-5'}`}>
            {children}
          </div>

          {/* Rodapé com ações */}
          {footer && (
            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/**
 * Modal de confirmação pronto — substitui os blocos repetidos de "tem certeza?".
 *
 * <ConfirmModal open={!!toDelete} onClose={...} onConfirm={...} tone="danger"
 *               title="Excluir atividade" message="Essa ação não pode ser desfeita." />
 */
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: React.ReactNode;
  tone?: 'danger' | 'warning' | 'success' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

const TONE_CFG = {
  danger:  { icon: AlertTriangle, ring: 'bg-rose-50 border-rose-200 text-rose-600',     btn: 'danger'  as const },
  warning: { icon: AlertCircle,   ring: 'bg-amber-50 border-amber-200 text-amber-600',  btn: 'gold'    as const },
  success: { icon: CheckCircle2,  ring: 'bg-emerald-50 border-emerald-200 text-emerald-600', btn: 'primary' as const },
  info:    { icon: Info,          ring: 'bg-sky-50 border-sky-200 text-sky-600',        btn: 'primary' as const },
};

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  tone = 'danger', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', loading = false,
}: ConfirmModalProps) {
  if (!open) return null;
  const cfg = TONE_CFG[tone];
  const ToneIcon = cfg.icon;

  return (
    <Modal open={open} onClose={onClose} size="sm" headerTone="plain">
      <div className="flex flex-col items-center text-center space-y-4 py-2">
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${cfg.ring}`}>
          <ToneIcon className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">{title}</h3>
          {message && <p className="text-xs text-slate-500 font-semibold leading-relaxed">{message}</p>}
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 w-full pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>{cancelLabel}</Button>
          <Button variant={cfg.btn} fullWidth loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
