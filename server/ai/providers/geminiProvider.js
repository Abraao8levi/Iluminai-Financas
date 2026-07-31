const BaseAIProvider = require('./baseProvider');

class GeminiProvider extends BaseAIProvider {
  constructor(apiKey, modelName = 'gemini-1.5-flash') {
    super();
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async generateAdvice(transactions, userQuery) {
    if (!this.apiKey) {
      return "⚠️ **Configuração de IA Pendente**: Chave de API do Gemini não encontrada no arquivo `.env` do backend.";
    }

    const simplified = transactions.slice(0, 30).map(t => ({
      date: t.date,
      desc: t.description,
      amount: t.amount,
      type: t.type,
      cat: t.category
    }));

    const prompt = `Atue como um consultor financeiro pessoal experiente chamado Lúmina.
Dados de transações recentes: ${JSON.stringify(simplified)}
Pergunta do usuário: "${userQuery}"
Forneça uma resposta concisa, prática e amigável em Português do Brasil usando Markdown.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || 'Falha na comunicação com o Gemini API');
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || "Não foi possível gerar a análise financeira no momento.";
    } catch (err) {
      console.error('GeminiProvider Error:', err.message);
      return `Erro ao consultar assistente Gemini: ${err.message}`;
    }
  }

  async generateInsight(transactions) {
    if (!this.apiKey) {
      return "Configure GEMINI_API_KEY no arquivo .env para obter insights automáticos.";
    }

    if (!transactions || transactions.length === 0) {
      return "Adicione transações para receber insights personalizados da IA.";
    }

    const simplified = transactions.slice(0, 50).map(t => ({
      d: t.date,
      v: t.amount,
      t: t.type,
      c: t.category
    }));

    const prompt = `Analise estes dados financeiros e retorne exatamente 3 pontos principais (bullets) sobre a saúde financeira do usuário. Seja direto e motivador.
Dados: ${JSON.stringify(simplified)}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || 'Falha ao obter insights');
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || "Sem insights disponíveis no momento.";
    } catch (err) {
      console.error('GeminiProvider Insight Error:', err.message);
      return "Não foi possível gerar insights automáticos no momento.";
    }
  }
}

module.exports = GeminiProvider;
