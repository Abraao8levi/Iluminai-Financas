const BaseAIProvider = require('./baseProvider');

class OpenAICompatibleProvider extends BaseAIProvider {
  constructor({ apiKey, baseUrl = 'https://api.openai.com/v1', model = 'gpt-4o-mini', providerName = 'OpenAI' }) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.providerName = providerName;
  }

  async generateAdvice(transactions, userQuery) {
    if (!this.apiKey && !this.baseUrl.includes('localhost')) {
      return `⚠️ **Configuração de IA Pendente**: Chave de API para ${this.providerName} não configurada.`;
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
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'Você é Lúmina, um assistente de inteligência financeira pessoal.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || "Sem resposta do provedor de IA.";
    } catch (err) {
      console.error(`${this.providerName} Error:`, err.message);
      return `Erro ao consultar assistente (${this.providerName}): ${err.message}`;
    }
  }

  async generateInsight(transactions) {
    if (!this.apiKey && !this.baseUrl.includes('localhost')) {
      return `Configure a chave de API de ${this.providerName} no .env.`;
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
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'Você é um especialista em análise de finanças pessoais.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
      const data = await response.json();
      return data?.choices?.[0]?.message?.content || "Sem insights no momento.";
    } catch (err) {
      console.error(`${this.providerName} Insight Error:`, err.message);
      return "Não foi possível gerar insights automáticos no momento.";
    }
  }
}

module.exports = OpenAICompatibleProvider;
