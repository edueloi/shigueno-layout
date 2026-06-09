import React from 'react';
import {
  ArrowLeft, Mail, Phone, Calendar, Briefcase, FileText, Sparkles,
  MessageSquare, Send, BarChart2, CheckSquare, UserCheck, Plus,
  Edit, Trash2, RefreshCw, AlertCircle, CheckCircle2, X, Star,
  Shield, Package, Award, Clock, Target, TrendingUp, Download,
  ChevronRight, Users, AlertTriangle, ClipboardList, Building2
} from 'lucide-react';
import { Portal } from '../hooks/usePortal';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Candidate {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  vacancy_id?: number;
  vacancy_title?: string;
  vacancy_department?: string;
  vacancy_description?: string;
  vacancy_requirements?: string;
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

interface Interview { id: number; interviewer: string; scheduled_at: string; duration_min: number; type: string; location?: string; status: string; result: string; score?: number; notes?: string; }
interface Evaluation { id: number; evaluator: string; evaluation_date: string; type: string; score_technical: number; score_communication: number; score_attitude: number; score_experience: number; score_cultural_fit: number; overall_score: number; strengths?: string; weaknesses?: string; recommendation: string; notes?: string; }
interface Observation { id: number; author: string; type: string; content: string; is_private: boolean | number; created_at: string; }
interface Referral { id: number; type: string; description: string; deadline?: string; status: string; assigned_to?: string; created_at: string; }
interface OnboardingItem { id: number; category: string; item: string; description?: string; required: boolean | number; status: string; delivered_at?: string; delivered_by?: string; notes?: string; }
interface Onboarding { id: number; status: string; start_date?: string; hired_date?: string; department?: string; role?: string; salary?: number; employee_id?: number; notes?: string; }

// ── Helpers ───────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: 'Novo',            color: 'bg-blue-100 text-blue-800 border-blue-200',      dot: 'bg-blue-500',    step: 0 },
  { key: 'Triagem',         color: 'bg-slate-100 text-slate-700 border-slate-200',   dot: 'bg-slate-400',   step: 1 },
  { key: 'Em Análise',      color: 'bg-amber-100 text-amber-800 border-amber-200',   dot: 'bg-amber-500',   step: 2 },
  { key: 'Entrevista RH',   color: 'bg-purple-100 text-purple-800 border-purple-200',dot: 'bg-purple-500',  step: 3 },
  { key: 'Entrevista Téc.', color: 'bg-indigo-100 text-indigo-800 border-indigo-200',dot: 'bg-indigo-500',  step: 4 },
  { key: 'Proposta',        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',dot:'bg-emerald-500',step: 5 },
  { key: 'Aprovado',        color: 'bg-green-100 text-green-800 border-green-200',   dot: 'bg-green-600',   step: 6 },
  { key: 'Recusado',        color: 'bg-rose-100 text-rose-700 border-rose-200',      dot: 'bg-rose-500',    step: -1 },
  { key: 'Banco de Talentos',color:'bg-sky-100 text-sky-700 border-sky-200',         dot: 'bg-sky-400',     step: -1 },
];

const EPI_CATEGORY_ICON: Record<string, string> = {
  'EPI': '🦺', 'Documento': '📄', 'Treinamento': '📚',
  'Acesso': '🔑', 'Uniforme': '👕', 'Equipamento': '🔧',
  'Benefício': '🎁', 'Outro': '📋',
};

const EPI_STATUS_COLOR: Record<string, string> = {
  'Pendente':  'bg-amber-50 text-amber-700 border-amber-200',
  'Entregue':  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Assinado':  'bg-blue-50 text-blue-700 border-blue-200',
  'Concluído': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'N/A':       'bg-slate-100 text-slate-400 border-slate-200',
};

const stageInfo = (s?: string) => PIPELINE_STAGES.find(p => p.key === s) || PIPELINE_STAGES[0];

function fmtDate(s?: string | null) {
  if (!s) return '—';
  const clean = String(s).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return String(s).slice(0, 16).replace('T', ' ');
  return new Date(clean + 'T00:00:00').toLocaleDateString('pt-BR');
}

function fmtDateTime(s?: string) {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color = value >= 7 ? 'bg-emerald-500' : value >= 5 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-black text-slate-700 w-6 text-right">{value}</span>
    </div>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange?.(n)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}>
          <Star className={`w-4 h-4 ${n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
        </button>
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function CandidatePage({ uid, token, userName, onBack }: {
  uid: string;
  token: string;
  userName: string;
  onBack: () => void;
}) {
  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'interviews' | 'evaluations' | 'observations' | 'referrals' | 'ai' | 'onboarding'>('overview');
  const [interviews, setInterviews] = React.useState<Interview[]>([]);
  const [evaluations, setEvaluations] = React.useState<Evaluation[]>([]);
  const [observations, setObservations] = React.useState<Observation[]>([]);
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [onboarding, setOnboarding] = React.useState<Onboarding | null>(null);
  const [onboardingItems, setOnboardingItems] = React.useState<OnboardingItem[]>([]);
  const [tabLoading, setTabLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const [evaluatingId, setEvaluatingId] = React.useState<number | null>(null);
  const [localStage, setLocalStage] = React.useState('');
  const [localRating, setLocalRating] = React.useState(0);
  const [showConvertModal, setShowConvertModal] = React.useState(false);

  // Form states
  const [showForm, setShowForm] = React.useState(false);
  const [iInterviewer, setIInterviewer] = React.useState('');
  const [iDate, setIDate] = React.useState('');
  const [iTime, setITime] = React.useState('09:00');
  const [iDuration, setIDuration] = React.useState(60);
  const [iType, setIType] = React.useState('Entrevista RH');
  const [iLocation, setILocation] = React.useState('');
  const [iStatus, setIStatus] = React.useState('Agendada');
  const [iResult, setIResult] = React.useState('—');
  const [iScore, setIScore] = React.useState<number | ''>('');
  const [iNotes, setINotes] = React.useState('');
  const [editingInt, setEditingInt] = React.useState<Interview | null>(null);

  const [eEvaluator, setEEvaluator] = React.useState('');
  const [eDate, setEDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [eType, setEType] = React.useState('Competências');
  const [eTech, setETech] = React.useState(5);
  const [eComm, setEComm] = React.useState(5);
  const [eAtt, setEAtt] = React.useState(5);
  const [eExp, setEExp] = React.useState(5);
  const [eCult, setECult] = React.useState(5);
  const [eStrengths, setEStrengths] = React.useState('');
  const [eWeaknesses, setEWeaknesses] = React.useState('');
  const [eRec, setERec] = React.useState('Aguardar');
  const [eNotes, setENotes] = React.useState('');
  const [editingEval, setEditingEval] = React.useState<Evaluation | null>(null);

  const [oType, setOType] = React.useState('Observação');
  const [oContent, setOContent] = React.useState('');
  const [oPrivate, setOPrivate] = React.useState(false);

  const [rType, setRType] = React.useState('Documentação');
  const [rDesc, setRDesc] = React.useState('');
  const [rDeadline, setRDeadline] = React.useState('');
  const [rStatus, setRStatus] = React.useState('Pendente');
  const [rAssigned, setRAssigned] = React.useState('');
  const [editingRef, setEditingRef] = React.useState<Referral | null>(null);

  const [saving, setSaving] = React.useState(false);

  // Convert modal states
  const [cvDept, setCvDept] = React.useState('');
  const [cvRole, setCvRole] = React.useState('');
  const [cvHireDate, setCvHireDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [cvSalary, setCvSalary] = React.useState('');
  const [cvLocation, setCvLocation] = React.useState('');
  const [cvLevel, setCvLevel] = React.useState(1);
  const [converting, setConverting] = React.useState(false);

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: token } });

  const showOk = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 5000); };
  const showErr = (msg: string) => { setError(msg); setTimeout(() => setError(''), 6000); };

  // Carrega candidato por UID
  React.useEffect(() => {
    fetch(`/api/candidates/uid/${uid}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setCandidate(d.candidate);
          setLocalStage(d.candidate.pipeline_stage || d.candidate.status || 'Novo');
          setLocalRating(d.candidate.recruiter_rating || 0);
          setCvDept(d.candidate.vacancy_department || '');
          setCvRole(d.candidate.vacancy_title || '');
        } else { setNotFound(true); }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [uid]);

  // Carrega dados da aba ativa
  React.useEffect(() => {
    if (!candidate) return;
    const tab = activeTab;
    if (tab === 'overview' || tab === 'ai') return;
    setTabLoading(true);
    setShowForm(false);
    const endpoints: Record<string, string> = {
      interviews: 'interviews', evaluations: 'evaluations',
      observations: 'observations', referrals: 'referrals',
    };
    if (tab === 'onboarding') {
      fetch(`/api/onboarding/${candidate.id}`)
        .then(r => r.json())
        .then(d => { if (d.success) { setOnboarding(d.onboarding); setOnboardingItems(d.items || []); } })
        .finally(() => setTabLoading(false));
      return;
    }
    const ep = endpoints[tab];
    if (!ep) { setTabLoading(false); return; }
    fetch(`/api/recruitment/${candidate.id}/${ep}`)
      .then(r => r.json())
      .then(d => {
        if (tab === 'interviews') setInterviews(d.interviews || []);
        if (tab === 'evaluations') setEvaluations(d.evaluations || []);
        if (tab === 'observations') setObservations(d.observations || []);
        if (tab === 'referrals') setReferrals(d.referrals || []);
      })
      .finally(() => setTabLoading(false));
  }, [activeTab, candidate?.id]);

  const updateStage = async (stage: string) => {
    if (!candidate) return;
    setLocalStage(stage);
    const status = ['Aprovado', 'Recusado'].includes(stage) ? stage : 'Em Análise';
    await authFetch(`/api/candidates/${candidate.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await authFetch(`/api/recruitment/candidates/${candidate.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, pipeline_stage: stage }),
    });
    setCandidate(prev => prev ? { ...prev, status, pipeline_stage: stage } : null);
    showOk(`Etapa atualizada: ${stage}`);
  };

  const saveRating = async (r: number) => {
    if (!candidate) return;
    setLocalRating(r);
    await authFetch(`/api/recruitment/candidates/${candidate.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: candidate.status, pipeline_stage: localStage, recruiter_rating: r }),
    });
  };

  const runAI = async () => {
    if (!candidate) return;
    setEvaluatingId(candidate.id);
    try {
      const res = await authFetch(`/api/candidates/${candidate.id}/evaluate`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        setCandidate(prev => prev ? { ...prev, ai_analysis: d.ai_analysis } : null);
        showOk('Análise IA concluída!');
      }
    } finally { setEvaluatingId(null); }
  };

  // ── CRUD Interviews ──
  const saveInterview = async () => {
    if (!candidate || !iInterviewer || !iDate) return;
    setSaving(true);
    const payload = { interviewer: iInterviewer, scheduled_at: `${iDate}T${iTime}:00`, duration_min: iDuration, type: iType, location: iLocation || null, status: iStatus, result: iResult, score: iScore || null, notes: iNotes || null };
    if (editingInt) await authFetch(`/api/recruitment/interviews/${editingInt.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    else await authFetch(`/api/recruitment/${candidate.id}/interviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false); setShowForm(false); setEditingInt(null);
    setIInterviewer(''); setIDate(''); setITime('09:00'); setIDuration(60); setIType('Entrevista RH'); setILocation(''); setIStatus('Agendada'); setIResult('—'); setIScore(''); setINotes('');
    const d = await fetch(`/api/recruitment/${candidate.id}/interviews`).then(r => r.json());
    setInterviews(d.interviews || []);
    showOk(editingInt ? 'Entrevista atualizada.' : 'Entrevista registrada!');
  };

  const openEditInt = (i: Interview) => {
    setEditingInt(i); const dt = i.scheduled_at.includes('T') ? i.scheduled_at : i.scheduled_at.replace(' ', 'T');
    setIDate(dt.slice(0, 10)); setITime(dt.slice(11, 16)); setIInterviewer(i.interviewer); setIDuration(i.duration_min);
    setIType(i.type); setILocation(i.location || ''); setIStatus(i.status); setIResult(i.result);
    setIScore(i.score || ''); setINotes(i.notes || ''); setShowForm(true);
  };

  const deleteInterview = async (id: number) => {
    if (!confirm('Remover esta entrevista?')) return;
    await authFetch(`/api/recruitment/interviews/${id}`, { method: 'DELETE' });
    setInterviews(prev => prev.filter(i => i.id !== id));
    showOk('Entrevista removida.');
  };

  // ── CRUD Evaluations ──
  const saveEvaluation = async () => {
    if (!candidate || !eEvaluator || !eDate) return;
    setSaving(true);
    const payload = { evaluator: eEvaluator, evaluation_date: eDate, type: eType, score_technical: eTech, score_communication: eComm, score_attitude: eAtt, score_experience: eExp, score_cultural_fit: eCult, strengths: eStrengths || null, weaknesses: eWeaknesses || null, recommendation: eRec, notes: eNotes || null };
    if (editingEval) await authFetch(`/api/recruitment/evaluations/${editingEval.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    else await authFetch(`/api/recruitment/${candidate.id}/evaluations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false); setShowForm(false); setEditingEval(null);
    setEEvaluator(''); setETech(5); setEComm(5); setEAtt(5); setEExp(5); setECult(5); setEStrengths(''); setEWeaknesses(''); setERec('Aguardar'); setENotes('');
    const d = await fetch(`/api/recruitment/${candidate.id}/evaluations`).then(r => r.json());
    setEvaluations(d.evaluations || []);
    showOk(editingEval ? 'Avaliação atualizada.' : 'Avaliação registrada!');
  };

  const openEditEval = (ev: Evaluation) => {
    setEditingEval(ev); setEEvaluator(ev.evaluator); setEDate(String(ev.evaluation_date).slice(0, 10));
    setEType(ev.type); setETech(ev.score_technical); setEComm(ev.score_communication);
    setEAtt(ev.score_attitude); setEExp(ev.score_experience); setECult(ev.score_cultural_fit);
    setEStrengths(ev.strengths || ''); setEWeaknesses(ev.weaknesses || ''); setERec(ev.recommendation); setENotes(ev.notes || '');
    setShowForm(true);
  };

  const deleteEval = async (id: number) => {
    if (!confirm('Remover avaliação?')) return;
    await authFetch(`/api/recruitment/evaluations/${id}`, { method: 'DELETE' });
    setEvaluations(prev => prev.filter(e => e.id !== id));
    showOk('Avaliação removida.');
  };

  // ── Observations ──
  const saveObservation = async () => {
    if (!candidate || !oContent.trim()) return;
    setSaving(true);
    await authFetch(`/api/recruitment/${candidate.id}/observations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: userName, type: oType, content: oContent, is_private: oPrivate }),
    });
    setSaving(false); setOContent(''); setOType('Observação'); setOPrivate(false);
    const d = await fetch(`/api/recruitment/${candidate.id}/observations`).then(r => r.json());
    setObservations(d.observations || []);
    showOk('Observação registrada.');
  };

  // ── Referrals ──
  const saveReferral = async () => {
    if (!candidate || !rDesc.trim()) return;
    setSaving(true);
    const payload = { type: rType, description: rDesc, deadline: rDeadline || null, status: rStatus, assigned_to: rAssigned || null };
    if (editingRef) await authFetch(`/api/recruitment/referrals/${editingRef.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    else await authFetch(`/api/recruitment/${candidate!.id}/referrals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false); setShowForm(false); setEditingRef(null);
    setRDesc(''); setRType('Documentação'); setRDeadline(''); setRStatus('Pendente'); setRAssigned('');
    const d = await fetch(`/api/recruitment/${candidate.id}/referrals`).then(r => r.json());
    setReferrals(d.referrals || []);
    showOk(editingRef ? 'Encaminhamento atualizado.' : 'Encaminhamento criado.');
  };

  // ── Onboarding ──
  const initOnboarding = async () => {
    if (!candidate) return;
    setSaving(true);
    await authFetch(`/api/onboarding/${candidate.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Em andamento', department: cvDept, role: cvRole }),
    });
    setSaving(false);
    const d = await fetch(`/api/onboarding/${candidate.id}`).then(r => r.json());
    setOnboarding(d.onboarding); setOnboardingItems(d.items || []);
    showOk('Checklist de integração iniciado!');
  };

  const updateOnboardingItem = async (itemId: number, status: string, deliveredBy?: string) => {
    await authFetch(`/api/onboarding/items/${itemId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, delivered_at: ['Entregue', 'Assinado', 'Concluído'].includes(status) ? new Date().toISOString().slice(0, 10) : null, delivered_by: deliveredBy || userName }),
    });
    setOnboardingItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
    showOk('Item atualizado.');
  };

  const convertToEmployee = async () => {
    if (!candidate) return;
    setConverting(true);
    try {
      const res = await authFetch(`/api/onboarding/${candidate.id}/convert`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: cvRole, department: cvDept, hire_date: cvHireDate, salary: cvSalary ? Number(cvSalary) : null, work_location: cvLocation, hierarchy_level: cvLevel }),
      });
      const d = await res.json();
      if (d.success) {
        showOk(`${candidate.name} convertido para funcionário! ID: ${d.employee_id}`);
        setCandidate(prev => prev ? { ...prev, status: 'Aprovado', pipeline_stage: 'Aprovado' } : null);
        setLocalStage('Aprovado');
        setShowConvertModal(false);
        setActiveTab('onboarding');
      } else showErr(d.error);
    } finally { setConverting(false); }
  };

  const aiData = React.useMemo(() => {
    if (!candidate?.ai_analysis) return null;
    if (typeof candidate.ai_analysis === 'string') { try { return JSON.parse(candidate.ai_analysis); } catch { return null; } }
    return candidate.ai_analysis;
  }, [candidate?.ai_analysis]);

  const avgEval = React.useMemo(() => {
    if (!evaluations.length) return null;
    return Math.round(evaluations.reduce((a, e) => a + Number(e.overall_score), 0) / evaluations.length * 10) / 10;
  }, [evaluations]);

  const iField = 'w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors';
  const iLbl = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';

  const tabs = [
    { key: 'overview',     label: 'Ficha',           icon: FileText },
    { key: 'interviews',   label: 'Entrevistas',     icon: Calendar,      count: interviews.length },
    { key: 'evaluations',  label: 'Avaliações',      icon: BarChart2,     count: evaluations.length },
    { key: 'observations', label: 'Linha do Tempo',  icon: MessageSquare, count: observations.length },
    { key: 'referrals',    label: 'Tarefas',         icon: CheckSquare,   count: referrals.length },
    { key: 'ai',           label: 'Análise IA',      icon: Sparkles },
    { key: 'onboarding',   label: 'Integração',      icon: Shield,        highlight: localStage === 'Aprovado' },
  ] as const;

  // ─── Loading / Not found ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm font-bold">Carregando ficha do candidato...</p>
        </div>
      </div>
    );
  }

  if (notFound || !candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-slate-200">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-base font-black text-slate-900">Candidato não encontrado</h2>
          <p className="text-xs text-slate-500 mt-2">O link pode estar desatualizado ou o candidato foi removido.</p>
          <button onClick={onBack} className="mt-5 flex items-center gap-2 mx-auto text-xs font-bold text-emerald-700 hover:underline cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />Voltar
          </button>
        </div>
      </div>
    );
  }

  const si = stageInfo(localStage);
  const isApproved = localStage === 'Aprovado' || candidate.status === 'Aprovado';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toasts */}
      {success && (
        <Portal>
          <div className="fixed top-5 right-5 z-[99999]">
            <div className="bg-emerald-800 text-white rounded-2xl px-5 py-3.5 text-xs font-bold flex items-center gap-3 shadow-2xl min-w-[280px] max-w-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300" />{success}
              <button onClick={() => setSuccess('')} className="ml-auto text-emerald-300 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </Portal>
      )}
      {error && (
        <Portal>
          <div className="fixed top-5 right-5 z-[99999]">
            <div className="bg-rose-700 text-white rounded-2xl px-5 py-3.5 text-xs font-bold flex items-center gap-3 shadow-2xl min-w-[280px] max-w-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-300" />{error}
              <button onClick={() => setError('')} className="ml-auto text-rose-300 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </Portal>
      )}

      {/* ── HERO HEADER ── */}
      <div className="bg-gradient-to-br from-[#071810] via-[#0a2016] to-[#0d3320] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="pt-5 pb-2 flex items-center gap-2 text-emerald-400/70 text-[10px] font-bold uppercase tracking-widest">
            <button onClick={onBack} className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors">
              <ArrowLeft className="w-3 h-3" />Candidatos
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-300">{candidate.name}</span>
          </div>

          <div className="pb-6">
            {/* Stage + meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${si.color}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${si.dot}`} />{localStage}
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">UID: {candidate.uid}</span>
              {candidate.source && <span className="text-[9px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{candidate.source}</span>}
              {isApproved && (
                <span className="text-[9px] bg-emerald-400 text-emerald-950 font-black px-2.5 py-1 rounded-full animate-pulse">
                  ✓ APROVADO
                </span>
              )}
            </div>

            {/* Nome + vaga */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{candidate.name}</h1>
                <p className="text-emerald-300 font-semibold mt-1 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  {candidate.vacancy_title || 'Candidatura Espontânea'}
                  {candidate.vacancy_department && <span className="text-emerald-400/70">· {candidate.vacancy_department}</span>}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-emerald-200/80">
                  {candidate.email && <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-white"><Mail className="w-3 h-3" />{candidate.email}</a>}
                  {candidate.phone && <a href={`tel:${candidate.phone}`} className="flex items-center gap-1 hover:text-white"><Phone className="w-3 h-3" />{candidate.phone}</a>}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Aplicou em {fmtDate(candidate.applied_at)}</span>
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="flex flex-col gap-2 shrink-0">
                <div>
                  <p className="text-[8px] text-emerald-400 uppercase font-bold tracking-wider mb-1.5">Nota do recrutador</p>
                  <Stars value={localRating} onChange={saveRating} />
                </div>
                {!isApproved && (
                  <button onClick={() => updateStage('Aprovado')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" />Aprovar Candidato
                  </button>
                )}
                {isApproved && !onboarding && (
                  <button onClick={() => setShowConvertModal(true)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Users className="w-3.5 h-3.5" />Converter em Funcionário
                  </button>
                )}
              </div>
            </div>

            {/* Pipeline visual */}
            <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1">
              {PIPELINE_STAGES.filter(s => s.step >= 0).map(s => {
                const si2 = stageInfo(localStage);
                const active = localStage === s.key;
                const done = (si2.step || 0) > s.step;
                return (
                  <button key={s.key} onClick={() => updateStage(s.key)}
                    className={`flex-1 min-w-[80px] py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wide cursor-pointer whitespace-nowrap transition-all border ${
                      active ? s.color + ' ring-1 ring-white/20 scale-105'
                        : done ? 'bg-white/10 text-white/70 border-white/10'
                        : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white/70'
                    }`}>
                    {done && !active && <span className="mr-1">✓</span>}
                    {s.key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="max-w-5xl mx-auto border-t border-white/10">
          <div className="flex overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon, count, highlight }: any) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-[11px] font-black uppercase tracking-wide cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-emerald-400 text-emerald-300 bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
                } ${highlight ? 'text-amber-300' : ''}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
                {count !== undefined && count > 0 && (
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 text-white/60'}`}>{count}</span>
                )}
                {highlight && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {tabLoading ? (
          <div className="py-20 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-700" /></div>
        ) : (
          <>
            {/* ════════ FICHA ════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Dados candidatura */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Dados da Candidatura</p>
                      <div className="space-y-2.5 text-xs">
                        {[
                          ['Aplicou em', fmtDate(candidate.applied_at)],
                          ['Origem', candidate.source || 'Portal'],
                          ['Pretensão salarial', candidate.salary_expectation || '—'],
                          ['Disponibilidade', candidate.availability || '—'],
                        ].map(([k, v]) => (
                          <div key={String(k)} className="flex items-start justify-between gap-2">
                            <span className="text-slate-400 shrink-0">{k}</span>
                            <span className="font-bold text-slate-800 text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Desempenho</p>
                      <div className="space-y-3">
                        {aiData && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500" />Score IA</span>
                            <span className={`text-sm font-black ${aiData.score >= 70 ? 'text-emerald-700' : aiData.score >= 50 ? 'text-amber-700' : 'text-rose-600'}`}>{aiData.score}%</span>
                          </div>
                        )}
                        {avgEval !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5 text-purple-500" />Média avaliações</span>
                            <span className="text-sm font-black text-purple-700">{avgEval}/10</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Nota recrutador</span>
                          <Stars value={localRating} onChange={saveRating} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Entrevistas</span>
                          <span className="text-xs font-bold text-slate-700">{interviews.length || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vaga detalhes */}
                    {candidate.vacancy_description && (
                      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sobre a Vaga</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{candidate.vacancy_description}</p>
                        {candidate.vacancy_requirements && (
                          <>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3 mb-1.5">Requisitos</p>
                            <p className="text-xs text-slate-700 leading-relaxed">{candidate.vacancy_requirements}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Currículo */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currículo / Experiência</p>
                        {candidate.cv_filename && (
                          <a href={`/api/candidates/${candidate.id}/cv`} download={candidate.cv_filename}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                            <Download className="w-3 h-3" />Baixar CV
                          </a>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 min-h-[200px] max-h-[500px] overflow-y-auto">
                        {candidate.cv_text || (candidate.cv_filename ? `📎 ${candidate.cv_filename}` : 'Nenhum currículo cadastrado.')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Etapa pipeline completo */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Mover Etapa do Pipeline</p>
                  <div className="flex flex-wrap gap-2">
                    {PIPELINE_STAGES.map(s => (
                      <button key={s.key} onClick={() => updateStage(s.key)}
                        className={`px-4 py-2 text-[10px] font-black rounded-xl border cursor-pointer transition-all ${localStage === s.key ? s.color + ' ring-1 ring-slate-400/20' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        {localStage === s.key && <span className="mr-1">●</span>}{s.key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════ ENTREVISTAS ════════ */}
            {activeTab === 'interviews' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Entrevistas</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Agende, realize e registre o feedback de cada etapa</p>
                  </div>
                  <button onClick={() => { setShowForm(v => !v); setEditingInt(null); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />{showForm ? 'Cancelar' : 'Nova Entrevista'}
                  </button>
                </div>

                {showForm && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900">{editingInt ? 'Editar Entrevista' : 'Agendar Entrevista'}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className={iLbl}>Entrevistador *</label>
                        <input className={iField} value={iInterviewer} onChange={e => setIInterviewer(e.target.value)} placeholder="Nome do entrevistador" />
                      </div>
                      <div><label className={iLbl}>Data *</label><input type="date" className={iField} value={iDate} onChange={e => setIDate(e.target.value)} /></div>
                      <div><label className={iLbl}>Horário</label><input type="time" className={iField} value={iTime} onChange={e => setITime(e.target.value)} /></div>
                      <div>
                        <label className={iLbl}>Tipo</label>
                        <select className={iField} value={iType} onChange={e => setIType(e.target.value)}>
                          {['Triagem Telefônica', 'Entrevista RH', 'Entrevista Técnica', 'Entrevista Final', 'Dinâmica de Grupo', 'Teste Prático'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div><label className={iLbl}>Duração (min)</label><input type="number" min="15" step="15" className={iField} value={iDuration} onChange={e => setIDuration(Number(e.target.value))} /></div>
                      <div><label className={iLbl}>Local / Link</label><input className={iField} value={iLocation} onChange={e => setILocation(e.target.value)} placeholder="Presencial / Meet / Zoom..." /></div>
                      <div>
                        <label className={iLbl}>Status</label>
                        <select className={iField} value={iStatus} onChange={e => setIStatus(e.target.value)}>
                          {['Agendada', 'Realizada', 'Cancelada', 'Não Compareceu'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={iLbl}>Resultado</label>
                        <select className={iField} value={iResult} onChange={e => setIResult(e.target.value)}>
                          {['—', 'Aprovado', 'Reprovado', 'Em análise'].map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div><label className={iLbl}>Pontuação (0-10)</label><input type="number" min="0" max="10" className={iField} value={iScore} onChange={e => setIScore(e.target.value === '' ? '' : Number(e.target.value))} placeholder="—" /></div>
                      <div className="col-span-2 sm:col-span-3">
                        <label className={iLbl}>Anotações / Feedback</label>
                        <textarea rows={3} className={iField} value={iNotes} onChange={e => setINotes(e.target.value)} placeholder="Impressões, pontos observados, perguntas respondidas..." />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => { setShowForm(false); setEditingInt(null); }} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                      <button onClick={saveInterview} disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                        {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}{editingInt ? 'Atualizar' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                )}

                {interviews.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">Nenhuma entrevista registrada</p>
                    <p className="text-xs text-slate-400 mt-1">Clique em "Nova Entrevista" para agendar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interviews.map(i => (
                      <div key={i.id} className={`bg-white rounded-2xl border p-5 transition-all ${i.status === 'Agendada' ? 'border-emerald-200 shadow-[0_2px_12px_rgba(4,120,87,0.06)]' : 'border-slate-100'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-sm font-black text-slate-900">{i.type}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${i.status === 'Realizada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : i.status === 'Agendada' ? 'bg-blue-50 text-blue-700 border-blue-200' : i.status === 'Cancelada' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{i.status}</span>
                              {i.result !== '—' && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${i.result === 'Aprovado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{i.result}</span>}
                              {i.score !== null && i.score !== undefined && <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{i.score}/10</span>}
                            </div>
                            <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDateTime(i.scheduled_at)}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{i.duration_min}min</span>
                              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{i.interviewer}</span>
                              {i.location && <span className="flex items-center gap-1">📍{i.location}</span>}
                            </div>
                            {i.notes && <p className="mt-3 text-xs text-slate-600 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed">{i.notes}</p>}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button onClick={() => openEditInt(i)} className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border border-slate-200 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteInterview(i.id)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════ AVALIAÇÕES ════════ */}
            {activeTab === 'evaluations' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Avaliações de Desempenho</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Registre avaliações por competência com critérios objetivos</p>
                  </div>
                  <button onClick={() => { setShowForm(v => !v); setEditingEval(null); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />{showForm ? 'Cancelar' : 'Nova Avaliação'}
                  </button>
                </div>

                {showForm && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
                    <h3 className="text-sm font-black text-slate-900">{editingEval ? 'Editar Avaliação' : 'Registrar Avaliação'}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div><label className={iLbl}>Avaliador *</label><input className={iField} value={eEvaluator} onChange={e => setEEvaluator(e.target.value)} /></div>
                      <div><label className={iLbl}>Data *</label><input type="date" className={iField} value={eDate} onChange={e => setEDate(e.target.value)} /></div>
                      <div>
                        <label className={iLbl}>Tipo</label>
                        <select className={iField} value={eType} onChange={e => setEType(e.target.value)}>
                          {['Triagem', 'Competências', 'Comportamental', 'Técnica', 'Cultural', 'Final'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critérios de Avaliação (0-10)</p>
                        <span className={`text-lg font-black ${((eTech + eComm + eAtt + eExp + eCult) / 5) >= 7 ? 'text-emerald-700' : ((eTech + eComm + eAtt + eExp + eCult) / 5) >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {((eTech + eComm + eAtt + eExp + eCult) / 5).toFixed(1)}<span className="text-xs text-slate-400">/10</span>
                        </span>
                      </div>
                      {[
                        ['Técnico / Conhecimento', eTech, setETech, 'bg-blue-500'],
                        ['Comunicação e Clareza', eComm, setEComm, 'bg-purple-500'],
                        ['Atitude / Proatividade', eAtt, setEAtt, 'bg-amber-500'],
                        ['Experiência Relevante', eExp, setEExp, 'bg-emerald-500'],
                        ['Fit Cultural', eCult, setECult, 'bg-rose-400'],
                      ].map(([label, val, setter, color]) => (
                        <div key={String(label)} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-semibold">{String(label)}</span>
                            <span className="font-black text-slate-800">{Number(val)}/10</span>
                          </div>
                          <input type="range" min="0" max="10" value={Number(val)} onChange={e => (setter as any)(Number(e.target.value))}
                            className="w-full h-2 rounded-full cursor-pointer accent-emerald-700"
                            style={{ background: `linear-gradient(to right, #047857 0%, #047857 ${Number(val)*10}%, #e2e8f0 ${Number(val)*10}%, #e2e8f0 100%)` }} />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className={iLbl}>Pontos Fortes</label><textarea rows={3} className={iField} value={eStrengths} onChange={e => setEStrengths(e.target.value)} placeholder="Destaque os aspectos positivos..." /></div>
                      <div><label className={iLbl}>Pontos de Atenção</label><textarea rows={3} className={iField} value={eWeaknesses} onChange={e => setEWeaknesses(e.target.value)} placeholder="Lacunas identificadas..." /></div>
                      <div>
                        <label className={iLbl}>Recomendação Final</label>
                        <select className={iField} value={eRec} onChange={e => setERec(e.target.value)}>
                          {['Contratar', 'Banco de Talentos', 'Não Recomendado', 'Aguardar'].map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div><label className={iLbl}>Observações</label><input className={iField} value={eNotes} onChange={e => setENotes(e.target.value)} placeholder="Detalhes adicionais..." /></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => { setShowForm(false); setEditingEval(null); }} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                      <button onClick={saveEvaluation} disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                        {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}{editingEval ? 'Atualizar' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                )}

                {evaluations.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">Nenhuma avaliação registrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evaluations.map(ev => (
                      <div key={ev.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-slate-900">{ev.type}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${ev.recommendation === 'Contratar' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ev.recommendation === 'Não Recomendado' ? 'bg-rose-50 text-rose-700 border-rose-200' : ev.recommendation === 'Banco de Talentos' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{ev.recommendation}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{fmtDate(ev.evaluation_date)} · {ev.evaluator}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className={`text-center px-4 py-2 rounded-2xl ${Number(ev.overall_score) >= 7 ? 'bg-emerald-50 text-emerald-700' : Number(ev.overall_score) >= 5 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                              <p className="text-xl font-black leading-none">{Number(ev.overall_score).toFixed(1)}</p>
                              <p className="text-[8px] font-bold">/10</p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => openEditEval(ev)} className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border border-slate-200 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteEval(ev.id)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[['Técnico', ev.score_technical], ['Comunicação', ev.score_communication], ['Atitude', ev.score_attitude], ['Experiência', ev.score_experience], ['Fit Cultural', ev.score_cultural_fit]].map(([l, v]) => (
                            <div key={String(l)}><p className="text-[10px] font-bold text-slate-500 mb-0.5">{String(l)}</p><ScoreBar value={Number(v)} /></div>
                          ))}
                        </div>
                        {(ev.strengths || ev.weaknesses) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                            {ev.strengths && <div><p className="font-black text-emerald-700 mb-1.5">💪 Pontos Fortes</p><p className="text-slate-600 leading-relaxed">{ev.strengths}</p></div>}
                            {ev.weaknesses && <div><p className="font-black text-amber-700 mb-1.5">⚠️ Atenção</p><p className="text-slate-600 leading-relaxed">{ev.weaknesses}</p></div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════ LINHA DO TEMPO ════════ */}
            {activeTab === 'observations' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-black text-slate-900">Linha do Tempo</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Registre contatos, observações e encaminhamentos em ordem cronológica</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={iLbl}>Tipo</label>
                      <select className={iField} value={oType} onChange={e => setOType(e.target.value)}>
                        {['Observação', 'Contato', 'Encaminhamento', 'Documento', 'Proposta', 'Alerta'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 pb-2">
                        <input type="checkbox" checked={oPrivate} onChange={e => setOPrivate(e.target.checked)} className="accent-emerald-700 w-4 h-4" />Privado
                      </label>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <label className={iLbl}>Anotação *</label>
                      <textarea rows={3} className={iField} value={oContent} onChange={e => setOContent(e.target.value)} placeholder="Descreva o contato, observação ou encaminhamento..." />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={saveObservation} disabled={saving || !oContent.trim()}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60">
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}Registrar
                    </button>
                  </div>
                </div>

                {observations.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">Nenhuma observação registrada</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />
                    <div className="space-y-3 pl-10">
                      {observations.map(o => (
                        <div key={o.id} className={`relative bg-white rounded-2xl border p-4 ${o.is_private ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`}>
                          <div className={`absolute -left-[33px] w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${o.is_private ? 'bg-amber-400' : 'bg-emerald-600'}`}>
                            <span className="text-white">{({ 'Observação': '📝', 'Contato': '📞', 'Encaminhamento': '📤', 'Documento': '📄', 'Proposta': '💰', 'Alerta': '⚠️' } as any)[o.type] || '•'}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-black text-slate-700">{o.type}</span>
                                <span className="text-[9px] text-slate-400">por <strong>{o.author}</strong> · {fmtDateTime(o.created_at)}</span>
                                {o.is_private && <span className="text-[8px] bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded-md">Privado</span>}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">{o.content}</p>
                            </div>
                            <button onClick={async () => { if (!confirm('Remover?')) return; await authFetch(`/api/recruitment/observations/${o.id}`, { method: 'DELETE' }); setObservations(prev => prev.filter(x => x.id !== o.id)); }} className="p-1.5 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 cursor-pointer shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════ TAREFAS / ENCAMINHAMENTOS ════════ */}
            {activeTab === 'referrals' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Tarefas & Encaminhamentos</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Propostas, documentos, exames e próximos passos</p>
                  </div>
                  <button onClick={() => { setShowForm(v => !v); setEditingRef(null); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />{showForm ? 'Cancelar' : 'Nova Tarefa'}
                  </button>
                </div>

                {showForm && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={iLbl}>Tipo</label>
                        <select className={iField} value={rType} onChange={e => setRType(e.target.value)}>
                          {['Proposta Salarial', 'Exame Admissional', 'Documentação', 'Carta Oferta', 'Integração', 'Outro'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div><label className={iLbl}>Prazo</label><input type="date" className={iField} value={rDeadline} onChange={e => setRDeadline(e.target.value)} /></div>
                      <div>
                        <label className={iLbl}>Status</label>
                        <select className={iField} value={rStatus} onChange={e => setRStatus(e.target.value)}>
                          {['Pendente', 'Em andamento', 'Concluído', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={iLbl}>Descrição *</label>
                        <input className={iField} value={rDesc} onChange={e => setRDesc(e.target.value)} placeholder="Descreva a tarefa ou encaminhamento..." />
                      </div>
                      <div><label className={iLbl}>Responsável</label><input className={iField} value={rAssigned} onChange={e => setRAssigned(e.target.value)} placeholder="Nome" /></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => { setShowForm(false); setEditingRef(null); }} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                      <button onClick={saveReferral} disabled={saving || !rDesc.trim()} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                        {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}{editingRef ? 'Atualizar' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                )}

                {referrals.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">Nenhuma tarefa registrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {referrals.map(r => (
                      <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${r.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700' : r.status === 'Pendente' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-black text-slate-900">{r.description}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${r.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : r.status === 'Pendente' ? 'bg-amber-50 text-amber-700 border-amber-200' : r.status === 'Em andamento' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{r.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                            <span className="font-semibold">{r.type}</span>
                            {r.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Prazo: {fmtDate(r.deadline)}</span>}
                            {r.assigned_to && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{r.assigned_to}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => { setEditingRef(r); setRType(r.type); setRDesc(r.description); setRDeadline(r.deadline ? String(r.deadline).slice(0, 10) : ''); setRStatus(r.status); setRAssigned(r.assigned_to || ''); setShowForm(true); }} className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border border-slate-200 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={async () => { if (!confirm('Remover?')) return; await authFetch(`/api/recruitment/referrals/${r.id}`, { method: 'DELETE' }); setReferrals(prev => prev.filter(x => x.id !== r.id)); }} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════ ANÁLISE IA ════════ */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Análise por Inteligência Artificial</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Gemini analisa o currículo em relação à vaga e gera insights + perguntas</p>
                  </div>
                  <button onClick={runAI} disabled={evaluatingId === candidate.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer disabled:opacity-60">
                    {evaluatingId === candidate.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {evaluatingId === candidate.id ? 'Analisando...' : 'Rodar Análise IA'}
                  </button>
                </div>

                {!aiData ? (
                  <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500">Nenhuma análise gerada ainda</p>
                    <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Clique em "Rodar Análise IA" para gerar insights, pontos fortes, lacunas e perguntas sugeridas para a entrevista.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-gradient-to-br from-emerald-950 to-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-start gap-5">
                      <div className="shrink-0 text-center bg-white/10 rounded-2xl p-5 min-w-[100px]">
                        <p className="text-5xl font-black text-white">{aiData.score}</p>
                        <p className="text-[9px] text-emerald-300 uppercase font-bold tracking-wider mt-1">% Aderência</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-emerald-300 uppercase tracking-wider mb-2">Diagnóstico da IA</p>
                        <p className="text-sm text-white/80 leading-relaxed">{aiData.summary}</p>
                        {aiData.matchingVacancies?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <span className="text-[9px] text-emerald-400 font-bold">Outras vagas compatíveis:</span>
                            {aiData.matchingVacancies.map((v: string, i: number) => (
                              <span key={i} className="text-[9px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl border border-slate-100 p-5">
                        <p className="text-[10px] font-black text-emerald-700 uppercase mb-3">💪 Pontos Fortes</p>
                        <ul className="space-y-2">
                          {aiData.strengths?.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-emerald-600 font-black mt-0.5 shrink-0">✓</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-100 p-5">
                        <p className="text-[10px] font-black text-amber-700 uppercase mb-3">⚠️ Pontos de Atenção</p>
                        <ul className="space-y-2">
                          {aiData.gaps?.map((g: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-amber-600 font-black mt-0.5 shrink-0">!</span>{g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {aiData.recommendations && (
                      <div className="bg-white rounded-2xl border border-slate-100 p-5">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Recomendação</p>
                        <p className="text-sm text-slate-800 font-semibold leading-relaxed">{aiData.recommendations}</p>
                      </div>
                    )}

                    {aiData.questions?.length > 0 && (
                      <div className="bg-[#071810] rounded-2xl p-5 space-y-3">
                        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">💬 Perguntas Sugeridas para a Entrevista</p>
                        <div className="space-y-2">
                          {aiData.questions.map((q: string, i: number) => (
                            <div key={i} className="bg-white/5 rounded-xl px-4 py-3 text-xs text-white/80 leading-relaxed flex gap-3">
                              <span className="font-black text-emerald-400 shrink-0 mt-0.5">{i + 1}.</span>{q}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ════════ INTEGRAÇÃO / ONBOARDING ════════ */}
            {activeTab === 'onboarding' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Integração & Onboarding</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Checklist de EPIs, documentos, treinamentos e acessos</p>
                  </div>
                  {!onboarding && isApproved && (
                    <button onClick={initOnboarding} disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer disabled:opacity-60">
                      <Shield className="w-3.5 h-3.5" />Iniciar Checklist de Integração
                    </button>
                  )}
                  {!onboarding && !isApproved && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-amber-800">
                      <AlertTriangle className="w-4 h-4" />Aprove o candidato para iniciar a integração
                    </div>
                  )}
                  {isApproved && !onboarding?.employee_id && (
                    <button onClick={() => setShowConvertModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl cursor-pointer">
                      <Users className="w-3.5 h-3.5" />Converter em Funcionário
                    </button>
                  )}
                  {onboarding?.employee_id && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                      <UserCheck className="w-4 h-4" />Já convertido — Funcionário #{onboarding.employee_id}
                    </span>
                  )}
                </div>

                {!onboarding ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">Checklist de integração não iniciado</p>
                    <p className="text-xs text-slate-400 mt-1">Aprove o candidato e clique em "Iniciar Checklist" para gerar a lista de EPIs, documentos e treinamentos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Progresso geral */}
                    {(() => {
                      const total = onboardingItems.filter(i => i.required).length;
                      const done = onboardingItems.filter(i => i.required && ['Entregue', 'Assinado', 'Concluído'].includes(i.status)).length;
                      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (
                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-black text-slate-700">Progresso da Integração</p>
                            <span className={`text-sm font-black ${pct === 100 ? 'text-emerald-700' : pct >= 60 ? 'text-amber-700' : 'text-slate-700'}`}>{pct}% completo</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">{done} de {total} itens obrigatórios concluídos</p>
                        </div>
                      );
                    })()}

                    {/* Itens por categoria */}
                    {Array.from(new Set(onboardingItems.map(i => i.category))).map(cat => {
                      const items = onboardingItems.filter(i => i.category === cat);
                      const doneCount = items.filter(i => ['Entregue', 'Assinado', 'Concluído'].includes(i.status)).length;
                      return (
                        <div key={cat} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{EPI_CATEGORY_ICON[String(cat)] || '📋'}</span>
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{cat}</span>
                            </div>
                            <span className={`text-[10px] font-bold ${doneCount === items.length ? 'text-emerald-600' : 'text-slate-400'}`}>{doneCount}/{items.length}</span>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {items.map(item => (
                              <div key={item.id} className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${['Entregue', 'Assinado', 'Concluído'].includes(item.status) ? 'bg-emerald-50/30' : ''}`}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs font-bold text-slate-800 ${item.status === 'N/A' ? 'line-through text-slate-400' : ''}`}>{item.item}</span>
                                    {item.required ? <span className="text-[8px] text-rose-500 font-bold">*obrig.</span> : <span className="text-[8px] text-slate-400">opcional</span>}
                                  </div>
                                  {item.description && <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>}
                                  {item.delivered_at && <p className="text-[9px] text-emerald-600 font-bold mt-1">✓ {fmtDate(item.delivered_at)} por {item.delivered_by || '—'}</p>}
                                </div>
                                <div className="shrink-0">
                                  <select value={item.status} onChange={e => updateOnboardingItem(item.id, e.target.value)}
                                    className={`text-[9px] font-black px-2 py-1 rounded-lg border cursor-pointer outline-none ${EPI_STATUS_COLOR[item.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {['Pendente', 'Entregue', 'Assinado', 'Concluído', 'N/A'].map(s => <option key={s}>{s}</option>)}
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal converter em funcionário ── */}
      {showConvertModal && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowConvertModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white p-5 rounded-t-2xl">
                <h3 className="text-base font-black">Converter em Funcionário</h3>
                <p className="text-xs text-emerald-200 mt-1">Preencha os dados de admissão de {candidate.name}</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className={iLbl}>Cargo / Função *</label><input className={iField} value={cvRole} onChange={e => setCvRole(e.target.value)} placeholder="Ex: Tratorista Agrícola" /></div>
                  <div><label className={iLbl}>Departamento *</label><input className={iField} value={cvDept} onChange={e => setCvDept(e.target.value)} placeholder="Ex: Avicultura" list="dept-cv" /><datalist id="dept-cv">{['RH', 'Avicultura', 'Citricultura', 'Cafeicultura', 'Pecuária', 'Financeiro', 'Administrativo', 'Logística'].map(d => <option key={d} value={d} />)}</datalist></div>
                  <div><label className={iLbl}>Data de Admissão</label><input type="date" className={iField} value={cvHireDate} onChange={e => setCvHireDate(e.target.value)} /></div>
                  <div><label className={iLbl}>Salário (R$)</label><input type="number" min="0" step="100" className={iField} value={cvSalary} onChange={e => setCvSalary(e.target.value)} placeholder="0,00" /></div>
                  <div><label className={iLbl}>Local de trabalho</label><input className={iField} value={cvLocation} onChange={e => setCvLocation(e.target.value)} list="loc-cv" /><datalist id="loc-cv">{['Tatuí (Sede)', 'Tatuí (Granja)', 'Buri - SP (Citros)', 'Itaí - SP (Café)', 'Leverger (MT)'].map(l => <option key={l} value={l} />)}</datalist></div>
                  <div>
                    <label className={iLbl}>Nível Hierárquico</label>
                    <select className={iField} value={cvLevel} onChange={e => setCvLevel(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 7].map(l => <option key={l} value={l}>{l} · {['Menor Aprendiz', 'Estagiário', 'Auxiliar', 'Assistente', 'Analista', 'Supervisor', 'Líder'][l - 1]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button onClick={() => setShowConvertModal(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer">Cancelar</button>
                <button onClick={convertToEmployee} disabled={converting || !cvRole || !cvDept}
                  className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                  {converting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirmar Contratação
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
