import { GoogleGenerativeAI } from "@google/generative-ai";
import { Transaction } from '../types';

const getAiClient = () => {
  // A chave da API é injetada pelo Vite a partir do arquivo .env
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("MISSING_API_KEY");
  }

  return new GoogleGenerativeAI(apiKey);
};

export const getFinancialAdvice = async (
  transactions: Transaction[],
  userQuery: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    
    // Simplificar os dados para reduzir consumo de tokens
    const simplifiedTransactions = transactions.slice(0, 30).map(t => ({
        date: t.date,
        desc: t.description,
        amount: t.amount,
        type: t.type,
        cat: t.category
    }));

    const transactionSummary = JSON.stringify(simplifiedTransactions);
    
    const prompt = `
      Atue como um consultor financeiro pessoal experiente chamado Lúmina.
      Aqui estão os dados recentes de transações do usuário em formato JSON simplificado:
      ${transactionSummary}
      
      Pergunta do usuário: "${userQuery}"
      
      Forneça uma resposta concisa, amigável e útil em Português do Brasil.
      Use formatação Markdown (negrito, listas) para facilitar a leitura.
      Se a pergunta não for sobre finanças, tente relacionar ou explique educadamente que seu foco é financeiro.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "Desculpe, não consegui analisar seus dados no momento.";

  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    
    if (error.message === "MISSING_API_KEY") {
        return "⚠️ **Configuração Necessária**: Chave de API não encontrada ou inválida.";
    }

    if (error.message.includes('API key not valid')) {
      return "Erro: A chave da API do Gemini não é válida. Verifique seu arquivo `.env`.";
    }

    return "Ocorreu um erro ao conectar com o assistente inteligente. Tente novamente mais tarde.";
  }
};

export const generateMonthlyInsight = async (transactions: Transaction[]): Promise<string> => {
    try {
        const ai = getAiClient();
        const model = ai.getGenerativeModel({ model: "gemini-pro" });
        
        if (transactions.length === 0) return "Adicione transações para receber insights personalizados da IA.";

        const simplifiedTransactions = transactions.slice(0, 50).map(t => ({
            d: t.date,
            v: t.amount,
            t: t.type,
            c: t.category
        }));

        const transactionSummary = JSON.stringify(simplifiedTransactions);

        const prompt = `
            Analise estes dados financeiros (JSON) e me dê 3 pontos principais (bullets) sobre a saúde financeira.
            Seja direto e motivador. Fale sobre gastos excessivos ou boas economias se houver.
            Dados: ${transactionSummary}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text || "Sem insights disponíveis no momento.";
    } catch (error: any) {
        console.error("Gemini Insight Error:", error);
        if (error.message === "MISSING_API_KEY") {
            return "Chave API necessária para gerar insights.";
        }
        return "Não foi possível gerar insights automáticos no momento.";
    }
}