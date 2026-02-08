const { fn, col } = require('sequelize');
const { rolesTypes } = require('../../types/roles');
const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class CalculateCommissionsByRole {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ where, saleWhere }) {
    try {
      const { salesItemsWhere, salesWhere } =
        CheckoutFilters.createAllFiltersSequelize(where, saleWhere);

      const results = await SalesItems.findAll({
        raw: true,
        where: salesItemsWhere,
        attributes: [
          [col('commissions.id_role'), 'id_role'],
          [fn('SUM', col('commissions.amount')), 'total'],
          [fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'count'],
        ],
        include: [
          {
            association: 'commissions',
            attributes: [],
          },
          {
            association: 'sale',
            attributes: [],
            required: true,
            where: Object.keys(salesWhere).length > 0 ? salesWhere : undefined,
          },
        ],
        group: ['commissions.id_role'],
      });

      const resultMap = new Map();
      results.forEach((row) => {
        resultMap.set(Number(row.id_role), {
          total: Number(row.total || 0),
          count: Number(row.count || 0),
        });
      });

      const commissionsByRole = {};
      rolesTypes.forEach((roleInfo) => {
        const dbData = resultMap.get(roleInfo.id) || { total: 0, count: 0 };
        commissionsByRole[roleInfo.key] = {
          id: roleInfo.id,
          label: roleInfo.label,
          total: dbData.total,
          count: dbData.count,
        };
      });

      return commissionsByRole;
    } catch (error) {
      console.error(
        'Erro ao calcular comissões por role com Sequelize:',
        error,
      );

      const commissionsByRole = {};
      rolesTypes.forEach((roleInfo) => {
        commissionsByRole[roleInfo.key] = {
          id: roleInfo.id,
          label: roleInfo.label,
          total: 0,
          count: 0,
        };
      });
      return commissionsByRole;
    }
  }
};