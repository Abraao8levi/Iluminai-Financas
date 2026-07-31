class BaseAIProvider {
  async generateAdvice(transactions, userQuery) {
    throw new Error('generateAdvice method must be implemented');
  }

  async generateInsight(transactions) {
    throw new Error('generateInsight method must be implemented');
  }
}

module.exports = BaseAIProvider;
