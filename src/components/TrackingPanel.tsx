import React from 'react';
import {
  Truck, MapPin, Navigation, Activity, Fuel, Zap, Clock,
  Plus, Trash2, Play, Pause, ChevronRight, Radio, AlertTriangle,
  CheckCircle2, Package, User, Gauge, RotateCw, X, Flag,
  TrendingUp, Route, ArrowRight, Signal
} from 'lucide-react';

// ── Preset coordinates ────────────────────────────────────────────────────────
const COORDS: Record<string, { lat: number; lng: number; label: string; region: 'mt' | 'sp' }> = {
  'Tatuí (Granja)':                  { lat: -23.3556, lng: -47.8556, label: 'Tatuí - SP', region: 'sp' },
  'Tatuí (Sede)':                    { lat: -23.3600, lng: -47.8600, label: 'Tatuí - SP', region: 'sp' },
  'Tatuí (Fazenda Nova Aliança)':    { lat: -23.3700, lng: -47.9000, label: 'Tatuí - SP', region: 'sp' },
  'Sorocaba (Distribuição)':         { lat: -23.5015, lng: -47.4522, label: 'Sorocaba - SP', region: 'sp' },
  'São Paulo (Mercado Municipal)':   { lat: -23.5489, lng: -46.6388, label: 'São Paulo - SP', region: 'sp' },
  'Mogi das Cruzes (Avicultura)':   { lat: -23.5222, lng: -46.1889, label: 'Mogi das Cruzes', region: 'sp' },
  'Buri - SP (Citros)':              { lat: -23.7975, lng: -48.5133, label: 'Buri - SP', region: 'sp' },
  'Itaí - SP (Café)':                { lat: -23.4167, lng: -49.0167, label: 'Itaí - SP', region: 'sp' },
  'Santo Antônio do Leverger (MT)': { lat: -15.8656, lng: -56.0781, label: 'Leverger - MT', region: 'mt' },
  'Santo Antônio do Leverger':       { lat: -15.8656, lng: -56.0781, label: 'Leverger - MT', region: 'mt' },
};

const VEHICLE_TYPES = [
  'Caminhão Baú (Ovos)',
  'Caminhão Refrigerado (Ovos Premium)',
  'Semirreboque Gaiola (Gado)',
  'Caminhão Boiadeiro (Nelore)',
  'Truck Carroceria (Citros)',
  'Caminhão Graneleiro (Café)',
];

// ── Map bounds ────────────────────────────────────────────────────────────────
const MAP = { minLat: -25.5, maxLat: -13.5, minLng: -58.5, maxLng: -44.5 };
const toX = (lng: number, w: number) => ((lng - MAP.minLng) / (MAP.maxLng - MAP.minLng)) * w;
const toY = (lat: number, h: number) => ((lat - MAP.minLat) / (MAP.maxLat - MAP.minLat)) * h;

// ── Status helpers ────────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === 'Ativa') return { bg: 'bg-emerald-500', text: 'text-emerald-600', ring: '#10b981' };
  if (s === 'Concluída') return { bg: 'bg-blue-500', text: 'text-blue-600', ring: '#3b82f6' };
  return { bg: 'bg-slate-400', text: 'text-slate-500', ring: '#94a3b8' };
}

function fuelColor(f: number) {
  if (f > 50) return 'bg-emerald-500';
  if (f > 20) return 'bg-amber-400';
  return 'bg-red-500';
}

function formatDuration(started: string) {
  const diff = Date.now() - new Date(started).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  routes: any[];
  selectedRouteId: number | null;
  simulationActive: boolean;
  setSelectedRouteId: (id: number | null) => void;
  setSimulationActive: (v: boolean) => void;
  onCreateRoute: (e: React.FormEvent, data: any) => void;
  onDeleteRoute: (id: number) => void;
  onTriggerProgress: (id: number, add?: number) => void;
  onManualEvent: (e: React.FormEvent, text: string) => void;
}

