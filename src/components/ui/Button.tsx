import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Botão padrão Shigueno — reutilizável em todo o painel.
 *
 * Variantes:
 *  - primary   → verde Shigueno (ação principal)
 *  - gold      → âmbar/dourado (destaque premium)
 *  - secondary → cinza claro (ação neutra)
 *  - outline   → borda fina (ação leve)
 *  - ghost     → transparente (ações em toolbars)
 *  - danger    → vermelho (ações destrutivas)
 *  - success   → verde claro (confirmações)
 */
export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-gradient-to-b from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white shadow-md shadow-emerald-900/20 hover:shadow-lg hover:shadow-emerald-900/25 border border-emerald-900/30',
  gold:      'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 border border-amber-600/30',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80',
  outline:   'bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 shadow-2xs',
  ghost:     'bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800',
  danger:    'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-md shadow-rose-600/20 border border-rose-700/30',
  success:   'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200',
};

const SIZES: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-[10px] rounded-lg gap-1.5',
  sm: 'px-3.5 py-2 text-[11px] rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-xs rounded-xl gap-2',
  lg: 'px-6 py-3 text-sm rounded-2xl gap-2',
};

const ICON_SIZES: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4.5 h-4.5',
};

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ElementType;
  iconRight?: React.ElementType;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  /** Demais atributos nativos do <button> (onClick, title, type...) */
  [key: string]: any;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-extrabold uppercase tracking-wide cursor-pointer select-none
        transition-all duration-200 active:scale-[0.97]
        disabled:opacity-55 disabled:pointer-events-none disabled:saturate-50
        ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...rest}
    >
      {loading
        ? <RefreshCw className={`${ICON_SIZES[size]} animate-spin shrink-0`} />
        : Icon && <Icon className={`${ICON_SIZES[size]} shrink-0`} />}
      {children && <span>{children}</span>}
      {IconRight && !loading && <IconRight className={`${ICON_SIZES[size]} shrink-0`} />}
    </button>
  );
}
