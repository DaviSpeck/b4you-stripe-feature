module.exports = class FindRefundAverage {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ start_date, end_date }) {
    const productSales = await this.SalesItemsRepository.averageAmount(
      start_date,
      end_date,
    );
    const totalSales = productSales.reduce((acc, { total }) => acc + total, 0);
    return { amount: totalSales };
  }
};
