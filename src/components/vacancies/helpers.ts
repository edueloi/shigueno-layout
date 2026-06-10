// ── Helpers do módulo de Gestão de Vagas ──────────────────────────────────────
import { Vacancy } from '../../types';
import { LEVEL_LABELS, LEVEL_COLORS, DEPARTMENTS, deptClass, levelClass } from '../employees/helpers';

export type { Vacancy };
export { LEVEL_LABELS, LEVEL_COLORS, DEPARTMENTS, deptClass, levelClass };

/** Cargos comuns do Grupo Shigueno — sugestões no dropdown de título */
export const COMMON_ROLES = [
  'Auxiliar de Avicultura',
  'Classificador de Ovos',
  'Tratorista Agrícola',
  'Campeiro / Tratador de Gado',
  'Operador de Produção',
  'Auxiliar de Produção',
  'Motorista (Categoria D/E)',
  'Mecânico de Manutenção',
  'Auxiliar Administrativo',
  'Analista Financeiro',
  'Assistente de RH',
  'Técnico Agrícola',
  'Pedreiro',
  'Serviços Gerais',
  'Encarregado de Granja',
  'Supervisor de Produção',
];

export const VACANCY_LOCATIONS = [
  'Tatuí - SP',
  'Tatuí - SP (Granja)',
  'Tatuí - SP (Fazenda Nova Aliança)',
  'Buri - SP (Citros)',
  'Itaí - SP (Café)',
  'Santo Antônio do Leverger - MT',
  'Sorocaba - SP (Distribuição)',
];

export const CONTRACT_TYPES = ['CLT', 'Temporário (Safra)', 'Estágio', 'Aprendiz', 'PJ / Prestador'];

export const VACANCY_STATUS_STYLE: Record<string, { strip: string; badge: string; dot: string }> = {
  'Ativa':   { strip: 'from-emerald-500 to-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Pausada': { strip: 'from-amber-500 to-amber-400',     badge: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
};

export const vacancyStatusStyle = (s: string) => VACANCY_STATUS_STYLE[s] || VACANCY_STATUS_STYLE['Pausada'];

export function fmtCreatedAt(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Dias desde a criação (para chip "há Xd") */
export function daysOpen(s?: string | null): number | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}
