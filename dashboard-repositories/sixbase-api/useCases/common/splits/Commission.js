const logger = require('../../../utils/logger');
const UpdateBalance = require('../balances/UpdateBalance');
const Commissions = require('../../../database/models/Commissions');

module.exports = class Commission {
  #id_user;

  #id;

  #amount;

  #BalanceRepository;

  #DatabaseConfig;

  constructor({ id, id_user, amount }, BalanceRepository, DatabaseConfig) {
    this.#id_user = id_user;
    this.#amount = amount;
    this.#BalanceRepository = BalanceRepository;
    this.#DatabaseConfig = DatabaseConfig;
    this.#id = id;
  }

  async pay() {
    const data = {
      id_user: this.#id_user,
      amount: this.#amount,
      operation: 'increment',
    };
    logger.info(`PAYING COMMISSION - DATA ${JSON.stringify(data)}`);
    await this.#DatabaseConfig.transaction(async (t) => {
      await Commissions.update({ id_status: 3 }, { where: { id: this.#id } });
      await new UpdateBalance(
        { ...data, databaseTransaction: t },
        this.#BalanceRepository,
      ).execute();
    });
    logger.info(`PAYING COMMISSION - COMPLETE`);
  }
};
