import React from 'react';
import {
  Users, Search, Plus, X, Edit, Trash2, RefreshCw, AlertCircle,
  CheckCircle2, ChevronRight, Mail, Phone, Calendar, Star, Clock,
  FileText, Sparkles, Award, MessageSquare, ArrowRight, Send,
  Target, TrendingUp, UserCheck, Clipboard, AlertTriangle, Download,
  PlusCircle, BookOpen, Activity, BarChart2, CheckSquare, XCircle,
  Eye, Filter, ChevronDown, Briefcase
} from 'lucide-react';
import { Portal } from '../hooks/usePortal';
import { useUserPreferences } from '../hooks/useUserPreferences';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  vacancy_id: number | null;
  vacancy_title?: string;
  cv_text?: string;
  cv_filename?: string;
  applied_at: string;
  status: string;
  pipeline_stage?: string;
  salary_expectation?: string;
  availability?: string;
  source?: string;
  recruiter_rating?: number;
  ai_analysis?: any;
}

interface Interview {
  id: number;
  candidate_id: number;
  interviewer: string;
  scheduled_at: string;
  duration_min: number;
  type: string;
  location?: string;
  status: string;
  result: string;
  score?: number;
  notes?: string;
}

interface Evaluation {
  id: number;
  candidate_id: number;
  evaluator: string;
  evaluation_date: string;
  type: string;
  score_technical: number;
  score_communication: number;
  score_attitude: number;
  score_experience: number;
  score_cultural_fit: number;
  overall_score: number;
  strengths?: string;
  weaknesses?: string;
  recommendation: string;
  notes?: string;
}

interface Observation {
  id: number;
  candidate_id: number;
  author: string;
  type: string;
  content: string;
  is_private: boolean | number;
  created_at: string;
}

interface Referral {
  id: number;
  candidate_id: number;
  type: string;
  description: string;
  deadline?: string;
  status: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
}

interface Vacancy { id: number; title: string; department: string; }

// ── Helpers visuais ───────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: 'Novo',            color: 'bg-blue-100 text-blue-800 border-blue-200',      dot: 'bg-blue-500' },
  { key: 'Triagem',         color: 'bg-slate-100 text-slate-700 border-slate-200',   dot: 'bg-slate-400' },
  { key: 'Em Análise',      color: 'bg-amber-100 text-amber-800 border-amber-200',   dot: 'bg-amber-500' },
  { key: 'Entrevista RH',   color: 'bg-purple-100 text-purple-800 border-purple-200',dot: 'bg-purple-500' },
  { key: 'Entrevista Téc.', color: 'bg-indigo-100 text-indigo-800 border-indigo-200',dot: 'bg-indigo-500' },
  { key: 'Proposta',        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  { key: 'Aprovado',        color: 'bg-green-100 text-green-800 border-green-200',   dot: 'bg-green-500' },
  { key: 'Recusado',        color: 'bg-rose-100 text-rose-700 border-rose-200',      dot: 'bg-rose-500' },
  { key: 'Banco de Talentos',color:'bg-sky-100 text-sky-700 border-sky-200',         dot: 'bg-sky-400' },
];

const OBS_TYPE_ICONS: Record<string,string> = {
  'Observação': '📝', 'Contato': '📞', 'Encaminhamento': '📤',
  'Documento': '📄', 'Proposta': '💰', 'Alerta': '⚠️'
};

const stageInfo = (s?: string) => PIPELINE_STAGES.find(p => p.key === s) || PIPELINE_STAGES[0];

