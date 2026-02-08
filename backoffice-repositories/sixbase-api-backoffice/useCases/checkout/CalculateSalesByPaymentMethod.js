const { fn, col, literal } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class CalculateSalesByPaymentMethod {
    constructor(SalesItemsRepository) {
        this.SalesItemsRepository = SalesItemsRepository;
    }

    async execute({ where, saleWhere }) {
        try {
            const { salesItemsWhere, salesWhere } =
                CheckoutFilters.createAllFiltersSequelize(where, saleWhere);

            const [totals] = await SalesItems.findAll({
                raw: true,
                where: salesItemsWhere,
                attributes: [
                    [fn('COUNT', fn('DISTINCT', col('sales_items.id'))), 'total_items'],
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
            });

            const rows = await SalesItems.findAll({
                raw: true,
                where: salesItemsWhere,
                attributes: [
                    [
                        fn(
                            'COALESCE',
                            fn('NULLIF', col('sales_items.payment_method'), ''),
                            'Indefinido'
                        ),
                        'payment_method',
                    ],
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
                group: [literal('payment_method')],
            });

            const paymentCounts = {};
            rows.forEach((r) => {
                const method = r.payment_method || 'Indefinido';
                const count = Number(r.count || 0);
                const price = Number(r.total_price || 0);

                paymentCounts[method] = { count, total_price: price };
            });

            return {
                totalItems: Number(totals.total_items || 0),
                totalSalesPrice: Number(Number(totals.total_price || 0).toFixed(2)),
                salesMethodsCount: paymentCounts,
                salesMethodsCountSimple: Object.fromEntries(
                    Object.entries(paymentCounts).map(([m, v]) => [m, v.count])
                ),
            };
        } catch (error) {
            console.error(
                'Erro ao calcular vendas por método de pagamento (via Sequelize):',
                error
            );
            return {
                totalItems: 0,
                totalSalesPrice: 0,
                salesMethodsCount: {},
                salesMethodsCountSimple: {},
            };
        }
    }
};