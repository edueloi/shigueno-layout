import React from 'react';
import {
  X, User, Heart, Shield, Home, Briefcase, Camera, Search, RefreshCw,
  Check, ChevronLeft, ChevronRight, UserPlus, Edit as EditIcon, AlertCircle
} from 'lucide-react';
import { Employee, LEVEL_LABELS, DEPARTMENTS, WORK_LOCATIONS, avatarBg, maskPhone, maskCpf, maskCep } from './helpers';
import { Modal, Button, Field, Input, Select, Textarea } from '../ui';

const STEPS = [
  { key: 'basico',   label: 'Básico',   icon: User },
  { key: 'pessoal',  label: 'Pessoal',  icon: Heart },
  { key: 'saude',    label: 'Saúde',    icon: Shield },
  { key: 'endereco', label: 'Endereço', icon: Home },
  { key: 'trabalho', label: 'Trabalho', icon: Briefcase },
] as const;
type StepKey = typeof STEPS[number]['key'];

/**
 * Cadastro/edição de funcionário em modal responsivo com passos (stepper).
 * Desktop: modal central. Celular: bottom-sheet em tela quase cheia.
 */
export default function EmployeeFormModal({ initial, employees, onSave, onCancel, saving }: {
  initial?: Partial<Employee>;
  employees: Employee[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [step, setStep] = React.useState<StepKey>('basico');
  const [formError, setFormError] = React.useState<string | null>(null);

  const [full_name,       setFullName]       = React.useState(initial?.full_name       || '');
  const [role,            setRole]           = React.useState(initial?.role            || '');
  const [department,      setDept]           = React.useState(initial?.department      || '');
  const [hierarchy_level, setLevel]          = React.useState<number>(initial?.hierarchy_level || 1);
  const [manager_id,      setManagerId]      = React.useState(initial?.manager_id ? String(initial.manager_id) : '');
  const [email,           setEmail]          = React.useState(initial?.email           || '');
  const [phone,           setPhone]          = React.useState(maskPhone(initial?.phone  || ''));
  const [phone2,          setPhone2]         = React.useState(maskPhone(initial?.phone2 || ''));
  const [status,          setStatus]         = React.useState<string>(initial?.status  || 'Ativo');
  const [hire_date,       setHireDate]       = React.useState(initial?.hire_date       ? String(initial.hire_date).slice(0,10) : '');
  const [termination_date,setTermDate]       = React.useState(initial?.termination_date? String(initial.termination_date).slice(0,10) : '');
  const [work_location,   setWorkLoc]        = React.useState(initial?.work_location   || '');
  const [salary,          setSalary]         = React.useState(initial?.salary ? String(initial.salary) : '');
  const [notes,           setNotes]          = React.useState(initial?.notes           || '');
  // Documentos
  const [cpf,             setCpf]            = React.useState(maskCpf(initial?.cpf || ''));
  const [rg,              setRg]             = React.useState(initial?.rg              || '');
  const [has_cnh,         setHasCnh]         = React.useState<boolean>(!!initial?.has_cnh);
  const [cnh_category,    setCnhCategory]    = React.useState(initial?.cnh_category    || '');
  // Pessoal
  const [sex,             setSex]            = React.useState(initial?.sex             || '');
  const [birth_date,      setBirthDate]      = React.useState(initial?.birth_date      ? String(initial.birth_date).slice(0,10) : '');
  const [blood_type,      setBloodType]      = React.useState(initial?.blood_type      || '');
  const [marital_status,  setMaritalStatus]  = React.useState(initial?.marital_status  || '');
  const [has_children,    setHasChildren]    = React.useState<boolean>(!!initial?.has_children);
  const [children_count,  setChildrenCount]  = React.useState<number>(initial?.children_count || 0);
  const [education,       setEducation]      = React.useState(initial?.education       || '');
  // PCD & Saúde
  const [is_pcd,          setIsPcd]          = React.useState<boolean>(!!initial?.is_pcd);
  const [pcd_type,        setPcdType]        = React.useState(initial?.pcd_type        || '');
  const [has_med,         setHasMed]         = React.useState<boolean>(!!initial?.has_continuous_medication);
  const [medications,     setMedications]    = React.useState(initial?.medications     || '');
  const [has_chronic,     setHasChronic]     = React.useState<boolean>(!!initial?.has_chronic_disease);
  const [chronic_diseases,setChronicDis]     = React.useState(initial?.chronic_diseases|| '');
  const [allergies,       setAllergies]      = React.useState(initial?.allergies       || '');
  const [emerg_name,      setEmergName]      = React.useState(initial?.emergency_contact_name  || '');
  const [emerg_phone,     setEmergPhone]     = React.useState(initial?.emergency_contact_phone || '');
  // Endereço
  const [cep,             setCep]            = React.useState(initial?.cep             || '');
  const [street,          setStreet]         = React.useState(initial?.street          || '');
  const [street_number,   setStreetNum]      = React.useState(initial?.street_number   || '');
  const [complement,      setComplement]     = React.useState(initial?.complement      || '');
  const [neighborhood,    setNeighborhood]   = React.useState(initial?.neighborhood    || '');
  const [city,            setCity]           = React.useState(initial?.city            || '');
  const [state,           setState]          = React.useState(initial?.state           || '');
  const [country,         setCountry]        = React.useState(initial?.country         || 'Brasil');
  const [cepLoading,      setCepLoading]     = React.useState(false);
  // Foto
  const [photoFile,       setPhotoFile]      = React.useState<File | null>(null);
  const [photoPreview,    setPhotoPreview]   = React.useState<string | null>(initial?.photo_path ? `/api/employees/${initial.id}/photo` : null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const possibleManagers = employees.filter(e => e.id !== initial?.id && e.status !== 'Desligado');
  const stepIdx = STEPS.findIndex(s => s.key === step);

  const handlePhotoChange = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const fetchCep = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
        setCountry('Brasil');
      }
    } catch { /* silencioso */ }
    finally { setCepLoading(false); }
  };

  const submit = async () => {
    if (!full_name.trim() || !role.trim() || !department.trim()) {
      setFormError('Preencha os campos obrigatórios: Nome, Cargo e Departamento (passo Básico).');
      setStep('basico');
      return;
    }
    setFormError(null);
    const payload = {
      full_name, role, department, hierarchy_level,
      manager_id: manager_id || null,
      email, phone, phone2,
      cpf, rg, has_cnh, cnh_category: has_cnh ? cnh_category : null,
      sex, birth_date, blood_type, marital_status,
      has_children, children_count: has_children ? children_count : 0, education,
      is_pcd, pcd_type: is_pcd ? pcd_type : null,
      has_continuous_medication: has_med, medications: has_med ? medications : null,
      has_chronic_disease: has_chronic, chronic_diseases: has_chronic ? chronic_diseases : null,
      allergies,
      emergency_contact_name: emerg_name, emergency_contact_phone: emerg_phone,
      cep, street, street_number, complement, neighborhood, city, state, country,
      status, hire_date, termination_date,
      work_location, salary: salary ? Number(salary) : null, notes,
    };
    await onSave({ ...payload, _photoFile: photoFile });
  };

  // ── Cabeçalho customizado: título + stepper ──
  const HeaderIcon = initial?.id ? EditIcon : UserPlus;
  const header = (
    <div className="bg-gradient-to-r from-[#06150c] via-[#0a1e13] to-[#0d2818] text-white">
      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <HeaderIcon className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-wide truncate">
              {initial?.id ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h3>
            <p className="text-[10px] font-bold font-mono text-emerald-300/90 mt-0.5 truncate">
              {initial?.id ? initial.full_name : 'Cadastro completo da equipe Shigueno'}
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors shrink-0 cursor-pointer">
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Stepper */}
      <div className="px-3 sm:px-6 pb-0 flex items-end gap-1 overflow-x-auto scrollbar-thin">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = s.key === step;
          const done = i < stepIdx;
          return (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-t-xl text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                active
                  ? 'bg-white text-emerald-900 border-amber-400'
                  : done
                    ? 'text-amber-400 border-transparent hover:bg-white/5'
                    : 'text-emerald-400/70 border-transparent hover:text-emerald-200 hover:bg-white/5'
              }`}
            >
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                active ? 'bg-emerald-800 text-white' : done ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-emerald-300'
              }`}>
                {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
              </span>
              <Icon className="w-3.5 h-3.5 hidden sm:block" />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Modal
      open
      onClose={onCancel}
      size="xl"
      header={header}
      lockBackdrop
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <div className="flex-1 hidden sm:block" />
          {stepIdx > 0 && (
            <Button variant="outline" icon={ChevronLeft} onClick={() => setStep(STEPS[stepIdx - 1].key)}>Anterior</Button>
          )}
          {stepIdx < STEPS.length - 1 ? (
            <Button variant="secondary" iconRight={ChevronRight} onClick={() => setStep(STEPS[stepIdx + 1].key)}>Próximo</Button>
          ) : null}
          <Button variant="primary" icon={Check} loading={saving} onClick={submit}>
            {saving ? 'Salvando...' : 'Salvar Funcionário'}
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

        {/* ── PASSO BÁSICO ── */}
        {step === 'basico' && (
          <div className="space-y-5 animate-fade-in">
            {/* Foto */}
            <div className="flex items-center gap-4 bg-slate-50/80 border border-slate-150 rounded-2xl p-4">
              <div className="relative shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="foto" className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md" />
                  : <div className={`w-20 h-20 rounded-2xl ${initial?.id ? avatarBg(initial.id) : 'bg-slate-200'} flex items-center justify-center text-white text-xl font-black shadow-inner`}>
                      {full_name ? full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : <Camera className="w-6 h-6 text-slate-400" />}
                    </div>
                }
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-b from-emerald-700 to-emerald-800 text-white rounded-lg p-1.5 hover:from-emerald-800 hover:to-emerald-900 cursor-pointer shadow-md">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Foto do funcionário</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">JPEG, PNG ou WebP · máx 4 MB</p>
                <Button variant="outline" size="xs" icon={Camera} className="mt-2" onClick={() => fileInputRef.current?.click()}>
                  Selecionar Foto
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Nome Completo" required className="sm:col-span-2">
                <Input value={full_name} onChange={(e: any) => setFullName(e.target.value)} placeholder="Ex: João da Silva" />
              </Field>
              <Field label="Status">
                <Select value={status} onChange={(e: any) => setStatus(e.target.value)}>
                  <option>Ativo</option><option>Afastado</option><option>Férias</option><option>Desligado</option>
                </Select>
              </Field>
              <Field label="Cargo / Função" required>
                <Input value={role} onChange={(e: any) => setRole(e.target.value)} placeholder="Ex: Operador de Máquinas" />
              </Field>
              <Field label="Departamento" required>
                <Input value={department} onChange={(e: any) => setDept(e.target.value)} list="dept-list" placeholder="Ex: Avicultura" />
                <datalist id="dept-list">{DEPARTMENTS.map(d => <option key={d} value={d} />)}</datalist>
              </Field>
              <Field label="Nível Hierárquico">
                <Select value={hierarchy_level} onChange={(e: any) => setLevel(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(l => <option key={l} value={l}>{l} · {LEVEL_LABELS[l]}</option>)}
                </Select>
              </Field>
              <Field label="Gestor / Superior Imediato" className="sm:col-span-2">
                <Select value={manager_id} onChange={(e: any) => setManagerId(e.target.value)}>
                  <option value="">— Sem gestor (nível raiz) —</option>
                  {possibleManagers.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name} · {m.role} · Nível {m.hierarchy_level}</option>
                  ))}
                </Select>
              </Field>
              <Field label="E-mail">
                <Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="joao@shigueno.com.br" />
              </Field>
              <Field label="Telefone / WhatsApp">
                <Input value={phone} onChange={(e: any) => setPhone(maskPhone(e.target.value))} placeholder="(15) 99999-0000" maxLength={15} />
              </Field>
              <Field label="Telefone 2">
                <Input value={phone2} onChange={(e: any) => setPhone2(maskPhone(e.target.value))} placeholder="Opcional" maxLength={15} />
              </Field>
            </div>
          </div>
        )}

        {/* ── PASSO PESSOAL ── */}
        {step === 'pessoal' && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="CPF">
                <Input value={cpf} onChange={(e: any) => setCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} className="font-mono" />
              </Field>
              <Field label="RG">
                <Input value={rg} onChange={(e: any) => setRg(e.target.value.replace(/[^0-9Xx\-\.]/g, '').slice(0, 18))} placeholder="00.000.000-0" className="font-mono" />
              </Field>
              <Field label="Sexo">
                <Select value={sex} onChange={(e: any) => setSex(e.target.value)}>
                  <option value="">—</option>
                  <option>Masculino</option><option>Feminino</option>
                  <option>Outro</option><option>Prefiro não informar</option>
                </Select>
              </Field>
              <Field label="Data de Nascimento">
                <Input type="date" value={birth_date} onChange={(e: any) => setBirthDate(e.target.value)} />
              </Field>
              <Field label="Tipo Sanguíneo">
                <Select value={blood_type} onChange={(e: any) => setBloodType(e.target.value)}>
                  <option value="">—</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Estado Civil">
                <Select value={marital_status} onChange={(e: any) => setMaritalStatus(e.target.value)}>
                  <option value="">—</option>
                  {['Solteiro','Casado','União Estável','Divorciado','Viúvo','Outro'].map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Tem filhos?">
                <Select value={has_children ? 'sim' : 'nao'} onChange={(e: any) => setHasChildren(e.target.value === 'sim')}>
                  <option value="nao">Não</option><option value="sim">Sim</option>
                </Select>
              </Field>
              {has_children && (
                <Field label="Quantos filhos?">
                  <Input type="number" min="1" max="20" value={children_count} onChange={(e: any) => setChildrenCount(Number(e.target.value))} />
                </Field>
              )}
              <Field label="Escolaridade" className={has_children ? '' : 'sm:col-span-2'}>
                <Select value={education} onChange={(e: any) => setEducation(e.target.value)}>
                  <option value="">—</option>
                  {['Fundamental Incompleto','Fundamental Completo','Médio Incompleto','Médio Completo','Superior Incompleto','Superior Completo','Pós-Graduação','Mestrado','Doutorado'].map(ed => <option key={ed}>{ed}</option>)}
                </Select>
              </Field>
            </div>

            {/* CNH */}
            <div className="bg-slate-50/80 border border-slate-150 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Habilitação (CNH)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Possui CNH?">
                  <Select value={has_cnh ? 'sim' : 'nao'} onChange={(e: any) => setHasCnh(e.target.value === 'sim')}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </Select>
                </Field>
                {has_cnh && (
                  <Field label="Categoria(s) — múltiplas" className="sm:col-span-2"
                    hint={cnh_category ? `Selecionado: ${cnh_category}` : undefined}>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['A','B','C','D','E','AB','AC','AD','AE','ACC'].map(cat => {
                        const selected = cnh_category.split(',').map(s => s.trim()).includes(cat);
                        return (
                          <button key={cat} type="button"
                            onClick={() => {
                              const current = cnh_category.split(',').map(s => s.trim()).filter(Boolean);
                              const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
                              setCnhCategory(next.join(', '));
                            }}
                            className={`px-3.5 py-1.5 text-[10px] font-black rounded-lg border cursor-pointer transition-all ${
                              selected
                                ? 'bg-gradient-to-b from-emerald-700 to-emerald-800 text-white border-emerald-800 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                            }`}>
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PASSO SAÚDE ── */}
        {step === 'saude' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 font-mono">Pessoa com Deficiência (PCD)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="É PCD?">
                  <Select value={is_pcd ? 'sim' : 'nao'} onChange={(e: any) => setIsPcd(e.target.value === 'sim')}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </Select>
                </Field>
                {is_pcd && (
                  <Field label="Tipo de Deficiência" className="sm:col-span-2">
                    <Input value={pcd_type} onChange={(e: any) => setPcdType(e.target.value)} list="pcd-list" placeholder="Ex: Física, Visual, Auditiva..." />
                    <datalist id="pcd-list">
                      {['Física','Visual','Auditiva','Intelectual','Múltipla','Transtorno do Espectro Autista (TEA)','Baixa Visão','Surdez','Surdocegueira'].map(p => <option key={p} value={p} />)}
                    </datalist>
                  </Field>
                )}
              </div>
            </div>

            <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 font-mono">Medicação Contínua</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Toma remédio contínuo?">
                  <Select value={has_med ? 'sim' : 'nao'} onChange={(e: any) => setHasMed(e.target.value === 'sim')}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </Select>
                </Field>
                {has_med && (
                  <Field label="Quais medicamentos?" className="sm:col-span-2">
                    <Textarea rows={2} value={medications} onChange={(e: any) => setMedications(e.target.value)} placeholder="Ex: Metformina 500mg, Losartana 50mg..." />
                  </Field>
                )}
              </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 font-mono">Doenças Crônicas / Condições de Saúde</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Possui doença crônica?">
                  <Select value={has_chronic ? 'sim' : 'nao'} onChange={(e: any) => setHasChronic(e.target.value === 'sim')}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </Select>
                </Field>
                {has_chronic && (
                  <Field label="Descrever condições" className="sm:col-span-2">
                    <Textarea rows={2} value={chronic_diseases} onChange={(e: any) => setChronicDis(e.target.value)} placeholder="Ex: Diabetes tipo 2, Hipertensão, Asma..." />
                  </Field>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Alergias conhecidas">
                <Input value={allergies} onChange={(e: any) => setAllergies(e.target.value)} placeholder="Ex: Dipirona, Penicilina, látex... ou Nenhuma" />
              </Field>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 font-mono">Contato de Emergência</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome">
                  <Input value={emerg_name} onChange={(e: any) => setEmergName(e.target.value)} placeholder="Ex: Maria da Silva (mãe)" />
                </Field>
                <Field label="Telefone">
                  <Input value={emerg_phone} onChange={(e: any) => setEmergPhone(maskPhone(e.target.value))} placeholder="(15) 99999-0000" />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* ── PASSO ENDEREÇO ── */}
        {step === 'endereco' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
            <Field label="CEP" hint="Preenche o endereço automaticamente">
              <div className="flex gap-2">
                <Input value={cep} onChange={(e: any) => setCep(maskCep(e.target.value))} placeholder="00000-000" maxLength={9} onBlur={fetchCep} className="font-mono" />
                <Button variant="primary" size="sm" icon={cepLoading ? RefreshCw : Search} loading={cepLoading} onClick={fetchCep} className="shrink-0">
                  Buscar
                </Button>
              </div>
            </Field>
            <Field label="Rua / Logradouro" className="sm:col-span-2">
              <Input value={street} onChange={(e: any) => setStreet(e.target.value)} placeholder="Rua, Avenida..." />
            </Field>
            <Field label="Número">
              <Input value={street_number} onChange={(e: any) => setStreetNum(e.target.value)} placeholder="123 / S/N" />
            </Field>
            <Field label="Complemento">
              <Input value={complement} onChange={(e: any) => setComplement(e.target.value)} placeholder="Apto, Bloco..." />
            </Field>
            <Field label="Bairro">
              <Input value={neighborhood} onChange={(e: any) => setNeighborhood(e.target.value)} />
            </Field>
            <Field label="Cidade">
              <Input value={city} onChange={(e: any) => setCity(e.target.value)} />
            </Field>
            <Field label="Estado (UF)">
              <Input value={state} onChange={(e: any) => setState(e.target.value)} maxLength={2} placeholder="SP" />
            </Field>
            <Field label="País">
              <Input value={country} onChange={(e: any) => setCountry(e.target.value)} />
            </Field>
          </div>
        )}

        {/* ── PASSO TRABALHO ── */}
        {step === 'trabalho' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
            <Field label="Data de Admissão">
              <Input type="date" value={hire_date} onChange={(e: any) => setHireDate(e.target.value)} />
            </Field>
            <Field label="Data de Desligamento">
              <Input type="date" value={termination_date} onChange={(e: any) => setTermDate(e.target.value)} />
            </Field>
            <Field label="Local de Trabalho">
              <Input value={work_location} onChange={(e: any) => setWorkLoc(e.target.value)} list="loc-list" placeholder="Tatuí (Sede)" />
              <datalist id="loc-list">{WORK_LOCATIONS.map(l => <option key={l} value={l} />)}</datalist>
            </Field>
            <Field label="Salário (R$)">
              <Input type="number" min="0" step="0.01" value={salary} onChange={(e: any) => setSalary(e.target.value)} placeholder="0,00" />
            </Field>
            <Field label="Observações Internas" className="sm:col-span-3">
              <Textarea rows={3} value={notes} onChange={(e: any) => setNotes(e.target.value)} placeholder="Habilidades, histórico, equipamentos..." />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  );
}
