const { Op } = require('sequelize');
const { getMetricsChartController } = require('../../controllers/dashboard/metrics');
// const { findMetrics } = require('../../database/controllers/transactions');
const Commissions = require('../../database/models/Commissions');
const Products = require('../../database/models/Products');

// Mock dependencies
jest.mock('../../database/controllers/transactions');
jest.mock('../../database/models/Commissions', () => ({
    findAll: jest.fn(),
    init: jest.fn().mockReturnThis(),
    associate: jest.fn(),
}));
jest.mock('../../database/models/Products', () => ({
    findAll: jest.fn(),
}));

// Mock other dependencies that might cause issues if not mocked
jest.mock('../../database/controllers/products', () => ({
    findRawUserProducts: jest.fn(),
    findSingleProductWithProducer: jest.fn(),
}));
jest.mock('../../database/controllers/affiliates', () => ({
    findRawProductsAffiliates: jest.fn(),
}));
jest.mock('../../repositories/sequelize/CoproductionsRepository', () => ({
    findAllRaw: jest.fn(),
}));
jest.mock('../../database/models/SalesMetricsDaily', () => ({
    sequelize: { query: jest.fn() },
}));
jest.mock('../../database/models/UsersRevenue', () => ({}));
jest.mock('../../database/models/Sales_items', () => ({
    count: jest.fn(),
}));
jest.mock('../../database/models/UsersTotalCommission', () => ({}));

describe('Metrics Chart Controller (Unit)', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { id: 1 },
            query: {
                start_date: '2023-01-01',
                end_date: '2023-01-31',
            },
            route: { methods: { get: true } },
            originalUrl: '/test',
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return correct chart structure based on Commissions logic (New)', async () => {
        // Mock Commissions.findAll implementation
        Commissions.findAll.mockResolvedValue([
            {
                amount: 100.00,
                sale_item: {
                    paid_at: '2023-01-05T12:00:00Z',
                    id_product: 1,
                    product: {
                        name: 'Test Product',
                        uuid: 'prod-uuid-123',
                        hex_color: '#000000'
                    }
                }
            }
        ]);

        await getMetricsChartController(req, res, next);

        expect(Commissions.findAll).toHaveBeenCalled();
        const callArgs = Commissions.findAll.mock.calls[0][0];

        // Verify Commission where does NOT have id_status
        expect(callArgs.where).toEqual({ id_user: 1 });

        // Verify Sale Item include HAS id_status filter
        const saleItemInclude = callArgs.include.find(i => i.association === 'sale_item');
        expect(saleItemInclude).toBeDefined();
        expect(saleItemInclude.where).toHaveProperty('id_status');
        expect(saleItemInclude.where.id_status).toBeInstanceOf(Array);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();

        const response = res.send.mock.calls[0][0];
        expect(response).toHaveProperty('products');
        expect(response).toHaveProperty('dates');
        expect(response.products).toHaveLength(1);
        expect(response.products[0].name).toBe('Test Product');

        // Verify data correctness
        const dataPoints = response.products[0].data;
        const summedValue = dataPoints.reduce((a, b) => a + b, 0);
        expect(summedValue).toBeCloseTo(100.00);
        expect(summedValue).toBeCloseTo(100.00);
    });

    it('should use optimized query when product_uuid is provided', async () => {

        // Mock Products found
        Products.findAll.mockResolvedValue([{
            id: 99,
            name: 'Optimized Product',
            uuid: 'opt-uuid',
            hex_color: '#ffffff'
        }]);

        // Mock Commissions found
        Commissions.findAll.mockResolvedValue([{
            amount: 50.00,
            id_product: 99,
            sale_item: {
                paid_at: '2023-01-10T12:00:00Z',
                id_product: 99,
                // No product here, it should be mapped
            }
        }]);

        req.query.product_uuid = 'opt-uuid';

        await getMetricsChartController(req, res, next);

        // Verify Products pre-fetch
        expect(Products.findAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { uuid: { [Op.in]: ['opt-uuid'] } }
        }));

        // Verify Commissions query has id_product filter and NO product include
        const callArgs = Commissions.findAll.mock.calls[0][0];

        expect(callArgs.where).toHaveProperty('id_product');

        const saleItemInclude = callArgs.include.find(i => i.association === 'sale_item');
        // Check that sale item include does NOT have nested product include
        expect(saleItemInclude).not.toHaveProperty('include');

        // Verify response mapping
        const response = res.send.mock.calls[0][0];
        expect(response.products[0].name).toBe('Optimized Product');
    });
});
