const GeminiProvider = require('./providers/geminiProvider');
const OpenAICompatibleProvider = require('./providers/openaiCompatibleProvider');

class AIFactory {
  static getProvider() {
    const providerType = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

    switch (providerType) {
      case 'openai':
        return new OpenAICompatibleProvider({
          apiKey: process.env.OPENAI_API_KEY,
          baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          providerName: 'OpenAI'
        });

      case 'groq':
        return new OpenAICompatibleProvider({
          apiKey: process.env.GROQ_API_KEY,
          baseUrl: 'https://api.groq.com/openai/v1',
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          providerName: 'Groq'
        });

      case 'deepseek':
        return new OpenAICompatibleProvider({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseUrl: 'https://api.deepseek.com',
          model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
          providerName: 'DeepSeek'
        });

      case 'ollama':
        return new OpenAICompatibleProvider({
          apiKey: '',
          baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434/v1',
          model: process.env.OLLAMA_MODEL || 'llama3',
          providerName: 'Ollama (Local)'
        });

      case 'gemini':
      default:
        const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        return new GeminiProvider(geminiKey, process.env.GEMINI_MODEL || 'gemini-1.5-flash');
    }
  }

  static getProviderInfo() {
    const providerType = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();
    return {
      provider: providerType,
      active: true
    };
  }
}

module.exports = AIFactory;
