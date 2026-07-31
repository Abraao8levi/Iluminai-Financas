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

  async parseReceipt(fileBase64, mimeType = 'image/jpeg') {
    if (!this.apiKey) {
      throw new Error('Chave do Gemini (GEMINI_API_KEY) não configurada no backend');
    }

    const cleanBase64 = fileBase64.replace(/^data:(.*);base64,/, '');

    const prompt = `Analise a imagem deste comprovante ou recibo financeiro e extraia as informações em formato JSON estrito, sem textos adicionais ou marcação markdown extra.
Retorne um objeto JSON com as chaves:
- description (string): Nome do estabelecimento ou descrição resumida.
- amount (number): Valor total numérico positivo (ex: 150.50).
- date (string): Data no formato YYYY-MM-DD. Se não encontrar, use a data atual.
- category (string): Categoria sugerida entre: Alimentação, Transporte, Moradia, Entretenimento, Saúde, Restaurante, Salário, Freelance, Investimentos, Outros.
- type (string): "EXPENSE" ou "INCOME".
- accountType (string): "Cartão de Crédito", "Conta Corrente", "PIX" ou "Poupança".`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
                    data: cleanBase64
                  }
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
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonString = rawText.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonString);
    } catch (err) {
      console.error('Gemini parseReceipt Error:', err.message);
      throw new Error(`Falha ao ler comprovante com Gemini: ${err.message}`);
    }
  }
}

module.exports = GeminiProvider;
