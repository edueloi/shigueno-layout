import React from 'react';
import {
  X, Edit, Phone, Mail, MapPin, Heart, Home, Building2, Shield,
  Users, UserCheck, Cake, MessageCircle, FileText, GraduationCap, Droplets, Car
} from 'lucide-react';
import { Employee, deptClass, levelClass, statusStyle, LEVEL_LABELS, yearsLabel, birthdayIn, fmtDate, fmtMoney } from './helpers';
import Avatar from './Avatar';
import { Modal, Button } from '../ui';

/** Linha rótulo → valor das seções de informação */
function InfoRow({ label, value, mono = false }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0">{label}</span>
      <span className={`text-xs font-bold text-slate-800 text-right min-w-0 ${mono ? 'font-mono' : ''}`}>
        {value !== undefined && value !== null && value !== '' ? value : <span className="text-slate-300 font-semibold">—</span>}
      </span>
    </div>
  );
}

/** Seção com cabeçalho icônico tonal */
function InfoSection({ icon: Icon, title, tone = 'emerald', children }: {
  icon: React.ElementType;
  title: string;
  tone?: 'emerald' | 'rose' | 'sky' | 'amber' | 'violet';
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose:    'bg-rose-50 text-rose-600 border-rose-100',
    sky:     'bg-sky-50 text-sky-700 border-sky-100',
    amber:   'bg-amber-50 text-amber-700 border-amber-100',
    violet:  'bg-violet-50 text-violet-700 border-violet-100',
  };
  return (
    <section className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/60">
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">{title}</h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </section>
  );
}

