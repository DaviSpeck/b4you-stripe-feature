const { QueryTypes } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const { capitalizeName } = require('../../utils/formatters');

module.exports = class FindRefundAverage {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({ start_date, end_date, page, size }) {
    const producerAverageSales =
      await this.SalesItemsRepository.averageProducerSales(
        start_date,
        end_date,
        page,
        size,
      );
    const producerSales = producerAverageSales.rows.map(
      ({
        total,
        product: {
          producer: { full_name, uuid, profile_picture },
        },
      }) => ({
        total,
        full_name: capitalizeName(full_name),
        uuid,
        profile_picture,
      }),
    );
    return { rows: producerSales, count: producerAverageSales.count };
  }

  async executeWithSQL({ start_date, end_date, page, size }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);
      const results = await SalesItems.sequelize.query(
        `
        SELECT 
          u.id as producer_id,
          u.uuid as producer_uuid,
          u.full_name as producer_full_name,
          u.profile_picture as producer_profile_picture,
          COUNT(DISTINCT si.id) as total_sales,
          COALESCE(SUM(si.price_total), 0) as total_revenue,
          COALESCE(AVG(si.price_total), 0) as average_sale_value,
          MAX(si.created_at) as last_sale_date
        FROM sales_items si
        INNER JOIN products p ON si.id_product = p.id
        INNER JOIN users u ON p.id_user = u.id
        WHERE si.id_status = 2
        AND si.created_at BETWEEN :start_date AND :end_date
        GROUP BY u.id, u.uuid, u.full_name, u.profile_picture
        ORDER BY total_revenue DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            start_date,
            end_date,
            limit,
            offset,
          },
        },
      );

      const countResult = await SalesItems.sequelize.query(
        `
        SELECT COUNT(DISTINCT u.id) as total
        FROM sales_items si
        INNER JOIN products p ON si.id_product = p.id
        INNER JOIN users u ON p.id_user = u.id
        WHERE si.id_status = 2
        AND si.created_at BETWEEN :start_date AND :end_date
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            start_date,
            end_date,
          },
        },
      );

      const total = countResult[0]?.total || 0;

      const formattedResults = results.map((row) => ({
        total: row.total_revenue,
        full_name: capitalizeName(row.producer_full_name),
        uuid: row.producer_uuid,
        profile_picture: row.producer_profile_picture,
        statistics: {
          total_sales: row.total_sales,
          average_sale_value: row.average_sale_value,
          last_sale_date: row.last_sale_date,
        },
      }));

      return {
        rows: formattedResults,
        count: total,
      };
    } catch (error) {
      console.error('Erro ao buscar vendas médias com SQL direto:', error);
      throw error;
    }
  }
};
