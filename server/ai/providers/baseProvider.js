class BaseAIProvider {
  async generateAdvice(transactions, userQuery) {
    throw new Error('generateAdvice method must be implemented');
  }

  async generateInsight(transactions) {
    throw new Error('generateInsight method must be implemented');
  }

  async parseReceipt(fileBase64, mimeType) {
    throw new Error('parseReceipt method must be implemented');
  }
}

module.exports = BaseAIProvider;
