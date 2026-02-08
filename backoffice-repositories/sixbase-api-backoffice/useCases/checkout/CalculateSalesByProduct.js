const { fn, col } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class CalculateSalesByProduct {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ where, saleWhere, searchTerm, limit = 50 }) {
    try {
      const { salesItemsWhere, productIncludeWhere } =
        CheckoutFilters.createProductFilterSequelize(where);
      const salesWhere = CheckoutFilters.createSalesFiltersSequelize(saleWhere);

      if (searchTerm && searchTerm.trim()) {
        return this.executeProductSearch({
          salesItemsWhere,
          productIncludeWhere,
          salesWhere,
          searchTerm,
          limit,
        });
      }

      const rows = await SalesItems.findAll({
        raw: true,
        where: Object.keys(salesItemsWhere).length
          ? salesItemsWhere
          : undefined,
        attributes: [
          [col('product.id'), 'product_id'],
          [col('product.name'), 'product_name'],
          [fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'total_count'],
        ],
        include: [
          {
            association: 'product',
            attributes: [],
            required: false,
            where: Object.keys(productIncludeWhere).length
              ? productIncludeWhere
              : undefined,
          },
          {
            association: 'sale',
            attributes: [],
            required: true,
            where: Object.keys(salesWhere).length ? salesWhere : undefined,
          },
        ],
        group: ['product.id', 'product.name'],
        order: [[fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'DESC']],
        limit: limit,
        having: fn('COUNT', fn('DISTINCT', col('sales_items.id')), '>=', 1),
      });

      const salesByProduct = {};
      rows.forEach((row) => {
        const productId = String(row.product_id);
        const productName = row.product_name || `Produto ${productId}`;
        salesByProduct[productId] = {
          product_name: productName,
          total_count: Number(row.total_count || 0),
        };
      });

      return salesByProduct;
    } catch (error) {
      console.error(
        'Erro ao calcular vendas por produto com Sequelize:',
        error,
      );
      return {};
    }
  }

  async executeProductSearch({
    salesItemsWhere,
    productIncludeWhere,
    salesWhere,
    searchTerm,
    limit,
  }) {
    try {
      const { Op } = require('sequelize');

      const searchWhere = {
        ...salesItemsWhere,
        [Op.or]: [
          { '$product.name$': { [Op.like]: `%${searchTerm}%` } },
          { '$product.id$': { [Op.like]: `%${searchTerm}%` } },
        ],
      };

      const rows = await SalesItems.findAll({
        raw: true,
        where: Object.keys(searchWhere).length ? searchWhere : undefined,
        attributes: [
          [col('product.id'), 'product_id'],
          [col('product.name'), 'product_name'],
          [fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'total_count'],
        ],
        include: [
          {
            association: 'product',
            attributes: [],
            required: true,
            where: Object.keys(productIncludeWhere).length
              ? productIncludeWhere
              : undefined,
          },
          {
            association: 'sale',
            attributes: [],
            required: true,
            where: Object.keys(salesWhere).length ? salesWhere : undefined,
          },
        ],
        group: ['product.id', 'product.name'],
        order: [[fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'DESC']],
        limit: limit,
      });

      const salesByProduct = {};
      rows.forEach((row) => {
        const productId = String(row.product_id);
        const productName = row.product_name || `Produto ${productId}`;
        salesByProduct[productId] = {
          product_name: productName,
          total_count: Number(row.total_count || 0),
        };
      });

      return salesByProduct;
    } catch (error) {
      console.error('Erro ao buscar produtos específicos:', error);
      return {};
    }
  }
};
