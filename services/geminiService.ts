import { Transaction } from '../types';
import { fetchAiAdvice, fetchAiInsight } from './api';

export const getFinancialAdvice = async (
  transactions: Transaction[],
  userQuery: string
): Promise<string> => {
  try {
    return await fetchAiAdvice(transactions, userQuery);
  } catch (error: any) {
    console.error('AI Advice Error:', error);
    return error.message || 'Ocorreu um erro ao conectar com o assistente inteligente.';
  }
};

export const generateMonthlyInsight = async (transactions: Transaction[]): Promise<string> => {
  try {
    return await fetchAiInsight(transactions);
  } catch (error: any) {
    console.error('AI Insight Error:', error);
    return 'Não foi possível gerar insights automáticos no momento.';
  }
};