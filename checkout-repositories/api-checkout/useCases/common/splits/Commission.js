const date = require('../../../utils/helpers/date');
const { DATABASE_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');
const {
  findTransactionStatusByKey,
} = require('../../../status/transactionStatus');
const logger = require('../../../utils/logger');
const UpdateBalance = require('../balances/UpdateBalance');

module.exports = class Commission {
  #id_user;

  #amount;

  #transaction_id;

  #BalanceRepository;

  #BalanceHistoryRepository;

  #TransactionsRepository;

  #DatabaseConfig;

  constructor(
    { id_user, amount, transaction_id },
    BalanceRepository,
    BalanceHistoryRepository,
    TransactionsRepository,
    DatabaseConfig,
  ) {
    this.#id_user = id_user;
    this.#amount = amount;
    this.#transaction_id = transaction_id;
    this.#BalanceRepository = BalanceRepository;
    this.#BalanceHistoryRepository = BalanceHistoryRepository;
    this.#TransactionsRepository = TransactionsRepository;
    this.#DatabaseConfig = DatabaseConfig;
  }

  async pay() {
    const data = {
      id_user: this.#id_user,
      amount: this.#amount,
      id_transaction: this.#transaction_id,
      operation: 'increment',
    };
    logger.info(`PAYING COMMISSION - DATA ${JSON.stringify(data)}`);
    await this.#DatabaseConfig.transaction(async (t) => {
      await new UpdateBalance(
        { ...data, databaseTransaction: t },
        this.#BalanceRepository,
        this.#BalanceHistoryRepository,
      ).execute();
      await this.#TransactionsRepository.update(
        { id: this.#transaction_id },
        {
          released: true,
          id_status: findTransactionStatusByKey('paid').id,
          release_date: date().now().format(DATABASE_DATE_WITHOUT_TIME),
        },
        t,
      );
    });
    logger.info(`PAYING COMMISSION - COMPLETE`);
  }
};
