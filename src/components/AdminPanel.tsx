import React from 'react';
import { 
  Users, Briefcase, TrendingUp, Phone, MapPin, Plus, Trash2, 
  Edit, CheckCircle2, ChevronRight, X, AlertCircle, RefreshCw, BarChart2,
  FileText, Calendar, Filter, Leaf, Download, Menu, Home, LogOut,
  Truck, Navigation, Compass, Map, Activity, Play, CheckCircle, Clock, Settings,
  LayoutGrid, Search, Sparkles, PlusCircle, Award
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Vacancy, Candidate, Supplier, DashboardStats } from '../types';
import BlogManager from './BlogManager';
import A4PosterModal from './A4PosterModal';

interface AdminPanelProps {
  onLogout: () => void;
  onNavigate: (viewKey: string) => void;
  onSettingsUpdate?: () => void;
}

const COLORS = ['#047857', '#fbbf24', '#065f46', '#f59e0b', '#1e3a8a', '#dc2626'];

const PRESET_COORDS: Record<string, { lat: number; lng: number }> = {
  'Tatuí (Granja)': { lat: -23.3556, lng: -47.8556 },
  'Tatuí (Sede)': { lat: -23.3556, lng: -47.8556 },
  'Tatuí (Fazenda Nova Aliança)': { lat: -23.3556, lng: -47.8556 },
  'Santo Antônio do Leverger (MT)': { lat: -15.8656, lng: -56.0781 },
  'Santo Antônio do Leverger': { lat: -15.8656, lng: -56.0781 },
  'Sorocaba (Distribuição)': { lat: -23.5015, lng: -47.4522 },
  'São Paulo (Mercado Municipal)': { lat: -23.5489, lng: -46.6388 },
  'Mogi das Cruzes (Avicultura)': { lat: -23.5222, lng: -46.1889 },
  'Buri - SP (Citros)': { lat: -23.7975, lng: -48.5133 },
  'Itaí - SP (Café)': { lat: -23.4167, lng: -49.0167 }
};

const getAiData = (candidate: any) => {
  if (!candidate || !candidate.ai_analysis) return null;
  if (typeof candidate.ai_analysis === 'string') {
    try {
      return JSON.parse(candidate.ai_analysis);
    } catch (e) {
      return null;
    }
  }
  return candidate.ai_analysis;
};

