const { fn, col, Op } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class CalculateTotalFeeB4you {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ where, saleWhere }) {
    try {
      const { salesItemsWhere, salesWhere } =
        CheckoutFilters.createAllFiltersSequelize(where, saleWhere);

      const row = await SalesItems.findOne({
        raw: true,
        where: Object.keys(salesItemsWhere).length ? salesItemsWhere : undefined,
        attributes: [[fn('SUM', col('sales_items.fee_total')), 'total_fee']],
        include: [
          {
            association: 'sale',
            attributes: [],
            required: true,
            where: Object.keys(salesWhere).length ? salesWhere : undefined,
          },
        ],
      });

      const totalFee = row ? Number(row.total_fee || 0) : 0;

      return { total: Number(totalFee.toFixed(2)) };
    } catch (error) {
      console.error('Erro ao calcular total de fees B4you com Sequelize:', error);
      return { total: 0 };
    }
  }
};