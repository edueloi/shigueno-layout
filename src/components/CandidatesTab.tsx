import React from 'react';
import {
  Users, Search, Plus, X, Edit, Trash2, RefreshCw, CheckCircle2,
  ChevronRight, Mail, Phone, Calendar, Star, Clock,
  FileText, Sparkles, MessageSquare, Send,
  UserCheck, Download, Activity,
  PlusCircle, BarChart2, CheckSquare, Filter,
  Briefcase, ArrowUpRight
} from 'lucide-react';
import { Portal } from '../hooks/usePortal';

interface Candidate {
  id: number;
  uid?: string;
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
  author: string;
  type: string;
  content: string;
  is_private: boolean | number;
  created_at: string;
}

interface Referral {
  id: number;
  type: string;
  description: string;
  deadline?: string;
  status: string;
  assigned_to?: string;
  created_at: string;
}

interface Vacancy { id: number; title: string; department: string; }

const PIPELINE_STAGES = [
  { key: 'Novo',             color: 'bg-blue-100 text-blue-800 border-blue-200',        dot: 'bg-blue-500',    bar: 'from-blue-400 to-blue-600' },
  { key: 'Triagem',          color: 'bg-slate-100 text-slate-700 border-slate-200',     dot: 'bg-slate-400',   bar: 'from-slate-400 to-slate-500' },
  { key: 'Em Análise',       color: 'bg-amber-100 text-amber-800 border-amber-200',     dot: 'bg-amber-500',   bar: 'from-amber-400 to-amber-600' },
  { key: 'Entrevista RH',    color: 'bg-purple-100 text-purple-800 border-purple-200',  dot: 'bg-purple-500',  bar: 'from-purple-400 to-purple-600' },
  { key: 'Entrevista Téc.',  color: 'bg-indigo-100 text-indigo-800 border-indigo-200',  dot: 'bg-indigo-500',  bar: 'from-indigo-400 to-indigo-600' },
  { key: 'Proposta',         color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', bar: 'from-emerald-400 to-emerald-600' },
  { key: 'Aprovado',         color: 'bg-green-100 text-green-800 border-green-200',     dot: 'bg-green-600',   bar: 'from-green-400 to-green-600' },
  { key: 'Recusado',         color: 'bg-rose-100 text-rose-700 border-rose-200',        dot: 'bg-rose-500',    bar: 'from-rose-400 to-rose-600' },
  { key: 'Banco de Talentos',color: 'bg-sky-100 text-sky-700 border-sky-200',           dot: 'bg-sky-400',     bar: 'from-sky-400 to-sky-500' },
];

const PIPELINE_ORDER = ['Novo','Triagem','Em Análise','Entrevista RH','Entrevista Téc.','Proposta','Aprovado'];

const OBS_ICONS: Record<string,string> = {
  'Observação':'📝','Contato':'📞','Encaminhamento':'📤','Documento':'📄','Proposta':'💰','Alerta':'⚠️'
};

const stageInfo = (s?: string) => PIPELINE_STAGES.find(p => p.key === s) || PIPELINE_STAGES[0];
const pipelineStep = (s?: string) => { const i = PIPELINE_ORDER.indexOf(s||'Novo'); return i === -1 ? 0 : i; };

function fmtDate(s?: string|null) {
  if (!s) return '—';
  const c = String(s).slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c)) return String(s).slice(0,16).replace('T',' ');
  return new Date(c+'T00:00:00').toLocaleDateString('pt-BR');
}
function fmtDateTime(s?: string) {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function avatarGradient(name: string) {
  const g = ['from-emerald-700 to-emerald-500','from-blue-700 to-blue-500','from-purple-700 to-purple-500','from-amber-600 to-amber-400','from-rose-700 to-rose-500','from-indigo-700 to-indigo-500','from-teal-700 to-teal-500'];
  let h = 0; for (let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))%g.length;
  return g[h];
}

function Stars({ value, onChange }: { value: number; onChange?: (n:number)=>void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={()=>onChange?.(n)}
          className={`${onChange?'cursor-pointer hover:scale-110':'cursor-default'} transition-transform`}>
          <Star className={`w-4 h-4 ${n<=value?'text-amber-400 fill-amber-400':'text-white/20'}`}/>
        </button>
      ))}
    </div>
  );
}

function ScoreBar({value,max=10,color='bg-emerald-500'}:{value:number;max?:number;color?:string}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{width:`${Math.round((value/max)*100)}%`}}/>
      </div>
      <span className="text-[10px] font-black text-slate-700 w-5 text-right">{value}</span>
    </div>
  );
}

