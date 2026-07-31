import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Category, Goal, Transaction } from '../../types';
import { MOCK_TRANSACTIONS } from '../../constants';
import { useAuth } from './AuthContext';
import {
  createGoal as apiCreateGoal,
  createTransaction as apiCreateTransaction,
  deleteGoal as apiDeleteGoal,
  deleteTransaction as apiDeleteTransaction,
  fetchGoals,
  fetchTransactions,
  updateGoal as apiUpdateGoal,
  updateTransaction as apiUpdateTransaction
} from '../../services/api';

export type DashboardPeriod = 'ALL' | 'THIS_MONTH' | 'THIS_YEAR';

interface FinancialContextType {
  transactions: Transaction[];
  dashboardTransactions: Transaction[];
  goals: Goal[];
  categories: Category[];
  dashboardPeriod: DashboardPeriod;
  setDashboardPeriod: (period: DashboardPeriod) => void;
  isLoading: boolean;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (t: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>;
  editGoal: (g: Goal) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isBackendAvailable, authState } = useAuth();
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriod>('THIS_MONTH');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finanai_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('finanai_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories] = useState<Category[]>([]);

  useEffect(() => {
    localStorage.setItem('finanai_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finanai_goals', JSON.stringify(goals));
  }, [goals]);

  const loadDataFromBackend = async () => {
    if (!isBackendAvailable || authState !== 'AUTHENTICATED') return;
    setIsLoading(true);
    try {
      const [txData, goalsData] = await Promise.all([fetchTransactions(), fetchGoals()]);
      setTransactions(txData);
      setGoals(goalsData);
    } catch (err) {
      console.error('Erro ao sincronizar dados com backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromBackend();
  }, [isBackendAvailable, authState]);

  const dashboardTransactions = useMemo(() => {
    if (dashboardPeriod === 'ALL') return transactions;

    const now = new Date();
    return transactions.filter(t => {
      if (!t.date) return false;
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

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (isBackendAvailable && authState === 'AUTHENTICATED') {
      const created = await apiCreateTransaction(newTx);
      setTransactions(prev => [created, ...prev]);
    } else {
      const mockCreated: Transaction = { ...newTx, id: String(Date.now()) };
      setTransactions(prev => [mockCreated, ...prev]);
    }
  };

  const editTransaction = async (updatedTx: Transaction) => {
    if (isBackendAvailable && authState === 'AUTHENTICATED') {
      const updated = await apiUpdateTransaction(updatedTx);
      setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    } else {
      setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
    }
  };

  const removeTransaction = async (id: string) => {
    if (isBackendAvailable && authState === 'AUTHENTICATED') {
      await apiDeleteTransaction(id);
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = async (newGoal: Omit<Goal, 'id'>) => {
    if (isBackendAvailable && authState === 'AUTHENTICATED') {
      const created = await apiCreateGoal(newGoal);
      setGoals(prev => [...prev, created]);
    } else {
      const mockCreated: Goal = { ...newGoal, id: String(Date.now()) };
      setGoals(prev => [...prev, mockCreated]);
    }
  };

  const editGoal = async (updatedGoal: Goal) => {
    if (isBackendAvailable && authState === 'AUTHENTICATED') {
      const updated = await apiUpdateGoal(updatedGoal);
      setGoals(prev => prev.map(g => (g.id === updated.id ? updated : g)));
    } else {
      setGoals(prev => prev.map(g => (g.id === updatedGoal.id ? updatedGoal : g)));
    }
  };

  const removeGoal = async (id: string) => {
    if (isBackendAvailable && authState === 'AUTHENTICATED') {
      await apiDeleteGoal(id);
    }
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <FinancialContext.Provider
      value={{
        transactions,
        dashboardTransactions,
        goals,
        categories,
        dashboardPeriod,
        setDashboardPeriod,
        isLoading,
        addTransaction,
        editTransaction,
        removeTransaction,
        addGoal,
        editGoal,
        removeGoal,
        refreshData: loadDataFromBackend
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial deve ser utilizado dentro de FinancialProvider');
  }
  return context;
};