export default function AdminPanel({ onLogout, onNavigate, onSettingsUpdate }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'reports' | 'suppliers' | 'vacancies' | 'candidates' | 'tracking' | 'blog' | 'settings'>('reports');
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Authenticated fetch helper to pass security middleware
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('shigueno_token') || '';
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': token
      }
    });
  };
  
  // Real database states
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([]);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [evaluatingId, setEvaluatingId] = React.useState<number | null>(null);
  
  const [loading, setLoading] = React.useState(true);
  const [errorNotice, setErrorNotice] = React.useState<string | null>(null);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  // Real-time tracking fleet states
  const [routes, setRoutes] = React.useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = React.useState<number | null>(null);
  const [simulationActive, setSimulationActive] = React.useState<boolean>(true);

  // Ecological Circular integration states for the Shigueno Circular Planner (covers all four core segments: Eggs, Oranges, Coffee, Cattle)
  const [simOvos, setSimOvos] = React.useState<number>(100);
  const [simCitros, setSimCitros] = React.useState<number>(100);
  const [simCafe, setSimCafe] = React.useState<number>(100);
  const [simNelore, setSimNelore] = React.useState<number>(100);
  
  // Create Route Form Overlay
  const [routeFormOpen, setRouteFormOpen] = React.useState(false);
  const [driverName, setDriverName] = React.useState('');
  const [vehiclePlate, setVehiclePlate] = React.useState('');
  const [vehicleType, setVehicleType] = React.useState('Caminhão Baú (Ovos)');
  const [startLocation, setStartLocation] = React.useState('Tatuí (Granja)');
  const [destination, setDestination] = React.useState('Sorocaba (Distribuição)');
  const [cargoDesc, setCargoDesc] = React.useState('');
  const [customEventText, setCustomEventText] = React.useState('');

  // Modal / Form triggers for CRUD
  const [activityFormOpen, setActivityFormOpen] = React.useState(false);
  const [selectedActivityId, setSelectedActivityId] = React.useState<number | null>(null);
  const [actTitle, setActTitle] = React.useState('');
  const [actDescription, setActDescription] = React.useState('');
  const [actCategory, setActCategory] = React.useState('Ações');
  const [actStatus, setActStatus] = React.useState('A Fazer');
  const [actPriority, setActPriority] = React.useState('Média');
  const [actResponsible, setActResponsible] = React.useState('');
  const [actDueDate, setActDueDate] = React.useState('');

  const [vacancyFormOpen, setVacancyFormOpen] = React.useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = React.useState<number | null>(null);
  const [vacTitle, setVacTitle] = React.useState('');
  const [vacDept, setVacDept] = React.useState('');
  const [vacDesc, setVacDesc] = React.useState('');
  const [vacLoc, setVacLoc] = React.useState('Tatuí - SP');
  const [vacReq, setVacReq] = React.useState('');
  const [vacStatus, setVacStatus] = React.useState('Ativa');

  // Poster generator states
  const [selectedVacancyForPoster, setSelectedVacancyForPoster] = React.useState<Vacancy | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = React.useState(false);

  // Candidate detail viewer
  const [viewingCandidate, setViewingCandidate] = React.useState<Candidate | null>(null);

  // Filters
  const [cityFilter, setCityFilter] = React.useState('Todos');
  const [activityCategoryFilter, setActivityCategoryFilter] = React.useState('Todos');
  const [candidateStatusFilter, setCandidateStatusFilter] = React.useState('Todos');
  const [candidateSearchQuery, setCandidateSearchQuery] = React.useState('');
  const [candidateVacancyFilter, setCandidateVacancyFilter] = React.useState('Todos');
  
  // Manual candidate registration states
  const [manualCandidateModalOpen, setManualCandidateModalOpen] = React.useState(false);
  const [manualCandName, setManualCandName] = React.useState('');
  const [manualCandEmail, setManualCandEmail] = React.useState('');
  const [manualCandPhone, setManualCandPhone] = React.useState('');
  const [manualCandVacancyId, setManualCandVacancyId] = React.useState('');
  const [manualCandCvText, setManualCandCvText] = React.useState('');

  const [reportPeriod, setReportPeriod] = React.useState('Todos');
  const [reportStartMonth, setReportStartMonth] = React.useState('Dez');
  const [reportEndMonth, setReportEndMonth] = React.useState('Mai');
  const [reportMinCattle, setReportMinCattle] = React.useState(0);
  const [reportBreed, setReportBreed] = React.useState('Todos');

  // Editable settings fields state
  const [siteMotto, setSiteMotto] = React.useState('');
  const [siteAboutIntro, setSiteAboutIntro] = React.useState('');
  const [siteAboutFull, setSiteAboutFull] = React.useState('');
  const [siteAboutDiversification, setSiteAboutDiversification] = React.useState('');
  const [siteContactEmail, setSiteContactEmail] = React.useState('');
  const [siteContactPhone, setSiteContactPhone] = React.useState('');
  const [siteProdAvicultura, setSiteProdAvicultura] = React.useState('');
  const [siteProdCitricultura, setSiteProdCitricultura] = React.useState('');
  const [siteProdCafeicultura, setSiteProdCafeicultura] = React.useState('');
  const [siteProdNelore, setSiteProdNelore] = React.useState('');
  const [activeEditTab, setActiveEditTab] = React.useState<'home' | 'sobre' | 'produtos' | 'contato'>('home');

  React.useEffect(() => {
    fetchInitialData();
  }, [activeSubTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setErrorNotice(null);
      
      // Fetch Dashboard stats
      const reportsRes = await fetch('/api/dashboard/reports');
      const reportsData = await reportsRes.json();
      if (reportsData.success) {
        setStats(reportsData.stats);
      }

      // Fetch Activities list
      const activitiesRes = await fetch('/api/activities');
      const activitiesData = await activitiesRes.json();
      if (activitiesData.success) {
        setActivities(activitiesData.activities || []);
      }

      // Fetch MT Cattle Suppliers list (for consolidated reports)
      const suppliersRes = await fetch('/api/suppliers');
      const suppliersData = await suppliersRes.json();
      if (suppliersData.success) {
        setSuppliers(suppliersData.suppliers || []);
      }

      // Fetch Vacancies list
      const vacanciesRes = await fetch('/api/vacancies');
      const vacanciesData = await vacanciesRes.json();
      if (vacanciesData.success) {
        setVacancies(vacanciesData.vacancies || []);
      }

      // Fetch Candidates list
      const candidatesRes = await fetch('/api/candidates');
      const candidatesData = await candidatesRes.json();
      if (candidatesData.success) {
        setCandidates(candidatesData.candidates || []);
      }

      // Fetch Tracking routes list
      const routesRes = await fetch('/api/routes');
      const routesData = await routesRes.json();
      if (routesData.success) {
        const loadedRoutes = routesData.routes || [];
        setRoutes(loadedRoutes);
        
        // Autoselect first active route if nothing is selected yet
        if (loadedRoutes.length > 0) {
          const activeOnes = loadedRoutes.filter((r: any) => r.status === 'Ativa');
          if (activeOnes.length > 0) {
            setSelectedRouteId(prev => prev !== null ? prev : activeOnes[0].id);
          } else {
            setSelectedRouteId(prev => prev !== null ? prev : loadedRoutes[0].id);
          }
        }
      }

      // Fetch current site settings
      const settingsRes = await fetch('/api/site-settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.config) {
        setSiteMotto(settingsData.config.company_motto || '');
        setSiteAboutIntro(settingsData.config.about_text_intro || '');
        setSiteAboutFull(settingsData.config.about_text_full || '');
        setSiteAboutDiversification(settingsData.config.about_diversification || '');
        setSiteContactEmail(settingsData.config.contact_email || '');
        setSiteContactPhone(settingsData.config.contact_phone || '');
        setSiteProdAvicultura(settingsData.config.prod_avicultura_desc || '');
        setSiteProdCitricultura(settingsData.config.prod_citricultura_desc || '');
        setSiteProdCafeicultura(settingsData.config.prod_cafeicultura_desc || '');
        setSiteProdNelore(settingsData.config.prod_nelore_desc || '');
      }

    } catch (e) {
      console.error(e);
      setErrorNotice('Falha de sincronização de rede com o servidor SQLite de Tatuí.');
    } finally {
      setLoading(false);
    }
  };

  // Modern live analytics computations based on chosen filters
  const monthOrder = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];

  const filteredProductionStats = React.useMemo(() => {
    if (!stats?.productionStats) return [];
    let list = [...stats.productionStats];
    
    if (reportPeriod === '3m') {
      // Last 3 months: Mar, Abr, Mai
      list = list.filter(item => ['Mar', 'Abr', 'Mai'].includes(item.month));
    } else if (reportPeriod === '6m') {
      // Last 6 months: Dez, Jan, Fev, Mar, Abr, Mai
      list = list.filter(item => ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'].includes(item.month));
    } else if (reportPeriod === 'custom') {
      const startIdx = monthOrder.indexOf(reportStartMonth);
      const endIdx = monthOrder.indexOf(reportEndMonth);
      list = list.filter(item => {
        const idx = monthOrder.indexOf(item.month);
        if (startIdx !== -1 && endIdx !== -1) {
          return idx >= startIdx && idx <= endIdx;
        }
        return true;
      });
    }
    return list;
  }, [stats?.productionStats, reportPeriod, reportStartMonth, reportEndMonth]);

  const filteredSuppliersForReports = React.useMemo(() => {
    let list = [...suppliers];
    if (reportBreed !== 'Todos') {
      list = list.filter(s => s.cattle_breed.toLowerCase() === reportBreed.toLowerCase());
    }
    if (reportMinCattle > 0) {
      list = list.filter(s => s.cattle_count >= reportMinCattle);
    }
    return list;
  }, [suppliers, reportBreed, reportMinCattle]);

  const computedCattleHead = React.useMemo(() => {
    return filteredSuppliersForReports.reduce((sum, s) => sum + s.cattle_count, 0);
  }, [filteredSuppliersForReports]);

  const computedTotalOvos = React.useMemo(() => {
    return filteredProductionStats.reduce((sum, item) => sum + item.ovos, 0);
  }, [filteredProductionStats]);

  const computedTotalCitros = React.useMemo(() => {
    return filteredProductionStats.reduce((sum, item) => sum + item.citros, 0);
  }, [filteredProductionStats]);

  const computedTotalCafe = React.useMemo(() => {
    return filteredProductionStats.reduce((sum, item) => sum + item.cafe, 0);
  }, [filteredProductionStats]);

  const computedCityDistribution = React.useMemo(() => {
    const distributionMap: { [key: string]: { value: number; supplier_count: number } } = {};
    filteredSuppliersForReports.forEach(s => {
      const city = s.city || 'Desconhecido';
      if (!distributionMap[city]) {
        distributionMap[city] = { value: 0, supplier_count: 0 };
      }
      distributionMap[city].value += s.cattle_count;
      distributionMap[city].supplier_count += 1;
    });

    return Object.entries(distributionMap)
      .map(([city, data]) => ({
        city,
        value: data.value,
        supplier_count: data.supplier_count
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSuppliersForReports]);

  // --- INTEGRATED AGRO-ECOLOGICAL PLANNER CALCULATIONS ---
  // Base constants based on actual historic monthly averages of Grupo Shigueno
  const BASE_MONTHLY_OVOS = 500; // 500 caixas/mês
  const BASE_MONTHLY_CITROS = 400; // 400 toneladas/mês
  const BASE_MONTHLY_CAFE = 320; // 320 sacas/mês
  const BASE_NELORE_HEAD = 2400; // 2400 cabeças de gado nelore MT

  const simResults = React.useMemo(() => {
    const ovosVal = Math.round(BASE_MONTHLY_OVOS * (simOvos / 100));
    const citrosVal = Math.round(BASE_MONTHLY_CITROS * (simCitros / 100));
    const cafeVal = Math.round(BASE_MONTHLY_CAFE * (simCafe / 100));
    const neloreVal = Math.round(BASE_NELORE_HEAD * (simNelore / 100));

    // Circular flow: 1 box of eggs translates directly to roughly 0.06 tons of premium organic chicken fertilizer (esterco) available for Citros & Café
    const manureGenerated = Math.round((ovosVal * 0.08) * 10) / 10; // tons

    // Chemical fertilizer displacement: R$ 165 saved per ton of nitrogen compost generated
    const fertilizerSavings = Math.round(manureGenerated * 165);

    // Soil biology score base: composite of organic compost and crop balance
    const combinedCrops = citrosVal + (cafeVal * 1.5);
    const fertilizationRatio = combinedCrops > 0 ? (manureGenerated * 100) / combinedCrops : 100;
    const soilScore = Math.min(100, Math.round(75 + Math.min(25, fertilizationRatio * 1.8)));

    // Revenue generation estimate
    const revenueOvos = ovosVal * 195; // R$ 195 por caixa
    const revenueCitros = citrosVal * 1450; // R$ 1450 por tonelada
    const revenueCafe = cafeVal * 880; // R$ 880 por saca
    const revenueNelore = neloreVal * 2600; // R$ 2600 por cabeça
    const totalRevenueEst = revenueOvos + revenueCitros + revenueCafe + (revenueNelore / 12);

    return {
      ovosVal,
      citrosVal,
      cafeVal,
      neloreVal,
      manureGenerated,
      fertilizerSavings,
      soilScore,
      totalRevenueEst
    };
  }, [simOvos, simCitros, simCafe, simNelore]);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // --- CRUD SITE SETTINGS COMPONENT ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorNotice(null);
      const res = await authFetch('/api/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_motto: siteMotto,
          about_text_intro: siteAboutIntro,
          about_text_full: siteAboutFull,
          about_diversification: siteAboutDiversification,
          contact_email: siteContactEmail,
          contact_phone: siteContactPhone,
          prod_avicultura_desc: siteProdAvicultura,
          prod_citricultura_desc: siteProdCitricultura,
          prod_cafeicultura_desc: siteProdCafeicultura,
          prod_nelore_desc: siteProdNelore
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Configurações e dados do site gravados no SQLite com sucesso!');
        if (typeof onSettingsUpdate === 'function') {
          onSettingsUpdate();
        }
      } else {
        setErrorNotice(data.error || 'Erro ao gravar configurações.');
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Erro de rede ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD QUADRO DE ATIVIDADES ---
  const saveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle || !actDescription || !actResponsible || !actDueDate) {
      alert('Favor preencher todos os campos obrigatórios da atividade.');
      return;
    }

    const payload = {
      title: actTitle,
      description: actDescription,
      category: actCategory,
      status: actStatus,
      priority: actPriority,
      responsible: actResponsible,
      due_date: actDueDate
    };

    try {
      let res;
      if (selectedActivityId) {
        res = await authFetch(`/api/activities/${selectedActivityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showSuccess(selectedActivityId ? 'Atividade atualizada com sucesso.' : 'Nova atividade cadastrada com sucesso.');
        setActivityFormOpen(false);
        resetActivityForm();
        fetchInitialData();
      } else {
        alert('Erro ao salvar atividade: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar atividade.');
    }
  };

  const deleteActivity = async (id: number) => {
    if (!confirm('Deseja realmente remover esta atividade do quadro?')) return;
    try {
      const res = await authFetch(`/api/activities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Atividade removida com sucesso.');
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditActivity = (act: any) => {
    setSelectedActivityId(act.id);
    setActTitle(act.title);
    setActDescription(act.description);
    setActCategory(act.category);
    setActStatus(act.status);
    setActPriority(act.priority);
    setActResponsible(act.responsible);
    setActDueDate(act.due_date);
    setActivityFormOpen(true);
  };

  const resetActivityForm = () => {
    setSelectedActivityId(null);
    setActTitle('');
    setActDescription('');
    setActCategory('Ações');
    setActStatus('A Fazer');
    setActPriority('Média');
    setActResponsible('');
    setActDueDate('');
  };

  // --- CRUD VAGAS ---
  const saveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacTitle || !vacDept || !vacDesc || !vacReq) {
      alert('Preencha os campos essenciais da vaga corporativa.');
      return;
    }

    const payload = {
      title: vacTitle,
      department: vacDept,
      description: vacDesc,
      location: vacLoc,
      requirements: vacReq,
      status: vacStatus
    };

    try {
      let res;
      if (selectedVacancyId) {
        res = await authFetch(`/api/vacancies/${selectedVacancyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/vacancies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showSuccess(selectedVacancyId ? 'Vaga corrigida e atualizada.' : 'Nova vaga publicada no portal do Trabalhe Conosco.');
        setVacancyFormOpen(false);
        resetVacancyForm();
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVacancy = async (id: number) => {
    if (!confirm('Deseja realmente remover esta vaga do sistema? Candidaturas vinculadas terão esta vaga desvinculada.')) return;
    try {
      const res = await authFetch(`/api/vacancies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Vaga excluída com êxito.');
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditVacancy = (vac: Vacancy) => {
    setSelectedVacancyId(vac.id);
    setVacTitle(vac.title);
    setVacDept(vac.department);
    setVacDesc(vac.description);
    setVacLoc(vac.location);
    setVacReq(vac.requirements);
    setVacStatus(vac.status);
    setVacancyFormOpen(true);
  };

  const resetVacancyForm = () => {
    setSelectedVacancyId(null);
    setVacTitle('');
    setVacDept('');
    setVacDesc('');
    setVacLoc('Tatuí - SP');
    setVacReq('');
    setVacStatus('Ativa');
  };

  // --- RECRUTAMENTO GERENCIAR CURRÍCULOS ---
  const updateCandidateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await authFetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Ficha atualizada para status: ${newStatus}`);
        if (viewingCandidate && viewingCandidate.id === id) {
          setViewingCandidate({ ...viewingCandidate, status: newStatus });
        }
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCandidate = async (id: number) => {
    if (!confirm('Deseja purgar este currículo da lixeira interna? Esta operação é irreversível.')) return;
    try {
      const res = await authFetch(`/api/candidates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Currículo expurgado do banco.');
        setViewingCandidate(null);
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runAiEvaluation = async (candidateId: number) => {
    setEvaluatingId(candidateId);
    try {
      const response = await authFetch(`/api/candidates/${candidateId}/evaluate`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        showSuccess('Triagem inteligente e análise de currículo por IA concluídas!');
        const updatedAnalysis = data.ai_analysis;
        
        // Find existing candidate and update it in place
        setCandidates(prev => prev.map(c => 
          c.id === candidateId ? { ...c, ai_analysis: updatedAnalysis } : c
        ));
        
        if (viewingCandidate && viewingCandidate.id === candidateId) {
          setViewingCandidate(prev => prev ? { ...prev, ai_analysis: updatedAnalysis } : null);
        }
        
        fetchInitialData();
      } else {
        alert('Erro ao realizar a triagem por IA: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      console.error('AI evaluation failed:', err);
      alert('Erro na conexão de rede para triagem por IA: ' + err.message);
    } finally {
      setEvaluatingId(null);
    }
  };

  const registerManualCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCandName || !manualCandEmail || !manualCandPhone || !manualCandCvText) {
      alert('Por favor, preencha todos os campos obrigatórios do currículo.');
      return;
    }
    try {
      const res = await authFetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: manualCandName,
          email: manualCandEmail,
          phone: manualCandPhone,
          vacancy_id: manualCandVacancyId ? Number(manualCandVacancyId) : null,
          cv_text: manualCandCvText
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Candidato registrado manualmente com sucesso no Banco de Talentos!');
        setManualCandName('');
        setManualCandEmail('');
        setManualCandPhone('');
        setManualCandVacancyId('');
        setManualCandCvText('');
        setManualCandidateModalOpen(false);
        fetchInitialData();
      } else {
        alert('Erro ao registrar candidato: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao contatar servidor: ' + err.message);
    }
  };

  // --- RASTREAMENTO CORRIDA SIMULATOR AND MUTATIONS ---
  
  const createRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !vehiclePlate || !cargoDesc) {
      alert('Por favor, preencha o Nome do Motorista, a Placa do Veículo e a Descrição da Carga.');
      return;
    }

    try {
      const startPreset = PRESET_COORDS[startLocation] || { lat: -23.3556, lng: -47.8556 };
      
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_name: driverName,
          vehicle_plate: vehiclePlate.toUpperCase(),
          vehicle_type: vehicleType,
          start_location: startLocation,
          destination: destination,
          current_lat: startPreset.lat,
          current_lng: startPreset.lng,
          cargo_description: cargoDesc
        })
      });

      const data = await res.json();
      if (data.success) {
        showSuccess('Rota e rastreamento GPS em tempo real iniciados com sucesso!');
        setRouteFormOpen(false);
        setDriverName('');
        setVehiclePlate('');
        setCargoDesc('');
        
        const freshRes = await fetch('/api/routes');
        const freshData = await freshRes.json();
        if (freshData.success) {
          const loaded = freshData.routes || [];
          setRoutes(loaded);
          setSelectedRouteId(data.id);
        }
      }
    } catch (e) {
      console.error(e);
      setErrorNotice('Falha de rede ao tentar iniciar a rota.');
    }
  };

  const deleteRoute = async (id: number) => {
    if (!confirm('Deseja purgar este registro de rota finalizada? O histórico será excluído.')) return;
    try {
      const res = await fetch(`/api/routes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Registro de rota expurgado do sistema.');
        if (selectedRouteId === id) setSelectedRouteId(null);
        const freshRes = await fetch('/api/routes');
        const freshData = await freshRes.json();
        if (freshData.success) {
          setRoutes(freshData.routes || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const manualEventReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId || !customEventText.trim()) return;

    try {
      const currentRoute = routes.find(r => r.id === selectedRouteId);
      if (!currentRoute) return;

      const res = await fetch(`/api/routes/${selectedRouteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          last_event: customEventText,
          event_occurred: customEventText
        })
      });

      const data = await res.json();
      if (data.success) {
        showSuccess('Evento e posicionamento gravados no histórico!');
        setCustomEventText('');
        const freshRes = await fetch('/api/routes');
        const freshData = await freshRes.json();
        if (freshData.success) {
          setRoutes(freshData.routes || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerStepProgress = async (id: number, forcedProgressAdd?: number) => {
    try {
      const currentRoute = routes.find(r => r.id === id);
      if (!currentRoute || currentRoute.status !== 'Ativa') return;

      const prevProgress = currentRoute.progress || 0;
      const addVal = forcedProgressAdd !== undefined ? forcedProgressAdd : 5;
      const newProgress = Math.min(prevProgress + addVal, 100);

      const startPreset = PRESET_COORDS[currentRoute.start_location] || { lat: -23.3556, lng: -47.8556 };
      const endPreset = PRESET_COORDS[currentRoute.destination] || { lat: -23.7975, lng: -48.5133 };

      const latVal = startPreset.lat + (endPreset.lat - startPreset.lat) * (newProgress / 100);
      const lngVal = startPreset.lng + (endPreset.lng - startPreset.lng) * (newProgress / 100);

      const statusVal = newProgress >= 100 ? 'Concluída' : 'Ativa';
      const speedVal = statusVal === 'Concluída' ? 0 : (65 + Math.floor(Math.random() * 25));
      const fuelVal = Math.max(currentRoute.fuel_level - (forcedProgressAdd !== undefined ? 2 : 1), 5);

      let logMsg = currentRoute.last_event;
      if (newProgress === 100) {
        logMsg = 'Destino alcançado. Carga entregue com sucesso e comprovante assinado.';
      } else if (newProgress % 20 === 0) {
        logMsg = `Veículo cruzando rodovia a ${speedVal} km/h. Condição estável.`;
      }

      const res = await fetch(`/api/routes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_lat: latVal,
          current_lng: lngVal,
          progress: newProgress,
          speed: speedVal,
          fuel_level: fuelVal,
          last_event: logMsg,
          status: statusVal,
          event_occurred: forcedProgressAdd !== undefined ? `Progresso alterado manualmente para ${newProgress}%` : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        const freshRes = await fetch('/api/routes');
        const freshData = await freshRes.json();
        if (freshData.success) {
          setRoutes(freshData.routes || []);
        }
      }
    } catch (e) {
      console.error('Falha de simulação GPS:', e);
    }
  };

  // Automated GPS Simulator Clock (Every 6 seconds)
  React.useEffect(() => {
    let intervalId: any = null;
    if (simulationActive && activeSubTab === 'tracking') {
      intervalId = setInterval(() => {
        const activeRoutes = routes.filter(r => r.status === 'Ativa');
        activeRoutes.forEach(route => {
          triggerStepProgress(route.id);
        });
      }, 6000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [simulationActive, routes, activeSubTab]);

  // Filter lists
  const filteredSuppliers = suppliers.filter(s => cityFilter === 'Todos' || s.city === cityFilter);
  const filteredCandidates = candidates.filter(c => {
    const matchesStatus = candidateStatusFilter === 'Todos' || c.status === candidateStatusFilter;
    const matchesVacancy = candidateVacancyFilter === 'Todos' || String(c.vacancy_id) === String(candidateVacancyFilter);
    
    const query = candidateSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.cv_text.toLowerCase().includes(query) ||
      (c.vacancy_title && c.vacancy_title.toLowerCase().includes(query));
      
    return matchesStatus && matchesVacancy && matchesSearch;
  });

  // Distinct cities in MT for dropdown filter
  const uniqueMTCities = Array.from(new Set(suppliers.map(s => s.city)));

  return (
    <div className="min-h-screen bg-slate-50/70 flex font-sans w-full" id="manager-panel-container">
      {/* MOBILE SIDEBAR BACKDROP */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* PORTAL SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0a1e13] text-emerald-100 flex flex-col h-screen border-r border-emerald-900 shadow-2xl transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* SIDEBAR HEADER / BRANDING */}
        <div className="p-6 border-b border-emerald-900/60 bg-[#06150c] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-emerald-950 font-black text-sm tracking-tight shadow-md select-none">
              S
            </span>
            <div>
              <h2 className="font-extrabold text-amber-500 text-xs uppercase tracking-widest leading-none">Grupo Shigueno</h2>
              <span className="text-[10px] text-emerald-300 font-bold uppercase font-mono mt-1 block">Painel do Gestor</span>
            </div>
          </div>
          
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-emerald-300 hover:bg-emerald-900 hover:text-white transition-colors"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGGED IN USER PROFILE */}
        <div className="p-4 mx-4 my-2.5 bg-emerald-900/20 rounded-2xl border border-emerald-800/40 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-emerald-850 border-2 border-emerald-700/60 flex items-center justify-center text-xs font-black text-amber-400">
            {(() => {
              const savedUser = localStorage.getItem('shigueno_user');
              const name = savedUser ? JSON.parse(savedUser).name : 'G';
              return name.charAt(0).toUpperCase();
            })()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-extrabold text-white truncate">
              {(() => {
                const savedUser = localStorage.getItem('shigueno_user');
                return savedUser ? JSON.parse(savedUser).name : 'Gestor Geral';
              })()}
            </p>
            <span className="text-[10px] text-emerald-400 font-bold font-mono tracking-wide uppercase">
              {(() => {
                const savedUser = localStorage.getItem('shigueno_user');
                return savedUser ? JSON.parse(savedUser).role : 'Administrador';
              })()}
            </span>
          </div>
        </div>

        {/* NAVIGATION MENUS */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {[
            { key: 'reports', label: 'Relatórios Gerais', icon: BarChart2 },
            { key: 'suppliers', label: 'Quadro de Atividades', icon: LayoutGrid },
            { key: 'tracking', label: 'Rastreamento & Frotas', icon: Truck },
            { key: 'blog', label: 'Gestor do Blog', icon: FileText },
            { key: 'vacancies', label: 'Cadastro de Vagas', icon: Briefcase },
            { key: 'candidates', label: 'Seleção & Currículos', icon: Users },
            { key: 'settings', label: 'Dados do Site', icon: Settings }
          ].map((item) => {
            const IconComponent = item.icon;
            const active = activeSubTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveSubTab(item.key as any);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                  active 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                    : 'text-emerald-250 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 ${active ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* BOTTOM NAV / ACTIONS */}
        <div className="p-4 border-t border-emerald-900/60 bg-[#06150c]/80 space-y-1.5">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/40 transition-colors text-[11px] font-bold cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Voltar ao Site</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-red-400 hover:text-red-100 hover:bg-red-950/45 transition-colors text-[11px] font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-400" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* PORTAL MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* CUSTOM PORTAL TOPBAR */}
        <header className="bg-white border-b border-slate-150 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-650 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-none">
                {activeSubTab === 'reports' && 'Painel de Controle — Estatísticas'}
                {activeSubTab === 'suppliers' && 'Quadro de Atividades Shigueno'}
                {activeSubTab === 'tracking' && 'Rastreamento de Transportes & Frotas'}
                {activeSubTab === 'blog' && 'Console Editorial — Gerenciamento do Blog'}
                {activeSubTab === 'vacancies' && 'Gestão de Oportunidades Empregatícias'}
                {activeSubTab === 'candidates' && 'Recrutamento & Seleção de Talentos'}
                {activeSubTab === 'settings' && 'Dados e Divulgação da Instituição'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchInitialData}
              title="Sincronizar base SQLite"
              className="p-2 px-3 rounded-xl transition-all hover:bg-slate-50 hover:text-emerald-800 text-slate-500 flex items-center space-x-1.5 border border-slate-150 shadow-2xs text-[11px] font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden xs:inline">Sincronizar</span>
            </button>
            
            <button
              onClick={() => onNavigate('home')}
              className="p-2 px-3 border border-slate-150 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-2xs hidden xs:inline-block cursor-pointer"
            >
              Ir ao Site
            </button>
          </div>
        </header>

        {/* CONTAINER WORKSPACE */}
        <main className="flex-grow p-4 md:p-8 w-full space-y-6">
          {successNotice && (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-905 rounded-xl p-4 text-xs font-bold shadow-xs animate-slide-in flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}
          {errorNotice && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs font-bold leading-relaxed shadow-xs animate-pulse flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-slate-400 italic text-sm flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-7 h-7 text-emerald-700 animate-spin" />
              <span>Consultando banco de dados local SQLite de Tatuí...</span>
            </div>
          ) : (
            <div className="animate-fade-in font-sans">
            
              {/* SUBTAB 1: RELATÓRIOS EM TEMPO REAL */}
              {activeSubTab === 'reports' && stats && (
              <div className="space-y-8">

                {/* Modern Filter Board */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-all">
                  {/* Date/Time Filter Column */}
                  <div className="md:col-span-6 space-y-3.5">
                    <div className="flex items-center space-x-2 text-emerald-900">
                      <Calendar className="w-4 h-4 text-emerald-800" />
                      <span className="text-xs font-black uppercase tracking-wider font-mono">Filtro de Período e Datas (Safra)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Selecionar Recorte:</label>
                        <select
                          value={reportPeriod}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReportPeriod(val);
                            if (val === '3m') {
                              setReportStartMonth('Mar');
                              setReportEndMonth('Mai');
                            } else if (val === '6m' || val === 'Todos') {
                              setReportStartMonth('Dez');
                              setReportEndMonth('Mai');
                            }
                          }}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-750 focus:outline-emerald-800 cursor-pointer shadow-3xs transition-colors"
                        >
                          <option value="Todos">Todo Histórico (6 meses)</option>
                          <option value="3m">Último Trimestre (Mar - Mai)</option>
                          <option value="custom">Período Customizado 📅</option>
                        </select>
                      </div>

                      {reportPeriod === 'custom' && (
                        <div className="grid grid-cols-2 gap-2 animate-fade-in">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Início:</label>
                            <select
                              value={reportStartMonth}
                              onChange={(e) => setReportStartMonth(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-700 focus:outline-emerald-800 cursor-pointer"
                            >
                              {monthOrder.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Fim:</label>
                            <select
                              value={reportEndMonth}
                              onChange={(e) => setReportEndMonth(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-700 focus:outline-emerald-800 cursor-pointer"
                            >
                              {monthOrder.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agricultural / Livestock Filter Column */}
                  <div className="md:col-span-6 space-y-3.5 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
                    <div className="flex items-center space-x-2 text-amber-900">
                      <Filter className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black uppercase tracking-wider font-mono">Filtro Nelores & Microrregião (Pecuária)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Raça do Gado:</label>
                        <select
                          value={reportBreed}
                          onChange={(e) => setReportBreed(e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-755 focus:outline-emerald-800 cursor-pointer shadow-3xs transition-colors"
                        >
                          <option value="Todos">Qualquer Raça</option>
                          <option value="Nelore">Nelore Pura</option>
                          <option value="Angus">Angus</option>
                          <option value="Senepol">Senepol</option>
                          <option value="Misto">Misto / Cruzamentos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">Tamanho de Rebanho Mín:</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={reportMinCattle === 0 ? '' : reportMinCattle}
                            onChange={(e) => setReportMinCattle(Number(e.target.value))}
                            placeholder="Ex: 100 cab."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-emerald-800 shadow-3xs"
                          />
                          {reportMinCattle > 0 && (
                            <button 
                              type="button"
                              onClick={() => setReportMinCattle(0)}
                              className="absolute right-2.5 top-2.5 text-[10px] font-black text-red-500 hover:text-red-700"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Micro KPIs Section - Produção Consolidada */}
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center space-x-2 text-emerald-950">
                    <TrendingUp className="w-4 h-4 text-emerald-855" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-mono">Performance de Produção (Agropecuária & Postura)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Nelore */}
                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Pecuária Nelore (MT)</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{computedCattleHead.toLocaleString('pt-BR')} cab.</h4>
                        <p className="text-[9px] text-emerald-700 font-semibold italic">Rebanho ativo filtrado</p>
                      </div>
                    </div>

                    {/* Ovos Nova Aliança */}
                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0 w-11 h-11 flex items-center justify-center select-none text-[20px]">
                        🥚
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Ovos Nova Aliança</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{computedTotalOvos.toLocaleString('pt-BR')} cx.</h4>
                        <p className="text-[9px] text-amber-600 font-semibold">Postura coletada</p>
                      </div>
                    </div>

                    {/* Laranjas Citros */}
                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shrink-0 w-11 h-11 flex items-center justify-center select-none text-[20px]">
                        🍊
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Laranjas Tatuí/Buri</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{computedTotalCitros.toLocaleString('pt-BR')} t</h4>
                        <p className="text-[9px] text-emerald-700 font-semibold">Colheita escoada</p>
                      </div>
                    </div>

                    {/* Café Arábica */}
                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-amber-100/50 text-amber-850 rounded-xl w-11 h-11 shrink-0 flex items-center justify-center select-none text-[20px]">
                        ☕
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Café Arábica Itaí</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{computedTotalCafe.toLocaleString('pt-BR')} sc.</h4>
                        <p className="text-[9px] text-amber-800 font-semibold">Sacarias processadas</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Ativos Administrativos, Talentos e Gestão de Parceiros */}
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center space-x-2 text-slate-950">
                    <Users className="w-4 h-4 text-slate-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-mono">Gestão Corporativa, Vagas & Parceiros</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl shrink-0">
                        <Users className="w-5 h-5 flex items-center justify-center" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Parceiros de Pecuária</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{filteredSuppliersForReports.length} pecuaristas</h4>
                        <p className="text-[9px] text-slate-400 font-mono">De total de {stats.totalSuppliers} cadastrados</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Vagas de Recrutamento</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{stats.totalVacancies} ativas</h4>
                        <p className="text-[9px] text-slate-450 font-mono">Divulgadas no site</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300 select-none">
                      <div className="p-3 bg-slate-100 text-slate-700 rounded-xl shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Fichas de Currículos</p>
                        <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{stats.totalCandidates} recebidos</h4>
                        <p className="text-[9px] text-orange-655 font-bold font-mono">Banco de talentos</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Real-time Production Charts block */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Production chart */}
                  <div className="bg-white p-6 rounded-2xl space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Escoamento de Safra Consolidado</h3>
                        <p className="text-[10px] text-slate-500">Colheita e postura monitoradas em tempo real (meses selecionados).</p>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 font-black px-2 py-0.5 rounded-lg font-mono uppercase tracking-wider">{reportPeriod === 'Todos' ? 'Histórico Completo' : 'Período Filtrado'}</span>
                    </div>

                    <div className="h-64 sm:h-72">
                      {filteredProductionStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredProductionStats} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="ovos" name="Ovos Nova Aliança (caixas)" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="citros" name="Laranjas Tatuí/Buri (tons)" stroke="#047857" strokeWidth={3} />
                            <Line type="monotone" dataKey="cafe" name="Café Arábica Itaí (sacas)" stroke="#8b5a2b" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs italic text-slate-400">Nenhum dado produtivo para o recorte escolhido.</div>
                      )}
                    </div>
                  </div>

                  {/* Cattle distribution Chart */}
                  <div className="bg-white p-6 rounded-2xl space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Distribuição Regional de Nelores</h3>
                        <p className="text-[10px] text-slate-500">Por microrregião e propriedade parceira sob os filtros agro.</p>
                      </div>
                      <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2 py-0.5 rounded-lg font-mono uppercase tracking-wider">Raça: {reportBreed}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="h-56">
                        {computedCityDistribution.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={computedCityDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                fill="#8884d8"
                                paddingAngle={3}
                                dataKey="value"
                                nameKey="city"
                              >
                                {computedCityDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs italic text-slate-400">Nenhum pecuarista elegível nos filtros atuais.</div>
                        )}
                      </div>

                      {/* Map Legends of MT cattle suppliers distribution */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2">Foco por Município:</p>
                        {computedCityDistribution.length > 0 ? (
                          computedCityDistribution.map((cityRow, i) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1 last:border-0 font-sans">
                              <div className="flex items-center space-x-2 truncate">
                                <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                <span className="font-bold text-slate-700 truncate">{cityRow.city}</span>
                              </div>
                              <span className="font-mono text-slate-600 shrink-0 select-none">
                                <strong className="text-amber-850 font-black">{cityRow.value}</strong> cab. ({cityRow.supplier_count} faz.)
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Sem registros para legendar.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Applicants by Job vacancy distribution */}
                <div className="bg-white p-6 rounded-2xl space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] transition-all duration-300">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Estatísticas De Recrutamento</h3>
                    <p className="text-[10px] text-slate-500 font-sans">Volume de fichas de candidaturas em tempo real por anúncio ou interesse espontâneo.</p>
                  </div>

                  <div className="h-64">
                    {stats.candidatesByVacancy.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.candidatesByVacancy} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                          <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                          <Bar dataKey="value" name="Número de Fichas" fill="#047857" radius={[6, 6, 0, 0]}>
                            {stats.candidatesByVacancy.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#047857' : '#059669'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs italic text-slate-400">Nenhum currículo cadastrado na base ainda.</div>
                    )}
                  </div>
                </div>

                {/* INTERACTIVE SHIGUENO CIRCULAR PLANNER */}
                <div id="agroecological-planner" className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_12px_40px_rgba(4,120,87,0.15)] relative overflow-hidden select-none animate-fade-in">
                  {/* Glowing background blob */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 relative z-10">
                    <div>
                      <span className="text-[9px] bg-emerald-800 text-emerald-100 font-extrabold px-2 py-1 rounded-md tracking-wider uppercase font-mono">Modelo Ecológico de Alta Produtividade</span>
                      <h3 className="text-lg sm:text-xl font-black mt-1">Planejador Agroecológico Integrado (Ciclo Circular Termofílico)</h3>
                      <p className="text-xs text-emerald-200/70 mt-0.5">Simule a interação sinérgica ideal entre Avicultura (compostagem), Citros, Café e Gado Nelore.</p>
                    </div>
                    <Leaf className="w-8 h-8 text-emerald-400 mt-3 sm:mt-0 opacity-80 shrink-0" />
                  </div>

                  {/* Sliders Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                    
                    {/* Avicultura Slider */}
                    <div className="bg-white/5 p-4 rounded-2xl hover:bg-white/8 transition-colors space-y-3.5 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black tracking-wide text-amber-200 uppercase font-mono">🥚 Avicultura (Ovos)</span>
                        <span className="text-xs font-mono font-black text-amber-400">{simOvos}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={simOvos} 
                        onChange={(e) => setSimOvos(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 accent-amber-400 cursor-pointer rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>Mín (50%)</span>
                        <span>Máx (150%)</span>
                      </div>
                      <div className="pt-1 text-[10px] text-emerald-100/70 italic border-t border-white/5">
                        Alvo: <strong>{simResults.ovosVal}</strong> cx./mês
                      </div>
                    </div>

                    {/* Citricultura Slider */}
                    <div className="bg-white/5 p-4 rounded-2xl hover:bg-white/8 transition-colors space-y-3.5 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black tracking-wide text-orange-300 uppercase font-mono">🍊 Citros (Laranja)</span>
                        <span className="text-xs font-mono font-black text-orange-400">{simCitros}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={simCitros} 
                        onChange={(e) => setSimCitros(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 accent-orange-400 cursor-pointer rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>Mín (50%)</span>
                        <span>Máx (150%)</span>
                      </div>
                      <div className="pt-1 text-[10px] text-emerald-100/70 italic border-t border-white/5">
                        Alvo: <strong>{simResults.citrosVal}</strong> t/mês
                      </div>
                    </div>

                    {/* Cafeicultura Slider */}
                    <div className="bg-white/5 p-4 rounded-2xl hover:bg-white/8 transition-colors space-y-3.5 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black tracking-wide text-yellow-300 uppercase font-mono">☕ Café Arábica</span>
                        <span className="text-xs font-mono font-black text-yellow-400">{simCafe}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={simCafe} 
                        onChange={(e) => setSimCafe(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 accent-yellow-400 cursor-pointer rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>Mín (50%)</span>
                        <span>Máx (150%)</span>
                      </div>
                      <div className="pt-1 text-[10px] text-emerald-100/70 italic border-t border-white/5">
                        Alvo: <strong>{simResults.cafeVal}</strong> sc./mês
                      </div>
                    </div>

                    {/* Pecuária Nelore Slider */}
                    <div className="bg-white/5 p-4 rounded-2xl hover:bg-white/8 transition-colors space-y-3.5 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black tracking-wide text-teal-300 uppercase font-mono">🐂 Nelore (MT)</span>
                        <span className="text-xs font-mono font-black text-teal-400">{simNelore}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={simNelore} 
                        onChange={(e) => setSimNelore(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 accent-teal-400 cursor-pointer rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>Mín (50%)</span>
                        <span>Máx (150%)</span>
                      </div>
                      <div className="pt-1 text-[10px] text-emerald-100/70 italic border-t border-white/5">
                        Alvo: <strong>{simResults.neloreVal}</strong> cab. rebanho
                      </div>
                    </div>

                  </div>

                  {/* Circular feedback logic with live generated metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pt-4 border-t border-white/10">
                    
                    {/* Manure production (circular connection check) */}
                    <div className="bg-emerald-990/40 p-4 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                      <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest font-mono">Adubo Orgânico Gerado</p>
                      <h4 className="text-xl font-bold mt-1 text-white">{simResults.manureGenerated.toLocaleString('pt-BR')} t</h4>
                      <p className="text-[10px] text-emerald-100/70 mt-1">Esterco enriquecido termofilizado produzido em Tatuí.</p>
                    </div>

                    {/* Cost reduction in chemical fertilizer based on manure generated */}
                    <div className="bg-emerald-990/40 p-4 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                      <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest font-mono">Economia Ecológica</p>
                      <h4 className="text-xl font-bold mt-1 text-emerald-300">R$ {simResults.fertilizerSavings.toLocaleString('pt-BR')}</h4>
                      <p className="text-[10px] text-emerald-100/70 mt-1">Sustentabilidade reduzindo o uso de químicos industriais.</p>
                    </div>

                    {/* Bio-Score Indicator */}
                    <div className="bg-emerald-950 p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/35 transition-all">
                      <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest font-mono">Biomassa do Solo (Índice)</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <h4 className="text-xl font-black text-emerald-400">{simResults.soilScore}%</h4>
                        <span className="text-[9px] font-bold text-emerald-200/80 uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 shrink-0">
                          {simResults.soilScore >= 95 ? 'Excelente' : simResults.soilScore >= 85 ? 'Ótimo' : 'Equilibrado'}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-100/70 mt-1">Nutrição natural do solo sob fertilização orgânica em Tatuí/Itaí.</p>
                    </div>

                    {/* Financial Estimations of chosen targets */}
                    <div className="bg-emerald-990/40 p-4 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                      <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest font-mono">Faturamento Mensal Est.</p>
                      <h4 className="text-xl font-bold mt-1 text-amber-400 font-mono">R$ {Math.round(simResults.totalRevenueEst).toLocaleString('pt-BR')}</h4>
                      <p className="text-[10px] text-emerald-100/70 mt-1">Estimativa comercial consolidada das 4 frentes produtivas.</p>
                    </div>

                  </div>

                  {/* High Quality Informative Box detailing the integration */}
                  <div className="bg-white/5 rounded-2xl p-4 text-[11px] text-emerald-100/80 leading-relaxed border border-white/5 relative z-10 flex items-start space-x-3 font-sans">
                    <span className="text-lg">💡</span>
                    <div>
                      <strong className="text-white block font-extrabold mb-1">Integração Circular Ecológica do Grupo Shigueno:</strong>
                      A colheita de ovos poedeiras em Tatuí gera fertilizante que aduba organicamente os pomares de laranja (Tatuí e Buri) e café (Itaí). No Mato Grosso, a recria racional de Nelore em piquetes rotacionados mantém a biosseguridade e renovação das pastagens com dignidade animal impecável.
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SUBTAB 2: GESTÃO DO QUADRO DE ATIVIDADES --- KANBAN */}
            {activeSubTab === 'suppliers' && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Quadro de Atividades Shigueno</h2>
                    <p className="text-xs text-slate-500">Fluxo Kanban integrado para planejar ações, compras, contratações gerais e finanças da corporação.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <select
                        value={activityCategoryFilter}
                        onChange={(e) => setActivityCategoryFilter(e.target.value)}
                        className="bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-emerald-850"
                      >
                        <option value="Todos">Filtrar Categoria: Todos</option>
                        <option value="Compras">Compras</option>
                        <option value="Ações">Ações</option>
                        <option value="Contratações Gerais">Contratações Gerais</option>
                        <option value="Financeiro">Financeiro</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        resetActivityForm();
                        setActivityFormOpen(true);
                      }}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nova Atividade</span>
                    </button>
                  </div>
                </div>

                {/* Activity CRUD Form Dialog */}
                {activityFormOpen && (
                  <div className="bg-[#fafbfa] border border-emerald-355 rounded-3xl p-6 shadow-xs animate-slide-in">
                    <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-tight">
                      {selectedActivityId ? 'Editar Atividade' : 'Cadastrar Nova Atividade'}
                    </h3>
                    
                    <form onSubmit={saveActivity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Título da Atividade *</label>
                        <input
                          type="text"
                          required
                          value={actTitle}
                          onChange={(e) => setActTitle(e.target.value)}
                          placeholder="Ex: Contratação de tratorista para colheita..."
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 font-sans">Descrição Detalhada *</label>
                        <textarea
                          required
                          rows={3}
                          value={actDescription}
                          onChange={(e) => setActDescription(e.target.value)}
                          placeholder="Detalhes sobre escopo, parceiros ou prazos envolvidos..."
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Categoria *</label>
                        <select
                          value={actCategory}
                          onChange={(e) => setActCategory(e.target.value)}
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-emerald-850"
                        >
                          <option value="Compras">Compras</option>
                          <option value="Ações">Ações</option>
                          <option value="Contratações Gerais">Contratações Gerais</option>
                          <option value="Financeiro">Financeiro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status Kanban *</label>
                        <select
                          value={actStatus}
                          onChange={(e) => setActStatus(e.target.value)}
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-emerald-850"
                        >
                          <option value="A Fazer">A Fazer</option>
                          <option value="Em Progresso">Em Progresso</option>
                          <option value="Concluído">Concluído</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Prioridade *</label>
                        <select
                          value={actPriority}
                          onChange={(e) => setActPriority(e.target.value)}
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-emerald-850"
                        >
                          <option value="Alta">Alta</option>
                          <option value="Média">Média</option>
                          <option value="Baixa">Baixa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Responsável *</label>
                        <input
                          type="text"
                          required
                          value={actResponsible}
                          onChange={(e) => setActResponsible(e.target.value)}
                          placeholder="Ex: Gisela Shigueno"
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Prazo (Data Limite) *</label>
                        <input
                          type="date"
                          required
                          value={actDueDate}
                          onChange={(e) => setActDueDate(e.target.value)}
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                        />
                      </div>

                      <div className="md:col-span-2 flex items-end justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActivityFormOpen(false);
                            resetActivityForm();
                          }}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Salvar Atividade
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Kanban Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {['A Fazer', 'Em Progresso', 'Concluído'].map((columnStatus) => {
                    const filteredList = activities.filter((act) => {
                      const matchesStatus = act.status === columnStatus;
                      const matchesCategory = activityCategoryFilter === 'Todos' || act.category === activityCategoryFilter;
                      return matchesStatus && matchesCategory;
                    });

                    return (
                      <div key={columnStatus} className="bg-slate-50/70 border border-slate-200/50 rounded-2xl p-4 flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              columnStatus === 'A Fazer' ? 'bg-amber-500' :
                              columnStatus === 'Em Progresso' ? 'bg-indigo-600' :
                              'bg-emerald-600'
                            }`} />
                            <h3 className="font-sans font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight">{columnStatus}</h3>
                          </div>
                          <span className="bg-slate-200/70 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {filteredList.length}
                          </span>
                        </div>

                        <div className="space-y-4 flex-1">
                          {filteredList.length > 0 ? (
                            filteredList.map((act) => (
                              <div
                                key={act.id}
                                className="bg-white border border-slate-100/70 hover:border-emerald-100/50 rounded-xl p-4 space-y-3 shadow-[0_4px_18px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.04)] transition-all relative overflow-hidden"
                              >
                                {/* Category indicator */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${
                                  act.category === 'Compras' ? 'bg-sky-500' :
                                  act.category === 'Ações' ? 'bg-purple-500' :
                                  act.category === 'Contratações Gerais' ? 'bg-teal-500' :
                                  'bg-emerald-500'
                                }`} />

                                <div className="flex items-start justify-between gap-2.5 pl-1.5">
                                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight leading-snug">{act.title}</h4>
                                  <span className={`shrink-0 inline-block px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${
                                    act.priority === 'Alta' ? 'bg-red-50 text-red-750 border border-red-100' :
                                    act.priority === 'Média' ? 'bg-amber-50 text-amber-750 border border-amber-100' :
                                    'bg-slate-50 text-slate-750 border border-slate-100'
                                  }`}>
                                    {act.priority}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-600 leading-relaxed font-sans pl-1.5 flex-1">
                                  {act.description}
                                </p>

                                <div className="flex flex-wrap gap-1.5 pl-1.5">
                                  <span className="bg-slate-100 text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-md font-sans">
                                    📁 {act.category}
                                  </span>
                                  {act.responsible && (
                                    <span className="bg-emerald-50/50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md font-sans">
                                      👤 {act.responsible}
                                    </span>
                                  )}
                                  {act.due_date && (
                                    <span className="bg-slate-100 text-slate-850 font-mono text-[8px] font-extrabold px-2 py-0.5 rounded-md">
                                      ⏱️ {act.due_date}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1.5 pl-1.5 gap-2">
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => openEditActivity(act)}
                                      className="p-1 px-2 text-slate-500 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50/50 rounded-lg text-[10px] font-bold transition-all border border-slate-100 cursor-pointer"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => deleteActivity(act.id)}
                                      className="p-1 px-2 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg text-[10px] font-bold transition-all border border-rose-100/50 cursor-pointer"
                                    >
                                      Excluir
                                    </button>
                                  </div>

                                  <div className="flex items-center space-x-1 font-mono text-xs">
                                    {columnStatus !== 'A Fazer' && (
                                      <button
                                        title="Recuar status"
                                        onClick={async () => {
                                          const prevStatus = columnStatus === 'Em Progresso' ? 'A Fazer' : 'Em Progresso';
                                          await authFetch(`/api/activities/${act.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ ...act, status: prevStatus })
                                          });
                                          fetchInitialData();
                                        }}
                                        className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] text-slate-700 cursor-pointer"
                                      >
                                        ◀
                                      </button>
                                    )}
                                    {columnStatus !== 'Concluído' && (
                                      <button
                                        title="Avançar status"
                                        onClick={async () => {
                                          const nextStatus = columnStatus === 'A Fazer' ? 'Em Progresso' : 'Concluído';
                                          await authFetch(`/api/activities/${act.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ ...act, status: nextStatus })
                                          });
                                          fetchInitialData();
                                        }}
                                        className="p-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-[10px] text-emerald-800 font-bold cursor-pointer"
                                      >
                                        ▶
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-slate-400 text-[11px] italic bg-white/70 border border-slate-200/50 rounded-xl font-sans font-medium">
                              Nenhuma atividade nesta etapa
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* SUBTAB 3: CADASTRO DE VAGAS */}
            {activeSubTab === 'vacancies' && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Gerenciador de Vagas de Recrutamento</h2>
                    <p className="text-xs text-slate-500">Crie, altere e publique novas demandas do site unificado "Trabalhe Conosco".</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      resetVacancyForm();
                      setVacancyFormOpen(true);
                    }}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Nova Vaga</span>
                  </button>
                </div>

                {vacancyFormOpen && (
                  <div className="bg-[#fafbfa] border border-emerald-350 rounded-3xl p-6 shadow-xs animate-slide-in">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
                      <h3 className="font-extrabold text-emerald-950 text-sm">
                        {selectedVacancyId ? '✏ Editar Vaga' : '➕ Cadastrar Nova Vaga'}
                      </h3>
                      <button 
                        onClick={() => {
                          setVacancyFormOpen(false);
                          resetVacancyForm();
                        }}
                        className="text-xs text-slate-400 hover:text-slate-655 font-bold"
                      >
                        Cancelar [X]
                      </button>
                    </div>

                    <form onSubmit={saveVacancy} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Título do Cargo *</label>
                          <input
                            type="text"
                            required
                            value={vacTitle}
                            onChange={(e) => setVacTitle(e.target.value)}
                            placeholder="Ex: Tratorista Agrícola especializado"
                            className="w-full bg-white border border-slate-250 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Setor / Departamento *</label>
                          <input
                            type="text"
                            required
                            value={vacDept}
                            onChange={(e) => setVacDept(e.target.value)}
                            placeholder="Ex: Citricultura, Avicultura"
                            className="w-full bg-white border border-slate-250 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Localização *</label>
                          <input
                            type="text"
                            required
                            value={vacLoc}
                            onChange={(e) => setVacLoc(e.target.value)}
                            placeholder="Ex: Tatuí - SP"
                            className="w-full bg-white border border-slate-250 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-emerald-850"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Descrição das Atribuições *</label>
                        <textarea
                          rows={3}
                          required
                          value={vacDesc}
                          onChange={(e) => setVacDesc(e.target.value)}
                          placeholder="Responsabilidades do empregado diárias, cuidados rurais..."
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-emerald-850 font-sans leading-relaxed"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Requisitos Técnicos / Cursos *</label>
                        <textarea
                          rows={2}
                          required
                          value={vacReq}
                          onChange={(e) => setVacReq(e.target.value)}
                          placeholder="Ex: Disponibilidade para residir em Tatuí. Conhecimento de adubação."
                          className="w-full bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-emerald-850 font-sans leading-relaxed"
                        ></textarea>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status Interno</label>
                          <select
                            value={vacStatus}
                            onChange={(e) => setVacStatus(e.target.value)}
                            className="bg-white border border-slate-250 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-emerald-850"
                          >
                            <option value="Ativa">Ativa (Visível para candidatos)</option>
                            <option value="Pausada">Pausada (Oculta no site)</option>
                          </select>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVacancyFormOpen(false);
                              resetVacancyForm();
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-colors"
                          >
                            Publicar Vaga
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vacancies.map((v) => (
                    <div 
                      key={v.id} 
                      className="bg-white rounded-2xl p-6 space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.05)] border border-slate-100/40 hover:border-emerald-200/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-bold bg-[#fafbfa] text-emerald-850 border border-emerald-100 px-2 py-0.5 rounded font-mono uppercase">
                              {v.department}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-950 mt-1 pl-1 border-l-2 border-amber-500">{v.title}</h3>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.status === 'Ativa' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-750'
                          }`}>
                            {v.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 pl-1">
                          <p>📍 <strong>Local:</strong> {v.location}</p>
                          <p className="line-clamp-2 mt-1">📝 <strong>Atividades:</strong> {v.description}</p>
                          <p className="line-clamp-1 italic mt-1">⭐ <strong>Requisitos:</strong> {v.requirements}</p>
                        </div>
                      </div>

                      <div className="pt-3 mt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-mono">ID SQLite: #0{v.id}</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedVacancyForPoster(v);
                              setIsPosterModalOpen(true);
                            }}
                            className="p-1.5 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs rounded hover:bg-emerald-800 hover:text-white transition-all flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Gerar Cartaz A4</span>
                          </button>
                          <button
                            onClick={() => openEditVacancy(v)}
                            className="p-1.5 px-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded hover:border-emerald-300 hover:bg-emerald-50/20 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteVacancy(v.id)}
                            className="p-1.5 px-2.5 border border-slate-200 text-red-650 font-bold text-xs rounded hover:bg-red-650 hover:text-white transition-all"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* SUBTAB 4: CADASTRO DE CURRÍCULOS */}
            {activeSubTab === 'candidates' && (() => {
              const totalCandidates = candidates.length;
              const candidatesWithAi = candidates.filter(c => getAiData(c) !== null).length;
              const pendingCandidates = candidates.filter(c => c.status === 'Novo').length;
              const averageAiScore = (() => {
                const evaluated = candidates.map(c => getAiData(c)).filter(Boolean);
                if (evaluated.length === 0) return 0;
                const sum = evaluated.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
                return Math.round(sum / evaluated.length);
              })();

              return (
                <div className="space-y-6 animate-in fade-in duration-300 w-full text-left font-sans" id="recruitment-ats-dashboard">
                  {/* METRICS GRID FOR RECRUITMENT */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="recruitment-stats-grid">
                    <div className="bg-slate-50 rounded-2xl p-4 transition-all flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">Total Inscritos</p>
                        <h4 className="text-lg font-black text-slate-900">{totalCandidates}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 transition-all flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-700 shrink-0">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">Triados por IA</p>
                        <h4 className="text-lg font-black text-slate-900">{candidatesWithAi}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 transition-all flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-amber-50 rounded-xl text-amber-650 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">Aguardando IA</p>
                        <h4 className="text-lg font-black text-slate-900">{pendingCandidates}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 transition-all flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-emerald-950 rounded-xl text-emerald-400 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">Aderência Média</p>
                        <h4 className="text-lg font-black text-slate-900">{averageAiScore}%</h4>
                      </div>
                    </div>
                  </div>

                  {/* ADVANCED RECRUITMENT FILTER PANEL */}
                  <div className="bg-white rounded-2xl p-4.5 flex flex-col xl:flex-row items-center gap-3 justify-between">
                    <div className="relative w-full xl:max-w-md">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={candidateSearchQuery}
                        onChange={(e) => setCandidateSearchQuery(e.target.value)}
                        placeholder="Pesquisar por nome, contato, vaga ou currículo..."
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-800 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 transition-all outline-none"
                      />
                      {candidateSearchQuery && (
                        <button 
                          type="button" 
                          onClick={() => setCandidateSearchQuery('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 font-bold text-slate-450 hover:text-red-500 text-[10px]"
                        >
                          ✕ Limpar
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-end">
                      {/* Filter by Vaga */}
                      <select
                        value={candidateVacancyFilter}
                        onChange={(e) => setCandidateVacancyFilter(e.target.value)}
                        className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-800 border-0"
                      >
                        <option value="Todos">Todas as Vagas</option>
                        {vacancies.map(v => (
                          <option key={v.id} value={v.id}>{v.title}</option>
                        ))}
                        <option value="null">Espontâneas / Banco</option>
                      </select>

                      {/* Filter by Status */}
                      <select
                        value={candidateStatusFilter}
                        onChange={(e) => setCandidateStatusFilter(e.target.value)}
                        className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-800 border-0"
                      >
                        <option value="Todos">Filtrar Status</option>
                        <option value="Novo">Novo</option>
                        <option value="Em Análise">Em Análise</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Recusado">Recusado</option>
                      </select>

                      {/* Action: Registrar Candidato Manual */}
                      <button
                        type="button"
                        onClick={() => setManualCandidateModalOpen(true)}
                        className="px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs border-0 shrink-0"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Incluir Manual</span>
                      </button>
                    </div>
                  </div>

                  {/* MASTER-DETAIL SPLIT GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* List of candidates column */}
                    <div className={`${viewingCandidate ? 'hidden lg:block lg:col-span-6' : 'lg:col-span-12'} space-y-3.5 text-left`}>
                      <div className="flex items-center justify-between pb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                          Currículos Registrados: {filteredCandidates.length}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((cand) => {
                            const candAi = getAiData(cand);
                            const isSelected = viewingCandidate?.id === cand.id;

                            return (
                              <div
                                key={cand.id}
                                id={`candidate-row-${cand.id}`}
                                onClick={() => setViewingCandidate(cand)}
                                className={`p-5 rounded-2xl text-left cursor-pointer transition-all duration-300 select-none ${
                                  isSelected
                                    ? 'bg-emerald-100/30'
                                    : 'bg-white hover:bg-slate-50'
                                }`}
                              >
                                {/* Top Badge Line / Border-less clean interface with soft spacing as requested */}
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{cand.name}</h4>
                                    <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                                      🎯 {cand.vacancy_title || 'Candidatura Espontânea / Geral'}
                                    </p>
                                  </div>

                                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider ${
                                      cand.status === 'Novo' ? 'bg-blue-105 text-blue-800' :
                                      cand.status === 'Em Análise' ? 'bg-amber-100 text-amber-850' :
                                      cand.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
                                      'bg-slate-100 text-slate-500'
                                    }`}>
                                      {cand.status}
                                    </span>

                                    {candAi ? (
                                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded text-[9px] font-black">
                                        <Sparkles className="w-2.5 h-2.5 text-indigo-700" />
                                        <span>Compatibilidade: {candAi.score}%</span>
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-semibold text-slate-400 italic">Análise IA Pendente</span>
                                    )}
                                  </div>
                                </div>

                                {/* Summary contacts info */}
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-400 font-mono">
                                  <span className="truncate">📧 {cand.email}</span>
                                  <span className="truncate">📞 {cand.phone}</span>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                  <span>📅 Submetido em: {cand.applied_at}</span>
                                  <span className="text-emerald-850 font-black flex items-center">
                                    Ver Ficha Seletiva
                                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-16 bg-white text-center rounded-2xl text-xs italic text-slate-400 font-medium">
                            Nenhum currículo encontrado sob as condições.
                          </div>
                        )}
                      </div>
                    </div>

                {/* Candidate detailed view Column */}
                {viewingCandidate && (
                  <div className="lg:col-span-6 bg-[#fafbfa] border-0 rounded-3xl p-6.5 space-y-6.5 animate-slide-in relative select-none" id="candidate-detail-spot">
                    {/* Voltar para Lista no Mobile */}
                    <button
                      type="button"
                      onClick={() => setViewingCandidate(null)}
                      className="lg:hidden w-full flex items-center justify-center space-x-1.5 py-3 border border-slate-200 bg-white hover:bg-slate-55 active:bg-slate-100 rounded-xl text-slate-650 font-bold text-xs transition-colors shadow-2xs cursor-pointer mb-2"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180 text-emerald-800" />
                      <span>Voltar para Lista de Currículos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewingCandidate(null)}
                      className="hidden lg:block absolute top-5 right-5 text-xs font-black text-slate-400 hover:text-red-500 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      FECHAR [X]
                    </button>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-amber-700 uppercase font-mono tracking-wider">Ficha Seletiva de RH</span>
                      <h3 className="text-xl font-black text-slate-950 font-sans tracking-tight">{viewingCandidate.name}</h3>
                      <p className="text-xs text-slate-500 font-semibold font-mono">📅 Recebido via portal em {viewingCandidate.applied_at}</p>
                    </div>

                    {/* ADVANCED RECRUITMENT PIPELINE BAR */}
                    <div className="bg-slate-50 p-4.5 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Etapa Atual do Fluxo seletivo (Pipeline interativo)</p>
                      <div className="flex items-center justify-between relative pl-1.5 pr-1.5">
                        {/* Connecting track line */}
                        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-slate-200 z-0"></div>
                        
                        {/* Interactive status steps */}
                        {[
                          { key: 'Novo', label: 'Novo', icon: '📩' },
                          { key: 'Em Análise', label: 'Em Análise', icon: '🔍' },
                          { key: 'Aprovado', label: 'Contratar', icon: '🟢' },
                          { key: 'Recusado', label: 'Reprovado', icon: '✕' }
                        ].map((step) => {
                          const isCurrent = viewingCandidate.status === step.key;
                          let isCompleted = false;
                          if (viewingCandidate.status === 'Aprovado' && step.key !== 'Recusado') isCompleted = true;
                          if (viewingCandidate.status === 'Em Análise' && step.key === 'Novo') isCompleted = true;
                          if (isCurrent) isCompleted = true;

                          const nodeClass = isCurrent
                            ? 'bg-emerald-800 text-white border-2 border-emerald-950 ring-4 ring-emerald-100/70 scale-105 z-10 font-bold'
                            : isCompleted
                              ? 'bg-emerald-600 text-white z-10'
                              : 'bg-white text-slate-400 border border-slate-200 z-10';

                          return (
                            <button
                              key={step.key}
                              type="button"
                              onClick={() => updateCandidateStatus(viewingCandidate.id, step.key)}
                              className="flex flex-col items-center focus:outline-none cursor-pointer group select-none relative border-0 bg-transparent"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${nodeClass}`}>
                                {step.icon}
                              </div>
                              <span className={`text-[8px] font-black mt-1.5 transition-all tracking-tight ${isCurrent ? 'text-emerald-900 font-extrabold' : 'text-slate-400'}`}>
                                {step.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Applicant details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4.5 rounded-2xl">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Endereço de E-mail</p>
                        <a href={`mailto:${viewingCandidate.email}`} className="font-bold text-emerald-800 hover:underline break-all mt-0.5 block font-mono">
                          {viewingCandidate.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Celular WhatsApp</p>
                        <a href={`tel:${viewingCandidate.phone}`} className="font-bold text-slate-800 hover:underline mt-0.5 block font-mono">
                          {viewingCandidate.phone}
                        </a>
                      </div>
                      <div className="sm:col-span-2 border-t border-slate-100 pt-2.5 mt-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Vaga Alvo do Candidato</p>
                        <p className="font-bold text-slate-900 mt-0.5">{viewingCandidate.vacancy_title || 'Envio Espontâneo / Banco de Talentos Geral'}</p>
                      </div>
                    </div>

                    {/* PERSISTED RECRUITER OPINION DIARY */}
                    {(() => {
                      const [notesVal, setNotesVal] = React.useState('');
                      
                      React.useEffect(() => {
                        if (viewingCandidate) {
                          setNotesVal(localStorage.getItem(`recruiter-notes-${viewingCandidate.id}`) || '');
                        }
                      }, [viewingCandidate.id]);

                      const handleSaveNotes = () => {
                        localStorage.setItem(`recruiter-notes-${viewingCandidate.id}`, notesVal);
                        showSuccess('Parecer interno do candidato registrado localmente!');
                      };

                      return (
                        <div className="bg-amber-50/20 border border-amber-200/40 rounded-2xl p-4.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center">
                              <span>📝 Parecer & Diário de Entrevista</span>
                            </h5>
                            
                            <button
                              type="button"
                              onClick={handleSaveNotes}
                              className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0"
                            >
                              Gravar Notas
                            </button>
                          </div>
                          
                          <textarea
                            value={notesVal}
                            onChange={(e) => setNotesVal(e.target.value)}
                            placeholder="Adicione observações da conversa telefônica... Ex: agendou teste prático de campo."
                            className="w-full bg-white border border-amber-100 rounded-xl p-3 text-xs font-normal text-slate-800 outline-none focus:border-amber-500 h-18 placeholder-slate-400 resize-none leading-relaxed font-sans"
                          />
                        </div>
                      );
                    })()}

                    {/* Parsing text CV content */}
                    <div className="space-y-1.5 text-left">
                      <p className="text-xs font-bold text-slate-700 uppercase">Resumo da Experiência / Texto do Currículo:</p>
                      <div className="bg-white border-0 rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-650 h-40 overflow-y-auto">
                        {viewingCandidate.cv_text}
                      </div>
                    </div>

                    {/* SEÇÃO ANALISE INTELIGENTE IA (GEMINI) */}
                    <div className="bg-emerald-50/20 border-0 rounded-2xl p-6.5 space-y-5 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-100/50 pb-4">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-650"></span>
                          </span>
                          <span className="text-[11px] font-black uppercase text-emerald-850 tracking-wider">Módulo Integrado Gemini IA | Grupo Shigueno</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => runAiEvaluation(viewingCandidate.id)}
                          disabled={evaluatingId === viewingCandidate.id}
                          className="px-3.5 py-1.5 bg-emerald-800 text-white hover:bg-emerald-950 disabled:bg-slate-205 disabled:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 shrink-0 inline-flex items-center space-x-1.5"
                        >
                          {evaluatingId === viewingCandidate.id ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-slate-100 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Triando...</span>
                            </>
                          ) : (
                            <>
                              <span>✨ Rodar IA do Grupo Shigueno</span>
                            </>
                          )}
                        </button>
                      </div>

                      {(() => {
                        const aiData = getAiData(viewingCandidate);
                        if (!aiData) {
                          return (
                            <div className="py-2 space-y-1">
                              <p className="text-xs text-slate-650 font-bold">Esta ficha seletiva ainda não possui análise por IA no sistema.</p>
                              <p className="text-[10px] text-slate-450 leading-relaxed">Clique em <strong>"Rodar IA do Grupo Shigueno"</strong> para calibrar a aderência do candidato com a vaga agrícola selecionada ou outras vagas em aberto.</p>
                            </div>
                          );
                        }

                        // We have aiData! Let's render it styled wonderfully
                        return (
                          <div className="space-y-4">
                            {/* Score and Summary banner */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center bg-white p-4.5 rounded-2xl">
                              <div className="sm:col-span-3 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 min-h-[64px]">
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none animate-pulse">Aderência</span>
                                <span className="text-2xl font-black mt-1 text-emerald-800 leading-none">{aiData.score}%</span>
                              </div>
                              <div className="sm:col-span-9">
                                <p className="text-[9px] uppercase font-black text-emerald-800 mb-0.5">Diagnóstico Técnico</p>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{aiData.summary}</p>
                              </div>
                            </div>

                            {/* Strengths & Gaps */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Strengths */}
                              <div className="bg-white p-4 rounded-xl space-y-1.5 border-0">
                                <h5 className="text-[9px] font-black uppercase text-emerald-805 tracking-wider flex items-center">
                                  <span className="mr-1 text-xs">💪</span> Pontos Fortes
                                </h5>
                                <ul className="space-y-1 list-none pl-0 text-[10px] sm:text-xs">
                                  {aiData.strengths?.map((str: string, idx: number) => (
                                    <li key={idx} className="flex items-start text-slate-650 leading-relaxed font-sans text-left">
                                      <span className="text-emerald-600 mr-1.5 font-bold">•</span>
                                      <span>{str}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Gaps */}
                              <div className="bg-white p-4 rounded-xl space-y-1.5 border-0">
                                <h5 className="text-[9px] font-black uppercase text-amber-750 tracking-wider flex items-center">
                                  <span className="mr-1 text-xs">⚠️</span> Pontos de Atenção
                                </h5>
                                <ul className="space-y-1 list-none pl-0 text-[10px] sm:text-xs">
                                  {aiData.gaps?.map((gp: string, idx: number) => (
                                    <li key={idx} className="flex items-start text-slate-655 leading-relaxed font-sans text-left">
                                      <span className="text-amber-600 mr-1.5 font-bold">•</span>
                                      <span>{gp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Recommendations & matching spots */}
                            <div className="bg-white p-4.5 rounded-xl space-y-1.5 border-0">
                              <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider leading-none">Recomendação de Próximos Passos:</p>
                              <p className="text-xs text-slate-800 font-black leading-relaxed">{aiData.recommendations}</p>
                              {aiData.matchingVacancies && aiData.matchingVacancies.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[9px] font-black uppercase text-slate-400">Alternativas do Grupo:</span>
                                  {aiData.matchingVacancies.map((mv: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg text-[9px] font-black">
                                      {mv}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Suggested Questions */}
                            <div className="bg-emerald-950 text-white p-4.5 rounded-2xl space-y-2 border-0">
                              <h5 className="text-[9px] font-black uppercase text-emerald-350 tracking-wider flex items-center">
                                💬 Perguntas Técnicas Estratégicas para o Recrutador
                              </h5>
                              <div className="space-y-1.5">
                                {aiData.questions?.map((q: string, idx: number) => (
                                  <div key={idx} className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/20 text-[10px] leading-relaxed flex items-start">
                                    <span className="font-extrabold text-emerald-300 mr-2">{idx + 1}.</span>
                                    <span className="text-emerald-100">{q}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Change Recruitment Status */}
                    <div className="pt-2 space-y-3">
                      <p className="text-[10px] font-black text-slate-655 uppercase">Alterar Status Seletivo:</p>
                      <div className="flex flex-wrap gap-2">
                        {['Novo', 'Em Análise', 'Aprovado', 'Recusado'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateCandidateStatus(viewingCandidate.id, st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                              viewingCandidate.status === st
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-2">
                        <button
                          type="button"
                          onClick={() => deleteCandidate(viewingCandidate.id)}
                          className="flex items-center space-x-1 text-red-650 hover:text-red-750 font-bold text-xs border-0 bg-transparent cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover do Banco</span>
                        </button>
                        
                        <p className="text-[9px] text-slate-400 font-mono italic">Ficha: #{viewingCandidate.id}</p>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )})()}

            {/* SUBTAB 5: RASTREAMENTO & FROTAS */}
            {activeSubTab === 'tracking' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                
                {/* 1. SEÇÃO ESQUERDA: LISTA DE ROTAS E DISPARO DE VIAGEM */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/90">
                    <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-50 pb-4">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 leading-snug flex items-center">
                          <Truck className="w-5 h-5 text-emerald-800 mr-2 shrink-0" />
                          <span>Frota Ativa</span>
                        </h2>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono mt-0.5">Escoamento Agrícola & Pecuário</p>
                      </div>
                      
                      <button
                        onClick={() => setRouteFormOpen(!routeFormOpen)}
                        className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer select-none shrink-0 uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Novo Despacho</span>
                      </button>
                    </div>

                    {/* FORM OVERLAY TO INICIATE ROUTE */}
                    {routeFormOpen && (
                      <form onSubmit={createRoute} className="bg-emerald-50/30 border border-emerald-100/70 rounded-2xl p-5 mb-6 space-y-4 shadow-3xs animate-in zoom-in-95 duration-200 text-xs">
                        <div className="flex justify-between items-center pb-2.5 border-b border-emerald-100/50">
                          <span className="font-extrabold text-emerald-950 uppercase tracking-wider flex items-center space-x-1.5 font-sans">
                            <Compass className="w-4 h-4 text-amber-500 animate-spin" />
                            <span>Novo Manifesto</span>
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setRouteFormOpen(false)}
                            className="text-slate-400 hover:text-slate-700 transition-colors font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                          >
                            [ fechar ]
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-600 font-extrabold text-[10px] uppercase tracking-wider">Nome do Motorista Corretor</label>
                          <input 
                            type="text" 
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="Ex: Ricardo N. Santos"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all text-slate-800"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-slate-600 font-extrabold text-[10px] uppercase tracking-wider">Placa do Veículo</label>
                            <input 
                              type="text" 
                              value={vehiclePlate}
                              onChange={(e) => setVehiclePlate(e.target.value)}
                              placeholder="Ex: SHI-2026"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-800 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all font-mono"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-600 font-extrabold text-[10px] uppercase tracking-wider">Tipo / Porte</label>
                            <select
                              value={vehicleType}
                              onChange={(e) => setVehicleType(e.target.value)}
                              className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all cursor-pointer"
                            >
                              <option value="Caminhão Baú (Ovos)">Caminhão Baú (Ovos)</option>
                              <option value="Semirreboque Gaiola (Gado)">Gaiola Nelore (Gado)</option>
                              <option value="Caminhão Graneleiro (Adubo)">Graneleiro (Adubo)</option>
                              <option value="Sider Lonado (Citros)">Lonado (Citros)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-slate-600 font-extrabold text-[10px] uppercase tracking-wider">Ponto de Partida</label>
                            <select
                              value={startLocation}
                              onChange={(e) => setStartLocation(e.target.value)}
                              className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all cursor-pointer"
                            >
                              {Object.keys(PRESET_COORDS).map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-slate-600 font-extrabold text-[10px] uppercase tracking-wider">Destino Final</label>
                            <select
                              value={destination}
                              onChange={(e) => setDestination(e.target.value)}
                              className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all cursor-pointer"
                            >
                              {Object.keys(PRESET_COORDS).map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-600 font-extrabold text-[10px] uppercase tracking-wider">Carga & Manifesto Declarado</label>
                          <input 
                            type="text" 
                            value={cargoDesc}
                            onChange={(e) => setCargoDesc(e.target.value)}
                            placeholder="Ex: 140 caixas de Ovos Shigueno Especial"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all text-slate-800 placeholder-slate-400"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition-all shadow-xs uppercase tracking-wider cursor-pointer"
                        >
                          🚚 Despachar & Iniciar Rota
                        </button>
                      </form>
                    )}

                    <div className="space-y-3.5">
                      {routes.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                          <p className="text-xs text-slate-400 italic font-semibold">Nenhum veículo em trânsito no momento.</p>
                        </div>
                      ) : (
                        routes.map((rt) => {
                          const isActive = rt.status === 'Ativa';
                          const isSelected = selectedRouteId === rt.id;
                          return (
                            <div
                              key={rt.id}
                              onClick={() => setSelectedRouteId(rt.id)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none relative group ${
                                isSelected 
                                  ? 'bg-gradient-to-br from-emerald-50/40 to-emerald-50/10 border-emerald-600 shadow-xs' 
                                  : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${
                                    isActive 
                                      ? 'bg-amber-50 text-amber-900 border-amber-200/50 animate-pulse' 
                                      : 'bg-slate-200/80 text-slate-600 border-slate-300/40'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full mr-1.5 ${isActive ? 'bg-amber-600 animate-ping' : 'bg-slate-400'}`} />
                                    {isActive ? 'Em Rota' : 'Concluída'}
                                  </span>
                                  <h4 className="text-xs font-black text-slate-900 truncate mt-1 flex items-center">
                                    {rt.driver_name}
                                  </h4>
                                  <p className="text-[10px] text-slate-550 font-mono font-semibold">
                                    {rt.vehicle_type} • <strong className="text-slate-800 font-extrabold">{rt.vehicle_plate}</strong>
                                  </p>
                                </div>
                                
                                {rt.status !== 'Ativa' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteRoute(rt.id);
                                    }}
                                    className="p-1 px-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                                    title="Remover histórico"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Progress miniature */}
                              <div className="mt-4 space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                                  <span>Progresso:</span>
                                  <span className="font-extrabold text-slate-800">{rt.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-700 ${isActive ? 'bg-emerald-600' : 'bg-slate-500'}`}
                                    style={{ width: `${rt.progress}%` }}
                                  />
                                </div>
                              </div>

                              <div className="mt-3 text-[10px] border-t border-slate-100 pt-2 flex justify-between text-slate-500 font-bold font-sans">
                                <span className="truncate max-w-[100px]" title={rt.start_location}>{rt.start_location.split(' ')[0]}</span>
                                <span className="text-slate-300">➜</span>
                                <span className="truncate max-w-[100px]" title={rt.destination}>{rt.destination.split(' ')[0]}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* CONTROLE SIMULADOR GERAL */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center">
                      <Activity className="w-4 h-4 text-emerald-850 mr-2 animate-pulse" />
                      <span>Simulação de Telemetria</span>
                    </h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">
                      Com o simulador ligado, os trajetos são atualizados a cada 6s de forma dinâmica pela central para calcular as rotas integradas.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-150 gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="font-bold text-slate-600 font-mono text-[9px] uppercase tracking-wider font-sans">Status Transmissão</span>
                      </div>
                      <button
                        onClick={() => setSimulationActive(!simulationActive)}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl font-black text-[10px] tracking-wider transition-all uppercase cursor-pointer text-center shrink-0 ${
                          simulationActive 
                            ? 'bg-emerald-800 text-white shadow-xs hover:bg-emerald-950' 
                            : 'bg-red-50 text-red-700 border border-red-200/80 hover:bg-red-150/60'
                        }`}
                      >
                        {simulationActive ? '📡 Simulando GPS' : '⏸️ Simulador Pausado'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. SEÇÃO DIREITA: DETALHAMENTO GPS, MAPA INTERATIVO E HISTÓRICO */}
                <div className="lg:col-span-8 space-y-6">
                  {(() => {
                    const selectedRoute = routes.find(r => r.id === selectedRouteId);
                    if (!selectedRoute) {
                       return (
                        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400 font-semibold shadow-xs flex flex-col items-center justify-center min-h-[450px]">
                          <Truck className="w-14 h-14 text-slate-300 mb-4 animate-bounce" style={{ animationDuration: '3s' }} />
                          <h3 className="text-slate-700 font-extrabold text-sm">Nenhum Veículo Selecionado</h3>
                          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                            Selecione uma rota na lista lateral ou registre um Novo Despacho para abrir o mapas e a telemetria satélite em tempo real.
                          </p>
                        </div>
                      );
                    }

                    const startPreset = PRESET_COORDS[selectedRoute.start_location] || { lat: -23.3556, lng: -47.8556 };
                    const endPreset = PRESET_COORDS[selectedRoute.destination] || { lat: -23.7975, lng: -48.5133 };

                    // Coordinates list for SVG path rendering (Southeast bounds setup)
                    const minLat = -24.5;
                    const maxLat = -14.0;
                    const minLng = -57.5;
                    const maxLng = -45.5;

                    const getXY = (lat: number, lng: number) => {
                      const x = ((lng - minLng) / (maxLng - minLng)) * 750;
                      const y = (1 - (lat - minLat) / (maxLat - minLat)) * 400;
                      return { x, y };
                    };

                    const startXY = getXY(startPreset.lat, startPreset.lng);
                    const endXY = getXY(endPreset.lat, endPreset.lng);
                    const currentXY = getXY(selectedRoute.current_lat, selectedRoute.current_lng);

                    // De-serialize history coordinates logs
                    let historyLogs: any[] = [];
                    try {
                      historyLogs = typeof selectedRoute.coordinates_history === 'string'
                        ? JSON.parse(selectedRoute.coordinates_history)
                        : (selectedRoute.coordinates_history || []);
                    } catch (e) {
                      historyLogs = [];
                    }

                    return (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        
                        {/* HEADER DETAILS CARD */}
                        <div className="bg-gradient-to-br from-[#0c1c13] through-[#0e2c1a] to-[#0a1710] text-white rounded-3xl p-6 shadow-md border-0 relative overflow-hidden select-none">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                          
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4 relative z-10">
                            <div>
                              <p className="text-[9px] font-extrabold text-amber-400 font-mono tracking-widest uppercase flex items-center space-x-1.5">
                                <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
                                <span>Painel de Logística Ativo</span>
                              </p>
                              <h3 className="text-xl font-extrabold mt-1 tracking-tight text-white">{selectedRoute.driver_name}</h3>
                              <p className="text-xs text-emerald-300 font-mono font-semibold">{selectedRoute.vehicle_type} — Placa: <strong className="text-amber-400">{selectedRoute.vehicle_plate}</strong></p>
                            </div>

                            <div className="text-left md:text-right">
                              <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-widest block">Rota de Escoamento</span>
                              <p className="text-sm font-extrabold mt-1 text-slate-100 flex items-center gap-1.5 md:justify-end">
                                <span>{selectedRoute.start_location.split(' ')[0]}</span>
                                <span className="text-amber-400 text-xs font-normal">➔</span>
                                <span>{selectedRoute.destination.split(' ')[0]}</span>
                              </p>
                              <span className="text-[10px] text-slate-300 font-mono mt-1 block">Início: {selectedRoute.started_at}</span>
                            </div>
                          </div>

                          {/* TELEMETRY READINGS BAR */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-center relative z-10">
                            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-900/50 backdrop-blur-md">
                              <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest">Velocidade</span>
                              <p className="text-base font-black text-white mt-1 font-mono tracking-tight">{selectedRoute.speed} <span className="text-[10px] text-zinc-400 font-sans font-normal">km/h</span></p>
                            </div>
                            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-900/50 backdrop-blur-md">
                              <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest">Combustível</span>
                              <p className="text-base font-black text-amber-400 mt-1 font-mono tracking-tight">{selectedRoute.fuel_level}%</p>
                            </div>
                            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-900/50 backdrop-blur-md">
                              <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest">Carga</span>
                              <p className="text-[11px] font-extrabold text-white mt-1.5 truncate max-w-[150px] mx-auto italic" title={selectedRoute.cargo_description}>
                                "{selectedRoute.cargo_description}"
                              </p>
                            </div>
                            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-900/50 backdrop-blur-md">
                              <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest">Último Evento</span>
                              <p className="text-[10px] font-semibold text-slate-200 mt-1 line-clamp-2 leading-tight" title={selectedRoute.last_event}>
                                "{selectedRoute.last_event}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* VECTOR HIGH POLISHED INTERACTIVE MAP */}
                        <div className="bg-white border border-slate-100/90 rounded-3xl p-5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">Visualizador de Integração Satélite ({selectedRoute.start_location.split(' ')[0]} ➔ {selectedRoute.destination.split(' ')[0]})</h3>
                              <p className="text-[10px] text-slate-400 uppercase font-extrabold font-mono tracking-wider mt-0.5">Mapeamento Vetorial Corporativo — Granja Shigueno</p>
                            </div>
                            <div className="text-[10px] bg-slate-50 text-slate-700 font-bold px-3.5 py-1.5 rounded-full font-mono flex items-center space-x-1.5 border border-slate-100 self-start sm:self-auto shrink-0 shadow-3xs">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span>Coordenadas GPS: {selectedRoute.current_lat.toFixed(5)}, {selectedRoute.current_lng.toFixed(5)}</span>
                            </div>
                          </div>

                          <div className="bg-[#0b120d] rounded-2xl overflow-hidden relative border border-slate-900 shadow-inner h-[285px] xs:h-[350px] md:h-[400px]">
                            <svg className="w-full h-full" viewBox="0 0 750 400">
                              {/* Grid lines backdrop (Control Center) */}
                              <pattern id="mapGrid2" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04" />
                              </pattern>
                              <rect width="100%" height="100%" fill="url(#mapGrid2)" />

                              {/* State boundary indicator rings */}
                              <circle cx="120" cy="80" r="100" fill="#fbbf24" fillOpacity="0.01" stroke="#fbbf24" strokeOpacity="0.05" strokeDasharray="4,4" />
                              <text x="50" y="45" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace" opacity="0.3">REGIÃO MATO GROSSO (MT)</text>

                              <circle cx="560" cy="330" r="130" fill="#047857" fillOpacity="0.01" stroke="#047857" strokeOpacity="0.05" strokeDasharray="4,4" />
                              <text x="590" y="225" fill="#059669" fontSize="9" fontWeight="bold" fontFamily="monospace" opacity="0.3">CENTRAL SÃO PAULO (SP)</text>

                              {/* Interstate connection highway */}
                              <line x1="120" y1="80" x2="520" y2="300" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.07" strokeDasharray="3,3" />

                              {/* ALL CITIES PRESETS NODES MARKERS */}
                              {Object.entries(PRESET_COORDS).map(([name, coords]) => {
                                const xy = getXY(coords.lat, coords.lng);
                                const isEndpoint = name === selectedRoute.start_location || name === selectedRoute.destination;
                                return (
                                  <g key={name} className="cursor-help" opacity={isEndpoint ? 1 : 0.4}>
                                    <circle 
                                      cx={xy.x} 
                                      cy={xy.y} 
                                      r={isEndpoint ? 6 : 4} 
                                      fill={name.includes('MT') ? '#fbbf24' : '#10b981'} 
                                    />
                                    {isEndpoint && (
                                      <circle 
                                        cx={xy.x} 
                                        cy={xy.y} 
                                        r={10} 
                                        fill="none" 
                                        stroke={name.includes('MT') ? '#fbbf24' : '#10b981'} 
                                        strokeOpacity="0.4"
                                        className="animate-ping"
                                      />
                                    )}
                                    <text 
                                      x={xy.x + 8} 
                                      y={xy.y + 3} 
                                      fill="#e2e8f0" 
                                      fontSize="8" 
                                      fontWeight="extrabold" 
                                      fontFamily="sans-serif"
                                      letterSpacing="0.05em"
                                    >
                                      {name}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* FULL PATH LINE */}
                              <line 
                                x1={startXY.x} 
                                y1={startXY.y} 
                                x2={endXY.x} 
                                y2={endXY.y} 
                                stroke="#10b981" 
                                strokeWidth="3" 
                                strokeOpacity="0.12" 
                              />
                              <line 
                                x1={startXY.x} 
                                y1={startXY.y} 
                                x2={endXY.x} 
                                y2={endXY.y} 
                                stroke="#f59e0b" 
                                strokeWidth="1.5" 
                                strokeDasharray="5,5" 
                                strokeOpacity="0.5" 
                              />

                              {/* DRIVEN / PROGRESS COMPLETED VECTOR OVERLAY LINE */}
                              <line 
                                x1={startXY.x} 
                                y1={startXY.y} 
                                x2={currentXY.x} 
                                y2={currentXY.y} 
                                stroke="#059669" 
                                strokeWidth="3.5" 
                                strokeOpacity="0.75" 
                              />

                              {/* DRIVER GPS LIVE CORNER */}
                              <g>
                                <circle 
                                  cx={currentXY.x} 
                                  cy={currentXY.y} 
                                  r={14} 
                                  fill="#fbbf24" 
                                  fillOpacity="0.2" 
                                  className={selectedRoute.status === 'Ativa' ? 'animate-ping' : ''}
                                  style={{ animationDuration: '3s' }}
                                />
                                <circle 
                                  cx={currentXY.x} 
                                  cy={currentXY.y} 
                                  r={6} 
                                  fill={selectedRoute.status === 'Ativa' ? '#f59e0b' : '#10b981'} 
                                  stroke="#ffffff" 
                                  strokeWidth="1.5"
                                />
                              </g>
                            </svg>

                            {/* HOVER EXPLANATORY BANNER overlay */}
                            <div className="absolute bottom-3 left-3 right-3 bg-[#0c130f]/90 p-2.5 rounded-xl border border-emerald-950 flex justify-between text-[10px] font-mono text-slate-300">
                              <span className="flex items-center space-x-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>Origem: {selectedRoute.start_location.split(' ')[0]} ({startPreset.lat.toFixed(2)}, {startPreset.lng.toFixed(2)})</span>
                              </span>
                              <span>➔</span>
                              <span>Destino: {selectedRoute.destination.split(' ')[0]} ({endPreset.lat.toFixed(2)}, {endPreset.lng.toFixed(2)})</span>
                            </div>
                          </div>
                        </div>

                        {/* DRIVER SIMULATION PROGRESS CONTROL MODIFERS */}
                        {selectedRoute.status === 'Ativa' && (
                          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-50 pb-3">
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">Painel Operacional do Motorista</h3>
                                <p className="text-[10px] text-slate-400">Force atualizações manuais ou simule o comportamento do veículo na pista.</p>
                              </div>
                              
                              <div className="flex items-center space-x-2.5">
                                <button
                                  type="button"
                                  onClick={() => triggerStepProgress(selectedRoute.id, 10)}
                                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 font-extrabold text-[#0c1c13] rounded-xl text-[10px] transition-all uppercase flex items-center space-x-1.5 cursor-pointer shadow-3xs"
                                >
                                  <Play className="w-3.5 h-3.5 shrink-0" />
                                  <span>Adiantar Rota +10%</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => triggerStepProgress(selectedRoute.id, 100 - selectedRoute.progress)}
                                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-[10px] font-black transition-all uppercase cursor-pointer"
                                >
                                  Forçar Chegada Agora
                                </button>
                              </div>
                            </div>

                            <form onSubmit={manualEventReport} className="flex gap-2.5">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={customEventText}
                                  onChange={(e) => setCustomEventText(e.target.value)}
                                  placeholder="Ex: Parada técnica para pesagem de carga no pedágio / Posto reabastecido..."
                                  className="w-full px-4 py-2.5 border border-slate-150 rounded-xl text-xs bg-slate-50/50 text-slate-900 focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all font-semibold outline-none"
                                  required
                                />
                              </div>
                              <button
                                type="submit"
                                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-xs transition-all hover:shadow-xs cursor-pointer tracking-wider shrink-0 uppercase"
                              >
                                Emitir Alerta
                              </button>
                            </form>
                          </div>
                        )}

                        {/* HISTORICAL COORDINATES ROAD DIARY */}
                        <div className="bg-white border border-slate-100/90 rounded-3xl p-5 shadow-sm">
                          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest font-mono mb-4 flex items-center space-x-1.5 border-b border-slate-50 pb-3">
                            <Clock className="w-4 h-4 text-emerald-800" />
                            <span>Diário de Bordo Geográfico & logs GPS</span>
                          </h3>

                          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 relative">
                            {historyLogs.length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-6 text-center">Aguardando pings de telemetria satélite.</p>
                            ) : (
                              [...historyLogs].reverse().map((log, lidx) => (
                                <div key={lidx} className="flex items-start space-x-4 text-xs font-sans border-l border-emerald-800/20 pl-4 py-1.5 relative">
                                  {/* Milestone node bubble indicator */}
                                  <div className="absolute -left-[5px] top-2 my-0.5 w-2 h-2 rounded-full bg-white border-2 border-emerald-800 flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-emerald-800" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start gap-4">
                                      <p className="font-bold text-slate-900 text-xs">{log.event || 'Sinal de telemetria transmitido com sucesso.'}</p>
                                      <span className="text-[9px] text-slate-400 font-mono font-bold shrink-0">{log.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-3.5 mt-1 text-[10px] font-mono text-slate-500 font-semibold font-mono">
                                      <span>LatLng: {Number(log.lat).toFixed(4)}, {Number(log.lng).toFixed(4)}</span>
                                      <span>•</span>
                                      <span>Velocidade registrada: <strong className="text-emerald-900">{log.speed || 0} km/h</strong></span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>

              </div>
            )}

            {/* SUBTAB 6: DADOS E DIVULGAÇÃO DA INSTITUIÇÃO */}
            {activeSubTab === 'settings' && (
              <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Editar Dados de Divulgação</h2>
                  <p className="text-xs text-slate-500 font-medium">Atualize os slogans, informações institucionais, história e contatos organizados por abas da mesma forma que os menus do site.</p>
                </div>

                {/* NESTED SETTINGS TABS */}
                <div className="flex border-b border-slate-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
                  {[
                    { key: 'home', label: '🏠 Canal Início (Home)' },
                    { key: 'sobre', label: '📖 Institucional (Sobre Nós)' },
                    { key: 'produtos', label: '🍊 Segmentos (Produtos)' },
                    { key: 'contato', label: '📞 Canais de Contato' }
                  ].map((sub) => (
                    <button
                      key={sub.key}
                      type="button"
                      onClick={() => setActiveEditTab(sub.key as any)}
                      className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x -mb-px transition-all cursor-pointer ${
                        activeEditTab === sub.key
                          ? 'bg-slate-50 border-slate-200 border-b-transparent text-emerald-800 font-black'
                          : 'bg-white border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* TAB 1: HOME */}
                  {activeEditTab === 'home' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 text-xs text-emerald-900 mb-4 font-medium">
                        Configure as frases de impacto e de apresentação dispostas na página de recepção (Home).
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-705 tracking-wide uppercase">
                          Slogan Principal da Família Shigueno
                        </label>
                        <input
                          type="text"
                          value={siteMotto}
                          onChange={(e) => setSiteMotto(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                          placeholder="Ex: Uma empresa sempre preocupada com a qualidade de vida."
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: OVER / HISTÓRIA */}
                  {activeEditTab === 'sobre' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 text-xs text-emerald-900 mb-2 font-medium">
                        Configure o legado histórico estruturado do Sr. Haruo Shigueno para inspirar o público institucional.
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>Introdução Histórica (Chegada do Patriarca Sr. Haruo Shigueno)</span>
                          <span className="text-slate-400 text-[10px]">Introdução em destaque</span>
                        </label>
                        <textarea
                          rows={3}
                          value={siteAboutIntro}
                          onChange={(e) => setSiteAboutIntro(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed"
                          placeholder="Breve sumário sobre a imigração em 1932..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>História de Fundação (Avicultura e deparação com o campo)</span>
                          <span className="text-slate-400 text-[10px]">Parágrafo central principal</span>
                        </label>
                        <textarea
                          rows={5}
                          value={siteAboutFull}
                          onChange={(e) => setSiteAboutFull(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed"
                          placeholder="Detalhes completos sobre Mogi das Cruzes, São José dos Campos e Tatuí..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>Diversificação Agrícola e Progresso das Fazendas</span>
                          <span className="text-slate-400 text-[10px]">Última seção</span>
                        </label>
                        <textarea
                          rows={4}
                          value={siteAboutDiversification}
                          onChange={(e) => setSiteAboutDiversification(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed"
                          placeholder="Explicação sobre a citricultura, café e adubo de postura das aves..."
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PRODUTOS / PILARES */}
                  {activeEditTab === 'produtos' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 text-xs text-emerald-900 mb-2 font-medium">
                        Edite os textos descritivos que aparecem nas abas técnicas de cada categoria em nosso catálogo de produtos do campo.
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>🥚 Avicultura de Postura - Descrição Executiva</span>
                          <span className="text-slate-400 text-[10px]">Fazenda Nova Aliança Tatuí (SP)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={siteProdAvicultura}
                          onChange={(e) => setSiteProdAvicultura(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed"
                          placeholder="Descrição da produção seletiva de ovos..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>🍊 Citricultura Técnica - Descrição Sazonal</span>
                          <span className="text-slate-400 text-[10px]">Fazendas Califórnia e Aliança</span>
                        </label>
                        <textarea
                          rows={3}
                          value={siteProdCitricultura}
                          onChange={(e) => setSiteProdCitricultura(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed"
                          placeholder="Descrição do cultivo orgânico de citros com esterco aviário..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>☕ Cafeicultura de Altitude - Descrição Climatológica</span>
                          <span className="text-slate-400 text-[10px]">Fazendas de Itaí (SP)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={siteProdCafeicultura}
                          onChange={(e) => setSiteProdCafeicultura(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed"
                          placeholder="Descrição das linhagens de café arábica e microclima..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>🐂 Nelore Agropecuária - Cria & Recria Sustentável</span>
                          <span className="text-slate-400 text-[10px]">Santo Antônio do Leverger (MT)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={siteProdNelore}
                          onChange={(e) => setSiteProdNelore(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed"
                          placeholder="Descrição do manejo racional do rebanho Nelore..."
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CONTATO */}
                  {activeEditTab === 'contato' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 text-xs text-emerald-900 mb-2 font-medium">
                        Configure as informações básicas de contato disponibilizadas no rodapé e canal comercial.
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">
                            E-mail Geral de Atendimento (SAC)
                          </label>
                          <input
                            type="email"
                            value={siteContactEmail}
                            onChange={(e) => setSiteContactEmail(e.target.value)}
                            className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-mono font-semibold text-slate-800 focus:outline-none"
                            placeholder="Ex: sac@shigueno.com.br"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">
                            Telefone Comercial (Sede Administrativa Tatuí)
                          </label>
                          <input
                            type="text"
                            value={siteContactPhone}
                            onChange={(e) => setSiteContactPhone(e.target.value)}
                            className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all rounded-xl px-4 py-3 text-xs font-mono font-semibold text-slate-800 focus:outline-none"
                            placeholder="Ex: (15) 3259-9710"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTION CONTROLS */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3.5">
                    <button
                      type="button"
                      onClick={fetchInitialData}
                      disabled={loading}
                      className="px-5 py-3 border border-slate-250 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all focus:outline-none cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reverter Alterações</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-xl text-xs transition-all shadow-sm tracking-widest uppercase flex items-center space-x-2 cursor-pointer"
                    >
                      <span>Gravar Dados no site</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUBTAB GESTÃO DO BLOG */}
            {activeSubTab === 'blog' && (
              <BlogManager authFetch={authFetch} onSettingsUpdate={onSettingsUpdate} />
            )}
            
          </div>
        )}
        </main>
      </div>

      {/* A4 Job Poster Generator Overlay */}
      <A4PosterModal
        isOpen={isPosterModalOpen}
        onClose={() => {
          setIsPosterModalOpen(false);
          setSelectedVacancyForPoster(null);
        }}
        vacancy={selectedVacancyForPoster}
      />
    </div>
  );
}
