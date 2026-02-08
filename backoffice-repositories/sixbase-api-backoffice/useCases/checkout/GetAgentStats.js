const Sales = require('../../database/models/Sales');
const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');
const { parseUserAgent } = require('../../utils/parseUserAgent');

module.exports = class GetAgentStats {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ where, saleWhere }) {
    try {
      const salesWhere = CheckoutFilters.createSalesFiltersSequelize(saleWhere);
      const salesItemsWhere = CheckoutFilters.createBaseFiltersSequelize(where);

      const sales = await Sales.findAll({
        raw: true,
        attributes: ['params'],
        where: Object.keys(salesWhere).length ? salesWhere : undefined,
        include: [
          {
            model: SalesItems,
            as: 'products',
            attributes: [],
            required: true,
            where: Object.keys(salesItemsWhere).length
              ? salesItemsWhere
              : undefined,
          },
        ],
      });

      const agentStatsRows = sales.map((sale) => {
        const params = sale.params || {};
        const agentData = parseUserAgent(params);
        return agentData;
      });

      return this.processAgentStats(agentStatsRows);
    } catch (error) {
      console.error('Erro ao buscar agent stats via Sales params:', error);
      return this.getEmptyStats();
    }
  }

  processAgentStats(rows) {
    const stats = { devices: {}, browsers: {}, os: {}, origins: {} };

    const normalize = (val) => {
      if (!val || val === 'unknown' || val === 'Indefinido')
        return 'Indefinido';
      return String(val).trim();
    };

    rows.forEach((row) => {
      const device = normalize(row.device);
      const browser = normalize(row.browser);
      const os = normalize(row.os);
      const origin = normalize(row.origin);

      stats.devices[device] = (stats.devices[device] || 0) + 1;
      stats.browsers[browser] = (stats.browsers[browser] || 0) + 1;
      stats.os[os] = (stats.os[os] || 0) + 1;
      stats.origins[origin] = (stats.origins[origin] || 0) + 1;
    });

    return stats;
  }

  getEmptyStats() {
    return {
      devices: { Indefinido: 0 },
      browsers: { Indefinido: 0 },
      os: { Indefinido: 0 },
      origins: { Indefinido: 0 },
    };
  }
};