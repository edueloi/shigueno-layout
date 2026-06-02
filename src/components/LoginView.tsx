import React from 'react';
import { ShieldAlert, User, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
      setErrorMsg('Erro de conexão com o servidor de Tatuí. Verifique a rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in flex justify-center items-center font-sans">
      
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden flex flex-col">
        
        {/* Editorial Top header bar */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white p-8 text-center relative border-b-4 border-amber-500">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase font-mono bg-emerald-800/80 px-2.5 py-1 rounded border border-emerald-700">
              Ambiente Restrito
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-3">Portal do Gestor</h2>
            <p className="text-xs text-emerald-250 leading-relaxed max-w-xs mx-auto">
              Acesse o sistema interno para gerenciar vagas, currículos, relatórios e fornecedores de gado em Mato Grosso.
            </p>
          </div>
        </div>

        {/* Content Form Body */}
        <div className="p-8 space-y-6">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs font-semibold leading-relaxed flex items-center space-x-2 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Usuário de Acesso</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: shigueno"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-emerald-800"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Senha Corporativa</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Key className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua senha de acesso..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold focus:outline-emerald-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md hover:shadow transition-all flex items-center justify-center space-x-2 relative cursor-pointer"
            >
              <span>{loading ? 'Validando Acesso...' : 'Acessar Canal Administrativo'}</span>
              {!loading && <ArrowRight className="w-4 h-4 text-amber-400" />}
            </button>

          </form>

          {/* Credentials helper inside sandbox */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 text-slate-900 font-sans">
            <p className="text-xs font-extrabold flex items-center text-amber-850">
              ℹ Senha do Sistema para Homologação:
            </p>
            <div className="text-[11px] font-mono leading-relaxed text-slate-700 pt-1">
              <p>• <strong>Usuário:</strong> <code className="bg-white px-1.5 py-0.5 border rounded">shigueno</code></p>
              <p>• <strong>Senha:</strong> <code className="bg-white px-1.5 py-0.5 border rounded">shigueno2026</code></p>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
              * Utilize os dados acima para examinar os painéis de relatórios em tempo real de ovos, gado, citros, fornecedores do MT e RH.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-slate-500 hover:text-emerald-800 font-bold transition-colors"
            >
              ← Voltar para o Site Institucional
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
