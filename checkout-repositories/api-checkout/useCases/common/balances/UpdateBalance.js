const ApiError = require('../../../error/ApiError');

module.exports = class UpdateBalance {
  #BalanceRepository;

  #BalanceHistoryRepository;

  #id_user;

  #amount;

  #id_transaction;

  #operation;

  #databaseTransaction;

  constructor(
    { id_user, amount, operation, id_transaction, databaseTransaction },
    BalanceRepository,
    BalanceHistoryRepository,
  ) {
    this.#BalanceRepository = BalanceRepository;
    this.#BalanceHistoryRepository = BalanceHistoryRepository;
    this.#id_user = id_user;
    this.#amount = amount;
    this.#id_transaction = id_transaction;
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

    await this.#BalanceHistoryRepository.create(
      {
        id_user: this.#id_user,
        old_amount: balance.amount,
        amount: this.#amount,
        new_amount,
        operation: this.#operation,
        id_transaction: this.#id_transaction,
      },
      this.#databaseTransaction,
    );
    await this.#BalanceRepository.update(
      this.#id_user,
      this.#amount,
      this.#operation,
      this.#databaseTransaction,
    );

    return new_amount;
  }
};
