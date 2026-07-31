import clsx from 'clsx';
import { Camera, Loader2, Sparkles, User, Zap } from 'lucide-react';
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

import { useAuth } from './src/contexts/AuthContext';
import { useFinancial } from './src/contexts/FinancialContext';
import { generateMonthlyInsight } from './services/geminiService';
import { TransactionType, ViewState } from './types';

const App: React.FC = () => {
  const {
    authState,
    setAuthState,
    userProfile,
    settings,
    login,
    register,
    logout,
    updateProfile
  } = useAuth();

  const {
    transactions,
    dashboardTransactions,
    goals,
    categories,
    dashboardPeriod,
    setDashboardPeriod,
    addTransaction,
    editTransaction,
    removeTransaction,
    addGoal,
    editGoal,
    removeGoal
  } = useFinancial();

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiTip, setAiTip] = useState<string>('Carregando insights financeiros...');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalIncome = useMemo(() => {
    return dashboardTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [dashboardTransactions]);

  const totalExpense = useMemo(() => {
    return dashboardTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [dashboardTransactions]);

  const periodBalance = totalIncome - totalExpense;

  const totalAssetBalance = useMemo(() => {
    return (
      transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, c) => a + c.amount, 0) -
      transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, c) => a + c.amount, 0)
    );
  }, [transactions]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (authState !== 'AUTHENTICATED') return;
      setIsLoadingTip(true);
      const tip = await generateMonthlyInsight(dashboardTransactions.length > 0 ? dashboardTransactions : transactions);
      setAiTip(tip);
      setIsLoadingTip(false);
    };

    fetchInsight();
  }, [transactions, dashboardPeriod, authState]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateProfile({ avatar: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  if (authState === 'LOGIN') {
    return (
      <LoginPage
        onLogin={async (authData) => {
          if (authData?.email && authData?.password) {
            await login(authData.email, authData.password);
          } else {
            await login('usuario@exemplo.com', '123456');
          }
        }}
        onNavigateToSignUp={() => setAuthState('SIGNUP')}
      />
    );
  }

  if (authState === 'SIGNUP') {
    return (
      <SignUpPage
        onSignUp={() => setAuthState('LOGIN')}
        onNavigateToLogin={() => setAuthState('LOGIN')}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-slate-800/50 border-b border-slate-700/50 px-4 md:px-6 flex items-center justify-between z-10 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white md:hidden"
            >
              <Zap className="w-5 h-5 text-indigo-400" />
            </button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Lúmina AI
            </h1>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="hidden sm:flex bg-slate-900/60 p-1 rounded-xl border border-slate-700/50 text-xs">
              <button
                onClick={() => setDashboardPeriod('THIS_MONTH')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg transition-colors font-medium',
                  dashboardPeriod === 'THIS_MONTH' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                Mês Atual
              </button>
              <button
                onClick={() => setDashboardPeriod('THIS_YEAR')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg transition-colors font-medium',
                  dashboardPeriod === 'THIS_YEAR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                Ano
              </button>
              <button
                onClick={() => setDashboardPeriod('ALL')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg transition-colors font-medium',
                  dashboardPeriod === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                Tudo
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-700/40 transition-colors"
              >
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-indigo-500/50" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="hidden md:inline text-sm font-medium text-slate-200">{userProfile.name}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700/50">
                    <p className="text-sm font-medium text-white">{userProfile.name}</p>
                    <p className="text-xs text-slate-400 truncate">{userProfile.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/50 flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4 text-slate-400" />
                    <span>Alterar Foto de Perfil</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView(ViewState.SETTINGS);
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/50 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Configurações</span>
                  </button>
                  <div className="border-t border-slate-700/50 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2"
                  >
                    <span>Sair da conta</span>
                  </button>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {currentView === ViewState.DASHBOARD && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Saldo no Período"
                  value={periodBalance}
                  type={periodBalance >= 0 ? 'positive' : 'negative'}
                />
                <StatCard
                  title="Receitas"
                  value={totalIncome}
                  type="positive"
                />
                <StatCard
                  title="Despesas"
                  value={totalExpense}
                  type="negative"
                />
                <StatCard
                  title="Patrimônio Total"
                  value={totalAssetBalance}
                  type={totalAssetBalance >= 0 ? 'positive' : 'negative'}
                />
              </div>

              <div className="bg-gradient-to-r from-indigo-900/40 via-slate-800/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-4 md:p-5 relative overflow-hidden backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-indigo-300">Insights Inteligentes da Lúmina</h3>
                      {isLoadingTip && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                    </div>
                    <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                      {aiTip}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <FinancialCharts transactions={dashboardTransactions} />
                </div>
                <div>
                  <GoalsWidget
                    goals={goals}
                    onAddGoal={addGoal}
                    onUpdateGoal={editGoal}
                    onDeleteGoal={removeGoal}
                  />
                </div>
              </div>

              <TransactionList
                transactions={dashboardTransactions}
                categories={categories}
                onAddTransaction={addTransaction}
                onEditTransaction={editTransaction}
                onRemoveTransaction={removeTransaction}
              />
            </>
          )}

          {currentView === ViewState.TRANSACTIONS && (
            <TransactionList
              transactions={transactions}
              categories={categories}
              onAddTransaction={addTransaction}
              onEditTransaction={editTransaction}
              onRemoveTransaction={removeTransaction}
            />
          )}

          {currentView === ViewState.AI_INSIGHTS && (
            <AIAssistant transactions={transactions} />
          )}

          {currentView === ViewState.INTEGRATIONS && (
            <BankIntegrations
              onImportTransactions={(imported) => {
                imported.forEach(t => addTransaction(t));
              }}
            />
          )}

          {currentView === ViewState.SETTINGS && (
            <SettingsPage
              settings={settings}
              onUpdateSettings={(newSettings) => updateProfile(newSettings)}
              categories={categories}
              onAddCategory={() => {}}
              onRemoveCategory={() => {}}
              transactions={transactions}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;