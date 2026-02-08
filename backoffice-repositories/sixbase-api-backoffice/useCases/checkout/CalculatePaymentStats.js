const { fn, col, Op } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class CalculatePaymentStats {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ where, saleWhere }) {
    try {
      const { salesItemsWhere, salesWhere } =
        CheckoutFilters.createAllFiltersSequelize(where, saleWhere);

      const convertedStatuses = [2, 4, 5, 6, 8];

      const results = await SalesItems.findAll({
        raw: true,
        where: {
          ...salesItemsWhere,
          id_status: { [Op.in]: convertedStatuses },
        },
        attributes: [
          [col('sales_items.payment_method'), 'payment_method'],
          [fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'count'],
          [fn('SUM', col('sales_items.price_total')), 'total_price'],
        ],
        include: [
          {
            association: 'sale',
            attributes: [],
            required: true,
            where: Object.keys(salesWhere).length > 0 ? salesWhere : undefined,
          },
        ],
        group: ['sales_items.payment_method'],
      });

      const paymentCounts = {};
      let totalConvertedSalesPrice = 0;
      let totalCount = 0;

      results.forEach((row) => {
        const method = row.payment_method || 'Indefinido';
        const count = Number(row.count || 0);
        const total_price = Number(row.total_price || 0);

        paymentCounts[method] = { count, total_price };
        totalConvertedSalesPrice += total_price;
        totalCount += count;
      });

      const conversionRates = {
        total: totalCount,
        converted: totalCount,
        rate: totalCount > 0 ? 100 : 0,
      };

      Object.keys(paymentCounts).forEach((method) => {
        conversionRates[method] =
          totalCount > 0
            ? ((paymentCounts[method].count / totalCount) * 100).toFixed(2)
            : '0.00';
      });

      return {
        totalConvertedSalesPrice: Number(totalConvertedSalesPrice.toFixed(2)),
        salesMethodsCount: paymentCounts,
        salesMethodsCountSimple: Object.fromEntries(
          Object.entries(paymentCounts).map(([key, value]) => [key, value.count]),
        ),
        conversionRates,
      };
    } catch (error) {
      console.error('Erro ao calcular stats de pagamento com Sequelize:', error);
      return {
        totalConvertedSalesPrice: 0,
        salesMethodsCount: {},
        salesMethodsCountSimple: {},
        conversionRates: { total: 0, converted: 0, rate: 0 },
      };
    }
  }
};