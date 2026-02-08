/**
 * Interface abstrata para provedores de pagamento
 * Permite implementações diferentes (Pagarme, Iopay, Sandbox, etc)
 */
export class PaymentProvider {
  /**
   * Obtém o saldo disponível de um recipiente/conta
   * @param {string} recipientId - ID do recipiente
   * @returns {Promise<number>} Saldo em centavos
   */
  async getBalance(recipientId) {
    throw new Error('getBalance must be implemented');
  }

  /**
   * Solicita um saque
   * @param {string} recipientId - ID do recipiente
   * @param {number} amount - Valor em centavos
   * @returns {Promise<{id: string, status?: string}>} Dados da resposta
   */
  async requestWithdrawal(recipientId, amount) {
    throw new Error('requestWithdrawal must be implemented');
  }

  /**
   * Gera um payout via PIX
   * @param {Object} payoutData - Dados do payout
   * @returns {Promise<Object>} Dados da resposta
   */
  async generatePayout(payoutData) {
    throw new Error('generatePayout must be implemented');
  }
}
