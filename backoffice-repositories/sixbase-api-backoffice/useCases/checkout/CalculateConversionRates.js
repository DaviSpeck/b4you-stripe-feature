const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class CalculateConversionRates {
    constructor(SalesItemsRepository) {
        this.SalesItemsRepository = SalesItemsRepository;
    }

    async execute({ where, saleWhere }) {
        try {
            const convertedStatuses = [2, 4, 5, 6, 8];

            const { filters, replacements } = CheckoutFilters.createAllFiltersSQL(where, saleWhere);

            const sql = `
                SELECT 
                sub.payment_method,
                COUNT(*) AS total,
                SUM(sub.is_converted) AS converted
                FROM (
                SELECT 
                    si.id_student,
                    si.id_product,
                    COALESCE(NULLIF(si.payment_method, ''), 'Indefinido') AS payment_method,
                    MAX(CASE WHEN si.id_status IN (${convertedStatuses.join(',')}) THEN 1 ELSE 0 END) AS is_converted
                FROM sales_items si
                INNER JOIN sales s ON si.id_sale = s.id
                WHERE 1=1
                    ${filters}
                GROUP BY si.id_student, si.id_product, si.payment_method
                ) sub
                GROUP BY sub.payment_method
            `;

            const rows = await SalesItems.sequelize.query(sql, {
                type: SalesItems.sequelize.QueryTypes.SELECT,
                replacements,
            });

            let totalAll = 0;
            let totalConverted = 0;
            const byMethodRates = {};

            rows.forEach((row) => {
                const method = row.payment_method || 'Indefinido';
                const total = Number(row.total || 0);
                const converted = Number(row.converted || 0);

                totalAll += total;
                totalConverted += converted;

                byMethodRates[method] =
                    total > 0 ? ((converted / total) * 100).toFixed(2) : '0.00';
            });

            return {
                total: totalAll,
                converted: totalConverted,
                rate: totalAll > 0 ? ((totalConverted / totalAll) * 100).toFixed(2) : '0.00',
                byMethod: byMethodRates,
            };
        } catch (error) {
            console.error('Erro ao calcular taxas de conversão (SQL):', error);
            return {
                total: 0,
                converted: 0,
                rate: '0.00',
                byMethod: {},
            };
        }
    }
};