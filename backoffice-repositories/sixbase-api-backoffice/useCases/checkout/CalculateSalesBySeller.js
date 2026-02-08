const { fn, col, literal } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class CalculateSalesBySeller {
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
          [col('sale.id_user'), 'seller_id'],
          [fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'total_count'],
          [
            fn(
              'COALESCE',
              col('sale.user.full_name'),
              fn(
                'NULLIF',
                fn(
                  'CONCAT',
                  fn('COALESCE', col('sale.user.first_name'), ''),
                  ' ',
                  fn('COALESCE', col('sale.user.last_name'), '')
                ),
                ' '
              ),
              literal("CONCAT('Vendedor ', sale.id_user)")
            ),
            'user_name',
          ],
        ],
        include: [
          {
            association: 'sale',
            attributes: [],
            required: true,
            where: Object.keys(salesWhere).length ? salesWhere : undefined,
            include: [
              {
                association: 'user',
                attributes: [],
              },
            ],
          },
        ],
        group: ['sale.id_user', 'sale.user.full_name', 'sale.user.first_name', 'sale.user.last_name'],
        order: [[fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'DESC']],
      });

      const salesBySeller = {};
      rows.forEach((row) => {
        const sellerId = String(row.seller_id);
        if (!sellerId) return;

        salesBySeller[sellerId] = {
          user_name: row.user_name,
          total_count: Number(row.total_count || 0),
        };
      });

      return salesBySeller;
    } catch (error) {
      console.error('Erro ao calcular vendas por vendedor com Sequelize:', error);
      return {};
    }
  }
};