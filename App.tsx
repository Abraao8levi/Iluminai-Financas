
import clsx from 'clsx';
import { Bell, Calendar, Camera, Clock, Lightbulb, Loader2, Mail, Menu, RefreshCcw, ServerOff, Sparkles, Upload, User, Wallet, X, Zap } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AIAssistant from './components/AIAssistant';
import BankIntegrations from './components/BankIntegrations';
import FinancialCharts from './components/FinancialCharts';
import GoalsWidget from './components/GoalsWidget';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/Sidebar';
import SignUpPage from './components/SignUpPage';
import StatCard from './components/StatCard';
import TransactionList from './components/TransactionList';
import { generateMonthlyInsight } from './services/geminiService';
import { AppSettings, Category, Goal, Transaction, TransactionType, UserProfile, ViewState } from './types';

type AuthState = 'LOGIN' | 'SIGNUP' | 'AUTHENTICATED';
type AuthData = { token: string; user: UserProfile } | null;
type DashboardPeriod = 'ALL' | 'THIS_MONTH' | 'THIS_YEAR';

const App: React.FC = () => {
  // Auth State
  const [auth, setAuth] = useState<{ state: AuthState; data: AuthData }>({ state: 'LOGIN', data: null });

  // Backend connectivity state
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  // App State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiTip, setAiTip] = useState<string>("Carregando insight do dia...");
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriod>('THIS_MONTH');

  // --- PERSISTENCE LOGIC START ---

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Goals State
  const [goals, setGoals] = useState<Goal[]>(() => {
    // Mock inicial, será substituído pelos dados do backend
    return [];
  });

  useEffect(() => {
    localStorage.setItem('finanai_goals', JSON.stringify(goals));
  }, [goals]);

  // User Profile State with LocalStorage Persistence
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Usuário',
    email: 'email@exemplo.com',
    onlineSince: new Date(),
  });

  // ... (O resto da lógica de persistência local será removida ou adaptada)

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('finanai_settings');
    return saved ? JSON.parse(saved) : { currency: 'BRL', theme: 'dark', notifications: true };
  });

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);


  useEffect(() => {
    localStorage.setItem('finanai_settings', JSON.stringify(settings));
    // Apply theme (basic implementation)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // --- PERSISTENCE LOGIC END ---

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Transactions for Dashboard
  const dashboardTransactions = useMemo(() => {
    if (dashboardPeriod === 'ALL') return transactions;

    const now = new Date();
    return transactions.filter(t => {
      // Parse YYYY-MM-DD manually to avoid TZ issues
      const [y, m, d] = t.date.split('-').map(Number);
      const tDate = new Date(y, m - 1, d);

      if (dashboardPeriod === 'THIS_MONTH') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      if (dashboardPeriod === 'THIS_YEAR') {
        return tDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, dashboardPeriod]);

  // Calculate Summary Stats based on Filtered Data
  const totalIncome = dashboardTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = dashboardTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const periodBalance = totalIncome - totalExpense;
  
  // Total Asset Balance (Always All Time)
  const totalAssetBalance = transactions
    .filter(t => t.type === TransactionType.INCOME).reduce((a, c) => a + c.amount, 0) -
    transactions
    .filter(t => t.type === TransactionType.EXPENSE).reduce((a, c) => a + c.amount, 0);

  useEffect(() => {
    // Lida com o callback do login OAuth
    if (window.location.pathname === '/auth/callback') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        // Simula a chamada de onLogin com os dados do token
        // O ideal seria decodificar o token para pegar o user, mas vamos buscar na API
        const fetchUserAndLogin = async () => {
          const response = await fetch('http://localhost:5000/api/user/me', { headers: { 'Authorization': `Bearer ${token}` }});
          if (response.ok) {
            const user = await response.json();
            handleLogin({ token, user });
            window.history.replaceState({}, document.title, "/"); // Limpa a URL
          }
        };
        fetchUserAndLogin();
      }
    }
    // 1. Checar se o backend está online
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/');
        if (response.ok) {
          setIsBackendAvailable(true);
          console.log("✅ Backend is available.");
        }
      } catch (error) {
        setIsBackendAvailable(false);
        console.error("❌ Backend is not available.");
      } finally {
        setIsLoadingBackend(false);
      }
    };
    checkBackend();

    // 2. Se autenticado, buscar dados
    if (auth.state === 'AUTHENTICATED' && auth.data?.token) {
      const headers = {
        'Authorization': `Bearer ${auth.data.token}`,
        'Content-Type': 'application/json'
      };

      const fetchData = async (endpoint: string, setter: Function) => {
        try {
          const response = await fetch(`http://localhost:5000/api/${endpoint}`, { headers });
          const data = await response.json();
          if (response.ok) setter(data);
        } catch (error) {
          console.error(`Error fetching ${endpoint}:`, error);
        }
      };

      const fetchAllData = async () => {
        await Promise.all([
          fetchData('transactions', setTransactions),
          fetchData('goals', setGoals),
          fetchData('categories', setCategories),
          fetchData('user/me', (user: any) => setUserProfile({ ...user, onlineSince: new Date() }))
        ]);
      };

      fetchAllData();
    }
  }, [auth.state, auth.data?.token]);

  // Gerar dica da IA quando os dados mudarem
  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoadingTip(true);
      const tip = await generateMonthlyInsight(dashboardTransactions.length > 0 ? dashboardTransactions : transactions);
      setAiTip(tip);
      setIsLoadingTip(false);
    };
    if (auth.state === 'AUTHENTICATED') fetchInsight();
  }, [transactions, dashboardPeriod, auth.state]); // Re-run AI when period changes

  // Helper para chamadas à API
  const apiCall = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) => {
    if (!auth.data?.token) throw new Error("Usuário não autenticado.");
    
    const headers = {
      'Authorization': `Bearer ${auth.data.token}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
    }

    // DELETE não retorna corpo
    if (method === 'DELETE') return;

    return response.json();
  };

  const handleRemoveTransaction = async (id: string) => {
    try {
      await apiCall(`transactions/${id}`, 'DELETE');
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Erro ao remover transação:", error);
      alert("Não foi possível remover a transação.");
    }
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await apiCall('transactions', 'POST', transaction);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      alert("Não foi possível adicionar a transação.");
    }
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    try {
      // O backend espera _id, então removemos o 'id' do frontend
      const { id, ...dataToUpdate } = transaction;
      const updatedTransaction = await apiCall(`transactions/${id}`, 'PUT', dataToUpdate);
      setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)));
    } catch (error) {
      console.error("Erro ao editar transação:", error);
      alert("Não foi possível editar a transação.");
    }
  };

  const handleLogin = (authData: AuthData) => {
    if (authData) {
      setAuth({ state: 'AUTHENTICATED', data: authData });
      // Salvar token no localStorage para persistir o login entre reloads
      localStorage.setItem('auth_token', authData.token);
    }
  };

  const handleLogout = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAuth({ state: 'LOGIN', data: null });
    // Limpar dados
    setTransactions([]);
    setGoals([]);
    setCategories([]);
    setUserProfile({
      name: 'Usuário',
      email: 'email@exemplo.com',
      onlineSince: new Date(),
    });
    localStorage.removeItem('auth_token');
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Avatar = reader.result as string;
        try {
          const updatedUser = await apiCall('user/update', 'PUT', { avatar: base64Avatar });
          setUserProfile(prev => ({ ...prev, avatar: updatedUser.avatar }));
        } catch (error) {
          console.error("Erro ao atualizar avatar:", error);
          alert("Não foi possível atualizar o avatar.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (name: string) => {
    try {
      const updatedUser = await apiCall('user/update', 'PUT', { name });
      setUserProfile(prev => ({ ...prev, name: updatedUser.name }));
      // Opcional: mostrar um toast de sucesso
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Não foi possível atualizar o nome.");
    }
  };

  const handleImportTransactions = (newTransactions: Transaction[]) => {
    // Esta função pode ser expandida para fazer um POST em lote para a API
    console.log("Novas transações para importar:", newTransactions);
    // Por enquanto, apenas adiciona ao estado para visualização
    setTransactions(prev => [...newTransactions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await apiCall('categories', 'POST', category);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      alert("Não foi possível adicionar a categoria.");
    }
  };

  const handleRemoveCategory = async (id: string) => {
    try {
      await apiCall(`categories/${id}`, 'DELETE');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erro ao remover categoria:", error);
      alert("Não foi possível remover a categoria.");
    }
  };

  // Goal Handlers
  const handleAddGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const newGoal = await apiCall('goals', 'POST', goal);
      setGoals(prev => [...prev, newGoal]);
    } catch (error) {
      console.error("Erro ao adicionar meta:", error);
      alert("Não foi possível adicionar a meta.");
    }
  };
  
  const handleUpdateGoal = async (updatedGoal: Goal) => {
    try {
      const { id, ...dataToUpdate } = updatedGoal;
      const newGoal = await apiCall(`goals/${id}`, 'PUT', dataToUpdate);
      setGoals(prev => prev.map(g => (g.id === newGoal.id ? newGoal : g)));
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      alert("Não foi possível atualizar a meta.");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await apiCall(`goals/${id}`, 'DELETE');
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error("Erro ao deletar meta:", error);
      alert("Não foi possível deletar a meta.");
    }
  };

  // Auth Flow Rendering
  if (isLoadingBackend) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Conectando ao servidor Lúmina AI...</p>
      </div>
    );
  }

  if (!isBackendAvailable) {
     return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-4 text-center">
        <ServerOff className="w-12 h-12 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Servidor Indisponível</h1>
        <p className="text-slate-400 max-w-md">Não foi possível conectar ao backend. Por favor, verifique se o servidor está rodando (`npm run dev` na pasta `server`) e tente novamente.</p>
      </div>
    );
  }

  if (auth.state === 'LOGIN') {
    return (
      <LoginPage onLogin={handleLogin} onNavigateToSignUp={() => setAuth({ state: 'SIGNUP', data: null })} />
    );
  }

  if (auth.state === 'SIGNUP') {
    return (
      <SignUpPage onSignUp={() => setAuth({ state: 'LOGIN', data: null })} onNavigateToLogin={() => setAuth({ state: 'LOGIN', data: null })} />
    );
  }

  // Main App Rendering
  const renderContent = () => {
    switch (currentView) {
      case ViewState.SETTINGS:
        return (
          <SettingsPage 
            settings={settings}
            onUpdateSettings={setSettings}
            categories={categories}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            transactions={transactions}
          />
        );
      case ViewState.INTEGRATIONS:
        return (
          <div className="animate-fadeIn">
             <BankIntegrations onImportTransactions={handleImportTransactions} />
          </div>
        );
      case ViewState.ECONOMY_MODE:
        return (
          <div className="h-full flex flex-col animate-fadeIn">
             <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Modo Foco</h2>
                  <p className="text-slate-400 text-sm">Interação direta sem distrações visuais.</p>
                </div>
                <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20 flex items-center gap-2">
                   <Zap className="w-3 h-3" />
                   AI Active
                </div>
             </div>
             <div className="flex-1">
                <AIAssistant transactions={transactions} />
             </div>
          </div>
        );
      case ViewState.AI_INSIGHTS:
        return (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">Assistente Inteligente</h2>
            <AIAssistant transactions={transactions} />
          </div>
        );
      case ViewState.TRANSACTIONS:
        return (
          <div className="animate-fadeIn">
             <h2 className="text-2xl font-bold mb-6">Histórico de Transações</h2>
             <TransactionList 
              transactions={transactions} 
              categories={categories}
              onRemoveTransaction={handleRemoveTransaction}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
             />
          </div>
        );
      case ViewState.DASHBOARD:
      default:
        return (
          <div className="animate-fadeIn pb-10">
            {/* Dashboard Header with Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
                  <p className="text-slate-400 text-sm">Resumo da sua saúde financeira</p>
               </div>
               
               <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setDashboardPeriod('THIS_MONTH')}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      dashboardPeriod === 'THIS_MONTH' ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Este Mês
                  </button>
                  <button
                    onClick={() => setDashboardPeriod('THIS_YEAR')}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      dashboardPeriod === 'THIS_YEAR' ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Este Ano
                  </button>
                  <button
                    onClick={() => setDashboardPeriod('ALL')}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      dashboardPeriod === 'ALL' ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Tudo
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title={dashboardPeriod === 'ALL' ? "Saldo Total" : "Resultado do Período"}
                value={dashboardPeriod === 'ALL' ? totalAssetBalance : periodBalance}
                type={periodBalance >= 0 ? "positive" : "negative"}
                trend={12} // Mock trend
                icon={<Wallet className="w-16 h-16" />}
              />
              <StatCard 
                title="Entradas" 
                value={totalIncome} 
                type="positive"
                trend={5.4}
              />
              <StatCard 
                title="Saídas" 
                value={totalExpense} 
                type="negative"
                trend={-2.1}
              />
            </div>

            {/* AI Insight Professional Card */}
            <div className="mb-8 relative group overflow-hidden rounded-2xl border border-indigo-500/20 bg-surface/50 backdrop-blur-md transition-all hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10">
               {/* Decorative Background Glows */}
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity"></div>
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent opacity-50"></div>

               <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 relative z-10">
                  {/* Icon Column */}
                  <div className="shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full"></div>
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                         {isLoadingTip ? (
                           <RefreshCcw className="w-7 h-7 text-indigo-400 animate-spin" />
                         ) : (
                           <Sparkles className="w-7 h-7 text-indigo-400" />
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white flex items-center gap-3">
                        Análise Inteligente
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-bold uppercase tracking-wider shadow-sm">
                          Gemini AI
                        </span>
                      </h4>
                    </div>
                    
                    <div className={clsx("transition-opacity duration-500", isLoadingTip ? "opacity-50" : "opacity-100")}>
                      <div 
                        className="text-slate-300 text-sm leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-2 [&>strong]:text-indigo-200 [&>strong]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: aiTip.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
                      />
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span>Analisando dados: {dashboardPeriod === 'ALL' ? 'Todo o histórico' : dashboardPeriod === 'THIS_MONTH' ? 'Este Mês' : 'Este Ano'}</span>
                    </div>
                  </div>
               </div>
            </div>

            <FinancialCharts transactions={dashboardTransactions} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <TransactionList 
                  transactions={transactions.slice(0, 5)} 
                  categories={categories}
                  onRemoveTransaction={handleRemoveTransaction}
                  onAddTransaction={handleAddTransaction}
                  onEditTransaction={handleEditTransaction}
                />
              </div>
              
              {/* Dynamic Goals Widget */}
              <GoalsWidget 
                goals={goals}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            </div>
            
            <div className="mt-6 flex justify-end">
               <button 
                onClick={() => setCurrentView(ViewState.AI_INSIGHTS)}
                className="py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
               >
                 <Lightbulb className="w-4 h-4" />
                 Conversar com Consultor AI
               </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={() => handleLogout()}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-700/50 bg-background/80 backdrop-blur z-10 flex items-center justify-between px-6 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">
              {currentView === ViewState.DASHBOARD && 'Visão Geral'}
              {currentView === ViewState.TRANSACTIONS && 'Minhas Transações'}
              {currentView === ViewState.AI_INSIGHTS && 'Consultor AI'}
              {currentView === ViewState.INTEGRATIONS && 'Bancos & Integrações'}
              {currentView === ViewState.SETTINGS && 'Configurações'}
              {currentView === ViewState.ECONOMY_MODE && 'Modo Foco'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
            </button>
            
            {/* User Profile Trigger - Clickable */}
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 pl-4 border-l border-slate-700/50 hover:bg-slate-800/50 p-2 rounded-lg transition-colors group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{userProfile.name}</p>
                <div className="flex items-center justify-end gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] text-slate-400 uppercase tracking-wide">Online</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]">
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                       <User className="w-5 h-5 text-indigo-400" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setIsProfileOpen(false)}>
          <div 
            className="bg-slate-900/90 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Background Effect */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20"></div>
            
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center pt-10 pb-8 px-8 relative z-0">
               {/* Avatar Upload */}
               <div className="relative group cursor-pointer mb-6" onClick={handleAvatarClick}>
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1 shadow-2xl shadow-indigo-500/20">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden relative">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-slate-500" />
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-indigo-500 text-white p-2 rounded-full border-4 border-slate-900 shadow-lg">
                    <Upload className="w-4 h-4" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
               </div>

               {/* Name & Status (Editable Name) */}
               <div className="mb-1 text-center w-full">
                 <input 
                   type="text"
                   value={userProfile.name}
                   onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                   className="text-2xl font-bold text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-indigo-500 outline-none text-center w-full transition-colors"
                   onBlur={(e) => handleUpdateProfile(e.target.value)} // Salva ao perder o foco
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       handleUpdateProfile(userProfile.name);
                       (e.target as HTMLInputElement).blur(); // Remove o foco
                     }
                   }}
                 />
               </div>
               
               <p className="text-slate-400 flex items-center gap-2 text-sm mb-6">
                 <Mail className="w-3.5 h-3.5" /> {userProfile.email}
               </p>

               {/* Stats / Info Grid */}
               <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
                    <div className="p-2 bg-emerald-500/10 rounded-full mb-2">
                       <Clock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Status</span>
                    <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online Agora
                    </span>
                 </div>
                 
                 <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
                    <div className="p-2 bg-indigo-500/10 rounded-full mb-2">
                       <Calendar className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Online desde</span>
                    <span className="text-white font-bold text-sm">
                      {new Date(userProfile.onlineSince).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
               </div>

               {/* Actions */}
               <button 
                onClick={handleLogout}
                className="w-full py-3 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300 rounded-xl font-medium transition-all border border-slate-700 hover:border-rose-500/30"
               >
                 Sair da Conta
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;