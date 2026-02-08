module.exports = class FutureReleases {
  #id_user;

  #TransactionsRepository;

  constructor({ id_user }, TransactionsRepository, DatabaseConfig) {
    this.#id_user = id_user;
    this.#TransactionsRepository = TransactionsRepository;
  }

  async execute() {
    const transactions = await this.#TransactionsRepository.findFutureReleases(
      this.#id_user,
    );

    return transactions;
  }
};