function fmtDate(s?: string | null) {
  if (!s) return '—';
  const clean = String(s).slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return String(s).slice(0,16).replace('T',' ');
  return new Date(clean + 'T00:00:00').toLocaleDateString('pt-BR');
}
function fmtDateTime(s?: string) {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString('pt-BR', { day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit' });
}

function ScoreBar({ value, max = 10, color = 'bg-emerald-500' }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }}/>
      </div>
      <span className="text-[10px] font-black text-slate-700 w-6 text-right">{value}</span>
    </div>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange?.(n)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}>
          <Star className={`w-3.5 h-3.5 ${n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}/>
        </button>
      ))}
    </div>
  );
}

// ── Modal: Ficha Completa do Candidato ────────────────────────────────────────
function CandidateModal({ candidate, vacancies, token, userName, onClose, onStatusChange, onRunAI, evaluatingId }: {
  candidate: Candidate;
  vacancies: Vacancy[];
  token: string;
  userName: string;
  onClose: () => void;
  onStatusChange: (id: number, status: string, stage?: string) => void;
  onRunAI: (id: number) => void;
  evaluatingId: number | null;
}) {
  const [activeTab, setActiveTab] = React.useState<'overview'|'interviews'|'evaluations'|'observations'|'referrals'|'ai'>('overview');
  const [interviews,   setInterviews]   = React.useState<Interview[]>([]);
  const [evaluations,  setEvaluations]  = React.useState<Evaluation[]>([]);
  const [observations, setObservations] = React.useState<Observation[]>([]);
  const [referrals,    setReferrals]    = React.useState<Referral[]>([]);
  const [loadingTab,   setLoadingTab]   = React.useState(false);

  // Form states
  const [showForm, setShowForm] = React.useState(false);

  // Interview form
  const [iInterviewer,   setIInterviewer]  = React.useState('');
  const [iDate,          setIDate]         = React.useState('');
  const [iTime,          setITime]         = React.useState('09:00');
  const [iDuration,      setIDuration]     = React.useState(60);
  const [iType,          setIType]         = React.useState('Entrevista RH');
  const [iLocation,      setILocation]     = React.useState('');
  const [iStatus,        setIStatus]       = React.useState('Agendada');
  const [iResult,        setIResult]       = React.useState('—');
  const [iScore,         setIScore]        = React.useState<number|''>('');
  const [iNotes,         setINotes]        = React.useState('');
  const [editingInt,     setEditingInt]    = React.useState<Interview|null>(null);

  // Evaluation form
  const [eEvaluator,     setEEvaluator]    = React.useState('');
  const [eDate,          setEDate]         = React.useState(new Date().toISOString().slice(0,10));
  const [eType,          setEType]         = React.useState('Competências');
  const [eTech,          setETech]         = React.useState(5);
  const [eComm,          setEComm]         = React.useState(5);
  const [eAtt,           setEAtt]          = React.useState(5);
  const [eExp,           setEExp]          = React.useState(5);
  const [eCult,          setECult]         = React.useState(5);
  const [eStrengths,     setEStrengths]    = React.useState('');
  const [eWeaknesses,    setEWeaknesses]   = React.useState('');
  const [eRec,           setERec]          = React.useState('Aguardar');
  const [eNotes,         setENotes]        = React.useState('');
  const [editingEval,    setEditingEval]   = React.useState<Evaluation|null>(null);

  // Observation form
  const [oAuthor,        setOAuthor]       = React.useState(userName);
  const [oType,          setOType]         = React.useState('Observação');
  const [oContent,       setOContent]      = React.useState('');
  const [oPrivate,       setOPrivate]      = React.useState(false);

  // Referral form
  const [rType,          setRType]         = React.useState('Documentação');
  const [rDesc,          setRDesc]         = React.useState('');
  const [rDeadline,      setRDeadline]     = React.useState('');
  const [rStatus,        setRStatus]       = React.useState('Pendente');
  const [rAssigned,      setRAssigned]     = React.useState('');
  const [editingRef,     setEditingRef]    = React.useState<Referral|null>(null);

  const [saving, setSaving] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState(candidate.status);
  const [localStage,  setLocalStage]  = React.useState(candidate.pipeline_stage || candidate.status);
  const [localRating, setLocalRating] = React.useState(candidate.recruiter_rating || 0);

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers||{}), Authorization: token } });

  const loadTab = React.useCallback(async (tab: string) => {
    if (tab === 'overview' || tab === 'ai') return;
    setLoadingTab(true);
    try {
      const endpointMap: Record<string,string> = {
        interviews:   `interviews`,
        evaluations:  `evaluations`,
        observations: `observations`,
        referrals:    `referrals`,
      };
      const ep = endpointMap[tab];
      if (!ep) return;
      const res = await fetch(`/api/recruitment/${candidate.id}/${ep}`);
      const d = await res.json();
      if (tab === 'interviews')   setInterviews(d.interviews || []);
      if (tab === 'evaluations')  setEvaluations(d.evaluations || []);
      if (tab === 'observations') setObservations(d.observations || []);
      if (tab === 'referrals')    setReferrals(d.referrals || []);
    } finally { setLoadingTab(false); }
  }, [candidate.id]);

  React.useEffect(() => { loadTab(activeTab); }, [activeTab, loadTab]);

  const switchTab = (t: typeof activeTab) => { setActiveTab(t); setShowForm(false); };

  const saveStatus = async (status: string, stage?: string) => {
    setLocalStatus(status);
    if (stage) setLocalStage(stage);
    onStatusChange(candidate.id, status, stage);
  };

  const saveRating = async (r: number) => {
    setLocalRating(r);
    await authFetch(`/api/recruitment/candidates/${candidate.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: localStatus, pipeline_stage: localStage, recruiter_rating: r }),
    });
  };

  // ── CRUD Interviews ──
  const saveInterview = async () => {
    if (!iInterviewer || !iDate) return;
    setSaving(true);
    const payload = {
      interviewer: iInterviewer, scheduled_at: `${iDate}T${iTime}:00`,
      duration_min: iDuration, type: iType, location: iLocation||null,
      status: iStatus, result: iResult, score: iScore||null, notes: iNotes||null,
    };
    if (editingInt) {
      await authFetch(`/api/recruitment/interviews/${editingInt.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    } else {
      await authFetch(`/api/recruitment/${candidate.id}/interviews`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    }
    setSaving(false); setShowForm(false); setEditingInt(null);
    setIInterviewer(''); setIDate(''); setITime('09:00'); setIDuration(60); setIType('Entrevista RH');
    setILocation(''); setIStatus('Agendada'); setIResult('—'); setIScore(''); setINotes('');
    loadTab('interviews');
  };

  const openEditInt = (i: Interview) => {
    setEditingInt(i);
    const dt = i.scheduled_at.includes('T') ? i.scheduled_at : i.scheduled_at.replace(' ','T');
    setIDate(dt.slice(0,10)); setITime(dt.slice(11,16));
    setIInterviewer(i.interviewer); setIDuration(i.duration_min); setIType(i.type);
    setILocation(i.location||''); setIStatus(i.status); setIResult(i.result);
    setIScore(i.score||''); setINotes(i.notes||''); setShowForm(true);
  };

  const deleteInterview = async (id: number) => {
    if (!confirm('Remover esta entrevista?')) return;
    await authFetch(`/api/recruitment/interviews/${id}`, { method:'DELETE' });
    loadTab('interviews');
  };

  // ── CRUD Evaluations ──
  const saveEvaluation = async () => {
    if (!eEvaluator || !eDate) return;
    setSaving(true);
    const payload = {
      evaluator: eEvaluator, evaluation_date: eDate, type: eType,
      score_technical: eTech, score_communication: eComm, score_attitude: eAtt,
      score_experience: eExp, score_cultural_fit: eCult,
      strengths: eStrengths||null, weaknesses: eWeaknesses||null,
      recommendation: eRec, notes: eNotes||null,
    };
    if (editingEval) {
      await authFetch(`/api/recruitment/evaluations/${editingEval.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    } else {
      await authFetch(`/api/recruitment/${candidate.id}/evaluations`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    }
    setSaving(false); setShowForm(false); setEditingEval(null);
    setEEvaluator(''); setEDate(new Date().toISOString().slice(0,10)); setEType('Competências');
    setETech(5); setEComm(5); setEAtt(5); setEExp(5); setECult(5);
    setEStrengths(''); setEWeaknesses(''); setERec('Aguardar'); setENotes('');
    loadTab('evaluations');
  };

  const openEditEval = (ev: Evaluation) => {
    setEditingEval(ev);
    setEEvaluator(ev.evaluator); setEDate(String(ev.evaluation_date).slice(0,10));
    setEType(ev.type); setETech(ev.score_technical); setEComm(ev.score_communication);
    setEAtt(ev.score_attitude); setEExp(ev.score_experience); setECult(ev.score_cultural_fit);
    setEStrengths(ev.strengths||''); setEWeaknesses(ev.weaknesses||'');
    setERec(ev.recommendation); setENotes(ev.notes||''); setShowForm(true);
  };

  const deleteEval = async (id: number) => {
    if (!confirm('Remover esta avaliação?')) return;
    await authFetch(`/api/recruitment/evaluations/${id}`, { method:'DELETE' });
    loadTab('evaluations');
  };

  // ── Observations ──
  const saveObservation = async () => {
    if (!oContent.trim()) return;
    setSaving(true);
    await authFetch(`/api/recruitment/${candidate.id}/observations`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ author: oAuthor||userName, type: oType, content: oContent, is_private: oPrivate }),
    });
    setSaving(false); setOContent(''); setOType('Observação'); setOPrivate(false);
    loadTab('observations');
  };

  const deleteObs = async (id: number) => {
    if (!confirm('Remover observação?')) return;
    await authFetch(`/api/recruitment/observations/${id}`, { method:'DELETE' });
    loadTab('observations');
  };

  // ── Referrals ──
  const saveReferral = async () => {
    if (!rDesc.trim()) return;
    setSaving(true);
    const payload = { type: rType, description: rDesc, deadline: rDeadline||null, status: rStatus, assigned_to: rAssigned||null };
    if (editingRef) {
      await authFetch(`/api/recruitment/referrals/${editingRef.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    } else {
      await authFetch(`/api/recruitment/${candidate.id}/referrals`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    }
    setSaving(false); setShowForm(false); setEditingRef(null);
    setRDesc(''); setRType('Documentação'); setRDeadline(''); setRStatus('Pendente'); setRAssigned('');
    loadTab('referrals');
  };

  const openEditRef = (r: Referral) => {
    setEditingRef(r); setRType(r.type); setRDesc(r.description);
    setRDeadline(r.deadline ? String(r.deadline).slice(0,10) : '');
    setRStatus(r.status); setRAssigned(r.assigned_to||''); setShowForm(true);
  };

  const deleteRef = async (id: number) => {
    if (!confirm('Remover encaminhamento?')) return;
    await authFetch(`/api/recruitment/referrals/${id}`, { method:'DELETE' });
    loadTab('referrals');
  };

  const aiData = (() => {
    if (!candidate.ai_analysis) return null;
    if (typeof candidate.ai_analysis === 'string') {
      try { return JSON.parse(candidate.ai_analysis); } catch { return null; }
    }
    return candidate.ai_analysis;
  })();

  const avgEval = evaluations.length > 0
    ? Math.round(evaluations.reduce((a,e) => a + Number(e.overall_score), 0) / evaluations.length * 10) / 10
    : null;

  const iField = 'w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors';
  const iLbl   = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';

  const tabs: { key: typeof activeTab; label: string; icon: React.ElementType; count?: number }[] = [
    { key:'overview',     label:'Ficha',         icon: FileText },
    { key:'interviews',   label:'Entrevistas',   icon: Calendar,     count: interviews.length },
    { key:'evaluations',  label:'Avaliações',    icon: BarChart2,    count: evaluations.length },
    { key:'observations', label:'Observações',   icon: MessageSquare,count: observations.length },
    { key:'referrals',    label:'Encaminhamentos',icon: Send,         count: referrals.length },
    { key:'ai',           label:'Análise IA',    icon: Sparkles },
  ];

  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl h-[95vh] sm:max-h-[92vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

          {/* ── Header verde ── */}
          <div className="bg-gradient-to-br from-[#0a1e13] to-[#0d3320] text-white p-5 rounded-t-3xl shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${stageInfo(localStage).color}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${stageInfo(localStage).dot}`}/>
                    {localStage || 'Novo'}
                  </span>
                  <span className="text-[9px] text-emerald-300 font-bold">#{candidate.id}</span>
                  {candidate.source && <span className="text-[9px] text-emerald-400 font-bold">{candidate.source}</span>}
                </div>
                <h2 className="text-xl font-black text-white leading-tight truncate">{candidate.name}</h2>
                <p className="text-sm text-emerald-300 font-semibold mt-0.5 truncate">
                  {candidate.vacancy_title || 'Candidatura Espontânea'}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-[11px]">
                  {candidate.email && <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 text-emerald-200 hover:text-white"><Mail className="w-3 h-3"/>{candidate.email}</a>}
                  {candidate.phone && <a href={`tel:${candidate.phone}`} className="flex items-center gap-1 text-emerald-200 hover:text-white"><Phone className="w-3 h-3"/>{candidate.phone}</a>}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <button onClick={onClose} className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X className="w-5 h-5"/>
                </button>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[8px] text-emerald-400 uppercase font-bold tracking-wider">Nota do recrutador</p>
                  <Stars value={localRating} onChange={saveRating}/>
                </div>
              </div>
            </div>

            {/* Pipeline stages */}
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {PIPELINE_STAGES.map(s => (
                <button key={s.key} onClick={() => saveStatus(
                  ['Aprovado','Recusado'].includes(s.key) ? s.key : 'Em Análise', s.key
                )}
                  className={`text-[9px] font-black px-2.5 py-1 rounded-full border cursor-pointer whitespace-nowrap transition-all ${
                    localStage === s.key ? s.color + ' ring-1 ring-white/30' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                  }`}>
                  {s.key}
                </button>
              ))}
            </div>
          </div>

          {/* ── Abas ── */}
          <div className="flex border-b border-slate-100 bg-white shrink-0 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon, count }) => (
              <button key={key} onClick={() => switchTab(key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-black uppercase tracking-wide cursor-pointer border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}>
                <Icon className="w-3.5 h-3.5"/>
                {label}
                {count !== undefined && count > 0 && (
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Conteúdo das abas ── */}
          <div className="flex-1 overflow-y-auto">
            {loadingTab ? (
              <div className="py-16 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-700"/></div>
            ) : (
              <div className="p-5 space-y-5">

                {/* ─────────────── ABA: FICHA ─────────────── */}
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    {/* Info geral */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dados da Candidatura</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-slate-500">Aplicou em</span><span className="font-bold text-slate-800">{fmtDate(candidate.applied_at)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Vaga</span><span className="font-bold text-slate-800 text-right max-w-[60%] truncate">{candidate.vacancy_title || 'Espontânea'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Origem</span><span className="font-bold text-slate-800">{candidate.source || 'Portal'}</span></div>
                          {candidate.salary_expectation && <div className="flex justify-between"><span className="text-slate-500">Pretensão</span><span className="font-bold text-emerald-700">{candidate.salary_expectation}</span></div>}
                          {candidate.availability && <div className="flex justify-between"><span className="text-slate-500">Disponibilidade</span><span className="font-bold text-slate-800">{candidate.availability}</span></div>}
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Desempenho Agregado</p>
                        <div className="space-y-2.5">
                          {aiData && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Sparkles className="w-3 h-3 text-indigo-500"/>Score IA</span>
                              <span className="text-sm font-black text-indigo-700">{aiData.score}%</span>
                            </div>
                          )}
                          {avgEval !== null && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1"><BarChart2 className="w-3 h-3 text-purple-500"/>Média avaliações</span>
                              <span className="text-sm font-black text-purple-700">{avgEval}/10</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Nota recrutador</span>
                            <Stars value={localRating}/>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Entrevistas</span>
                            <span className="text-xs font-bold text-slate-700">{interviews.length || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CV */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currículo / Experiência</p>
                        {candidate.cv_filename && (
                          <a href={`/api/candidates/${candidate.id}/cv`} download={candidate.cv_filename}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg hover:bg-emerald-100">
                            <Download className="w-3 h-3"/>Baixar CV
                          </a>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 max-h-52 overflow-y-auto">
                        {candidate.cv_text || (candidate.cv_filename ? `📎 Arquivo: ${candidate.cv_filename}` : '—')}
                      </div>
                    </div>

                    {/* Ações rápidas */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      {PIPELINE_STAGES.slice(0,7).map(s => (
                        <button key={s.key} onClick={() => saveStatus(
                          ['Aprovado'].includes(s.key)?'Aprovado':['Recusado'].includes(s.key)?'Recusado':'Em Análise', s.key
                        )}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-xl border cursor-pointer transition-all ${
                            localStage === s.key ? s.color : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}>
                          {s.key}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─────────────── ABA: ENTREVISTAS ─────────────── */}
                {activeTab === 'interviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Entrevistas Agendadas / Realizadas</p>
                      <button onClick={() => { setShowForm(v=>!v); setEditingInt(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-black rounded-xl cursor-pointer">
                        <Plus className="w-3.5 h-3.5"/>{showForm ? 'Cancelar' : 'Nova Entrevista'}
                      </button>
                    </div>

                    {showForm && (
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-200">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <label className={iLbl}>Entrevistador *</label>
                            <input className={iField} value={iInterviewer} onChange={e=>setIInterviewer(e.target.value)} placeholder="Nome do entrevistador"/>
                          </div>
                          <div>
                            <label className={iLbl}>Data *</label>
                            <input type="date" className={iField} value={iDate} onChange={e=>setIDate(e.target.value)}/>
                          </div>
                          <div>
                            <label className={iLbl}>Horário</label>
                            <input type="time" className={iField} value={iTime} onChange={e=>setITime(e.target.value)}/>
                          </div>
                          <div>
                            <label className={iLbl}>Tipo</label>
                            <select className={iField} value={iType} onChange={e=>setIType(e.target.value)}>
                              {['Triagem Telefônica','Entrevista RH','Entrevista Técnica','Entrevista Final','Dinâmica de Grupo','Teste Prático'].map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={iLbl}>Duração (min)</label>
                            <input type="number" min="15" step="15" className={iField} value={iDuration} onChange={e=>setIDuration(Number(e.target.value))}/>
                          </div>
                          <div>
                            <label className={iLbl}>Local / Link</label>
                            <input className={iField} value={iLocation} onChange={e=>setILocation(e.target.value)} placeholder="Presencial / Meet..."/>
                          </div>
                          <div>
                            <label className={iLbl}>Status</label>
                            <select className={iField} value={iStatus} onChange={e=>setIStatus(e.target.value)}>
                              {['Agendada','Realizada','Cancelada','Não Compareceu'].map(s=><option key={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={iLbl}>Resultado</label>
                            <select className={iField} value={iResult} onChange={e=>setIResult(e.target.value)}>
                              {['—','Aprovado','Reprovado','Em análise'].map(r=><option key={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={iLbl}>Pontuação (0-10)</label>
                            <input type="number" min="0" max="10" className={iField} value={iScore} onChange={e=>setIScore(e.target.value===''?'':Number(e.target.value))} placeholder="—"/>
                          </div>
                          <div className="col-span-2 sm:col-span-3">
                            <label className={iLbl}>Anotações / Feedback</label>
                            <textarea rows={3} className={iField} value={iNotes} onChange={e=>setINotes(e.target.value)} placeholder="Impressões, pontos observados..."/>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={()=>{setShowForm(false);setEditingInt(null);}} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">Cancelar</button>
                          <button onClick={saveInterview} disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin"/>}{editingInt?'Atualizar':'Salvar'}
                          </button>
                        </div>
                      </div>
                    )}

                    {interviews.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40"/>
                        <p className="text-sm font-bold">Nenhuma entrevista registrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {interviews.map(i => (
                          <div key={i.id} className={`bg-white rounded-2xl border p-4 transition-all ${i.status==='Agendada'?'border-emerald-200':'border-slate-100'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <span className="text-xs font-black text-slate-900">{i.type}</span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                    i.status==='Realizada'?'bg-emerald-50 text-emerald-700 border-emerald-200':
                                    i.status==='Agendada'?'bg-blue-50 text-blue-700 border-blue-200':
                                    i.status==='Cancelada'?'bg-rose-50 text-rose-700 border-rose-200':
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>{i.status}</span>
                                  {i.result !== '—' && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${i.result==='Aprovado'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-rose-50 text-rose-700 border-rose-200'}`}>{i.result}</span>}
                                  {i.score !== null && i.score !== undefined && <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{i.score}/10</span>}
                                </div>
                                <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{fmtDateTime(i.scheduled_at)}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{i.duration_min}min</span>
                                  <span className="flex items-center gap-1"><UserCheck className="w-3 h-3"/>{i.interviewer}</span>
                                  {i.location && <span>{i.location}</span>}
                                </div>
                                {i.notes && <p className="text-[11px] text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">{i.notes}</p>}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={()=>openEditInt(i)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"><Edit className="w-3.5 h-3.5"/></button>
                                <button onClick={()=>deleteInterview(i.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─────────────── ABA: AVALIAÇÕES ─────────────── */}
                {activeTab === 'evaluations' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Avaliações de Desempenho</p>
                      <button onClick={() => { setShowForm(v=>!v); setEditingEval(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-black rounded-xl cursor-pointer">
                        <Plus className="w-3.5 h-3.5"/>{showForm ? 'Cancelar' : 'Nova Avaliação'}
                      </button>
                    </div>

                    {showForm && (
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-200">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <label className={iLbl}>Avaliador *</label>
                            <input className={iField} value={eEvaluator} onChange={e=>setEEvaluator(e.target.value)} placeholder="Nome do avaliador"/>
                          </div>
                          <div>
                            <label className={iLbl}>Data *</label>
                            <input type="date" className={iField} value={eDate} onChange={e=>setEDate(e.target.value)}/>
                          </div>
                          <div>
                            <label className={iLbl}>Tipo</label>
                            <select className={iField} value={eType} onChange={e=>setEType(e.target.value)}>
                              {['Triagem','Competências','Comportamental','Técnica','Cultural','Final'].map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Critérios de pontuação */}
                        <div className="bg-white rounded-xl p-4 space-y-3 border border-slate-200">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critérios (0-10)</p>
                          {[
                            ['Técnico / Conhecimento', eTech, setETech],
                            ['Comunicação', eComm, setEComm],
                            ['Atitude / Comportamento', eAtt, setEAtt],
                            ['Experiência relevante', eExp, setEExp],
                            ['Fit Cultural', eCult, setECult],
                          ].map(([label, val, setter]) => (
                            <div key={String(label)} className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-600 font-semibold w-40 shrink-0">{String(label)}</span>
                              <input type="range" min="0" max="10" value={Number(val)}
                                onChange={e => (setter as any)(Number(e.target.value))}
                                className="flex-1 h-2 rounded-full cursor-pointer accent-emerald-700"
                                style={{ background: `linear-gradient(to right, #047857 0%, #047857 ${Number(val)*10}%, #e2e8f0 ${Number(val)*10}%, #e2e8f0 100%)` }}/>
                              <span className="text-xs font-black text-slate-800 w-5 text-right">{Number(val)}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase">Média geral</span>
                            <span className={`text-base font-black ${((eTech+eComm+eAtt+eExp+eCult)/5)>=7?'text-emerald-700':((eTech+eComm+eAtt+eExp+eCult)/5)>=5?'text-amber-600':'text-rose-600'}`}>
                              {((eTech+eComm+eAtt+eExp+eCult)/5).toFixed(1)}/10
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={iLbl}>Pontos Fortes</label>
                            <textarea rows={2} className={iField} value={eStrengths} onChange={e=>setEStrengths(e.target.value)} placeholder="Destaque positivos observados..."/>
                          </div>
                          <div>
                            <label className={iLbl}>Pontos de Atenção</label>
                            <textarea rows={2} className={iField} value={eWeaknesses} onChange={e=>setEWeaknesses(e.target.value)} placeholder="Lacunas identificadas..."/>
                          </div>
                          <div>
                            <label className={iLbl}>Recomendação</label>
                            <select className={iField} value={eRec} onChange={e=>setERec(e.target.value)}>
                              {['Contratar','Banco de Talentos','Não Recomendado','Aguardar'].map(r=><option key={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={iLbl}>Observações</label>
                            <input className={iField} value={eNotes} onChange={e=>setENotes(e.target.value)} placeholder="Detalhes adicionais..."/>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button onClick={()=>{setShowForm(false);setEditingEval(null);}} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                          <button onClick={saveEvaluation} disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin"/>}{editingEval?'Atualizar':'Salvar'}
                          </button>
                        </div>
                      </div>
                    )}

                    {evaluations.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-40"/>
                        <p className="text-sm font-bold">Nenhuma avaliação registrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {evaluations.map(ev => (
                          <div key={ev.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-black text-slate-900">{ev.type}</span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                    ev.recommendation==='Contratar'?'bg-emerald-50 text-emerald-700 border-emerald-200':
                                    ev.recommendation==='Não Recomendado'?'bg-rose-50 text-rose-700 border-rose-200':
                                    ev.recommendation==='Banco de Talentos'?'bg-sky-50 text-sky-700 border-sky-200':
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>{ev.recommendation}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">{fmtDate(ev.evaluation_date)} · {ev.evaluator}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className={`text-center px-3 py-1.5 rounded-xl ${Number(ev.overall_score)>=7?'bg-emerald-50 text-emerald-700':Number(ev.overall_score)>=5?'bg-amber-50 text-amber-700':'bg-rose-50 text-rose-700'}`}>
                                  <p className="text-lg font-black leading-none">{Number(ev.overall_score).toFixed(1)}</p>
                                  <p className="text-[8px] font-bold">/ 10</p>
                                </div>
                                <button onClick={()=>openEditEval(ev)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"><Edit className="w-3.5 h-3.5"/></button>
                                <button onClick={()=>deleteEval(ev.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                ['Técnico', ev.score_technical],
                                ['Comunicação', ev.score_communication],
                                ['Atitude', ev.score_attitude],
                                ['Experiência', ev.score_experience],
                                ['Fit Cultural', ev.score_cultural_fit],
                              ].map(([label, val]) => (
                                <div key={String(label)}>
                                  <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                                    <span>{String(label)}</span><span>{Number(val)}/10</span>
                                  </div>
                                  <ScoreBar value={Number(val)} color={Number(val)>=7?'bg-emerald-500':Number(val)>=5?'bg-amber-500':'bg-rose-500'}/>
                                </div>
                              ))}
                            </div>
                            {(ev.strengths || ev.weaknesses) && (
                              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-[10px]">
                                {ev.strengths && <div><p className="font-black text-emerald-700 mb-1">💪 Pontos Fortes</p><p className="text-slate-600 leading-relaxed">{ev.strengths}</p></div>}
                                {ev.weaknesses && <div><p className="font-black text-amber-700 mb-1">⚠️ Atenção</p><p className="text-slate-600 leading-relaxed">{ev.weaknesses}</p></div>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─────────────── ABA: OBSERVAÇÕES ─────────────── */}
                {activeTab === 'observations' && (
                  <div className="space-y-4">
                    {/* Form rápido */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adicionar observação / contato</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className={iLbl}>Tipo</label>
                          <select className={iField} value={oType} onChange={e=>setOType(e.target.value)}>
                            {['Observação','Contato','Encaminhamento','Documento','Proposta','Alerta'].map(t=><option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={iLbl}>Autor</label>
                          <input className={iField} value={oAuthor} onChange={e=>setOAuthor(e.target.value)}/>
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 pb-2">
                            <input type="checkbox" checked={oPrivate} onChange={e=>setOPrivate(e.target.checked)} className="accent-emerald-700"/>
                            Privado
                          </label>
                        </div>
                        <div className="col-span-2 sm:col-span-3">
                          <label className={iLbl}>Conteúdo *</label>
                          <textarea rows={3} className={iField} value={oContent} onChange={e=>setOContent(e.target.value)}
                            placeholder="Descreva o contato realizado, observação ou encaminhamento..."/>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={saveObservation} disabled={saving || !oContent.trim()}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60">
                          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
                          Registrar
                        </button>
                      </div>
                    </div>

                    {/* Timeline */}
                    {observations.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40"/>
                        <p className="text-sm font-bold">Nenhuma observação registrada</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {observations.map(o => (
                          <div key={o.id} className={`bg-white rounded-2xl border p-4 flex gap-3 ${o.is_private ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
                              {OBS_TYPE_ICONS[o.type] || '📝'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[10px] font-black text-slate-700">{o.type}</span>
                                <span className="text-[9px] text-slate-400">por <strong>{o.author}</strong></span>
                                <span className="text-[9px] text-slate-400">{fmtDateTime(o.created_at)}</span>
                                {o.is_private && <span className="text-[8px] bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded-md">Privado</span>}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">{o.content}</p>
                            </div>
                            <button onClick={()=>deleteObs(o.id)} className="p-1 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 cursor-pointer shrink-0">
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─────────────── ABA: ENCAMINHAMENTOS ─────────────── */}
                {activeTab === 'referrals' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Encaminhamentos & Tarefas</p>
                      <button onClick={() => { setShowForm(v=>!v); setEditingRef(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-black rounded-xl cursor-pointer">
                        <Plus className="w-3.5 h-3.5"/>{showForm ? 'Cancelar' : 'Novo Encaminhamento'}
                      </button>
                    </div>

                    {showForm && (
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <label className={iLbl}>Tipo</label>
                            <select className={iField} value={rType} onChange={e=>setRType(e.target.value)}>
                              {['Proposta Salarial','Exame Admissional','Documentação','Carta Oferta','Integração','Outro'].map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={iLbl}>Prazo</label>
                            <input type="date" className={iField} value={rDeadline} onChange={e=>setRDeadline(e.target.value)}/>
                          </div>
                          <div>
                            <label className={iLbl}>Status</label>
                            <select className={iField} value={rStatus} onChange={e=>setRStatus(e.target.value)}>
                              {['Pendente','Em andamento','Concluído','Cancelado'].map(s=><option key={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className={iLbl}>Descrição *</label>
                            <input className={iField} value={rDesc} onChange={e=>setRDesc(e.target.value)} placeholder="Descreva o encaminhamento..."/>
                          </div>
                          <div>
                            <label className={iLbl}>Responsável</label>
                            <input className={iField} value={rAssigned} onChange={e=>setRAssigned(e.target.value)} placeholder="Nome do responsável"/>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={()=>{setShowForm(false);setEditingRef(null);}} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                          <button onClick={saveReferral} disabled={saving||!rDesc.trim()} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin"/>}{editingRef?'Atualizar':'Salvar'}
                          </button>
                        </div>
                      </div>
                    )}

                    {referrals.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Send className="w-8 h-8 mx-auto mb-2 opacity-40"/>
                        <p className="text-sm font-bold">Nenhum encaminhamento</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {referrals.map(r => (
                          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${r.status==='Concluído'?'bg-emerald-50 text-emerald-700':r.status==='Pendente'?'bg-amber-50 text-amber-700':'bg-slate-100 text-slate-500'}`}>
                              <CheckSquare className="w-4 h-4"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xs font-black text-slate-900">{r.description}</span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                  r.status==='Concluído'?'bg-emerald-50 text-emerald-700 border-emerald-200':
                                  r.status==='Pendente'?'bg-amber-50 text-amber-700 border-amber-200':
                                  r.status==='Em andamento'?'bg-blue-50 text-blue-700 border-blue-200':
                                  'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>{r.status}</span>
                              </div>
                              <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                                <span>{r.type}</span>
                                {r.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>Prazo: {fmtDate(r.deadline)}</span>}
                                {r.assigned_to && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3"/>{r.assigned_to}</span>}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={()=>openEditRef(r)} className="p-1.5 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"><Edit className="w-3.5 h-3.5"/></button>
                              <button onClick={()=>deleteRef(r.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─────────────── ABA: ANÁLISE IA ─────────────── */}
                {activeTab === 'ai' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"/>
                        </span>
                        <p className="text-xs font-black text-slate-700 uppercase">Módulo IA Gemini — Grupo Shigueno</p>
                      </div>
                      <button onClick={() => onRunAI(candidate.id)} disabled={evaluatingId === candidate.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60">
                        {evaluatingId === candidate.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
                        {evaluatingId === candidate.id ? 'Analisando...' : 'Rodar Análise IA'}
                      </button>
                    </div>

                    {!aiData ? (
                      <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Sparkles className="w-8 h-8 mx-auto mb-3 text-slate-300"/>
                        <p className="text-sm font-bold text-slate-500">Nenhuma análise IA ainda</p>
                        <p className="text-xs text-slate-400 mt-1">Clique em "Rodar Análise IA" para gerar insights sobre este candidato</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Score */}
                        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 rounded-2xl p-5 text-white flex items-center gap-5">
                          <div className="text-center shrink-0">
                            <p className="text-4xl font-black text-white">{aiData.score}%</p>
                            <p className="text-[9px] text-emerald-300 uppercase font-bold tracking-wider mt-1">Aderência</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] font-black text-emerald-300 uppercase tracking-wider mb-1">Diagnóstico</p>
                            <p className="text-xs text-white/80 leading-relaxed">{aiData.summary}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white border border-slate-100 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-emerald-700 uppercase mb-2">💪 Pontos Fortes</p>
                            <ul className="space-y-1.5">
                              {aiData.strengths?.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                                  <span className="text-emerald-600 font-bold mt-0.5">•</span>{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white border border-slate-100 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-amber-700 uppercase mb-2">⚠️ Pontos de Atenção</p>
                            <ul className="space-y-1.5">
                              {aiData.gaps?.map((g: string, i: number) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                                  <span className="text-amber-600 font-bold mt-0.5">•</span>{g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {aiData.recommendations && (
                          <div className="bg-white border border-slate-100 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Recomendação</p>
                            <p className="text-xs text-slate-800 font-semibold leading-relaxed">{aiData.recommendations}</p>
                          </div>
                        )}

                        {aiData.questions?.length > 0 && (
                          <div className="bg-emerald-950 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-emerald-300 uppercase mb-3">💬 Perguntas Sugeridas para Entrevista</p>
                            <div className="space-y-2">
                              {aiData.questions.map((q: string, i: number) => (
                                <div key={i} className="bg-emerald-900/40 rounded-xl px-3 py-2.5 text-[11px] text-emerald-100 leading-relaxed flex gap-2">
                                  <span className="font-black text-emerald-400 shrink-0">{i+1}.</span>{q}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ── Componente principal CandidatesTab ────────────────────────────────────────
export default function CandidatesTab({ token, vacancies, userName, canEdit, onOpenPage }: {
  token: string;
  vacancies: { id: number; title: string; department: string }[];
  userName: string;
  onOpenPage?: (uid: string) => void;
  canEdit: boolean;
}) {
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [vacFilter, setVacFilter] = React.useState('Todos');
  const [stageFilter, setStageFilter] = React.useState('Todos');
  const [viewingCandidate, setViewingCandidate] = React.useState<Candidate|null>(null);
  const [evaluatingId, setEvaluatingId] = React.useState<number|null>(null);
  const [success, setSuccess] = React.useState('');
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Add candidate form
  const [addName, setAddName] = React.useState('');
  const [addEmail, setAddEmail] = React.useState('');
  const [addPhone, setAddPhone] = React.useState('');
  const [addVacancy, setAddVacancy] = React.useState('');
  const [addCvText, setAddCvText] = React.useState('');
  const [addSalary, setAddSalary] = React.useState('');
  const [addSource, setAddSource] = React.useState('Manual');
  const [addSaving, setAddSaving] = React.useState(false);

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers||{}), Authorization: token } });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/candidates');
      const d = await res.json();
      if (d.success) setCandidates(d.candidates || []);
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const showOk = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  const updateStatus = async (id: number, status: string, stage?: string) => {
    // Update locally
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status, pipeline_stage: stage || status } : c));
    if (viewingCandidate?.id === id) setViewingCandidate(prev => prev ? { ...prev, status, pipeline_stage: stage || status } : null);
    await authFetch(`/api/candidates/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (stage) {
      await authFetch(`/api/recruitment/candidates/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, pipeline_stage: stage }),
      });
    }
    showOk(`Status atualizado: ${stage || status}`);
  };

  const runAI = async (id: number) => {
    setEvaluatingId(id);
    try {
      const res = await authFetch(`/api/candidates/${id}/evaluate`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, ai_analysis: d.ai_analysis } : c));
        if (viewingCandidate?.id === id) setViewingCandidate(prev => prev ? { ...prev, ai_analysis: d.ai_analysis } : null);
        showOk('Análise IA concluída!');
      }
    } finally { setEvaluatingId(null); }
  };

  const deleteCandidate = async (id: number) => {
    if (!confirm('Remover este candidato do banco?')) return;
    await authFetch(`/api/candidates/${id}`, { method: 'DELETE' });
    setViewingCandidate(null);
    load();
    showOk('Candidato removido.');
  };

  const addCandidate = async () => {
    if (!addName || !addEmail) return;
    setAddSaving(true);
    try {
      const res = await authFetch('/api/candidates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName, email: addEmail, phone: addPhone||null, vacancy_id: addVacancy||null, cv_text: addCvText||null }),
      });
      const d = await res.json();
      if (d.success) {
        showOk('Candidato registrado!');
        setShowAddModal(false);
        setAddName(''); setAddEmail(''); setAddPhone(''); setAddVacancy(''); setAddCvText(''); setAddSalary(''); setAddSource('Manual');
        load();
      }
    } finally { setAddSaving(false); }
  };

  // Métricas
  const total = candidates.length;
  const novo = candidates.filter(c => c.status === 'Novo').length;
  const emAnalise = candidates.filter(c => c.status === 'Em Análise').length;
  const aprovados = candidates.filter(c => c.status === 'Aprovado').length;
  const triados = candidates.filter(c => c.ai_analysis).length;

  // Filtro
  const filtered = React.useMemo(() => {
    let list = candidates;
    if (vacFilter !== 'Todos') list = list.filter(c => String(c.vacancy_id) === vacFilter || (vacFilter === 'null' && !c.vacancy_id));
    if (stageFilter !== 'Todos') list = list.filter(c => (c.pipeline_stage || c.status) === stageFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.vacancy_title||'').toLowerCase().includes(q));
    }
    return list;
  }, [candidates, vacFilter, stageFilter, search]);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {success && (
        <Portal>
          <div className="fixed top-5 right-5 z-[99999]">
            <div className="bg-emerald-800 text-white rounded-2xl px-5 py-3.5 text-xs font-bold flex items-center gap-3 shadow-2xl min-w-[260px]">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300"/>{success}
              <button onClick={() => setSuccess('')} className="ml-auto text-emerald-300 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        </Portal>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total', value:total, icon:Users, color:'bg-slate-50 text-slate-700', border:'border-slate-200' },
          { label:'Novos', value:novo, icon:PlusCircle, color:'bg-blue-50 text-blue-700', border:'border-blue-200' },
          { label:'Em Análise', value:emAnalise, icon:Activity, color:'bg-amber-50 text-amber-700', border:'border-amber-200' },
          { label:'Aprovados', value:aprovados, icon:CheckCircle2, color:'bg-emerald-50 text-emerald-700', border:'border-emerald-200' },
        ].map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-2xl border ${border} p-4 flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)]`}>
            <div className={`p-2.5 rounded-xl shrink-0 ${color}`}><Icon className="w-4 h-4"/></div>
            <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-wide">{label}</p><p className="text-xl font-black text-slate-900">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Barra de filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, email ou vaga..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all"/>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={vacFilter} onChange={e=>setVacFilter(e.target.value)} className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer">
            <option value="Todos">Todas as vagas</option>
            {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            <option value="null">Espontâneas</option>
          </select>
          <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer">
            <option value="Todos">Todos os estágios</option>
            {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
          </select>
          <button onClick={load} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin':''}`}/>
          </button>
          {canEdit && (
            <button onClick={()=>setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
              <Plus className="w-3.5 h-3.5"/>Incluir Candidato
            </button>
          )}
        </div>
      </div>

      {/* Lista de candidatos */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin text-emerald-700"/>
          <span className="text-sm">Carregando candidatos...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
          <p className="text-sm font-bold text-slate-500">Nenhum candidato encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const stage = c.pipeline_stage || c.status;
            const si = stageInfo(stage);
            const aiD = (() => {
              if (!c.ai_analysis) return null;
              if (typeof c.ai_analysis === 'string') { try { return JSON.parse(c.ai_analysis); } catch { return null; } }
              return c.ai_analysis;
            })();
            return (
              <div key={c.id} onClick={() => setViewingCandidate(c)}
                className="bg-white rounded-2xl border border-slate-100 hover:border-emerald-200/70 hover:shadow-[0_4px_20px_rgba(4,120,87,0.07)] transition-all duration-200 cursor-pointer overflow-hidden group">
                <div className={`h-0.5 w-full ${si.dot}`}/>
                <div className="p-4 flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {c.name.slice(0,2).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate">{c.name}</p>
                        <p className="text-[10px] text-emerald-700 font-bold truncate mt-0.5">
                          {c.vacancy_title || 'Candidatura Espontânea'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${si.color}`}>
                          {stage}
                        </span>
                        {aiD && <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">✨ {aiD.score}%</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>{c.email}</span>
                      {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/>{c.phone}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{fmtDate(c.applied_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <ChevronRight className="w-4 h-4 text-slate-300 mt-1"/>
                    {(c as any).uid && onOpenPage && (
                      <button
                        onClick={e => { e.stopPropagation(); onOpenPage((c as any).uid); }}
                        className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-all whitespace-nowrap cursor-pointer"
                      >
                        Ficha Completa →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ficha completa */}
      {viewingCandidate && (
        <CandidateModal
          candidate={viewingCandidate}
          vacancies={vacancies}
          token={token}
          userName={userName}
          onClose={() => setViewingCandidate(null)}
          onStatusChange={updateStatus}
          onRunAI={runAI}
          evaluatingId={evaluatingId}
        />
      )}

      {/* Modal adicionar candidato */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-sm font-black text-slate-900">Incluir Candidato Manualmente</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nome Completo *</label>
                    <input className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600" value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Ex: João da Silva"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">E-mail *</label>
                    <input type="email" className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600" value={addEmail} onChange={e=>setAddEmail(e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Telefone</label>
                    <input className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600" value={addPhone} onChange={e=>setAddPhone(e.target.value)} placeholder="(15) 99999-0000"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vaga</label>
                    <select className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600" value={addVacancy} onChange={e=>setAddVacancy(e.target.value)}>
                      <option value="">— Espontânea —</option>
                      {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Origem</label>
                    <select className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600" value={addSource} onChange={e=>setAddSource(e.target.value)}>
                      {['Manual','LinkedIn','Portal','Indicação','WhatsApp','E-mail','Agência'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Resumo do Currículo</label>
                    <textarea rows={3} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 resize-none" value={addCvText} onChange={e=>setAddCvText(e.target.value)} placeholder="Cole o texto do currículo aqui..."/>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button onClick={()=>setShowAddModal(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer">Cancelar</button>
                <button onClick={addCandidate} disabled={addSaving||!addName||!addEmail} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                  {addSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin"/>}Salvar Candidato
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
