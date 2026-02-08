export class UpdateBalance {
  #BalanceRepository;

  #BalanceHistoryRepository;

  #databaseTransaction;

  constructor(BalanceRepository, BalanceHistoryRepository, dbTransaction) {
    this.#BalanceRepository = BalanceRepository;
    this.#BalanceHistoryRepository = BalanceHistoryRepository;
    this.#databaseTransaction = dbTransaction;
  }

  async execute({ id_user, amount, operation, id_transaction }) {
    if (operation !== 'increment' && operation !== 'decrement')
      throw new Error('Operação não permitida');
    const balance = await this.#BalanceRepository.find(id_user);
    if (!balance) throw new Error('Carteira não encontrada');

    let new_amount;
    if (operation === 'increment') {
      new_amount = balance.amount + amount;
    } else {
      new_amount = balance.amount - amount;
    }

    await this.#BalanceHistoryRepository.create(
      {
        id_user,
        old_amount: balance.amount,
        amount,
        new_amount,
        operation,
        id_transaction,
      },
      this.#databaseTransaction
    );
    await this.#BalanceRepository.update(id_user, amount, operation, this.#databaseTransaction);

    return new_amount;
  }
}
