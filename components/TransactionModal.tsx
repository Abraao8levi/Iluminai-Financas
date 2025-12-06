import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, Tag, FileText, Wallet } from 'lucide-react';
import { Transaction, TransactionType, AccountType, Category } from '../types';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
  initialData?: Transaction | null;
  categories: Category[];
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, categories }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(AccountType.CHECKING);

  // Effect to pre-fill data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // EDIT MODE: Pre-fill all fields
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setCategory(initialData.category);
        
        // Ensure date is in YYYY-MM-DD format for the input
        // Handles cases where date might be an ISO string with time
        const formattedDate = initialData.date.includes('T') 
          ? initialData.date.split('T')[0] 
          : initialData.date;
        setDate(formattedDate);
        
        setAccountType(initialData.accountType);
      } else {
        // CREATE MODE: Reset fields to default
        setType(TransactionType.EXPENSE);
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]); // Today
        setAccountType(AccountType.CHECKING);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category || !date) return;

    const transactionData = {
      // Include ID only if editing
      ...(initialData && { id: initialData.id }),
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      accountType
    };

    // Casting ensures TypeScript knows this matches the expected type
    onSave(transactionData as Transaction);
    onClose();
  };

  const accountTypes = Object.values(AccountType);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900 rounded-xl">
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={clsx(
                "py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                type === TransactionType.INCOME 
                  ? "bg-emerald-500 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={clsx(
                "py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                type === TransactionType.EXPENSE 
                  ? "bg-rose-500 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              Saída
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Valor</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-xl font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Descrição</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Compras no mercado"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Categoria</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Selecione</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Data</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all [color-scheme:dark]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Type */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Conta / Forma de Pagamento</label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                {accountTypes.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-700/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {initialData ? 'Salvar Alterações' : 'Criar Transação'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;