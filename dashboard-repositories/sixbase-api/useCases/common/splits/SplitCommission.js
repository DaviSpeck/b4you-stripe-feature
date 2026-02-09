module.exports = class SplitCommission {
  #data;

  #TransactionsRepository;

  #BalanceHistoryRepository;

  #BalanceRepository;

  #SaleItemRepository;

  #SalesItemsTransactionsRepository;

  #DatabaseConfig;

  constructor(
    data,
    TransactionsRepository,
    BalanceHistoryRepository,
    BalanceRepository,
    SaleItemRepository,
    SalesItemsTransactionsRepository,
    DatabaseConfig,
  ) {
    this.#data = data;
    this.#TransactionsRepository = TransactionsRepository;
    this.#BalanceHistoryRepository = BalanceHistoryRepository;
    this.#BalanceRepository = BalanceRepository;
    this.#SaleItemRepository = SaleItemRepository;
    this.#SalesItemsTransactionsRepository = SalesItemsTransactionsRepository;
    this.#DatabaseConfig = DatabaseConfig;
  }

  async execute() {
    try {
      const saleItem = await this.#SaleItemRepository.findToSplit(
        this.#data.sale_id,
      );
      const transaction = await this.#TransactionsRepository.find(
        this.#data.transaction_id,
      );

      const commissionTransaction = await this.#TransactionsRepository.create({
        ...transaction,
        id_sale_item: saleItem?.id,
      });

      await this.#SalesItemsTransactionsRepository.create({
        id_sale_item: saleItem?.id,
        id_transaction: commissionTransaction?.id,
      });

      await this.#BalanceHistoryRepository.create({
        id_user: commissionTransaction?.id_user,
        amount: commissionTransaction?.user_net_amount,
      });

      await this.#BalanceRepository.update({
        id_user: commissionTransaction?.id_user,
        amount: commissionTransaction?.user_net_amount,
      });

      if (this.#DatabaseConfig?.transaction) {
        await this.#DatabaseConfig.transaction(async (t) => t);
      }

      return [commissionTransaction];
    } catch (error) {
      return error;
    }
  }
};
