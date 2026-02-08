const { Op } = require('sequelize');
const { chartMetricsV2, salesV2 } = require('../../controllers/dashboard/metrics');
const Commissions = require('../../database/models/Commissions');
const UsersRevenue = require('../../database/models/UsersRevenue');
const Products = require('../../database/models/Products');

jest.mock('../../database/controllers/transactions');
jest.mock('../../database/models', () => ({}));
jest.mock('../../database/models/Commissions', () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
}));
jest.mock('../../database/models/UsersRevenue', () => ({
    findOne: jest.fn(),
}));
jest.mock('../../database/models/Products', () => ({
    findAll: jest.fn(),
}));
jest.mock('../../database/models/Sales_items', () => ({}));
jest.mock('../../database/models/SalesMetricsDaily', () => ({
    sum: jest.fn(),
    findAll: jest.fn(),
}));

describe('Chart Metrics V2 Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { id: 1 },
            query: {
                start_date: '2023-01-01',
                end_date: '2023-01-10', // Short range => Daily view
            },
            route: { methods: { get: true } }, // Prevent crash in catch block
            originalUrl: '/test'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();

        // Default mock for UsersRevenue (first sale)
        UsersRevenue.findOne.mockResolvedValue({ paid_at: '2022-01-01' });
    });

    it('should aggregate commissions correctly for V2 daily view', async () => {
        // Mock Commissions data for Current Month
        Commissions.findAll.mockResolvedValueOnce([
            { paid_total: 100, time: '2023-01-05' },
            { paid_total: 200, time: '2023-01-06' }
        ]);

        // Mock Commissions data for Last Month (2nd call)
        Commissions.findAll.mockResolvedValueOnce([
            { paid_total: 50, time: '2022-12-05' }
        ]);

        await chartMetricsV2(req, res, next);

        expect(Commissions.findAll).toHaveBeenCalledTimes(2);

        // Verify Date Range (Current Month)
        const currentMonthCallArgs = Commissions.findAll.mock.calls[0][0];
        const whereClause = currentMonthCallArgs.include[0].where;
        const dateRange = whereClause.paid_at[Op.between];

        // Expected: 2023-01-01 00:00:00 + 3h => 2023-01-01 03:00:00
        // Expected: 2023-01-10 23:59:59 + 3h => 2023-01-11 02:59:59
        expect(dateRange[0]).toMatch(/2023-01-01 03:00:00/);
        expect(dateRange[1]).toMatch(/2023-01-11 02:59:59/);

        // Verify response
        const response = res.send.mock.calls[0][0];
        expect(response.total).toBe(300); // 100 + 200
        expect(response.current_month).toContain(100);
        expect(response.current_month).toContain(100);
        expect(response.current_month).toContain(200);
        expect(response.last_month).toBeDefined();
        expect(response.last_month).toContain(50); // Verification of last month mock data
        expect(response.porcentage).toBeDefined();
    });

    it('should use optimized query when product_uuid is provided in V2', async () => {
        // Mock Products
        Products.findAll.mockResolvedValue([{ id: 99 }]);
        req.query.product_uuid = 'uuid-99';

        Commissions.findAll.mockResolvedValue([]); // Empty for simplicity

        await chartMetricsV2(req, res, next);

        // Verify Products looked up
        expect(Products.findAll).toHaveBeenCalled();

        // Verify Commissions query uses id_product filter
        const callArgs = Commissions.findAll.mock.calls[0][0];
        expect(callArgs.where).toHaveProperty('id_product');
        expect(callArgs.where.id_product).toEqual({ [Op.in]: [99] });

        // Verify Include does NOT have Product (optimization)
        const saleItemInclude = callArgs.include.find(i => i.association === 'sale_item');
        expect(saleItemInclude).toBeDefined();
        // Since we didn't include Product in V2 implementation at all, it shouldn't be there.
        // My implementation kept 'sale_item' include but strictly with attributes: []
        expect(saleItemInclude.include).toBeUndefined();
    });

    it('should return correct total/net/gross for salesV2', async () => {
        Commissions.findOne.mockResolvedValue({
            transaction_count: 5,
            net_total: 500.00,
            gross_total: 600.00
        });

        await salesV2(req, res, next);

        expect(Commissions.findOne).toHaveBeenCalled();
        const callArgs = Commissions.findOne.mock.calls[0][0];

        // Verify Date Range
        const whereClause = callArgs.include[0].where;
        const dateRange = whereClause.paid_at[Op.between];

        // Expecting today's date (from test setup check? No, request query not set in test setup?)
        // Ah, in test setup 'start_date' is '2023-01-01'.
        // So expected: 2023-01-01 03:00:00 and 2023-01-10 (from query?) No wait. 
        // In this test 'req' is shared. req.query has start_date: '2023-01-01', end_date: '2023-01-10'.

        expect(dateRange[0]).toMatch(/2023-01-01 03:00:00/);
        expect(dateRange[1]).toMatch(/2023-01-11 02:59:59/);

        expect(callArgs.attributes).toEqual(expect.arrayContaining([
            [expect.anything(), 'transaction_count'],
            [expect.anything(), 'net_total'],
            [
                expect.objectContaining({
                    fn: 'sum',
                    args: expect.arrayContaining([
                        expect.objectContaining({ col: 'sale_item.price' })
                    ])
                }),
                'gross_total'
            ]
        ]));

        const response = res.send.mock.calls[0][0];
        expect(response).toEqual({
            transaction_count: 5,
            net_total: 500.00,
            gross_total: 600.00
        });
    });
});
