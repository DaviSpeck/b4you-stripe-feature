const { findSalesStatusByKey } = require('../../status/salesStatus');

module.exports = class FindRefundAverage {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute(id_product) {
    const sales = await this.SalesItemsRepository.countSales(id_product);
    if (sales.length === 0) return 0;
    const refunded = sales.filter(
      (element) => element.id_status === findSalesStatusByKey('refunded').id,
    ).length;
    const requested = sales.filter(
      (element) =>
        element.id_status === findSalesStatusByKey('request-refund').id,
    ).length;
    const paid = sales.filter(
      (element) => element.id_status === findSalesStatusByKey('paid').id,
    ).length;
    const total = refunded + requested + paid;
    const average = (100 * (refunded + requested)) / total;
    return Number(average.toFixed(2));
  }
};
