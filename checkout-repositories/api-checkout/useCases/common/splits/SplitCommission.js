const logger = require('../../../utils/logger');
const date = require('../../../utils/helpers/date');
const Commission = require('./Commission');
const CalculateCommissionsTransactions = require('./CalculateCommissionsTransactions');

const calculateDateDiffInDays = (dateToDiff) => date().diff(dateToDiff, 'd');

module.exports = class SplitCommission {
  #sale_id;

  #transaction_id;

  #first_charge;

  #TransactionsRepository;

  #BalanceHistoryRepository;

  #BalanceRepository;

  #SalesItemsRepository;

  #SalesItemsTransactionsRepository;

  #DatabaseConfig;

  #dbTransaction;

  constructor(
    { sale_id, transaction_id, first_charge = true },
    TransactionsRepository,
    BalanceHistoryRepository,
    BalanceRepository,
    SalesItemsRepository,
    SalesItemsTransactionsRepository,
    DatabaseConfig,
    dbTransaction,
  ) {
    this.#sale_id = sale_id;
    this.#transaction_id = transaction_id;
    this.#first_charge = first_charge;
    this.#TransactionsRepository = TransactionsRepository;
    this.#BalanceHistoryRepository = BalanceHistoryRepository;
    this.#BalanceRepository = BalanceRepository;
    this.#SalesItemsRepository = SalesItemsRepository;
    this.#SalesItemsTransactionsRepository = SalesItemsTransactionsRepository;
    this.#DatabaseConfig = DatabaseConfig;
    this.#dbTransaction = dbTransaction;
  }

  async execute() {
    const sale_item = await this.#SalesItemsRepository.findToSplit(
      {
        id: this.#sale_id,
      },
      this.#dbTransaction,
    );

    const { affiliate } = sale_item;

    try {
      const transactions = await new CalculateCommissionsTransactions(
        {
          affiliate,
          first_charge: this.#first_charge,
          sale_item,
          transaction_id: this.#transaction_id,
        },
        this.#TransactionsRepository,
        this.#dbTransaction,
      ).execute();
      for await (const transaction of transactions) {
        const dbTransaction = await this.#TransactionsRepository.create(
          transaction,
          this.#dbTransaction,
        );
        await this.#SalesItemsTransactionsRepository.create(
          {
            id_sale_item: sale_item.id,
            id_transaction: dbTransaction.id,
          },
          this.#dbTransaction,
        );
        this.#dbTransaction.afterCommit(async () => {
          if (calculateDateDiffInDays(dbTransaction.release_date) === 0) {
            await new Commission(
              {
                amount: dbTransaction.user_net_amount,
                id_user: dbTransaction.id_user,
                transaction_id: dbTransaction.id,
              },
              this.#BalanceRepository,
              this.#BalanceHistoryRepository,
              this.#TransactionsRepository,
              this.#DatabaseConfig,
            ).pay();
          }
        });
      }
      return transactions;
    } catch (error) {
      logger.error(error);
      return error;
    }
  }
};
