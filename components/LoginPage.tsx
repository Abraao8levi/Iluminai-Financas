import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, Hexagon, KeyRound, Loader2, Lock, Mail, UserPlus } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
  onLogin: (authData: any) => void;
  onNavigateToSignUp: () => void;
}

const LoginPage: React.FC<Props> = ({ onLogin, onNavigateToSignUp }) => {
  const [view, setView] = useState<'LOGIN' | 'FORGOT'>('LOGIN');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password specific state
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Por favor, preencha email e senha.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha no login.');
      }

      onLogin(data); // Passa o token e os dados do usuário para o App.tsx
    } catch (error: any) {
      alert(`Erro no login: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl w-full max-w-md p-8 shadow-2xl relative z-10 animate-fadeIn">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-3 hover:rotate-6 transition-transform">
             <Hexagon className="w-8 h-8 text-white fill-white/20" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-1">
            Lúmina
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">INTELLIGENT FINANCE</p>
        </div>

        {view === 'LOGIN' ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Bem-vindo de volta</h2>
              <p className="text-slate-500 text-sm">Acesse seu painel financeiro inteligente</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">Senha</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email); // Pre-fill email if typed
                      setView('FORGOT');
                      setResetSent(false);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-12 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Entrar <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1e293b] px-2 text-slate-500">Ou entre com</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a href="http://localhost:5000/api/auth/google" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white py-2.5 rounded-xl transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" color="#4285F4"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" color="#34A853"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" color="#FBBC05"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" color="#EA4335"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </a>
              <a href="http://localhost:5000/api/auth/facebook" className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1864D9] text-white py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </a>
            </div>

            {/* Registration Area */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
               <button 
                  onClick={onNavigateToSignUp}
                  className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white text-indigo-400 font-bold py-3 rounded-xl transition-all border border-slate-700 hover:border-indigo-500/30 flex items-center justify-center gap-2 group"
                >
                  <UserPlus className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                  Criar Nova Conta
                </button>
            </div>
          </>
        ) : (
          /* Forgot Password View */
          <div className="animate-fadeIn">
             <button 
                onClick={() => setView('LOGIN')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para o login
              </button>

             <div className="text-center mb-6">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <KeyRound className="w-7 h-7 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Recuperar Senha</h2>
                <p className="text-slate-500 text-sm max-w-[280px] mx-auto mt-2">
                  Digite seu e-mail cadastrado e enviaremos um link para você redefinir sua senha.
                </p>
              </div>

              {!resetSent ? (
                <form onSubmit={handleSendResetLink} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">E-mail Cadastrado</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !resetEmail}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Enviar Link de Recuperação"
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center animate-fadeIn py-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-2 text-emerald-400 mb-6">
                    <CheckCircle className="w-8 h-8" />
                    <span className="font-bold">E-mail Enviado!</span>
                    <p className="text-xs text-emerald-400/80 mt-1">
                      Verifique sua caixa de entrada (e spam) para encontrar o link de redefinição.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setView('LOGIN')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Voltar para o Login
                  </button>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;