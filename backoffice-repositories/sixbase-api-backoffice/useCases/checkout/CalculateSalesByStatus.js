const { fn, col, Op } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class CalculateSalesByStatus {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ where, saleWhere }) {
    try {
      const { salesItemsWhere, salesWhere } =
        CheckoutFilters.createAllFiltersSequelize(where, saleWhere);
        
      const rows = await SalesItems.findAll({
        raw: true,
        where: Object.keys(salesItemsWhere).length ? salesItemsWhere : undefined,
        attributes: [
          [col('sales_items.id_status'), 'status_id'],
          [fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'total_count'],
        ],
        include: [
          {
            association: 'sale',
            attributes: [],
            required: true,
            where: Object.keys(salesWhere).length ? salesWhere : undefined,
          },
        ],
        group: ['sales_items.id_status'],
        order: [[col('sales_items.id_status'), 'ASC']],
      });

      const salesByStatus = {};
      rows.forEach((row) => {
        salesByStatus[String(row.status_id)] = Number(row.total_count || 0);
      });

      return salesByStatus;
    } catch (error) {
      console.error('Erro ao calcular vendas por status com Sequelize:', error);
      return {};
    }
  }
};