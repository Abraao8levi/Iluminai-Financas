import { Transaction, TransactionType, AccountType } from './types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-25', description: 'Salário Mensal', amount: 8500.00, category: 'Salário', type: TransactionType.INCOME, accountType: AccountType.CHECKING },
  { id: '2', date: '2023-10-26', description: 'Supermercado Extra', amount: 450.50, category: 'Alimentação', type: TransactionType.EXPENSE, accountType: AccountType.CREDIT_CARD },
  { id: '3', date: '2023-10-27', description: 'Netflix Assinatura', amount: 55.90, category: 'Entretenimento', type: TransactionType.EXPENSE, accountType: AccountType.CREDIT_CARD },
  { id: '4', date: '2023-10-28', description: 'Posto Shell', amount: 200.00, category: 'Transporte', type: TransactionType.EXPENSE, accountType: AccountType.CHECKING },
  { id: '5', date: '2023-10-29', description: 'Freelance Design', amount: 1200.00, category: 'Freelance', type: TransactionType.INCOME, accountType: AccountType.PIX },
  { id: '6', date: '2023-10-30', description: 'Jantar Outback', amount: 180.00, category: 'Restaurante', type: TransactionType.EXPENSE, accountType: AccountType.CREDIT_CARD },
  { id: '7', date: '2023-11-01', description: 'Aluguel', amount: 2200.00, category: 'Moradia', type: TransactionType.EXPENSE, accountType: AccountType.CHECKING },
  { id: '8', date: '2023-11-02', description: 'Academia SmartFit', amount: 120.00, category: 'Saúde', type: TransactionType.EXPENSE, accountType: AccountType.CREDIT_CARD },
  { id: '9', date: '2023-11-03', description: 'Spotify', amount: 21.90, category: 'Entretenimento', type: TransactionType.EXPENSE, accountType: AccountType.CREDIT_CARD },
  { id: '10', date: '2023-11-05', description: 'Investimento CDB', amount: 1000.00, category: 'Investimentos', type: TransactionType.EXPENSE, accountType: AccountType.SAVINGS },
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Salário': '#10b981',
  'Freelance': '#34d399',
  'Alimentação': '#f59e0b',
  'Entretenimento': '#8b5cf6',
  'Transporte': '#ef4444',
  'Moradia': '#ec4899',
  'Saúde': '#06b6d4',
  'Restaurante': '#f97316',
  'Investimentos': '#3b82f6',
};