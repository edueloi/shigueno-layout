import React from 'react';
import { Briefcase, Edit as EditIcon, Check, AlertCircle, CalendarPlus } from 'lucide-react';
import {
  Vacancy, DEPARTMENTS, COMMON_ROLES, VACANCY_LOCATIONS, CONTRACT_TYPES,
  LEVEL_LABELS, fmtCreatedAt
} from './helpers';
import { Modal, Button, Field, Input, Select, Textarea } from '../ui';

/**
 * Cadastro/edição de vaga em modal responsivo.
 * Dropdowns de cargo (sugestões), área/departamento, nível hierárquico,
 * tipo de contrato, faixa salarial e nº de posições.
 */
export default function VacancyFormModal({ initial, onSave, onCancel, saving }: {
  initial?: Vacancy | null;
  onSave: (payload: any, id?: number) => Promise<boolean>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title,           setTitle]       = React.useState(initial?.title || '');
  const [department,      setDepartment]  = React.useState(initial?.department || '');
  const [location,        setLocation]    = React.useState(initial?.location || 'Tatuí - SP');
  const [hierarchy_level, setLevel]       = React.useState<number>(initial?.hierarchy_level || 0);
  const [contract_type,   setContract]    = React.useState(initial?.contract_type || 'CLT');
  const [salary_range,    setSalaryRange] = React.useState(initial?.salary_range || '');
  const [openings,        setOpenings]    = React.useState<number>(initial?.openings || 1);
  const [description,     setDescription] = React.useState(initial?.description || '');
  const [requirements,    setRequirements]= React.useState(initial?.requirements || '');
  const [status,          setStatus]      = React.useState(initial?.status || 'Ativa');
  const [formError,       setFormError]   = React.useState<string | null>(null);

  const created = fmtCreatedAt(initial?.created_at);

  const submit = async () => {
    if (!title.trim() || !department.trim() || !description.trim() || !requirements.trim()) {
      setFormError('Preencha os campos obrigatórios: Cargo, Área, Descrição e Requisitos.');
      return;
    }
    setFormError(null);
    const ok = await onSave({
      title, department, description, location, requirements, status,
      hierarchy_level: hierarchy_level || null,
      contract_type, salary_range, openings,
    }, initial?.id);
    if (!ok) setFormError('Não foi possível salvar a vaga. Tente novamente.');
  };

  return (
    <Modal
      open
      onClose={onCancel}
      size="lg"
      icon={initial?.id ? EditIcon : Briefcase}
      title={initial?.id ? 'Editar Vaga' : 'Cadastrar Nova Vaga'}
      subtitle={initial?.id
        ? `Vaga #${initial.id}${created ? ` · criada em ${created}` : ''}`
        : 'Publicação no site "Trabalhe Conosco"'}
      lockBackdrop
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" icon={Check} loading={saving} onClick={submit}>
            {saving ? 'Publicando...' : initial?.id ? 'Salvar Alterações' : 'Publicar Vaga'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {formError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />{formError}
          </div>
        )}

        {initial?.id && created && (
          <div className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-500 flex items-center gap-2">
            <CalendarPlus className="w-3.5 h-3.5 text-emerald-700" />
            Vaga criada em <span className="text-slate-800">{created}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Cargo / Título da Vaga" required hint="Digite ou escolha uma sugestão" className="sm:col-span-2">
            <Input value={title} onChange={(e: any) => setTitle(e.target.value)} list="role-suggestions"
              placeholder="Ex: Tratorista Agrícola" />
            <datalist id="role-suggestions">{COMMON_ROLES.map(r => <option key={r} value={r} />)}</datalist>
          </Field>

          <Field label="Área / Departamento" required hint="Escolha no dropdown ou digite">
            <Input value={department} onChange={(e: any) => setDepartment(e.target.value)} list="vac-departments"
              placeholder="Ex: Avicultura" />
            <datalist id="vac-departments">
              {[...DEPARTMENTS, 'Agropecuária', 'Serviços Gerais', 'Manutenção'].map(d => <option key={d} value={d} />)}
            </datalist>
          </Field>

          <Field label="Nível Hierárquico" hint="Mesma régua da Equipe (1–14)">
            <Select value={hierarchy_level} onChange={(e: any) => setLevel(Number(e.target.value))}>
              <option value={0}>— Não informar —</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(l => (
                <option key={l} value={l}>{l} · {LEVEL_LABELS[l]}</option>
              ))}
            </Select>
          </Field>

          <Field label="Localização" required>
            <Input value={location} onChange={(e: any) => setLocation(e.target.value)} list="vac-locations"
              placeholder="Ex: Tatuí - SP" />
            <datalist id="vac-locations">{VACANCY_LOCATIONS.map(l => <option key={l} value={l} />)}</datalist>
          </Field>

          <Field label="Tipo de Contrato">
            <Select value={contract_type} onChange={(e: any) => setContract(e.target.value)}>
              {CONTRACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>

          <Field label="Faixa Salarial" hint="Aparece só no painel interno">
            <Input value={salary_range} onChange={(e: any) => setSalaryRange(e.target.value)}
              placeholder="Ex: R$ 2.200 – R$ 2.800 + benefícios" />
          </Field>

          <Field label="Nº de Posições">
            <Input type="number" min="1" max="99" value={openings}
              onChange={(e: any) => setOpenings(Math.max(1, Number(e.target.value)))} />
          </Field>

          <Field label="Descrição das Atribuições" required className="sm:col-span-2">
            <Textarea rows={3} value={description} onChange={(e: any) => setDescription(e.target.value)}
              placeholder="Responsabilidades diárias, rotina de trabalho, cuidados rurais..." />
          </Field>

          <Field label="Requisitos Técnicos / Cursos" required className="sm:col-span-2"
            hint="Separe por ponto e vírgula — vira lista no cartaz A4">
            <Textarea rows={2} value={requirements} onChange={(e: any) => setRequirements(e.target.value)}
              placeholder="Ex: Experiência comprovada; CNH categoria D; Disponibilidade para residir em Tatuí." />
          </Field>

          <Field label="Status da Publicação" className="sm:col-span-2">
            <Select value={status} onChange={(e: any) => setStatus(e.target.value)}>
              <option value="Ativa">Ativa — visível no site para candidatos</option>
              <option value="Pausada">Pausada — oculta no site</option>
            </Select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
