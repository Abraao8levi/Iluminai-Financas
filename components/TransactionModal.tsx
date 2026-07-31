import React, { useState, useEffect, useRef } from 'react';
import { X, Check, DollarSign, Calendar, Tag, FileText, Wallet, Sparkles, Loader2, Upload } from 'lucide-react';
import { Transaction, TransactionType, AccountType, Category } from '../types';
import { parseReceiptWithAI } from '../services/api';
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

  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setCategory(initialData.category);

        const formattedDate = initialData.date.includes('T') 
          ? initialData.date.split('T')[0] 
          : initialData.date;
        setDate(formattedDate);

        setAccountType(initialData.accountType);
      } else {
        setType(TransactionType.EXPENSE);
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setAccountType(AccountType.CHECKING);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleScanReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsScanning(true);
      try {
        const parsed = await parseReceiptWithAI(base64, file.type || 'image/jpeg');
        if (parsed.description) setDescription(parsed.description);
        if (parsed.amount) setAmount(String(parsed.amount));
        if (parsed.date) setDate(parsed.date);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.type && Object.values(TransactionType).includes(parsed.type)) {
          setType(parsed.type as TransactionType);
        }
        if (parsed.accountType && Object.values(AccountType).includes(parsed.accountType)) {
          setAccountType(parsed.accountType as AccountType);
        }
      } catch (err: any) {
        alert(err.message || 'Erro ao processar comprovante com IA');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category || !date) return;

    const transactionData = {
      ...(initialData && { id: initialData.id }),
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      accountType
    };

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
          
          <div className="flex items-center justify-between p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Preencher com Leitura Inteligente de IA</span>
            </div>
            <button
              type="button"
              disabled={isScanning}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Lendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Comprovante</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleScanReceipt}
              className="hidden"
            />
          </div>

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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" /> Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> Descrição
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado, Salário, iFood..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Categoria
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Alimentação, Transporte..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" /> Tipo de Conta
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {accountTypes.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-700/50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;