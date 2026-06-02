import React from 'react';
import { Menu, X, User, Heart, Leaf, Home, Info, Briefcase, Mail, LogOut, LayoutDashboard, ChevronRight, Newspaper, Facebook, Linkedin, Instagram } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  siteSettings?: Record<string, string>;
}

export default function Header({ currentView, onNavigate, isLoggedIn, onLogout, siteSettings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();

  const showBlog = siteSettings?.show_blog_on_menu !== 'false';

  const navItems = [
    { key: 'home', label: t('nav.home'), icon: Home, desc: 'Página inicial e pilares' },
    { key: 'sobre', label: t('nav.about'), icon: Info, desc: 'História, legado e pioneirismo' },
    { key: 'produtos', label: t('nav.production'), icon: Leaf, desc: 'Avicultura, Citros, Café e Nelore' },
    ...(showBlog ? [{ key: 'blog', label: t('nav.blog'), icon: Newspaper, desc: 'Artigos, notícias e novidades' }] : []),
    { key: 'vagas', label: t('nav.careers'), icon: Briefcase, desc: 'Candidate-se e faça história' },
    { key: 'contato', label: t('nav.contact'), icon: Mail, desc: 'Canais de atendimento, SAC' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      {/* Top Utility Bar with Social Media and Language flags */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-5">
          {/* Left: Social Media Networks */}
          <div className="flex items-center space-x-3 text-slate-400">
            <a href="https://www.facebook.com/shiguenotatui/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors" title="Facebook">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.linkedin.com/company/grupo-shigueno" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors" title="LinkedIn">
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.instagram.com/fazshigueno/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors" title="Instagram">
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right: Flag Icons language selectors */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2">
              {/* Portuguese (Brazil flag SVG) */}
              <button 
                onClick={() => setLanguage('pt')} 
                className={`flex items-center space-x-1.5 px-2 py-1 rounded transition-all ${language === 'pt' ? 'bg-emerald-850 text-amber-400 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}
                title="Português"
              >
                <svg viewBox="0 0 24 16" className="w-4.5 h-3 rounded-xs shrink-0 shadow-xs border border-white/10" aria-hidden="true">
                  <rect width="24" height="16" fill="#009B3A" />
                  <polygon points="12,2 2,8 12,14 22,8" fill="#FEDF00" />
                  <circle cx="12" cy="8" r="3.5" fill="#002776" />
                  <path d="M 8.5 8.5 Q 12 7.2 15.5 8.5 Q 12 7.7 8.5 8.5" fill="#FFFFFF" />
                </svg>
                <span className="text-[9px] font-mono font-extrabold tracking-wider">PT</span>
              </button>

              <span className="text-slate-800">|</span>

              {/* English (USA flag SVG) */}
              <button 
                onClick={() => setLanguage('en')} 
                className={`flex items-center space-x-1.5 px-2 py-1 rounded transition-all ${language === 'en' ? 'bg-emerald-850 text-amber-400 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}
                title="English"
              >
                <svg viewBox="0 0 24 16" className="w-4.5 h-3 rounded-xs shrink-0 shadow-xs border border-white/10" aria-hidden="true">
                  <rect width="24" height="16" fill="#B22234" />
                  <path d="M0,1.23H24M0,3.69H24M0,6.15H24M0,8.61H24M0,11.07H24M0,13.53H24" stroke="#FFFFFF" strokeWidth="1.23" />
                  <rect width="10" height="8.61" fill="#3C3B6E" />
                  <path d="M2,2h.1 M5,2h.1 M8,2h.1 M3.5,4h.1 M6.5,4h.1 M2,6h.1 M5,6h.1 M8,6h.1" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
                <span className="text-[9px] font-mono font-extrabold tracking-wider">EN</span>
              </button>

              <span className="text-slate-800">|</span>

              {/* Spanish (Spain flag SVG) */}
              <button 
                onClick={() => setLanguage('es')} 
                className={`flex items-center space-x-1.5 px-2 py-1 rounded transition-all ${language === 'es' ? 'bg-emerald-850 text-amber-400 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}
                title="Español"
              >
                <svg viewBox="0 0 24 16" className="w-4.5 h-3 rounded-xs shrink-0 shadow-xs border border-white/10" aria-hidden="true">
                  <rect width="24" height="16" fill="#C60B1E" />
                  <rect width="24" height="8" y="4" fill="#FFC400" />
                  <circle cx="6" cy="8" r="1.8" fill="#C60B1E" />
                  <circle cx="6" cy="8" r="1.2" fill="#FFC400" />
                </svg>
                <span className="text-[9px] font-mono font-extrabold tracking-wider">ES</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Custom Styled Shigueno Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center space-x-3 cursor-pointer select-none group"
            id="shigueno-logo-button"
          >
            {/* Visual Emblem Representation of Shigueno */}
            <div className="relative w-12 h-12 bg-emerald-800 rounded-b-2xl rounded-t-lg border-2 border-emerald-600 flex flex-col items-center justify-center shadow-md overflow-hidden group-hover:scale-105 transition-transform">
              {/* Oranges & Eggs pure CSS simulation */}
              <div className="flex space-x-0.5 justify-center mt-1">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 block relative">
                  <span className="absolute -top-0.5 right-1 w-1.5 h-1 bg-green-600 rounded-full rotate-45"></span>
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 block relative">
                  <span className="absolute -top-0.5 right-1 w-1.5 h-1 bg-green-600 rounded-full rotate-45"></span>
                </span>
              </div>
              {/* White Eggs */}
              <div className="flex space-x-0.5 justify-center -mt-1 z-10">
                <span className="w-2 h-3 bg-white rounded-full block shadow-xs border border-gray-150"></span>
                <span className="w-2 h-3 bg-white rounded-full block shadow-xs border border-gray-150"></span>
                <span className="w-2 h-3 bg-white rounded-full block shadow-xs border border-gray-150"></span>
              </div>
              <span className="text-[7px] font-mono font-bold tracking-widest text-[#f5f5f5] mt-1 uppercase">1932</span>
            </div>

            <div>
              <span className="text-xl font-sans font-extrabold tracking-tight text-emerald-900 group-hover:text-emerald-700 transition-colors uppercase block leading-none">
                Shigueno
              </span>
              <span className="text-[10px] font-mono text-emerald-600 tracking-wider font-semibold block mt-0.5">
                {t('site.slogan')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => (
              <button
                key={item.key}
                id={`nav-${item.key}`}
                onClick={() => {
                  onNavigate(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === item.key
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                {item.key === 'produtos' && <Leaf className="inline w-3.5 h-3.5 mr-1 text-emerald-600 align-text-bottom" />}
                {item.key === 'blog' && <Newspaper className="inline w-3.5 h-3.5 mr-1 text-emerald-600 align-text-bottom" />}
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Portal Action */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  id="header-admin-panel"
                  onClick={() => onNavigate('admin')}
                  className="px-4 py-2 border border-emerald-300 text-emerald-800 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  {t('nav.manager_panel')}
                </button>
                <button
                  id="header-logout"
                  onClick={onLogout}
                  className="px-3 py-2 text-slate-500 hover:text-red-650 text-sm font-medium transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button
                id="header-login"
                onClick={() => onNavigate('login')}
                className="flex items-center space-x-2 bg-emerald-750 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm hover:bg-emerald-850 hover:shadow transition-all"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.manager_portal')}</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-2">
            {isLoggedIn && (
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-md hover:bg-emerald-100 transition-colors"
              >
                Painel
              </button>
            )}
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-500 hover:text-emerald-800 focus:outline-none p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>

      {/* Beautiful Slide-Over Drawer Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop blur effect */}
          <div 
            className="fixed inset-0 bg-emerald-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar Area */}
          <div className="relative w-full max-w-[290px] bg-white h-screen flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            
            {/* Header portion */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-850 text-white font-black flex items-center justify-center text-xs shadow-xs">S</span>
                <span className="font-extrabold text-[#064e3b] text-base font-sans tracking-tight">SHIGUENO</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                title="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation options list */}
            <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3 mb-2 font-mono">Navegação Principal</p>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentView === item.key;
                return (
                  <button
                    key={item.key}
                    id={`nav-mobile-${item.key}`}
                    onClick={() => {
                      onNavigate(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 text-left ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs font-semibold translate-x-1' 
                        : 'text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mr-3 ${isActive ? 'bg-emerald-700 text-white' : 'bg-slate-150/60 text-emerald-850'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold leading-none">{item.label}</p>
                      <p className={`text-[10px] mt-1 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>{item.desc}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 opacity-70 cursor-pointer ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Bottom Section with User portal context */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="px-1 py-1 flex items-center space-x-2.5 mb-2">
                    <div className="w-7 h-7 rounded-sm bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      AD
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Autenticado como</p>
                      <p className="text-xs font-extrabold text-slate-800 leading-none">Gestor Shigueno</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{t('nav.manager_panel')}</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 border border-slate-250 text-slate-650 hover:bg-red-50 hover:text-red-700 py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              ) : (
                <button
                  id="mobile-login"
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white py-3 px-4 rounded-xl text-xs font-extrabold shadow-sm transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>{t('nav.manager_portal')}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
