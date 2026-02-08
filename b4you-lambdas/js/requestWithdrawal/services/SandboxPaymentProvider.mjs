import { v4 } from 'uuid';
import { PaymentProvider } from './PaymentProvider.mjs';

/**
 * Implementação sandbox do provedor de pagamento
 * Não faz chamadas reais às adquirentes, apenas simula os comportamentos
 */
export class SandboxPaymentProvider extends PaymentProvider {
  #mockBalances;
  #withdrawalHistory;

  constructor(mockBalances = {}) {
    super();
    // Permite configurar saldos mockados por recipientId
    // Exemplo: { 'recipient_123': 100000 } = R$ 1000.00
    this.#mockBalances = mockBalances;
    this.#withdrawalHistory = [];
  }

  /**
   * Retorna saldo mockado ou saldo padrão de R$ 10.000,00
   * @param {string} recipientId
   * @returns {Promise<number>}
   */
  async getBalance(recipientId) {
    console.log('[SANDBOX] Getting balance for recipient:', recipientId);

    // Retorna saldo configurado ou um valor padrão alto para testes
    const balance = this.#mockBalances[recipientId] ?? 1000000; // R$ 10.000,00

    console.log('[SANDBOX] Balance:', balance / 100);
    return balance;
  }

  /**
   * Simula solicitação de saque sem chamar API externa
   * @param {string} recipientId
   * @param {number} amount
   * @returns {Promise<{id: string, status: string, amount: number}>}
   */
  async requestWithdrawal(recipientId, amount) {
    console.log(
      '[SANDBOX] Requesting withdrawal for recipient:',
      recipientId,
      'amount:',
      amount / 100
    );

    const withdrawalId = v4();
    const withdrawal = {
      id: withdrawalId,
      status: 'pending',
      amount,
      recipientId,
      created_at: new Date().toISOString(),
    };

    this.#withdrawalHistory.push(withdrawal);

    // Simula a resposta da Pagarme
    return {
      id: withdrawalId,
      status: 'pending',
      amount,
      fee: 0,
      type: 'credito_em_conta',
      recipient_id: recipientId,
      created_at: withdrawal.created_at,
    };
  }

  /**
   * Método não utilizado (mantido para compatibilidade com interface)
   * @deprecated Pay42/Iopay foi removido do sistema
   */
  async generatePayout() {
    throw new Error('generatePayout não é mais utilizado - Pay42/Iopay foi removido do sistema');
  }

  /**
   * Retorna histórico de saques (útil para testes)
   * @returns {Array}
   */
  getWithdrawalHistory() {
    return this.#withdrawalHistory;
  }

  /**
   * Limpa histórico (útil para testes)
   */
  clearHistory() {
    this.#withdrawalHistory = [];
  }

  /**
   * Configura saldo para um recipiente específico
   * @param {string} recipientId
   * @param {number} balance - em centavos
   */
  setBalance(recipientId, balance) {
    this.#mockBalances[recipientId] = balance;
  }
}
