import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, AccountType, Category } from '../types';
import { ArrowDownCircle, ArrowUpCircle, Search, Calendar, Filter, X, AlertTriangle, Eye, FileText, Tag, DollarSign, Pencil, Trash2, CreditCard, CheckCircle, Wallet, PiggyBank, Zap, Landmark, Info, Plus, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import TransactionModal from './TransactionModal';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onRemoveTransaction: (id: string) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

type FilterPeriod = 'ALL' | 'LAST_7' | 'THIS_MONTH' | 'CUSTOM';
type ActionType = 'EDIT' | 'DELETE';
type ToastType = 'success' | 'delete' | 'edit';

interface ActionConfirmation {
  type: ActionType;
  transaction: Transaction;
}

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

const TransactionList: React.FC<Props> = ({ transactions, categories, onRemoveTransaction, onAddTransaction, onEditTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterAccount, setFilterAccount] = useState<string>('ALL');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Loading State for Filters
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Modals State
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [actionConfirmation, setActionConfirmation] = useState<ActionConfirmation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Loading States
  const [processingRowId, setProcessingRowId] = useState<string | null>(null);
  const [isModalProcessing, setIsModalProcessing] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  // Get color helper
  const getCategoryColor = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat ? cat.color : '#94a3b8';
  };

  // Date Handling Helper
  const parseTransactionDate = (dateStr: string) => {
    // Assumes YYYY-MM-DD
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d); // Local Midnight
  };

  const parseInputDate = (dateStr: string) => {
    // Assumes DD/MM/YYYY
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d); // Local Midnight
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    if (val.length >= 5) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
    } else if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setter(val);
  };

  // Helper for Account Type Icon - Enhanced for Visual Recognition
  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.PIX:
        return (
          <div className="p-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 shrink-0" title="PIX">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
          </div>
        );
      case AccountType.CREDIT_CARD:
        return (
          <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 shrink-0" title="Cartão de Crédito">
            <CreditCard className="w-3.5 h-3.5 text-purple-500" />
          </div>
        );
      case AccountType.SAVINGS:
        return (
          <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 shrink-0" title="Poupança">
            <PiggyBank className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        );
      case AccountType.CHECKING:
      default:
        return (
          <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 shrink-0" title="Conta Corrente">
            <Wallet className="w-3.5 h-3.5 text-blue-500" />
          </div>
        );
    }
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Simulate loading when filters change
  useEffect(() => {
    setIsLoadingFilters(true);
    const timer = setTimeout(() => {
      setIsLoadingFilters(false);
    }, 400); // 400ms delay for visual feedback
    return () => clearTimeout(timer);
  }, [searchTerm, filterPeriod, customStart, customEnd, filterCategory, filterAccount, transactions]);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Text Search
      const matchesSearch = 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Category Filter
      if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;

      // 3. Account Filter
      if (filterAccount !== 'ALL' && t.accountType !== filterAccount) return false;

      // 4. Date Filter
      const tDate = parseTransactionDate(t.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to midnight local
      
      switch (filterPeriod) {
        case 'LAST_7': {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return tDate >= sevenDaysAgo && tDate <= new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        }
        case 'THIS_MONTH': {
          return (
            tDate.getMonth() === today.getMonth() &&
            tDate.getFullYear() === today.getFullYear()
          );
        }
        case 'CUSTOM': {
          if (customStart.length === 10 && customEnd.length === 10) {
            const start = parseInputDate(customStart);
            const end = parseInputDate(customEnd);
            
            if (start && end) {
               // Set end date to end of day
               end.setHours(23, 59, 59, 999);
               return tDate >= start && tDate <= end;
            }
          }
          return true; // Show all if dates aren't fully filled
        }
        case 'ALL':
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort desc
  }, [transactions, searchTerm, filterPeriod, customStart, customEnd, filterCategory, filterAccount]);

  const confirmClearFilters = () => {
    setSearchTerm('');
    setFilterPeriod('ALL');
    setCustomStart('');
    setCustomEnd('');
    setFilterCategory('ALL');
    setFilterAccount('ALL');
    setShowClearConfirmation(false);
  };

  const handleActionClick = (e: React.MouseEvent, type: ActionType, transaction: Transaction) => {
    e.stopPropagation(); // Prevent row click (view details)
    // Always require confirmation for both EDIT and DELETE
    setActionConfirmation({ type, transaction });
  };

  const handlePay = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProcessingRowId(id); // Start Loading
    
    // Simulate API delay for visual feedback
    setTimeout(() => {
      try {
        onRemoveTransaction(id);
        showToast('Conta paga com sucesso!', 'success');
      } catch (error) {
        showToast('Erro ao processar pagamento.', 'delete');
      } finally {
        setProcessingRowId(null); // Stop Loading (ensure cleanup)
      }
    }, 1000);
  };

  const executeAction = () => {
    if (!actionConfirmation) return;
    
    setIsModalProcessing(true); // Start Modal Loading

    // Simulate API delay
    setTimeout(() => {
      if (actionConfirmation.type === 'DELETE') {
        onRemoveTransaction(actionConfirmation.transaction.id);
        showToast('Transação removida.', 'delete');
      } else if (actionConfirmation.type === 'EDIT') {
        setEditingTransaction(actionConfirmation.transaction);
        setIsFormOpen(true);
      }
      
      setIsModalProcessing(false); // Stop Modal Loading
      setActionConfirmation(null); // Close Modal
    }, 500);
  };

  const handleSaveTransaction = (data: Transaction | Omit<Transaction, 'id'>) => {
    if ('id' in data) {
      onEditTransaction(data as Transaction);
      showToast('Transação salva com sucesso!', 'success');
    } else {
      onAddTransaction(data);
      showToast('Transação salva com sucesso!', 'success');
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const openNewTransactionModal = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const FilterButton = ({ type, label }: { type: FilterPeriod, label: string }) => (
    <button
      onClick={() => setFilterPeriod(type)}
      className={clsx(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
        filterPeriod === type
          ? "bg-primary text-white shadow-sm"
          : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-surface border border-slate-700/50 rounded-2xl flex flex-col h-full overflow-hidden relative">
      {/* Header & Toolbar */}
      <div className="p-6 border-b border-slate-700/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Transações
            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredTransactions.length}
            </span>
          </h3>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-9 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            {/* New Transaction Button */}
            <button
              onClick={openNewTransactionModal}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nova
            </button>
            
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="md:hidden p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <Filter className="w-5 h-5" />
            </button>
             {/* Mobile Add Button */}
            <button
              onClick={openNewTransactionModal}
              className="md:hidden p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className={clsx(
          "flex flex-col gap-4 transition-all duration-300 ease-in-out overflow-hidden",
          isFilterMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 md:max-h-full md:opacity-100"
        )}>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Period Filters */}
            <div className="flex flex-wrap gap-2">
              <FilterButton type="ALL" label="Todas" />
              <FilterButton type="LAST_7" label="Últimos 7 dias" />
              <FilterButton type="THIS_MONTH" label="Este Mês" />
              <FilterButton type="CUSTOM" label="Personalizado" />
            </div>

            {/* Custom Date Inputs */}
            {filterPeriod === 'CUSTOM' && (
              <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50 animate-fadeIn">
                <input 
                  type="text" 
                  placeholder="DD/MM/AAAA"
                  value={customStart}
                  onChange={(e) => handleDateInput(e, setCustomStart)}
                  className="bg-transparent text-slate-300 text-sm focus:outline-none p-1 w-24 text-center placeholder-slate-600"
                  maxLength={10}
                />
                <span className="text-slate-500">-</span>
                <input 
                  type="text" 
                  placeholder="DD/MM/AAAA"
                  value={customEnd}
                  onChange={(e) => handleDateInput(e, setCustomEnd)}
                  className="bg-transparent text-slate-300 text-sm focus:outline-none p-1 w-24 text-center placeholder-slate-600"
                  maxLength={10}
                />
              </div>
            )}
            
            {/* Advanced Filters: Category & Account */}
            <div className="flex flex-wrap gap-2">
               <div className="relative">
                 <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                 <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-800 text-slate-300 text-sm rounded-lg pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:border-primary appearance-none hover:bg-slate-700 transition-colors cursor-pointer"
                 >
                   <option value="ALL">Todas Categorias</option>
                   {categories.map(cat => (
                     <option key={cat.id} value={cat.name}>{cat.name}</option>
                   ))}
                 </select>
               </div>

               <div className="relative">
                 <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                 <select 
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="bg-slate-800 text-slate-300 text-sm rounded-lg pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:border-primary appearance-none hover:bg-slate-700 transition-colors cursor-pointer"
                 >
                   <option value="ALL">Todas Contas</option>
                   {Object.values(AccountType).map(acc => (
                     <option key={acc} value={acc}>{acc}</option>
                   ))}
                 </select>
               </div>
            </div>

            {(searchTerm || filterPeriod !== 'ALL' || filterCategory !== 'ALL' || filterAccount !== 'ALL') && (
               <button 
                 onClick={() => setShowClearConfirmation(true)}
                 className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 ml-auto md:ml-0"
               >
                 <X className="w-3 h-3" /> Limpar filtros
               </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto custom-scrollbar flex-1 pb-2">
        <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Transação</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Conta</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium text-right">Valor</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {isLoadingFilters ? (
                 <tr>
                   <td colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm">Atualizando resultados...</p>
                      </div>
                   </td>
                 </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                <tr 
                  key={t.id} 
                  onClick={() => setSelectedTransaction(t)}
                  className="group bg-surface hover:bg-slate-800 transition-all duration-200 cursor-pointer hover:scale-[1.005] hover:shadow-xl hover:z-10 relative"
                >
                  <td className="px-6 py-4 rounded-l-lg">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "p-2 rounded-lg transition-transform group-hover:scale-110 shadow-sm",
                        t.type === TransactionType.INCOME ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {t.type === TransactionType.INCOME ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                      </div>
                      <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 group-hover:border-slate-600 transition-colors"
                      style={{ color: getCategoryColor(t.category) }}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300">
                      {getAccountIcon(t.accountType)}
                      <span className="text-xs font-medium">{t.accountType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      {parseTransactionDate(t.date).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className={clsx(
                    "px-6 py-4 font-bold text-right tabular-nums",
                    t.type === TransactionType.INCOME ? "text-emerald-400" : "text-slate-200"
                  )}>
                    {t.type === TransactionType.EXPENSE && "- "}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                  </td>
                  <td className="px-6 py-4 rounded-r-lg">
                    <div className="flex items-center justify-center gap-2">
                      {t.type === TransactionType.EXPENSE && (
                        <button 
                          onClick={(e) => handlePay(e, t.id)}
                          disabled={processingRowId === t.id}
                          className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors opacity-50 group-hover:opacity-100 disabled:opacity-100 disabled:cursor-not-allowed"
                          title="Pagar Agora"
                        >
                          {processingRowId === t.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      <div className="w-px h-4 bg-slate-700 mx-1"></div>

                      <button 
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                        title="Ver Detalhes"
                      >
                         <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleActionClick(e, 'EDIT', t)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                        title="Editar"
                      >
                         <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleActionClick(e, 'DELETE', t)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                        title="Excluir"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))) : (
                <tr>
                   <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <div className="bg-slate-800/50 p-4 rounded-full mb-3">
                           <Search className="w-8 h-8 opacity-50" />
                        </div>
                        <p>Nenhuma transação encontrada para este filtro.</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
      
      <div className="p-4 border-t border-slate-700/50 text-center bg-slate-900/20">
        <p className="text-xs text-slate-500">
          Mostrando {filteredTransactions.length} de {transactions.length} registros
        </p>
      </div>

      {/* Transaction Form Modal */}
      <TransactionModal 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        categories={categories}
      />

      {/* Confirmation Modal (Clear Filters) */}
      {showClearConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <h4 className="text-lg font-bold text-white">Limpar filtros?</h4>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Você perderá todas as configurações de busca e períodos selecionados. Deseja continuar?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirmation(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearFilters}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-rose-500/20"
              >
                Sim, limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal (Delete/Edit) */}
      {actionConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
            <div className="flex items-center gap-3 mb-4">
              <div className={clsx(
                "p-2 rounded-full",
                actionConfirmation.type === 'DELETE' ? "bg-rose-500/10" : "bg-primary/10"
              )}>
                {actionConfirmation.type === 'DELETE' ? (
                  <Trash2 className="w-6 h-6 text-rose-500" />
                ) : (
                  <Pencil className="w-6 h-6 text-primary" />
                )}
              </div>
              <h4 className="text-lg font-bold text-white">
                {actionConfirmation.type === 'DELETE' ? 'Excluir Transação?' : 'Editar Transação?'}
              </h4>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {actionConfirmation.type === 'DELETE' 
                ? `Tem certeza que deseja remover "${actionConfirmation.transaction.description}"? Esta ação não pode ser desfeita.`
                : `Deseja entrar no modo de edição para "${actionConfirmation.transaction.description}"?`
              }
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionConfirmation(null)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg text-sm font-medium transition-colors"
                disabled={isModalProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                disabled={isModalProcessing}
                className={clsx(
                  "px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors shadow-lg flex items-center gap-2",
                  actionConfirmation.type === 'DELETE' 
                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" 
                    : "bg-primary hover:bg-indigo-600 shadow-primary/20",
                   isModalProcessing && "opacity-70 cursor-wait"
                )}
              >
                {isModalProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionConfirmation.type === 'DELETE' ? 'Sim, excluir' : 'Sim, editar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setSelectedTransaction(null)}>
          <div 
            className="bg-surface border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 pb-8 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/50">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className={clsx(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
                  selectedTransaction.type === TransactionType.INCOME ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                )}>
                  {selectedTransaction.type === TransactionType.INCOME ? <ArrowUpCircle className="w-8 h-8" /> : <ArrowDownCircle className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedTransaction.description}</h3>
                <span 
                   className="text-xs px-2 py-1 rounded-full border border-slate-700"
                   style={{ color: getCategoryColor(selectedTransaction.category) }}
                >
                  {selectedTransaction.category}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-3 text-slate-400">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Valor</span>
                  </div>
                  <span className={clsx(
                    "text-lg font-bold",
                    selectedTransaction.type === TransactionType.INCOME ? "text-emerald-400" : "text-white"
                  )}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedTransaction.amount)}
                  </span>
               </div>

               <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Landmark className="w-5 h-5" />
                    <span className="text-sm font-medium">Conta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAccountIcon(selectedTransaction.accountType)}
                    <span className="text-slate-200 font-medium">{selectedTransaction.accountType}</span>
                  </div>
               </div>

               <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">Data</span>
                  </div>
                  <span className="text-slate-200 font-medium">
                    {parseTransactionDate(selectedTransaction.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
               </div>

               <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">ID da Transação</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono break-all">
                    {selectedTransaction.id}
                  </span>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-700/50 flex justify-end gap-2">
              <button 
                onClick={() => {
                  const t = selectedTransaction;
                  setSelectedTransaction(null);
                  setActionConfirmation({ type: 'DELETE', transaction: t });
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-sm font-medium rounded-lg transition-colors"
              >
                Excluir
              </button>
               <button 
                onClick={() => {
                   const t = selectedTransaction;
                   setSelectedTransaction(null);
                   // Require confirmation for Edit as well
                   setActionConfirmation({ type: 'EDIT', transaction: t });
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-primary/10 hover:text-primary text-slate-400 text-sm font-medium rounded-lg transition-colors"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounceIn">
          <div className={clsx(
            "px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-white border",
            toast.type === 'success' && "bg-emerald-500 border-emerald-400 shadow-emerald-500/30",
            toast.type === 'delete' && "bg-slate-700 border-slate-600 shadow-slate-900/30",
            toast.type === 'edit' && "bg-primary border-indigo-400 shadow-primary/30"
          )}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'delete' && <Trash2 className="w-5 h-5 text-rose-400" />}
            {toast.type === 'edit' && <Info className="w-5 h-5" />}
            
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;