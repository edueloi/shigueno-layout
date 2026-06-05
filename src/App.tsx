import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import SobreView from './components/SobreView';
import ProdutosView from './components/ProdutosView';
import VagasView from './components/VagasView';
import ContatoView from './components/ContatoView';
import LoginView from './components/LoginView';
import AdminPanel from './components/AdminPanel';
import BlogView from './components/BlogView';
import ChatbotWidget from './components/ChatbotWidget';
import { SiteSettings } from './types';

// ── URL ↔ view mapping ────────────────────────────────────────────────────────
const ROUTE_MAP: Record<string, string> = {
  '/':          'home',
  '/sobre':     'sobre',
  '/producao':  'produtos',
  '/blog':      'blog',
  '/vagas':     'vagas',
  '/contato':   'contato',
  '/portal':    'login',
  '/admin':     'admin',
};
const VIEW_TO_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([k, v]) => [v, k])
);

function pathToView(path: string): string {
  const clean = path.length > 1 ? path.replace(/\/$/, '') : path;
  // /admin with any hash → admin view
  if (clean === '/admin' || clean.startsWith('/admin#')) return 'admin';
  return ROUTE_MAP[clean] || 'home';
}

export default function App() {
  const [currentView, setCurrentView] = React.useState<string>(() => pathToView(window.location.pathname));

  // Inicializa sessão de forma síncrona para evitar flash da tela de login no refresh
  const [user, setUser] = React.useState<any>(() => {
    try {
      const saved = localStorage.getItem('shigueno_user');
      const token = localStorage.getItem('shigueno_token');
      if (saved && token) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  });
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => {
    return !!(localStorage.getItem('shigueno_user') && localStorage.getItem('shigueno_token'));
  });

  const [siteSettings, setSiteSettings] = React.useState<Record<string, string>>({});
  const [activeProductTab, setActiveProductTab] = React.useState<'avicultura' | 'citricultura' | 'cafeicultura' | 'agropecuaria'>('avicultura');
  const [showSplash, setShowSplash] = React.useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = React.useState<boolean>(false);

  // Carrega settings na montagem (sessão já foi restaurada síncronamente acima)
  React.useEffect(() => {
    fetchSettings();
  }, []);

  // Sync URL → view on browser back/forward
  React.useEffect(() => {
    const onPop = () => {
      setCurrentView(pathToView(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'instant' as any });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Update document title per route
  React.useEffect(() => {
    const titles: Record<string, string> = {
      home:     'Grupo Shigueno — Qualidade de Vida desde 1932',
      sobre:    'Sobre Nós | Grupo Shigueno',
      produtos: 'Nossa Produção | Grupo Shigueno',
      blog:     'Blog | Grupo Shigueno',
      vagas:    'Trabalhe Conosco | Grupo Shigueno',
      contato:  'Contatos | Grupo Shigueno',
      login:    'Portal do Gestor | Grupo Shigueno',
      admin:    'Painel Administrativo | Grupo Shigueno',
    };
    document.title = titles[currentView] || 'Grupo Shigueno';
  }, [currentView]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      if (data.success) setSiteSettings(data.config || {});
    } catch (e) {
      console.error('Falha ao carregar configurações:', e);
    }
  };

  const handleLoginSuccess = (userData: any, token: string) => {
    localStorage.setItem('shigueno_user', JSON.stringify(userData));
    localStorage.setItem('shigueno_token', token);
    setShowSplash(true);
    setIsFadingOut(false);
    setTimeout(() => setIsFadingOut(true), 1900);
    setTimeout(() => {
      setShowSplash(false);
      setUser(userData);
      setIsLoggedIn(true);
      navigateTo('admin');
    }, 2350);
  };

  const handleLogout = () => {
    localStorage.removeItem('shigueno_user');
    localStorage.removeItem('shigueno_token');
    setUser(null);
    setIsLoggedIn(false);
    navigateTo('home');
  };

  const navigateTo = (viewKey: string, tab?: any) => {
    if (viewKey === 'produtos' && tab) setActiveProductTab(tab);
    const path = VIEW_TO_PATH[viewKey] || '/';
    // pushState com URL completa sem hash — limpa qualquer #hash do admin
    const fullPath = window.location.origin + path;
    window.history.pushState({ view: viewKey }, '', fullPath);
    setCurrentView(viewKey);
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  };

  const handleNavigation = navigateTo;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 font-sans selection:bg-emerald-200">
      
      {/* Spectacular Splash Entry Loader */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-[#022c1e] to-[#041a12] transition-all duration-500 ease-in-out ${
            isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Subtle light glowing core */}
          <div className="absolute w-[450px] h-[450px] bg-emerald-550/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow"></div>
          
          <div className="relative flex flex-col items-center z-10">
            {/* Ambient gold/emerald background rings */}
            <div className="absolute w-56 h-56 border border-dashed border-emerald-500/20 rounded-full animate-spin-slow"></div>
            <div className="absolute w-64 h-64 border border-dashed border-amber-500/15 rounded-full animate-pulse-glow"></div>
            
            {/* Logo Shigueno */}
            <div className="relative w-32 h-32 flex items-center justify-center animate-bounce-soft drop-shadow-[0_0_30px_rgba(4,120,87,0.4)]">
              <img src="/images/shigueno-logo.png" alt="Shigueno" className="w-full h-full object-contain" />
            </div>

            {/* Typography pair */}
            <div className="text-center mt-8 space-y-1.5">
              <span className="text-3xl font-sans font-black tracking-[0.25em] text-amber-400 uppercase block leading-none drop-shadow">
                Shigueno
              </span>
              <span className="text-[11px] font-mono text-emerald-300 tracking-[0.3em] font-extrabold block uppercase mt-1">
                Portal Administrativo
              </span>
            </div>

            {/* Glowing dynamic infinite action loading bar */}
            <div className="w-44 h-1.5 bg-emerald-950 rounded-full mt-8 overflow-hidden relative border border-emerald-800/30">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-400 rounded-full animate-infinite-loading w-20"></div>
            </div>

            {/* Little sub-text badge */}
            <p className="text-[11px] font-mono text-emerald-400/80 font-bold tracking-widest mt-4 uppercase animate-pulse">
              Homologando Acesso Seguro...
            </p>
          </div>
        </div>
      )}

      {/* Central Header Navigation - Hidden in Admin Panel and Login */}
      {currentView !== 'admin' && currentView !== 'login' && (
        <Header 
          currentView={currentView} 
          onNavigate={handleNavigation} 
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          siteSettings={siteSettings}
        />
      )}

      <main className="flex-grow">
        {currentView === 'home' && (
          <HomeView onNavigate={handleNavigation} siteSettings={siteSettings} />
        )}
        {currentView === 'sobre' && (
          <SobreView siteSettings={siteSettings} />
        )}
        {currentView === 'produtos' && (
          <ProdutosView activeTab={activeProductTab} onTabChange={setActiveProductTab} siteSettings={siteSettings} />
        )}
        {currentView === 'blog' && (
          <BlogView />
        )}
        {currentView === 'vagas' && (
          <VagasView onNavigate={handleNavigation} />
        )}
        {currentView === 'contato' && (
          <ContatoView siteSettings={siteSettings} />
        )}
        {currentView === 'login' && (
          <LoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigation} />
        )}
        {currentView === 'admin' && (
          isLoggedIn ? (
            <AdminPanel onLogout={handleLogout} onNavigate={handleNavigation} onSettingsUpdate={fetchSettings} user={user} token={localStorage.getItem('shigueno_token') || ''} />
          ) : (
            <LoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigation} />
          )
        )}
      </main>

      {/* Central Footer copyright and coordinates */}
      {currentView !== 'admin' && currentView !== 'login' && (
        <Footer onNavigate={handleNavigation} siteSettings={siteSettings} />
      )}

      {/* Floating ShiguenoBot Chatbot Widget & WhatsApp Autoatendimento — oculto no painel admin */}
      {currentView !== 'admin' && currentView !== 'login' && (
        <ChatbotWidget siteSettings={siteSettings} />
      )}
    </div>
  );
}
