const ApiError = require('../../../error/ApiError');

module.exports = class UpdateBalance {
  #BalanceRepository;

  #id_user;

  #amount;

  #operation;

  #databaseTransaction;

  constructor(
    { id_user, amount, operation, databaseTransaction },
    BalanceRepository,
  ) {
    this.#BalanceRepository = BalanceRepository;
    this.#id_user = id_user;
    this.#amount = amount;
    this.#operation = operation;
    this.#databaseTransaction = databaseTransaction;
  }

  async execute() {
    if (this.#operation !== 'increment' && this.#operation !== 'decrement')
      throw ApiError.badRequest('Operação não permitida');
    const balance = await this.#BalanceRepository.find(this.#id_user);
    if (!balance) throw ApiError.badRequest('Carteira não encontrada');

    let new_amount;
    if (this.#operation === 'increment') {
      new_amount = balance.amount + this.#amount;
    } else {
      new_amount = balance.amount - this.#amount;
    }

    await this.#BalanceRepository.update(
      this.#id_user,
      this.#amount,
      this.#operation,
      this.#databaseTransaction,
    );

    return new_amount;
  }
};
