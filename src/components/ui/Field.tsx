import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Campos de formulário padrão Shigueno — Input, Select e Textarea
 * com rótulo, dica e erro integrados. Responsivos e consistentes.
 *
 * <Field label="Nome" hint="Como aparece no crachá" error={errors.name}>
 *   <Input value={name} onChange={...} />
 * </Field>
 */
export function Field({ label, hint, error, required, children, className = '' }: {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      ) : hint ? (
        <p className="text-[10px] text-slate-400 font-semibold">{hint}</p>
      ) : null}
    </div>
  );
}

const BASE_INPUT = `
  w-full bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300
  focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 focus:outline-none
  rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400
  transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
`;

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className = '', invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={`${BASE_INPUT} ${invalid ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15' : ''} ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => (
    <select ref={ref} className={`${BASE_INPUT} cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', rows = 4, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={`${BASE_INPUT} resize-y leading-relaxed ${className}`} {...props} />
  )
);
Textarea.displayName = 'Textarea';
