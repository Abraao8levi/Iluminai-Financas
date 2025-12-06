import { Transaction, Goal, Category, UserProfile, AppSettings } from '../types';

const API_URL = 'http://localhost:5000/api';

// Helper to get token
const getToken = () => localStorage.getItem('auth_token');

// Helper for headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// --- Auth Services ---

export const apiLogin = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  localStorage.setItem('auth_token', data.token);
  return data.user;
};

export const apiRegister = async (userData: any) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error('Registration failed');
  const data = await res.json();
  localStorage.setItem('auth_token', data.token);
  return data.user;
};

// --- Transaction Services ---

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch(`${API_URL}/transactions`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const data = await res.json();
  // Map _id to id for frontend compatibility
  return data.map((t: any) => ({ ...t, id: t._id }));
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(transaction)
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  const t = await res.json();
  return { ...t, id: t._id };
};

export const updateTransaction = async (transaction: Transaction) => {
  const res = await fetch(`${API_URL}/transactions/${transaction.id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(transaction)
  });
  if (!res.ok) throw new Error('Failed to update transaction');
  const t = await res.json();
  return { ...t, id: t._id };
};

export const deleteTransaction = async (id: string) => {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
};

// --- Goal Services ---

export const fetchGoals = async (): Promise<Goal[]> => {
  const res = await fetch(`${API_URL}/goals`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch goals');
  const data = await res.json();
  return data.map((g: any) => ({ ...g, id: g._id }));
};

export const createGoal = async (goal: Omit<Goal, 'id'>) => {
  const res = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(goal)
  });
  if (!res.ok) throw new Error('Failed to create goal');
  const g = await res.json();
  return { ...g, id: g._id };
};

export const updateGoal = async (goal: Goal) => {
  const res = await fetch(`${API_URL}/goals/${goal.id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(goal)
  });
  if (!res.ok) throw new Error('Failed to update goal');
  const g = await res.json();
  return { ...g, id: g._id };
};

export const deleteGoal = async (id: string) => {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete goal');
};

// --- User Profile & Settings ---

export const updateUserProfile = async (profile: Partial<UserProfile> & Partial<AppSettings>) => {
  const res = await fetch(`${API_URL}/user/update`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return await res.json();
};