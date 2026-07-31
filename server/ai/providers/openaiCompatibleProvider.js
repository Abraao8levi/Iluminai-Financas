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

  async parseReceipt(fileBase64, mimeType = 'image/jpeg') {
    if (!this.apiKey && !this.baseUrl.includes('localhost')) {
      throw new Error(`Chave de API para ${this.providerName} não configurada no backend.`);
    }

    const cleanBase64 = fileBase64.startsWith('data:')
      ? fileBase64
      : `data:${mimeType};base64,${fileBase64}`;

    const prompt = `Analise a imagem deste comprovante ou recibo financeiro e extraia as informações em formato JSON estrito, sem textos adicionais ou marcação markdown extra.
Retorne um objeto JSON com as chaves:
- description (string): Nome do estabelecimento ou descrição resumida.
- amount (number): Valor total numérico positivo (ex: 150.50).
- date (string): Data no formato YYYY-MM-DD. Se não encontrar, use a data atual.
- category (string): Categoria sugerida entre: Alimentação, Transporte, Moradia, Entretenimento, Saúde, Restaurante, Salário, Freelance, Investimentos, Outros.
- type (string): "EXPENSE" ou "INCOME".
- accountType (string): "Cartão de Crédito", "Conta Corrente", "PIX" ou "Poupança".`;

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
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: cleanBase64 }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content || '';
      const jsonString = rawText.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonString);
    } catch (err) {
      console.error(`${this.providerName} parseReceipt Error:`, err.message);
      throw new Error(`Falha ao ler comprovante com ${this.providerName}: ${err.message}`);
    }
  }
}

module.exports = OpenAICompatibleProvider;
