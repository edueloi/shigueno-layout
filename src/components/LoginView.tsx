import React from 'react';
import { ShieldAlert, User, Key, ArrowRight, Eye, EyeOff, Facebook, Linkedin, Instagram } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigate: (view: string) => void;
}

export default function LoginView({ onLoginSuccess, onNavigate }: LoginViewProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Preencha os dados de usuário e senha corporativa.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        onLoginSuccess(data.user, data.token);
      } else {
        setErrorMsg(data.message || 'Usuário ou senha incorretos.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão com o servidor. Verifique a rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(135deg, #03200f 0%, #064e3b 50%, #03200f 100%)' }}>

      {/* Dot pattern overlay */}
      <div className="fixed inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">

        {/* Logo + brand */}
        <div className="flex flex-col items-center mb-8 space-y-3">
          <img
            src="/images/shigueno-logo.png"
            alt="Grupo Shigueno"
            className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]"
          />
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-[0.2em] text-amber-400 uppercase leading-none">Shigueno</h1>
            <p className="text-[11px] text-emerald-300 font-mono tracking-[0.25em] uppercase mt-1">Qualidade de Vida</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Card header */}
          <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 px-8 pt-8 pb-6 text-center border-b-4 border-amber-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase font-mono bg-emerald-800/80 px-2.5 py-1 rounded border border-emerald-700/60">
                Ambiente Restrito
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight mt-3">Portal do Gestor</h2>
              <p className="text-xs text-emerald-300 leading-relaxed mt-1.5 max-w-xs mx-auto">
                Acesse o sistema interno para gerenciar vagas, currículos e relatórios.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-7 space-y-5">

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Usuário de Acesso</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: shigueno"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Senha Corporativa</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite sua senha..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-70 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Validando Acesso...' : 'Acessar Canal Administrativo'}</span>
                {!loading && <ArrowRight className="w-4 h-4 text-amber-400" />}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                onClick={() => onNavigate('home')}
                className="text-xs text-slate-400 hover:text-emerald-800 font-semibold transition-colors"
              >
                ← Voltar para o Site Institucional
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Footer mínimo */}
      <footer className="relative z-10 border-t border-emerald-900/60 py-6 px-6">
        <div className="max-w-sm mx-auto flex flex-col items-center gap-4">

          {/* Logo + nome */}
          <div className="flex items-center gap-2.5">
            <img src="/images/shigueno-logo.png" alt="Shigueno" className="w-7 h-7 object-contain" />
            <span className="text-sm font-extrabold text-white tracking-widest uppercase">Shigueno</span>
          </div>

          {/* Redes sociais */}
          <div className="flex gap-3">
            {[
              { href: 'https://www.facebook.com/shiguenotatui/', Icon: Facebook, label: 'Facebook' },
              { href: 'https://www.linkedin.com/company/grupo-shigueno', Icon: Linkedin, label: 'LinkedIn' },
              { href: 'https://www.instagram.com/fazshigueno/', Icon: Instagram, label: 'Instagram' },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-amber-500 hover:text-emerald-950 flex items-center justify-center text-emerald-200 transition-all border border-emerald-800/60"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-emerald-400/70 font-mono text-center">
            © Grupo Shigueno. Todos os direitos reservados. Desde 1932 fomentando o agro sustentável.
          </p>
        </div>
      </footer>

    </div>
  );
}