export default function EmployeeDetailModal({ emp, onClose, onEdit, canEdit }: {
  emp: Employee & { reports?: Employee[] };
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}) {
  const days = birthdayIn(emp.birth_mmdd);
  const isBday = days === 0;
  const st = statusStyle(emp.status);
  const waPhone = emp.phone ? emp.phone.replace(/\D/g, '') : '';

  const header = (
    <div className="relative bg-gradient-to-br from-[#06150c] via-[#0a2316] to-[#0d3320] text-white px-5 sm:px-7 pt-6 pb-5 overflow-hidden">
      {/* Brilhos de fundo */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-14 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer z-10">
        <X className="w-4.5 h-4.5" />
      </button>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <Avatar emp={emp} size="xl" ring />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${levelClass(emp.hierarchy_level)}`}>
              Nível {emp.hierarchy_level} · {LEVEL_LABELS[emp.hierarchy_level] || 'Operacional'}
            </span>
            {isBday && (
              <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-300 text-slate-900 font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                <Cake className="w-3 h-3" />Aniversário hoje!
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">{emp.full_name}</h2>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300 text-sm font-extrabold mt-0.5">{emp.role}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${deptClass(emp.department)}`}>{emp.department}</span>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${st.badge} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{emp.status}
            </span>
            {emp.work_location && (
              <span className="text-[9px] text-emerald-200 font-bold flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                <MapPin className="w-2.5 h-2.5" />{emp.work_location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="relative grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-black text-white">{yearsLabel(emp.years_of_service)}</p>
          <p className="text-[9px] text-emerald-300 uppercase font-black tracking-wider font-mono mt-0.5">Tempo de casa</p>
        </div>
        <div className="text-center border-x border-white/10">
          <p className="text-lg sm:text-2xl font-black text-white">{emp.age ? `${emp.age} anos` : '—'}</p>
          <p className="text-[9px] text-emerald-300 uppercase font-black tracking-wider font-mono mt-0.5">Idade</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-black text-amber-400">
            {days === 0 ? '🎂 Hoje' : days !== null ? `${days}d` : '—'}
          </p>
          <p className="text-[9px] text-emerald-300 uppercase font-black tracking-wider font-mono mt-0.5">Próx. aniversário</p>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      header={header}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          {canEdit && <Button variant="primary" icon={Edit} onClick={onEdit}>Editar Funcionário</Button>}
        </>
      }
    >
      <div className="space-y-4">
        {/* Contato rápido */}
        {(emp.phone || emp.email) && (
          <div className="flex flex-wrap gap-2">
            {emp.phone && (
              <a href={`tel:${emp.phone}`} className="flex-1 min-w-[130px]">
                <Button variant="outline" size="sm" icon={Phone} fullWidth>Ligar</Button>
              </a>
            )}
            {waPhone && (
              <a href={`https://wa.me/55${waPhone}`} target="_blank" rel="noreferrer" className="flex-1 min-w-[130px]">
                <Button variant="success" size="sm" icon={MessageCircle} fullWidth>WhatsApp</Button>
              </a>
            )}
            {emp.email && (
              <a href={`mailto:${emp.email}`} className="flex-1 min-w-[130px]">
                <Button variant="outline" size="sm" icon={Mail} fullWidth>E-mail</Button>
              </a>
            )}
          </div>
        )}

        {/* Cadeia hierárquica */}
        {emp.manager_name && (
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border border-slate-200/70 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-xs min-w-0">
              <span className="text-slate-400 font-semibold">Responde para </span>
              <strong className="text-slate-900">{emp.manager_name}</strong>
              {emp.manager_role && <span className="text-slate-400 font-semibold"> · {emp.manager_role}</span>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoSection icon={Phone} title="Contato" tone="sky">
            <InfoRow label="E-mail" value={emp.email ? <a href={`mailto:${emp.email}`} className="text-emerald-700 hover:underline">{emp.email}</a> : null} />
            <InfoRow label="Telefone" value={emp.phone} mono />
            <InfoRow label="Tel. 2" value={emp.phone2} mono />
          </InfoSection>

          <InfoSection icon={Heart} title="Dados Pessoais" tone="rose">
            <InfoRow label="CPF" value={emp.cpf} mono />
            <InfoRow label="RG" value={emp.rg} mono />
            <InfoRow label="Sexo" value={emp.sex} />
            <InfoRow label="Nascimento" value={fmtDate(emp.birth_date)} mono />
            <InfoRow label="Tipo sanguíneo" value={emp.blood_type ? <span className="font-black text-rose-600 flex items-center gap-1"><Droplets className="w-3 h-3" />{emp.blood_type}</span> : null} />
            <InfoRow label="Est. civil" value={emp.marital_status} />
            <InfoRow label="Filhos" value={emp.has_children ? `${emp.children_count || 0} filho${(emp.children_count || 0) !== 1 ? 's' : ''}` : 'Não'} />
            <InfoRow label="Escolaridade" value={emp.education ? <span className="flex items-center gap-1.5 justify-end"><GraduationCap className="w-3.5 h-3.5 text-slate-400" />{emp.education}</span> : null} />
            <InfoRow label="CNH" value={emp.has_cnh ? <span className="font-black text-emerald-700 flex items-center gap-1"><Car className="w-3.5 h-3.5" />Sim — Cat. {emp.cnh_category || '—'}</span> : 'Não'} />
          </InfoSection>

          {(emp.is_pcd || emp.has_continuous_medication || emp.has_chronic_disease || emp.allergies || emp.emergency_contact_name) ? (
            <InfoSection icon={Shield} title="Saúde & Emergência" tone="violet">
              {!!emp.is_pcd && <InfoRow label="PCD" value={<span className="font-black text-violet-700">Sim — {emp.pcd_type || 'Não especificado'}</span>} />}
              {!!emp.has_continuous_medication && <InfoRow label="Medicação" value={emp.medications} />}
              {!!emp.has_chronic_disease && <InfoRow label="Doenças crônicas" value={emp.chronic_diseases} />}
              {!!emp.allergies && <InfoRow label="Alergias" value={emp.allergies} />}
              {!!emp.emergency_contact_name && <InfoRow label="Emergência" value={`${emp.emergency_contact_name} · ${emp.emergency_contact_phone || '—'}`} />}
            </InfoSection>
          ) : null}

          <InfoSection icon={Home} title="Endereço" tone="amber">
            <InfoRow label="CEP" value={emp.cep} mono />
            <InfoRow label="Rua" value={emp.street ? `${emp.street}, ${emp.street_number || 'S/N'}${emp.complement ? ` (${emp.complement})` : ''}` : null} />
            <InfoRow label="Bairro" value={emp.neighborhood} />
            <InfoRow label="Cidade/UF" value={emp.city ? `${emp.city}${emp.state ? ` - ${emp.state}` : ''}` : null} />
            <InfoRow label="País" value={emp.country} />
          </InfoSection>

          <InfoSection icon={Building2} title="Vínculo Empregatício" tone="emerald">
            <InfoRow label="Admissão" value={fmtDate(emp.hire_date)} mono />
            {emp.termination_date ? <InfoRow label="Desligamento" value={fmtDate(emp.termination_date)} mono /> : null}
            <InfoRow label="Local" value={emp.work_location} />
            {emp.salary ? <InfoRow label="Salário" value={<span className="font-black text-emerald-700">{fmtMoney(emp.salary)}</span>} /> : null}
          </InfoSection>
        </div>

        {/* Observações */}
        {emp.notes && (
          <InfoSection icon={FileText} title="Observações Internas" tone="amber">
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap py-2.5">{emp.notes}</p>
          </InfoSection>
        )}

        {/* Subordinados */}
        {emp.reports && emp.reports.length > 0 && (
          <InfoSection icon={Users} title={`Subordinados Diretos (${emp.reports.length})`} tone="emerald">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3">
              {(emp.reports as Employee[]).map(r => (
                <div key={r.id} className="flex items-center gap-2.5 bg-slate-50 hover:bg-emerald-50/60 rounded-xl px-3 py-2.5 border border-slate-100 transition-colors">
                  <Avatar emp={r} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{r.full_name}</p>
                    <p className="text-[9px] text-slate-500 truncate">{r.role} · {r.department}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${levelClass(r.hierarchy_level || 1)}`}>
                    N{r.hierarchy_level}
                  </span>
                </div>
              ))}
            </div>
          </InfoSection>
        )}
      </div>
    </Modal>
  );
}