export default function TrackingPanel({
  routes, selectedRouteId, simulationActive,
  setSelectedRouteId, setSimulationActive,
  onCreateRoute, onDeleteRoute, onTriggerProgress, onManualEvent
}: Props) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [driverName, setDriverName] = React.useState('');
  const [vehiclePlate, setVehiclePlate] = React.useState('');
  const [vehicleType, setVehicleType] = React.useState(VEHICLE_TYPES[0]);
  const [startLoc, setStartLoc] = React.useState('Tatuí (Granja)');
  const [destLoc, setDestLoc] = React.useState('Santo Antônio do Leverger (MT)');
  const [cargoDesc, setCargoDesc] = React.useState('');
  const [eventText, setEventText] = React.useState('');
  const [mapSize, setMapSize] = React.useState({ w: 800, h: 500 });
  const mapRef = React.useRef<SVGSVGElement>(null);
  const [tick, setTick] = React.useState(0);

  // Atualiza dimensões do mapa
  React.useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setMapSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    if (mapRef.current) obs.observe(mapRef.current);
    return () => obs.disconnect();
  }, []);

  // Pulso a cada segundo para animações
  React.useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const selected = routes.find(r => r.id === selectedRouteId) || routes[0] || null;
  const activeRoutes = routes.filter(r => r.status === 'Ativa');
  const doneRoutes = routes.filter(r => r.status === 'Concluída');
  const { w, h } = mapSize;

  const handleCreate = (e: React.FormEvent) => {
    onCreateRoute(e, { driverName, vehiclePlate, vehicleType, startLoc, destLoc, cargoDesc });
    setFormOpen(false);
    setDriverName(''); setVehiclePlate(''); setCargoDesc('');
  };

  const handleEvent = (e: React.FormEvent) => {
    onManualEvent(e, eventText);
    setEventText('');
  };

  const history = (() => {
    if (!selected) return [];
    try {
      const h = typeof selected.coordinates_history === 'string'
        ? JSON.parse(selected.coordinates_history)
        : selected.coordinates_history;
      return Array.isArray(h) ? [...h].reverse() : [];
    } catch { return []; }
  })();

  return (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* ── Top status bar ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Frotas em Rota', value: activeRoutes.length, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Concluídas', value: doneRoutes.length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Total de Rotas', value: routes.length, icon: Route, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Simulação GPS', value: simulationActive ? 'Ativa' : 'Pausada', icon: Radio, color: simulationActive ? 'text-amber-600' : 'text-slate-400', bg: simulationActive ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.bg}`}>
            <s.icon className={`w-5 h-5 shrink-0 ${s.color}`} />
            <div>
              <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
              <p className={`text-lg font-black leading-none mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* LEFT: fleet list + controls */}
        <div className="xl:col-span-4 space-y-4">

          {/* Fleet list header */}
          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-extrabold text-slate-900">Frota Shigueno</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{routes.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimulationActive(!simulationActive)}
                  title={simulationActive ? 'Pausar simulação GPS' : 'Retomar simulação GPS'}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    simulationActive ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {simulationActive ? <><Radio className="w-3 h-3 animate-pulse" /> GPS Ligado</> : <><Pause className="w-3 h-3" /> GPS Off</>}
                </button>
                <button
                  onClick={() => setFormOpen(v => !v)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo
                </button>
              </div>
            </div>

            {/* New route form */}
            {formOpen && (
              <form onSubmit={handleCreate} className="p-4 bg-emerald-50/50 border-b border-emerald-100 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Novo Despacho</span>
                  <button type="button" onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Motorista *</label>
                    <input value={driverName} onChange={e => setDriverName(e.target.value)} required placeholder="Nome completo"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-emerald-600" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Placa *</label>
                    <input value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} required placeholder="ABC-1234"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-emerald-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tipo de Veículo</label>
                  <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-emerald-600">
                    {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Origem</label>
                    <select value={startLoc} onChange={e => setStartLoc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-emerald-600">
                      {Object.keys(COORDS).map(k => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Destino</label>
                    <select value={destLoc} onChange={e => setDestLoc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-emerald-600">
                      {Object.keys(COORDS).map(k => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Carga *</label>
                  <input value={cargoDesc} onChange={e => setCargoDesc(e.target.value)} required placeholder="Ex: 120 caixas Ovos Extra"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-emerald-600" />
                </div>
                <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                  <Navigation className="w-3.5 h-3.5" /> Iniciar Rastreamento
                </button>
              </form>
            )}

            {/* Route cards */}
            <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
              {routes.length === 0 ? (
                <div className="p-8 text-center">
                  <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">Nenhuma rota cadastrada</p>
                  <p className="text-xs text-slate-400 mt-1">Clique em "Novo" para despachar uma frota</p>
                </div>
              ) : (
                routes.map(route => {
                  const sc = statusColor(route.status);
                  const isSelected = selectedRouteId === route.id;
                  return (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`px-4 py-3.5 cursor-pointer transition-all hover:bg-slate-50 ${isSelected ? 'bg-emerald-50/60 border-l-2 border-emerald-600' : 'border-l-2 border-transparent'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${sc.bg} ${route.status === 'Ativa' ? 'animate-pulse' : ''}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 truncate">{route.driver_name}</p>
                            <p className="text-[10px] font-mono text-slate-500">{route.vehicle_plate}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${route.status === 'Ativa' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {route.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{route.start_location}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span className="truncate">{route.destination}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400 font-mono">{route.progress}% percorrido</span>
                          {route.status === 'Ativa' && <span className="text-emerald-600 font-bold">{route.speed} km/h</span>}
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${route.status === 'Ativa' ? 'bg-emerald-500' : 'bg-blue-400'}`}
                            style={{ width: `${route.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Telemetry card for selected route */}
          {selected && (
            <div className="bg-slate-900 rounded-2xl p-5 space-y-4 text-white shadow-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Telemetria</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.status === 'Ativa' ? 'bg-emerald-900 text-emerald-300 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                  {selected.status === 'Ativa' ? '● AO VIVO' : '● CONCLUÍDA'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Velocidade', value: `${selected.speed} km/h`, icon: Gauge, color: 'text-amber-400' },
                  { label: 'Combustível', value: `${selected.fuel_level}%`, icon: Fuel, color: selected.fuel_level > 30 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Progresso', value: `${selected.progress}%`, icon: TrendingUp, color: 'text-blue-400' },
                  { label: 'Em rota há', value: selected.started_at ? formatDuration(selected.started_at) : '—', icon: Clock, color: 'text-purple-400' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                      <span className="text-[10px] text-slate-400 font-semibold">{m.label}</span>
                    </div>
                    <p className={`text-base font-black ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Fuel bar */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Nível de Combustível</span>
                  <span>{selected.fuel_level}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${fuelColor(selected.fuel_level)}`}
                    style={{ width: `${selected.fuel_level}%` }} />
                </div>
              </div>

              {/* Last event */}
              <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Último Evento</p>
                <p className="text-xs text-slate-200 leading-relaxed">{selected.last_event || 'Aguardando sinal...'}</p>
              </div>

              {/* Controls */}
              {selected.status === 'Ativa' && (
                <div className="space-y-2 pt-2 border-t border-slate-700/60">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Controles do Simulador</p>
                  <div className="flex gap-2">
                    <button onClick={() => onTriggerProgress(selected.id, 10)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer">
                      <Zap className="w-3 h-3" /> +10% Avançar
                    </button>
                    <button onClick={() => onTriggerProgress(selected.id, 100 - selected.progress)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer">
                      <Flag className="w-3 h-3" /> Concluir
                    </button>
                  </div>
                  <form onSubmit={handleEvent} className="flex gap-2">
                    <input value={eventText} onChange={e => setEventText(e.target.value)}
                      placeholder="Reportar evento..."
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-emerald-500" />
                    <button type="submit" className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold cursor-pointer">
                      <Signal className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              <button onClick={() => onDeleteRoute(selected.id)}
                className="w-full flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 text-[11px] font-bold pt-1 cursor-pointer transition-colors">
                <Trash2 className="w-3 h-3" /> Remover rota do histórico
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: map + details */}
        <div className="xl:col-span-8 space-y-4">

          {/* Map */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            {/* Map header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Mapa de Rotas — Centro-Sul do Brasil</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                {selected && (
                  <span className="text-slate-400">
                    {Number(selected.current_lat).toFixed(4)}, {Number(selected.current_lng).toFixed(4)}
                  </span>
                )}
                {simulationActive && activeRoutes.length > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping inline-block" />
                    GPS ao vivo
                  </span>
                )}
              </div>
            </div>

            {/* SVG map */}
            <div className="relative" style={{ height: '420px' }}>
              <svg ref={mapRef} width="100%" height="100%" className="block" viewBox={`0 0 ${w || 800} ${h || 420}`} preserveAspectRatio="xMidYMid meet">
                {/* Grid */}
                <defs>
                  <pattern id="tgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                  <radialGradient id="glow-y" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="glow-g" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                  <filter id="blur4">
                    <feGaussianBlur stdDeviation="4" />
                  </filter>
                </defs>

                <rect width="100%" height="100%" fill="#0f172a" />
                <rect width="100%" height="100%" fill="url(#tgrid)" />

                {/* SP region glow */}
                {w > 0 && (
                  <ellipse
                    cx={toX(-47.8, w)} cy={toY(-23.4, h || 420)}
                    rx={w * 0.12} ry={(h || 420) * 0.12}
                    fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="4,4" opacity={0.25}
                  />
                )}
                {/* MT region glow */}
                {w > 0 && (
                  <ellipse
                    cx={toX(-56.1, w)} cy={toY(-15.9, h || 420)}
                    rx={w * 0.08} ry={(h || 420) * 0.08}
                    fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4,4" opacity={0.25}
                  />
                )}

                {/* Draw all routes */}
                {routes.map(route => {
                  const startC = COORDS[route.start_location];
                  const endC = COORDS[route.destination];
                  if (!startC || !endC || !w) return null;

                  const sx = toX(startC.lng, w), sy = toY(startC.lat, h || 420);
                  const ex = toX(endC.lng, w), ey = toY(endC.lat, h || 420);
                  const cx1 = sx + (ex - sx) * 0.4, cy1 = Math.min(sy, ey) - (h || 420) * 0.1;
                  const cx2 = sx + (ex - sx) * 0.6, cy2 = Math.min(sy, ey) - (h || 420) * 0.05;
                  const path = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ex} ${ey}`;

                  const curX = toX(route.current_lng, w);
                  const curY = toY(route.current_lat, h || 420);
                  const pct = (route.progress || 0) / 100;
                  const drvPath = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${sx + (ex - sx) * pct} ${sy + (ey - sy) * pct}`;
                  const isActive = route.status === 'Ativa';
                  const isSel = route.id === selectedRouteId;

                  return (
                    <g key={route.id} onClick={() => setSelectedRouteId(route.id)} style={{ cursor: 'pointer' }}>
                      {/* Full route path */}
                      <path d={path} fill="none" stroke={isSel ? '#10b981' : '#1e293b'} strokeWidth={isSel ? 1.5 : 1} strokeDasharray="6,4" opacity={0.5} />
                      {/* Driven path */}
                      <path d={drvPath} fill="none" stroke={isActive ? '#34d399' : '#60a5fa'} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
                      {/* Vehicle dot */}
                      {isActive && (
                        <>
                          <circle cx={curX} cy={curY} r={16} fill="url(#glow-y)" filter="url(#blur4)" opacity={tick % 2 === 0 ? 0.6 : 0.3} />
                          <circle cx={curX} cy={curY} r={5} fill="#fbbf24" stroke="#fff" strokeWidth={1.5} />
                          <circle cx={curX} cy={curY} r={9} fill="none" stroke="#fbbf24" strokeWidth={1} opacity={tick % 2 === 0 ? 0.8 : 0.2} />
                        </>
                      )}
                      {!isActive && (
                        <circle cx={curX} cy={curY} r={4} fill="#60a5fa" stroke="#fff" strokeWidth={1.5} />
                      )}
                    </g>
                  );
                })}

                {/* City nodes */}
                {w > 0 && Object.entries(COORDS).filter(([k]) => !k.endsWith(')') || k.includes('(Granja)') || k.includes('(Sede)') || k.includes('(MT)') || k.includes('(Citros)') || k.includes('(Café)') || k.includes('(Distribuição)') || k.includes('(Mercado')).slice(0, 8).map(([key, c]) => {
                  const cx = toX(c.lng, w), cy = toY(c.lat, h || 420);
                  const isRoutePoint = routes.some(r => r.start_location === key || r.destination === key);
                  return (
                    <g key={key}>
                      <circle cx={cx} cy={cy} r={isRoutePoint ? 5 : 3} fill={c.region === 'mt' ? '#f59e0b' : '#10b981'} stroke="#0f172a" strokeWidth={1.5} opacity={0.9} />
                      <text x={cx + 7} y={cy + 4} fontSize={9} fill="#94a3b8" fontFamily="monospace" fontWeight="bold">{c.label}</text>
                    </g>
                  );
                })}
              </svg>

              {/* Map legend */}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-slate-700/60 flex flex-col gap-1.5">
                {[
                  { color: 'bg-amber-400', label: 'Veículo em rota' },
                  { color: 'bg-emerald-400', label: 'Caminho percorrido' },
                  { color: 'bg-blue-400', label: 'Rota concluída' },
                  { color: 'bg-amber-500', label: 'Ponto MT' },
                  { color: 'bg-emerald-500', label: 'Ponto SP' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                    <span className="text-[10px] text-slate-300 font-medium">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Route details + history */}
          {selected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Route info */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Detalhes da Rota #{selected.id}</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    { label: 'Motorista', value: selected.driver_name, icon: User },
                    { label: 'Veículo', value: `${selected.vehicle_plate} · ${selected.vehicle_type}`, icon: Truck },
                    { label: 'Carga', value: selected.cargo_description, icon: Package },
                    { label: 'Origem', value: selected.start_location, icon: MapPin },
                    { label: 'Destino', value: selected.destination, icon: Flag },
                    { label: 'Saída', value: selected.started_at ? new Date(selected.started_at).toLocaleString('pt-BR') : '—', icon: Clock },
                    ...(selected.completed_at ? [{ label: 'Chegada', value: new Date(selected.completed_at).toLocaleString('pt-BR'), icon: CheckCircle2 }] : []),
                  ].map(d => (
                    <div key={d.label} className="flex items-start gap-2">
                      <d.icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{d.label}</span>
                        <span className="text-slate-800 font-semibold">{d.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPS History */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                  <RotateCw className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Log GPS</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{history.length} pings</span>
                </div>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Nenhum sinal registrado ainda</p>
                  ) : history.map((log: any, i: number) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center mt-0.5">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-amber-400' : 'bg-slate-300'}`} />
                        {i < history.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                      </div>
                      <div className="pb-2 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-700 truncate">{log.event || 'Ping de telemetria'}</p>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.time?.substring(11, 16) || '—'}</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {Number(log.lat).toFixed(4)}, {Number(log.lng).toFixed(4)} · {log.speed || 0} km/h
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
