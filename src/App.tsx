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

export default function App() {
  const [currentView, setCurrentView] = React.useState<string>('home');
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<any>(null);
  const [siteSettings, setSiteSettings] = React.useState<Record<string, string>>({});
  const [activeProductTab, setActiveProductTab] = React.useState<'avicultura' | 'citricultura' | 'cafeicultura' | 'agropecuaria'>('avicultura');
  const [showSplash, setShowSplash] = React.useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = React.useState<boolean>(false);

  // Verify persistent admin session of Shigueno local storage on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('shigueno_user');
    const savedToken = localStorage.getItem('shigueno_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      if (data.success) {
        setSiteSettings(data.config || {});
      }
    } catch (e) {
      console.error('Falha ao carregar configurações da página do SQLite:', e);
    }
  };

  const handleLoginSuccess = (userData: any, token: string) => {
    localStorage.setItem('shigueno_user', JSON.stringify(userData));
    localStorage.setItem('shigueno_token', token);
    
    // Trigger spectacular dark-emerald secure portal loading transition
    setShowSplash(true);
    setIsFadingOut(false);
    
    setTimeout(() => {
      setIsFadingOut(true);
    }, 1900);
    
    setTimeout(() => {
      setShowSplash(false);
      setUser(userData);
      setIsLoggedIn(true);
      setCurrentView('admin'); // Gently transition to admin dashboard
    }, 2350);
  };

  const handleLogout = () => {
    localStorage.removeItem('shigueno_user');
    localStorage.removeItem('shigueno_token');
    setUser(null);
    setIsLoggedIn(false);
    setCurrentView('home');
  };

  const handleNavigation = (viewKey: string, tab?: any) => {
    if (viewKey === 'produtos' && tab) {
      setActiveProductTab(tab);
    }
    setCurrentView(viewKey);
    // Smooth scroll to top of view on tab switch
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  };

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
            
            {/* Visual Emblem Representation of Shigueno (Scaled Up & Animated) */}
            <div className="relative w-32 h-32 bg-emerald-850 rounded-b-3xl rounded-t-xl border-4 border-amber-550 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(4,120,87,0.3)] overflow-hidden animate-bounce-soft">
              {/* Oranges & Eggs pure CSS simulation */}
              <div className="flex space-x-1.5 justify-center mt-3 scale-110">
                <span className="w-8 h-8 rounded-full bg-amber-550 block relative shadow">
                  <span className="absolute -top-1 right-2 w-3 h-2 bg-green-600 rounded-full rotate-45"></span>
                </span>
                <span className="w-8 h-8 rounded-full bg-amber-550 block relative shadow">
                  <span className="absolute -top-1 right-2 w-3 h-2 bg-green-600 rounded-full rotate-45"></span>
                </span>
              </div>
              {/* White Eggs */}
              <div className="flex space-x-1 justify-center -mt-2.5 z-10 scale-110">
                <span className="w-4.5 h-6.5 bg-white rounded-full block shadow-xs border border-gray-100"></span>
                <span className="w-4.5 h-6.5 bg-white rounded-full block shadow-xs border border-gray-100"></span>
                <span className="w-4.5 h-6.5 bg-white rounded-full block shadow-xs border border-gray-100"></span>
              </div>
              <span className="text-[10px] font-mono font-black tracking-widest text-emerald-100 mt-2 uppercase">1932</span>
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

      {/* Central Header Navigation - Hidden in Admin Panel layout */}
      {currentView !== 'admin' && (
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
            <AdminPanel onLogout={handleLogout} onNavigate={handleNavigation} onSettingsUpdate={fetchSettings} />
          ) : (
            <LoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigation} />
          )
        )}
      </main>

      {/* Central Footer copyright and coordinates */}
      {currentView !== 'admin' && (
        <Footer onNavigate={handleNavigation} siteSettings={siteSettings} />
      )}

      {/* Floating ShiguenoBot Chatbot Widget & WhatsApp Autoatendimento */}
      <ChatbotWidget siteSettings={siteSettings} />
    </div>
  );
}
