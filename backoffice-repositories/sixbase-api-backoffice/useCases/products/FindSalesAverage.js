module.exports = class FindRefundAverage {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ start_date, end_date, page, size }) {
    const productSales = await this.SalesItemsRepository.averageSales(
      start_date,
      end_date,
      page,
      size,
    );
    return {
      rows: productSales.rows,
      count: productSales.count,
    };
  }
};
