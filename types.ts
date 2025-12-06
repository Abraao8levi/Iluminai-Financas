
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum AccountType {
  CHECKING = 'Conta Corrente',
  SAVINGS = 'Poupança',
  CREDIT_CARD = 'Cartão de Crédito',
  PIX = 'PIX'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  accountType: AccountType;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  AI_INSIGHTS = 'AI_INSIGHTS',
  INTEGRATIONS = 'INTEGRATIONS',
  SETTINGS = 'SETTINGS',
  ECONOMY_MODE = 'ECONOMY_MODE'
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  onlineSince: Date;
}

export interface AppSettings {
  currency: string;
  theme: 'dark' | 'light';
  notifications: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  deadline?: string;
}