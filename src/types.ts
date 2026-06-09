export interface Vacancy {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  requirements: string;
  status: string; // 'Ativa', 'Pausada'
}

export interface Supplier {
  id: number;
  name: string;
  city: string;
  phone: string;
  cattle_count: number;
  cattle_breed: string;
  status: string; // 'Ativo', 'Em Negociação', 'Inativo'
  last_delivery: string;
}

export interface SiteSettings {
  company_motto: string;
  about_text_intro: string;
  about_text_full: string;
  about_diversification: string;
  contact_email: string;
  contact_phone: string;
}

export interface TrackingRoute {
  id: number;
  driver_name: string;
  vehicle_plate: string;
  vehicle_type: string; // 'Caminhão Baú', 'Gaiola Boiadeiro', 'Fiorino Térmica'
  start_location: string;
  destination: string;
  status: 'Ativa' | 'Concluída';
  started_at: string;
  completed_at: string | null;
  current_lat: number;
  current_lng: number;
  progress: number; // 0 to 100
  speed: number; // km/h
  fuel_level: number; // %
  cargo_description: string;
  last_event: string;
  coordinates_history: Array<{ lat: number; lng: number; time: string; speed: number; event?: string }>;
}

export interface DashboardStats {
  totalVacancies: number;
  totalCandidates: number;
  totalSuppliers: number;
  totalCattleHead: number;
  totalActivities?: number;
  doneActivities?: number;
  cityDistribution: Array<{ city: string; value: number; supplier_count: number }>;
  candidatesByVacancy: Array<{ label: string; value: number }>;
  candidatesByStatus?: Array<{ label: string; value: number }>;
  recentCandidates?: Array<{ id: number; name: string; email: string; status: string; applied_at: string; vacancy_title?: string }>;
  productionStats: Array<{ month: string; year?: number; ovos: number; citros: number; cafe: number; nelore?: number }>;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  vacancy_id: number | null;
  vacancy_title?: string;
  cv_text: string;
  cv_filename?: string;
  applied_at: string;
  status: string;
  ai_analysis?: any;
}
