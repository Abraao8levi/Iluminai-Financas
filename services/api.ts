/// <reference types="vite/client" />
import { AppSettings, Goal, Transaction, UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('auth_token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL.replace(/\/api$/, '')}/`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
};

export const apiLogin = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Falha na autenticação');
  }
  const data = await res.json();
  localStorage.setItem('auth_token', data.token);
  return data;
};

export const apiRegister = async (userData: { name: string; email: string; password: string }) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Falha ao registrar conta');
  }
  const data = await res.json();
  localStorage.setItem('auth_token', data.token);
  return data;
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch(`${API_URL}/transactions`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Falha ao buscar transações');
  const data = await res.json();
  return data.map((t: any) => ({ ...t, id: String(t.id || t._id) }));
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(transaction)
  });
  if (!res.ok) throw new Error('Falha ao criar transação');
  const t = await res.json();
  return { ...t, id: String(t.id || t._id) };
};

export const updateTransaction = async (transaction: Transaction): Promise<Transaction> => {
  const res = await fetch(`${API_URL}/transactions/${transaction.id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(transaction)
  });
  if (!res.ok) throw new Error('Falha ao atualizar transação');
  const t = await res.json();
  return { ...t, id: String(t.id || t._id) };
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Falha ao remover transação');
};

export const fetchGoals = async (): Promise<Goal[]> => {
  const res = await fetch(`${API_URL}/goals`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Falha ao buscar metas');
  const data = await res.json();
  return data.map((g: any) => ({ ...g, id: String(g.id || g._id) }));
};

export const createGoal = async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
  const res = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(goal)
  });
  if (!res.ok) throw new Error('Falha ao criar meta');
  const g = await res.json();
  return { ...g, id: String(g.id || g._id) };
};

export const updateGoal = async (goal: Goal): Promise<Goal> => {
  const res = await fetch(`${API_URL}/goals/${goal.id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(goal)
  });
  if (!res.ok) throw new Error('Falha ao atualizar meta');
  const g = await res.json();
  return { ...g, id: String(g.id || g._id) };
};

export const deleteGoal = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Falha ao remover meta');
};

export const updateUserProfile = async (profile: Partial<UserProfile> & Partial<AppSettings>) => {
  const res = await fetch(`${API_URL}/user/update`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Falha ao atualizar perfil');
  return await res.json();
};

export const fetchAiAdvice = async (transactions: Transaction[], userQuery: string): Promise<string> => {
  const res = await fetch(`${API_URL}/ai/advice`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ transactions, userQuery })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro no serviço de IA');
  }
  const data = await res.json();
  return data.advice;
};

export const fetchAiInsight = async (transactions: Transaction[]): Promise<string> => {
  const res = await fetch(`${API_URL}/ai/insight`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ transactions })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao obter insight de IA');
  }
  const data = await res.json();
  return data.insight;
};

export const fetchAiStatus = async (): Promise<{ provider: string; active: boolean }> => {
  const res = await fetch(`${API_URL}/ai/status`);
  if (!res.ok) return { provider: 'gemini', active: false };
  return await res.json();
};