// ── Drawer: Ficha do Candidato ─────────────────────────────────────────────────
function CandidateDrawer({candidate,token,userName,onClose,onStatusChange,onRunAI,evaluatingId,onOpenPage}:{
  candidate: Candidate;
  token: string;
  userName: string;
  onClose: ()=>void;
  onStatusChange: (id:number,status:string,stage?:string)=>void;
  onRunAI: (id:number)=>void;
  evaluatingId: number|null;
  onOpenPage?: (uid:string)=>void;
}) {
  type Tab = 'overview'|'interviews'|'evaluations'|'observations'|'referrals'|'ai';
  const [activeTab, setActiveTab] = React.useState<Tab>('overview');
  const [interviews,   setInterviews]   = React.useState<Interview[]>([]);
  const [evaluations,  setEvaluations]  = React.useState<Evaluation[]>([]);
  const [observations, setObservations] = React.useState<Observation[]>([]);
  const [referrals,    setReferrals]    = React.useState<Referral[]>([]);
  const [loadingTab,   setLoadingTab]   = React.useState(false);
  const [showForm,     setShowForm]     = React.useState(false);
  const [saving,       setSaving]       = React.useState(false);

  const [localStage,  setLocalStage]  = React.useState(candidate.pipeline_stage||candidate.status);
  const [localStatus, setLocalStatus] = React.useState(candidate.status);
  const [localRating, setLocalRating] = React.useState(candidate.recruiter_rating||0);

  // interview form
  const [iInterviewer,setIInterviewer]=React.useState('');
  const [iDate,setIDate]=React.useState('');
  const [iTime,setITime]=React.useState('09:00');
  const [iDuration,setIDuration]=React.useState(60);
  const [iType,setIType]=React.useState('Entrevista RH');
  const [iLocation,setILocation]=React.useState('');
  const [iStatus,setIStatus]=React.useState('Agendada');
  const [iResult,setIResult]=React.useState('—');
  const [iScore,setIScore]=React.useState<number|''>('');
  const [iNotes,setINotes]=React.useState('');
  const [editingInt,setEditingInt]=React.useState<Interview|null>(null);

  // eval form
  const [eEvaluator,setEEvaluator]=React.useState('');
  const [eDate,setEDate]=React.useState(new Date().toISOString().slice(0,10));
  const [eType,setEType]=React.useState('Competências');
  const [eTech,setETech]=React.useState(5);
  const [eComm,setEComm]=React.useState(5);
  const [eAtt,setEAtt]=React.useState(5);
  const [eExp,setEExp]=React.useState(5);
  const [eCult,setECult]=React.useState(5);
  const [eStrengths,setEStrengths]=React.useState('');
  const [eWeaknesses,setEWeaknesses]=React.useState('');
  const [eRec,setERec]=React.useState('Aguardar');
  const [editingEval,setEditingEval]=React.useState<Evaluation|null>(null);

  // obs form
  const [oAuthor,setOAuthor]=React.useState(userName);
  const [oType,setOType]=React.useState('Observação');
  const [oContent,setOContent]=React.useState('');
  const [oPrivate,setOPrivate]=React.useState(false);

  // referral form
  const [rType,setRType]=React.useState('Documentação');
  const [rDesc,setRDesc]=React.useState('');
  const [rDeadline,setRDeadline]=React.useState('');
  const [rStatus,setRStatus]=React.useState('Pendente');
  const [rAssigned,setRAssigned]=React.useState('');
  const [editingRef,setEditingRef]=React.useState<Referral|null>(null);

  React.useEffect(()=>{
    setLocalStage(candidate.pipeline_stage||candidate.status);
    setLocalStatus(candidate.status);
    setLocalRating(candidate.recruiter_rating||0);
    setActiveTab('overview');
    setShowForm(false);
  },[candidate.id]);

  const authFetch=(url:string,opts:RequestInit={})=>fetch(url,{...opts,headers:{...(opts.headers||{}),Authorization:token}});

  const loadTab=React.useCallback(async(tab:string)=>{
    if(tab==='overview'||tab==='ai') return;
    setLoadingTab(true);
    try {
      const ep:Record<string,string>={interviews:'interviews',evaluations:'evaluations',observations:'observations',referrals:'referrals'};
      const res=await fetch(`/api/recruitment/${candidate.id}/${ep[tab]}`);
      const d=await res.json();
      if(tab==='interviews')   setInterviews(d.interviews||[]);
      if(tab==='evaluations')  setEvaluations(d.evaluations||[]);
      if(tab==='observations') setObservations(d.observations||[]);
      if(tab==='referrals')    setReferrals(d.referrals||[]);
    } finally { setLoadingTab(false); }
  },[candidate.id]);

  React.useEffect(()=>{loadTab(activeTab);},[activeTab,loadTab]);

  const switchTab=(t:Tab)=>{setActiveTab(t);setShowForm(false);};

  const saveStatus=(status:string,stage?:string)=>{
    setLocalStatus(status);
    if(stage) setLocalStage(stage);
    onStatusChange(candidate.id,status,stage);
  };

  const saveRating=async(r:number)=>{
    setLocalRating(r);
    await authFetch(`/api/recruitment/candidates/${candidate.id}`,{
      method:'PUT',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({status:localStatus,pipeline_stage:localStage,recruiter_rating:r}),
    });
  };

  // --- interview CRUD ---
  const saveInterview=async()=>{
    if(!iInterviewer||!iDate) return;
    setSaving(true);
    const p={interviewer:iInterviewer,scheduled_at:`${iDate}T${iTime}:00`,duration_min:iDuration,type:iType,location:iLocation||null,status:iStatus,result:iResult,score:iScore||null,notes:iNotes||null};
    if(editingInt) await authFetch(`/api/recruitment/interviews/${editingInt.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    else await authFetch(`/api/recruitment/${candidate.id}/interviews`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    setSaving(false);setShowForm(false);setEditingInt(null);
    setIInterviewer('');setIDate('');setITime('09:00');setIDuration(60);setIType('Entrevista RH');setILocation('');setIStatus('Agendada');setIResult('—');setIScore('');setINotes('');
    loadTab('interviews');
  };
  const openEditInt=(i:Interview)=>{
    setEditingInt(i);
    const dt=i.scheduled_at.includes('T')?i.scheduled_at:i.scheduled_at.replace(' ','T');
    setIDate(dt.slice(0,10));setITime(dt.slice(11,16));setIInterviewer(i.interviewer);setIDuration(i.duration_min);setIType(i.type);
    setILocation(i.location||'');setIStatus(i.status);setIResult(i.result);setIScore(i.score||'');setINotes(i.notes||'');setShowForm(true);
  };
  const deleteInterview=async(id:number)=>{
    if(!confirm('Remover?')) return;
    await authFetch(`/api/recruitment/interviews/${id}`,{method:'DELETE'});
    loadTab('interviews');
  };

  // --- eval CRUD ---
  const saveEvaluation=async()=>{
    if(!eEvaluator||!eDate) return;
    setSaving(true);
    const p={evaluator:eEvaluator,evaluation_date:eDate,type:eType,score_technical:eTech,score_communication:eComm,score_attitude:eAtt,score_experience:eExp,score_cultural_fit:eCult,strengths:eStrengths||null,weaknesses:eWeaknesses||null,recommendation:eRec};
    if(editingEval) await authFetch(`/api/recruitment/evaluations/${editingEval.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    else await authFetch(`/api/recruitment/${candidate.id}/evaluations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    setSaving(false);setShowForm(false);setEditingEval(null);
    setEEvaluator('');setEDate(new Date().toISOString().slice(0,10));setEType('Competências');setETech(5);setEComm(5);setEAtt(5);setEExp(5);setECult(5);setEStrengths('');setEWeaknesses('');setERec('Aguardar');
    loadTab('evaluations');
  };
  const openEditEval=(ev:Evaluation)=>{
    setEditingEval(ev);setEEvaluator(ev.evaluator);setEDate(String(ev.evaluation_date).slice(0,10));setEType(ev.type);
    setETech(ev.score_technical);setEComm(ev.score_communication);setEAtt(ev.score_attitude);setEExp(ev.score_experience);setECult(ev.score_cultural_fit);
    setEStrengths(ev.strengths||'');setEWeaknesses(ev.weaknesses||'');setERec(ev.recommendation);setShowForm(true);
  };
  const deleteEval=async(id:number)=>{
    if(!confirm('Remover?')) return;
    await authFetch(`/api/recruitment/evaluations/${id}`,{method:'DELETE'});
    loadTab('evaluations');
  };

  // --- obs ---
  const saveObs=async()=>{
    if(!oContent.trim()) return;
    setSaving(true);
    await authFetch(`/api/recruitment/${candidate.id}/observations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:oAuthor||userName,type:oType,content:oContent,is_private:oPrivate})});
    setSaving(false);setOContent('');setOType('Observação');setOPrivate(false);
    loadTab('observations');
  };
  const deleteObs=async(id:number)=>{
    if(!confirm('Remover?')) return;
    await authFetch(`/api/recruitment/observations/${id}`,{method:'DELETE'});
    loadTab('observations');
  };

  // --- referral ---
  const saveReferral=async()=>{
    if(!rDesc.trim()) return;
    setSaving(true);
    const p={type:rType,description:rDesc,deadline:rDeadline||null,status:rStatus,assigned_to:rAssigned||null};
    if(editingRef) await authFetch(`/api/recruitment/referrals/${editingRef.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    else await authFetch(`/api/recruitment/${candidate.id}/referrals`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    setSaving(false);setShowForm(false);setEditingRef(null);setRDesc('');setRType('Documentação');setRDeadline('');setRStatus('Pendente');setRAssigned('');
    loadTab('referrals');
  };
  const openEditRef=(r:Referral)=>{
    setEditingRef(r);setRType(r.type);setRDesc(r.description);setRDeadline(r.deadline?String(r.deadline).slice(0,10):'');setRStatus(r.status);setRAssigned(r.assigned_to||'');setShowForm(true);
  };
  const deleteRef=async(id:number)=>{
    if(!confirm('Remover?')) return;
    await authFetch(`/api/recruitment/referrals/${id}`,{method:'DELETE'});
    loadTab('referrals');
  };

  const aiData=(()=>{
    if(!candidate.ai_analysis) return null;
    if(typeof candidate.ai_analysis==='string'){try{return JSON.parse(candidate.ai_analysis);}catch{return null;}}
    return candidate.ai_analysis;
  })();

  const avgEval=evaluations.length>0?Math.round(evaluations.reduce((a,e)=>a+Number(e.overall_score),0)/evaluations.length*10)/10:null;

  const si=stageInfo(localStage);
  const stepIdx=pipelineStep(localStage);

  const iF='w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors';
  const iL='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';

  const tabs=[
    {key:'overview'     as Tab, label:'Ficha',           icon:FileText,      count:undefined},
    {key:'interviews'   as Tab, label:'Entrevistas',     icon:Calendar,      count:interviews.length},
    {key:'evaluations'  as Tab, label:'Avaliações',      icon:BarChart2,     count:evaluations.length},
    {key:'observations' as Tab, label:'Observações',     icon:MessageSquare, count:observations.length},
    {key:'referrals'   as Tab,  label:'Encaminhamentos', icon:Send,          count:referrals.length},
    {key:'ai'           as Tab, label:'Análise IA',      icon:Sparkles,      count:undefined},
  ];

  return (
    <Portal>
      {/* overlay */}
      <div
        className="fixed inset-0 z-[9990] bg-slate-900/50 backdrop-blur-[2px]"
        style={{animation:'fadeInOverlay .2s ease'}}
        onClick={onClose}
      />

      <style>{`
        @keyframes fadeInOverlay{from{opacity:0}to{opacity:1}}
        @keyframes slideFromRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
      `}</style>

      {/* drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[540px] lg:w-[620px] z-[9991] flex flex-col bg-white shadow-2xl overflow-hidden"
        style={{animation:'slideFromRight .28s cubic-bezier(0.22,1,0.36,1)'}}
        onClick={e=>e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-[#061510] via-[#0a2318] to-[#0d3320] text-white px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${si.color}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${si.dot}`}/>
                  {localStage||'Novo'}
                </span>
                <span className="text-[9px] text-emerald-400 font-bold">#{candidate.id}</span>
                {candidate.source && <span className="text-[9px] text-emerald-300/60 font-bold">{candidate.source}</span>}
              </div>
              <h2 className="text-xl font-black text-white leading-tight">{candidate.name}</h2>
              <p className="text-sm text-emerald-300 font-semibold mt-0.5">{candidate.vacancy_title||'Candidatura Espontânea'}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
                {candidate.email && <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 text-emerald-200/80 hover:text-white"><Mail className="w-3 h-3"/>{candidate.email}</a>}
                {candidate.phone && <a href={`tel:${candidate.phone}`}   className="flex items-center gap-1 text-emerald-200/80 hover:text-white"><Phone className="w-3 h-3"/>{candidate.phone}</a>}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                {onOpenPage && (
                  <button
                    onClick={async()=>{
                      if(candidate.uid){onOpenPage(candidate.uid);return;}
                      const res=await fetch(`/api/candidates/${candidate.id}/generate-uid`,{method:'POST',headers:{Authorization:token}});
                      const d=await res.json();
                      if(d.success) onOpenPage(d.uid);
                    }}
                    className="flex items-center gap-1 text-[10px] font-black text-emerald-300 hover:text-white border border-emerald-700 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5"/>Ficha Completa
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-[8px] text-emerald-400/60 uppercase font-bold tracking-wider">Nota</p>
                <Stars value={localRating} onChange={saveRating}/>
              </div>
            </div>
          </div>

          {/* pipeline progress */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {PIPELINE_ORDER.map((s,i)=>{
              const active=localStage===s;
              const done=i<stepIdx;
              return (
                <button key={s}
                  onClick={()=>saveStatus(s==='Aprovado'?'Aprovado':'Em Análise',s)}
                  className={`flex-1 min-w-0 text-center text-[8px] font-black px-1 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-all border ${
                    active?'bg-white text-emerald-900 border-white shadow-sm':
                    done?'bg-emerald-800/60 text-emerald-200 border-emerald-700/40':
                    'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/70'
                  }`}>
                  {s}
                </button>
              );
            })}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${si.bar} transition-all duration-500`}
              style={{width:`${Math.max(5,(stepIdx/(PIPELINE_ORDER.length-1))*100)}%`}}/>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-slate-100 bg-white shrink-0 overflow-x-auto">
          {tabs.map(({key,label,icon:Icon,count})=>(
            <button key={key} onClick={()=>switchTab(key)}
              className={`flex items-center gap-1 px-3.5 py-3 text-[10px] font-black uppercase tracking-wide cursor-pointer border-b-2 whitespace-nowrap transition-colors ${
                activeTab===key?'border-emerald-600 text-emerald-800 bg-emerald-50/40':'border-transparent text-slate-400 hover:text-slate-700'
              }`}>
              <Icon className="w-3 h-3"/>
              {label}
              {count!==undefined&&count>0&&(
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center ${activeTab===key?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          {loadingTab?(
            <div className="py-16 flex justify-center"><RefreshCw className="w-5 h-5 animate-spin text-emerald-700"/></div>
          ):(
            <div className="p-5 space-y-5">

              {/* FICHA */}
              {activeTab==='overview'&&(
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                      <p className={iL}>Dados da Candidatura</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Aplicou</span><span className="font-bold">{fmtDate(candidate.applied_at)}</span></div>
                        <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">Vaga</span><span className="font-bold text-right truncate max-w-[55%]">{candidate.vacancy_title||'Espontânea'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Origem</span><span className="font-bold">{candidate.source||'Portal'}</span></div>
                        {candidate.salary_expectation&&<div className="flex justify-between"><span className="text-slate-500">Pretensão</span><span className="font-bold text-emerald-700">{candidate.salary_expectation}</span></div>}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                      <p className={iL}>Desempenho</p>
                      <div className="space-y-2">
                        {aiData&&<div className="flex items-center justify-between"><span className="text-xs text-slate-500 flex items-center gap-1"><Sparkles className="w-3 h-3 text-indigo-500"/>Score IA</span><span className="text-sm font-black text-indigo-700">{aiData.score}%</span></div>}
                        {avgEval!==null&&<div className="flex items-center justify-between"><span className="text-xs text-slate-500 flex items-center gap-1"><BarChart2 className="w-3 h-3 text-purple-500"/>Avaliações</span><span className="text-sm font-black text-purple-700">{avgEval}/10</span></div>}
                        <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Entrevistas</span><span className="text-xs font-bold">{interviews.length||'—'}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* CV */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className={iL}>Currículo / Experiência</p>
                      {candidate.cv_filename&&(
                        <a href={`/api/candidates/${candidate.id}/cv`} download={candidate.cv_filename}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100">
                          <Download className="w-3 h-3"/>Baixar CV
                        </a>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 max-h-52 overflow-y-auto">
                      {candidate.cv_text||(candidate.cv_filename?`📎 ${candidate.cv_filename}`:'—')}
                    </div>
                  </div>

                  {/* pipeline rápido */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {PIPELINE_STAGES.slice(0,7).map(s=>(
                      <button key={s.key}
                        onClick={()=>saveStatus(s.key==='Aprovado'?'Aprovado':'Em Análise',s.key)}
                        className={`px-3 py-1.5 text-[9px] font-black rounded-lg border cursor-pointer transition-all ${localStage===s.key?s.color:'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        {s.key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ENTREVISTAS */}
              {activeTab==='interviews'&&(
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Entrevistas</p>
                    <button onClick={()=>{setShowForm(v=>!v);setEditingInt(null);}}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-black rounded-xl cursor-pointer">
                      <Plus className="w-3.5 h-3.5"/>{showForm?'Cancelar':'Nova Entrevista'}
                    </button>
                  </div>

                  {showForm&&(
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="col-span-2 sm:col-span-3"><label className={iL}>Entrevistador *</label><input className={iF} value={iInterviewer} onChange={e=>setIInterviewer(e.target.value)} placeholder="Nome"/></div>
                        <div><label className={iL}>Data *</label><input type="date" className={iF} value={iDate} onChange={e=>setIDate(e.target.value)}/></div>
                        <div><label className={iL}>Horário</label><input type="time" className={iF} value={iTime} onChange={e=>setITime(e.target.value)}/></div>
                        <div><label className={iL}>Tipo</label><select className={iF} value={iType} onChange={e=>setIType(e.target.value)}>{['Triagem Telefônica','Entrevista RH','Entrevista Técnica','Entrevista Final','Dinâmica de Grupo','Teste Prático'].map(t=><option key={t}>{t}</option>)}</select></div>
                        <div><label className={iL}>Duração (min)</label><input type="number" min="15" step="15" className={iF} value={iDuration} onChange={e=>setIDuration(Number(e.target.value))}/></div>
                        <div><label className={iL}>Local / Link</label><input className={iF} value={iLocation} onChange={e=>setILocation(e.target.value)} placeholder="Presencial / Meet..."/></div>
                        <div><label className={iL}>Status</label><select className={iF} value={iStatus} onChange={e=>setIStatus(e.target.value)}>{['Agendada','Realizada','Cancelada','Não Compareceu'].map(s=><option key={s}>{s}</option>)}</select></div>
                        <div><label className={iL}>Resultado</label><select className={iF} value={iResult} onChange={e=>setIResult(e.target.value)}>{['—','Aprovado','Reprovado','Em análise'].map(r=><option key={r}>{r}</option>)}</select></div>
                        <div><label className={iL}>Pontuação (0-10)</label><input type="number" min="0" max="10" className={iF} value={iScore} onChange={e=>setIScore(e.target.value===''?'':Number(e.target.value))} placeholder="—"/></div>
                        <div className="col-span-2 sm:col-span-3"><label className={iL}>Anotações</label><textarea rows={2} className={iF} value={iNotes} onChange={e=>setINotes(e.target.value)} placeholder="Impressões..."/></div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>{setShowForm(false);setEditingInt(null);}} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                        <button onClick={saveInterview} disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                          {saving&&<RefreshCw className="w-3.5 h-3.5 animate-spin"/>}{editingInt?'Atualizar':'Salvar'}
                        </button>
                      </div>
                    </div>
                  )}

                  {interviews.length===0?(
                    <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Calendar className="w-7 h-7 mx-auto mb-2 opacity-40"/><p className="text-sm font-bold">Nenhuma entrevista registrada</p>
                    </div>
                  ):(
                    <div className="space-y-3">
                      {interviews.map(i=>(
                        <div key={i.id} className={`bg-white rounded-2xl border p-4 ${i.status==='Agendada'?'border-emerald-200':'border-slate-100'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                <span className="text-xs font-black text-slate-900">{i.type}</span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${i.status==='Realizada'?'bg-emerald-50 text-emerald-700 border-emerald-200':i.status==='Agendada'?'bg-blue-50 text-blue-700 border-blue-200':'bg-slate-100 text-slate-600 border-slate-200'}`}>{i.status}</span>
                                {i.result!=='—'&&<span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${i.result==='Aprovado'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-rose-50 text-rose-700 border-rose-200'}`}>{i.result}</span>}
                                {i.score!=null&&<span className="text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{i.score}/10</span>}
                              </div>
                              <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{fmtDateTime(i.scheduled_at)}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{i.duration_min}min</span>
                                <span className="flex items-center gap-1"><UserCheck className="w-3 h-3"/>{i.interviewer}</span>
                              </div>
                              {i.notes&&<p className="text-[11px] text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">{i.notes}</p>}
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

              {/* AVALIAÇÕES */}
              {activeTab==='evaluations'&&(
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Avaliações</p>
                    <button onClick={()=>{setShowForm(v=>!v);setEditingEval(null);}}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-black rounded-xl cursor-pointer">
                      <Plus className="w-3.5 h-3.5"/>{showForm?'Cancelar':'Nova Avaliação'}
                    </button>
                  </div>

                  {showForm&&(
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-200">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div><label className={iL}>Avaliador *</label><input className={iF} value={eEvaluator} onChange={e=>setEEvaluator(e.target.value)} placeholder="Nome"/></div>
                        <div><label className={iL}>Data *</label><input type="date" className={iF} value={eDate} onChange={e=>setEDate(e.target.value)}/></div>
                        <div><label className={iL}>Tipo</label><select className={iF} value={eType} onChange={e=>setEType(e.target.value)}>{['Triagem','Competências','Comportamental','Técnica','Cultural','Final'].map(t=><option key={t}>{t}</option>)}</select></div>
                      </div>
                      <div className="bg-white rounded-xl p-4 space-y-3 border border-slate-200">
                        <p className={iL}>Critérios (0-10)</p>
                        {([['Técnico',eTech,setETech],['Comunicação',eComm,setEComm],['Atitude',eAtt,setEAtt],['Experiência',eExp,setEExp],['Fit Cultural',eCult,setECult]] as [string,number,(v:number)=>void][]).map(([label,val,setter])=>(
                          <div key={label} className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-600 font-semibold w-28 shrink-0">{label}</span>
                            <input type="range" min="0" max="10" value={val} onChange={e=>setter(Number(e.target.value))}
                              className="flex-1 h-2 rounded-full cursor-pointer accent-emerald-700"
                              style={{background:`linear-gradient(to right,#047857 0%,#047857 ${val*10}%,#e2e8f0 ${val*10}%,#e2e8f0 100%)`}}/>
                            <span className="text-xs font-black text-slate-800 w-5 text-right">{val}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                          <span className={iL}>Média</span>
                          <span className={`text-base font-black ${((eTech+eComm+eAtt+eExp+eCult)/5)>=7?'text-emerald-700':((eTech+eComm+eAtt+eExp+eCult)/5)>=5?'text-amber-600':'text-rose-600'}`}>
                            {((eTech+eComm+eAtt+eExp+eCult)/5).toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className={iL}>Pontos Fortes</label><textarea rows={2} className={iF} value={eStrengths} onChange={e=>setEStrengths(e.target.value)} placeholder="..."/></div>
                        <div><label className={iL}>Atenção</label><textarea rows={2} className={iF} value={eWeaknesses} onChange={e=>setEWeaknesses(e.target.value)} placeholder="..."/></div>
                        <div><label className={iL}>Recomendação</label><select className={iF} value={eRec} onChange={e=>setERec(e.target.value)}>{['Contratar','Banco de Talentos','Não Recomendado','Aguardar'].map(r=><option key={r}>{r}</option>)}</select></div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>{setShowForm(false);setEditingEval(null);}} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                        <button onClick={saveEvaluation} disabled={saving} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                          {saving&&<RefreshCw className="w-3.5 h-3.5 animate-spin"/>}{editingEval?'Atualizar':'Salvar'}
                        </button>
                      </div>
                    </div>
                  )}

                  {evaluations.length===0?(
                    <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <BarChart2 className="w-7 h-7 mx-auto mb-2 opacity-40"/><p className="text-sm font-bold">Nenhuma avaliação registrada</p>
                    </div>
                  ):(
                    <div className="space-y-3">
                      {evaluations.map(ev=>(
                        <div key={ev.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black text-slate-900">{ev.type}</span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${ev.recommendation==='Contratar'?'bg-emerald-50 text-emerald-700 border-emerald-200':ev.recommendation==='Não Recomendado'?'bg-rose-50 text-rose-700 border-rose-200':'bg-amber-50 text-amber-700 border-amber-200'}`}>{ev.recommendation}</span>
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
                            {[['Técnico',ev.score_technical],['Comunicação',ev.score_communication],['Atitude',ev.score_attitude],['Experiência',ev.score_experience],['Fit Cultural',ev.score_cultural_fit]].map(([l,v])=>(
                              <div key={String(l)}>
                                <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"><span>{String(l)}</span><span>{Number(v)}/10</span></div>
                                <ScoreBar value={Number(v)} color={Number(v)>=7?'bg-emerald-500':Number(v)>=5?'bg-amber-500':'bg-rose-500'}/>
                              </div>
                            ))}
                          </div>
                          {(ev.strengths||ev.weaknesses)&&(
                            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-[10px]">
                              {ev.strengths&&<div><p className="font-black text-emerald-700 mb-1">💪 Fortes</p><p className="text-slate-600 leading-relaxed">{ev.strengths}</p></div>}
                              {ev.weaknesses&&<div><p className="font-black text-amber-700 mb-1">⚠️ Atenção</p><p className="text-slate-600 leading-relaxed">{ev.weaknesses}</p></div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* OBSERVAÇÕES */}
              {activeTab==='observations'&&(
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
                    <p className={iL}>Adicionar observação</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div><label className={iL}>Tipo</label><select className={iF} value={oType} onChange={e=>setOType(e.target.value)}>{['Observação','Contato','Encaminhamento','Documento','Proposta','Alerta'].map(t=><option key={t}>{t}</option>)}</select></div>
                      <div><label className={iL}>Autor</label><input className={iF} value={oAuthor} onChange={e=>setOAuthor(e.target.value)}/></div>
                      <div className="flex items-end gap-2 pb-1"><label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600"><input type="checkbox" checked={oPrivate} onChange={e=>setOPrivate(e.target.checked)} className="accent-emerald-700"/>Privado</label></div>
                      <div className="col-span-2 sm:col-span-3"><label className={iL}>Conteúdo *</label><textarea rows={3} className={iF} value={oContent} onChange={e=>setOContent(e.target.value)} placeholder="Descreva..."/></div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={saveObs} disabled={saving||!oContent.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60">
                        {saving?<RefreshCw className="w-3.5 h-3.5 animate-spin"/>:<Send className="w-3.5 h-3.5"/>}Registrar
                      </button>
                    </div>
                  </div>

                  {observations.length===0?(
                    <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <MessageSquare className="w-7 h-7 mx-auto mb-2 opacity-40"/><p className="text-sm font-bold">Nenhuma observação</p>
                    </div>
                  ):(
                    <div className="space-y-2">
                      {observations.map(o=>(
                        <div key={o.id} className={`bg-white rounded-2xl border p-4 flex gap-3 ${o.is_private?'border-amber-200 bg-amber-50/20':'border-slate-100'}`}>
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm shrink-0 mt-0.5">{OBS_ICONS[o.type]||'📝'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[10px] font-black text-slate-700">{o.type}</span>
                              <span className="text-[9px] text-slate-400">por <strong>{o.author}</strong></span>
                              <span className="text-[9px] text-slate-400">{fmtDateTime(o.created_at)}</span>
                              {o.is_private&&<span className="text-[8px] bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded-md">Privado</span>}
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{o.content}</p>
                          </div>
                          <button onClick={()=>deleteObs(o.id)} className="p-1 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 cursor-pointer shrink-0"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ENCAMINHAMENTOS */}
              {activeTab==='referrals'&&(
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Encaminhamentos & Tarefas</p>
                    <button onClick={()=>{setShowForm(v=>!v);setEditingRef(null);}}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-black rounded-xl cursor-pointer">
                      <Plus className="w-3.5 h-3.5"/>{showForm?'Cancelar':'Novo Encaminhamento'}
                    </button>
                  </div>

                  {showForm&&(
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div><label className={iL}>Tipo</label><select className={iF} value={rType} onChange={e=>setRType(e.target.value)}>{['Proposta Salarial','Exame Admissional','Documentação','Carta Oferta','Integração','Outro'].map(t=><option key={t}>{t}</option>)}</select></div>
                        <div><label className={iL}>Prazo</label><input type="date" className={iF} value={rDeadline} onChange={e=>setRDeadline(e.target.value)}/></div>
                        <div><label className={iL}>Status</label><select className={iF} value={rStatus} onChange={e=>setRStatus(e.target.value)}>{['Pendente','Em andamento','Concluído','Cancelado'].map(s=><option key={s}>{s}</option>)}</select></div>
                        <div className="col-span-2"><label className={iL}>Descrição *</label><input className={iF} value={rDesc} onChange={e=>setRDesc(e.target.value)} placeholder="Descreva..."/></div>
                        <div><label className={iL}>Responsável</label><input className={iF} value={rAssigned} onChange={e=>setRAssigned(e.target.value)} placeholder="Nome"/></div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>{setShowForm(false);setEditingRef(null);}} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                        <button onClick={saveReferral} disabled={saving||!rDesc.trim()} className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                          {saving&&<RefreshCw className="w-3.5 h-3.5 animate-spin"/>}{editingRef?'Atualizar':'Salvar'}
                        </button>
                      </div>
                    </div>
                  )}

                  {referrals.length===0?(
                    <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Send className="w-7 h-7 mx-auto mb-2 opacity-40"/><p className="text-sm font-bold">Nenhum encaminhamento</p>
                    </div>
                  ):(
                    <div className="space-y-2">
                      {referrals.map(r=>(
                        <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${r.status==='Concluído'?'bg-emerald-50 text-emerald-700':r.status==='Pendente'?'bg-amber-50 text-amber-700':'bg-slate-100 text-slate-500'}`}><CheckSquare className="w-4 h-4"/></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-black text-slate-900">{r.description}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${r.status==='Concluído'?'bg-emerald-50 text-emerald-700 border-emerald-200':r.status==='Pendente'?'bg-amber-50 text-amber-700 border-amber-200':'bg-blue-50 text-blue-700 border-blue-200'}`}>{r.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                              <span>{r.type}</span>
                              {r.deadline&&<span className="flex items-center gap-1"><Clock className="w-3 h-3"/>Prazo: {fmtDate(r.deadline)}</span>}
                              {r.assigned_to&&<span>{r.assigned_to}</span>}
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

              {/* ANÁLISE IA */}
              {activeTab==='ai'&&(
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"/>
                      </span>
                      <p className="text-xs font-black text-slate-700 uppercase">IA Gemini — Grupo Shigueno</p>
                    </div>
                    <button onClick={()=>onRunAI(candidate.id)} disabled={evaluatingId===candidate.id}
                      className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60">
                      {evaluatingId===candidate.id?<RefreshCw className="w-3.5 h-3.5 animate-spin"/>:<Sparkles className="w-3.5 h-3.5"/>}
                      {evaluatingId===candidate.id?'Analisando...':'Rodar Análise IA'}
                    </button>
                  </div>

                  {!aiData?(
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Sparkles className="w-8 h-8 mx-auto mb-3 text-slate-300"/>
                      <p className="text-sm font-bold text-slate-500">Nenhuma análise ainda</p>
                      <p className="text-xs text-slate-400 mt-1">Clique em "Rodar Análise IA" para gerar insights</p>
                    </div>
                  ):(
                    <div className="space-y-4">
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
                          <ul className="space-y-1.5">{aiData.strengths?.map((s:string,i:number)=>(<li key={i} className="flex items-start gap-1.5 text-xs text-slate-700"><span className="text-emerald-600 font-bold mt-0.5">•</span>{s}</li>))}</ul>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-4">
                          <p className="text-[10px] font-black text-amber-700 uppercase mb-2">⚠️ Atenção</p>
                          <ul className="space-y-1.5">{aiData.gaps?.map((g:string,i:number)=>(<li key={i} className="flex items-start gap-1.5 text-xs text-slate-700"><span className="text-amber-600 font-bold mt-0.5">•</span>{g}</li>))}</ul>
                        </div>
                      </div>
                      {aiData.recommendations&&(
                        <div className="bg-white border border-slate-100 rounded-2xl p-4">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Recomendação</p>
                          <p className="text-xs text-slate-800 font-semibold leading-relaxed">{aiData.recommendations}</p>
                        </div>
                      )}
                      {aiData.questions?.length>0&&(
                        <div className="bg-emerald-950 rounded-2xl p-4">
                          <p className="text-[10px] font-black text-emerald-300 uppercase mb-3">💬 Perguntas para Entrevista</p>
                          <div className="space-y-2">
                            {aiData.questions.map((q:string,i:number)=>(
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
    </Portal>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function CandidatesTab({token,vacancies,userName,canEdit,onOpenPage}:{
  token: string;
  vacancies: Vacancy[];
  userName: string;
  canEdit: boolean;
  onOpenPage?: (uid:string)=>void;
}) {
  const [candidates,  setCandidates]  = React.useState<Candidate[]>([]);
  const [loading,     setLoading]     = React.useState(true);
  const [search,      setSearch]      = React.useState('');
  const [vacFilter,   setVacFilter]   = React.useState('Todos');
  const [stageFilter, setStageFilter] = React.useState('Todos');
  const [selected,    setSelected]    = React.useState<Candidate|null>(null);
  const [evaluatingId,setEvaluatingId]= React.useState<number|null>(null);
  const [success,     setSuccess]     = React.useState('');
  const [showAdd,     setShowAdd]     = React.useState(false);

  const [addName,   setAddName]   = React.useState('');
  const [addEmail,  setAddEmail]  = React.useState('');
  const [addPhone,  setAddPhone]  = React.useState('');
  const [addVacancy,setAddVacancy]= React.useState('');
  const [addCvText, setAddCvText] = React.useState('');
  const [addSource, setAddSource] = React.useState('Manual');
  const [addSaving, setAddSaving] = React.useState(false);

  const authFetch=(url:string,opts:RequestInit={})=>fetch(url,{...opts,headers:{...(opts.headers||{}),Authorization:token}});

  const load=React.useCallback(async()=>{
    setLoading(true);
    try{const res=await fetch('/api/candidates');const d=await res.json();if(d.success) setCandidates(d.candidates||[]);}
    finally{setLoading(false);}
  },[]);

  React.useEffect(()=>{load();},[load]);

  const showOk=(msg:string)=>{setSuccess(msg);setTimeout(()=>setSuccess(''),4000);};

  const updateStatus=async(id:number,status:string,stage?:string)=>{
    setCandidates(prev=>prev.map(c=>c.id===id?{...c,status,pipeline_stage:stage||status}:c));
    if(selected?.id===id) setSelected(prev=>prev?{...prev,status,pipeline_stage:stage||status}:null);
    await authFetch(`/api/candidates/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
    if(stage) await authFetch(`/api/recruitment/candidates/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,pipeline_stage:stage})});
    showOk(`Stage: ${stage||status}`);
  };

  const runAI=async(id:number)=>{
    setEvaluatingId(id);
    try{
      const res=await authFetch(`/api/candidates/${id}/evaluate`,{method:'POST'});
      const d=await res.json();
      if(d.success){
        setCandidates(prev=>prev.map(c=>c.id===id?{...c,ai_analysis:d.ai_analysis}:c));
        if(selected?.id===id) setSelected(prev=>prev?{...prev,ai_analysis:d.ai_analysis}:null);
        showOk('Análise IA concluída!');
      }
    } finally{setEvaluatingId(null);}
  };

  const addCandidate=async()=>{
    if(!addName||!addEmail) return;
    setAddSaving(true);
    try{
      const res=await authFetch('/api/candidates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:addName,email:addEmail,phone:addPhone||null,vacancy_id:addVacancy||null,cv_text:addCvText||null})});
      const d=await res.json();
      if(d.success){showOk('Candidato registrado!');setShowAdd(false);setAddName('');setAddEmail('');setAddPhone('');setAddVacancy('');setAddCvText('');setAddSource('Manual');load();}
    } finally{setAddSaving(false);}
  };

  const total=candidates.length;
  const novo=candidates.filter(c=>c.status==='Novo').length;
  const emAnalise=candidates.filter(c=>c.status==='Em Análise').length;
  const aprovados=candidates.filter(c=>c.status==='Aprovado').length;

  const filtered=React.useMemo(()=>{
    let list=candidates;
    if(vacFilter!=='Todos') list=list.filter(c=>String(c.vacancy_id)===vacFilter||(vacFilter==='null'&&!c.vacancy_id));
    if(stageFilter!=='Todos') list=list.filter(c=>(c.pipeline_stage||c.status)===stageFilter);
    if(search.trim()){const q=search.toLowerCase();list=list.filter(c=>c.name.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||(c.vacancy_title||'').toLowerCase().includes(q));}
    return list;
  },[candidates,vacFilter,stageFilter,search]);

  const vacCountMap=React.useMemo(()=>{
    const m:Record<string,number>={Todos:candidates.length,null:0};
    candidates.forEach(c=>{const k=c.vacancy_id?String(c.vacancy_id):'null';m[k]=(m[k]||0)+1;});
    return m;
  },[candidates]);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {success&&(
        <Portal>
          <div className="fixed top-5 right-5 z-[99999]">
            <div className="bg-emerald-800 text-white rounded-2xl px-5 py-3.5 text-xs font-bold flex items-center gap-3 shadow-2xl">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300"/>{success}
              <button onClick={()=>setSuccess('')} className="ml-auto text-emerald-300 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        </Portal>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {label:'Total',      value:total,      icon:Users,        bg:'bg-slate-100',   accent:'text-slate-600',  border:'border-slate-200'},
          {label:'Novos',      value:novo,       icon:PlusCircle,   bg:'bg-blue-50',     accent:'text-blue-700',   border:'border-blue-200'},
          {label:'Em Análise', value:emAnalise,  icon:Activity,     bg:'bg-amber-50',    accent:'text-amber-700',  border:'border-amber-200'},
          {label:'Aprovados',  value:aprovados,  icon:CheckCircle2, bg:'bg-emerald-50',  accent:'text-emerald-700',border:'border-emerald-200'},
        ].map(({label,value,icon:Icon,bg,accent,border})=>(
          <div key={label} className={`bg-white rounded-2xl border ${border} px-4 py-3.5 flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)]`}>
            <div className={`${bg} ${accent} p-2.5 rounded-xl shrink-0`}><Icon className="w-4 h-4"/></div>
            <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-wide">{label}</p><p className="text-2xl font-black text-slate-900 leading-none mt-0.5">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* busca + ações */}
        <div className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 border-b border-slate-50">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, email ou vaga..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all"/>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
              <select value={vacFilter} onChange={e=>setVacFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-600 focus:bg-white transition-colors appearance-none min-w-[160px]">
                <option value="Todos">Todas as vagas ({vacCountMap['Todos']||0})</option>
                {vacancies.map(v=><option key={v.id} value={String(v.id)}>{v.title} ({vacCountMap[String(v.id)]||0})</option>)}
                <option value="null">Espontâneas ({vacCountMap['null']||0})</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
              <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-600 focus:bg-white transition-colors appearance-none">
                <option value="Todos">Todos os estágios</option>
                {PIPELINE_STAGES.map(s=><option key={s.key} value={s.key}>{s.key}</option>)}
              </select>
            </div>
            <button onClick={load} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 cursor-pointer transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin':''}`}/>
            </button>
            {canEdit&&(
              <button onClick={()=>setShowAdd(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5"/>Incluir Candidato
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading?(
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin text-emerald-700"/>
          <span className="text-sm">Carregando candidatos...</span>
        </div>
      ):filtered.length===0?(
        <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
          <p className="text-sm font-bold text-slate-500">Nenhum candidato encontrado.</p>
        </div>
      ):(
        <div className="space-y-2">
          {filtered.map(c=>{
            const stage=c.pipeline_stage||c.status;
            const si=stageInfo(stage);
            const stepIdx=pipelineStep(stage);
            const isSelected=selected?.id===c.id;
            const aiD=(()=>{if(!c.ai_analysis) return null;if(typeof c.ai_analysis==='string'){try{return JSON.parse(c.ai_analysis);}catch{return null;}}return c.ai_analysis;})();

            return (
              <div key={c.id} onClick={()=>setSelected(c)}
                className={`bg-white rounded-2xl border transition-all duration-150 cursor-pointer overflow-hidden group ${
                  isSelected?'border-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.15)]':'border-slate-100 hover:border-emerald-200/70 hover:shadow-[0_4px_20px_rgba(4,120,87,0.07)]'
                }`}>
                {/* pipeline strip */}
                <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${si.bar} transition-all`}
                    style={{width:`${Math.max(5,(stepIdx/(PIPELINE_ORDER.length-1))*100)}%`}}/>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient(c.name)} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm`}>
                    {c.name.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate">{c.name}</p>
                        <p className="text-[10px] text-emerald-700 font-bold truncate">{c.vacancy_title||'Candidatura Espontânea'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${si.color}`}>{stage}</span>
                        {aiD&&<span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">✨ {aiD.score}%</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[180px]"><Mail className="w-3 h-3 shrink-0"/>{c.email}</span>
                      {c.phone&&<span className="flex items-center gap-1"><Phone className="w-3 h-3"/>{c.phone}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{fmtDate(c.applied_at)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 mt-1 shrink-0 transition-colors"/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {selected&&(
        <CandidateDrawer
          candidate={selected}
          token={token}
          userName={userName}
          onClose={()=>setSelected(null)}
          onStatusChange={updateStatus}
          onRunAI={runAI}
          evaluatingId={evaluatingId}
          onOpenPage={onOpenPage}
        />
      )}

      {/* Modal adicionar */}
      {showAdd&&(
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={()=>setShowAdd(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e=>e.stopPropagation()}>
              <div className="bg-gradient-to-br from-[#061510] to-[#0d3320] px-5 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-sm font-black text-white">Incluir Candidato Manualmente</h3>
                <button onClick={()=>setShowAdd(false)} className="text-white/50 hover:text-white cursor-pointer"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nome Completo *</label><input className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600" value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Ex: João da Silva"/></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">E-mail *</label><input type="email" className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600" value={addEmail} onChange={e=>setAddEmail(e.target.value)}/></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Telefone</label><input className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600" value={addPhone} onChange={e=>setAddPhone(e.target.value)} placeholder="(15) 99999-0000"/></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vaga</label><select className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600" value={addVacancy} onChange={e=>setAddVacancy(e.target.value)}><option value="">— Espontânea —</option>{vacancies.map(v=><option key={v.id} value={v.id}>{v.title}</option>)}</select></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Origem</label><select className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600" value={addSource} onChange={e=>setAddSource(e.target.value)}>{['Manual','LinkedIn','Portal','Indicação','WhatsApp','E-mail','Agência'].map(s=><option key={s}>{s}</option>)}</select></div>
                  <div className="col-span-2"><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Resumo do Currículo</label><textarea rows={3} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 resize-none" value={addCvText} onChange={e=>setAddCvText(e.target.value)} placeholder="Cole o texto do currículo aqui..."/></div>
                </div>
              </div>
              <div className="px-5 pb-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button onClick={()=>setShowAdd(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer">Cancelar</button>
                <button onClick={addCandidate} disabled={addSaving||!addName||!addEmail}
                  className="px-5 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                  {addSaving&&<RefreshCw className="w-3.5 h-3.5 animate-spin"/>}Salvar Candidato
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
