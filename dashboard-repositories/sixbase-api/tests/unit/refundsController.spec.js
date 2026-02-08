const { callbackRefundsController } = require('../../controllers/callbacks/refunds');
const Charges = require('../../database/models/Charges');
const Refunds = require('../../database/models/Refunds');
const Sales_items = require('../../database/models/Sales_items');
const RefundUseCase = require('../../useCases/callbacks/Refund');

jest.mock('../../database/models/Charges');
jest.mock('../../database/models/Refunds');
jest.mock('../../database/models/Sales_items');
jest.mock('../../useCases/callbacks/Refund');
// Mock Sequelize transaction
jest.mock('../../database/models/index', () => ({
    sequelize: {
        transaction: jest.fn((cb) => {
            const t = { afterCommit: jest.fn((fn) => fn()) };
            return cb(t);
        })
    }
}));
jest.mock('../../services/payments/Pagarme', () => class MockPagarme {
        // eslint-disable-next-line class-methods-use-this
        async getCharge() {
            return { status: 'refunded' };
        }
    });
jest.mock('../../queues/aws', () => ({ add: jest.fn() }));
jest.mock('../../status/chargeStatus', () => ({
    chargeStatus: [{}, { id: 2 }], // Mock array for destructuring in controller
    findChargeStatusByKey: () => ({ id: 1 })
}));

describe('Refunds Callback Controller', () => {
    let req; let res; let next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: { data: { id: 'prov_123' }, type: 'charge.refunded' },
            route: { methods: { post: true } }, // Mock route for error handler
            originalUrl: '/callbacks/refunds'
        };
        res = { send: jest.fn(), status: jest.fn().mockReturnThis(), sendStatus: jest.fn() };
        next = jest.fn();
    });

    it('should find refund via Charge -> SaleItems association when direct Refund lookup fails', async () => {
        // Setup: Direct Refund lookup fails
        Refunds.sequelize = { query: jest.fn().mockResolvedValue(null) };


        // Setup: Charge lookup succeeds with associated SaleItems
        const mockCharge = {
            id: 100,
            provider_id: 'prov_123',
            sales_items: [{ id: 50 }]
        };
        Charges.findOne.mockResolvedValue(mockCharge);

        // Setup: Fallback Refund lookup via SaleItem ID succeeds
        const mockRefund = { id: 10, uuid: 'ref_uuid', id_sale_item: 50 };
        Refunds.findOne.mockResolvedValueOnce(mockRefund); // Fallback lookup

        // Setup: SalesItem lookup succeeds
        Sales_items.findOne.mockResolvedValue({
            id: 50,
            id_sale: 999,
            charges: [{
                id: 100,
                provider_id: 'prov_123',
                provider: 'pagarme',
                id_status: 1
            }]
        });


        await callbackRefundsController(req, res, next);

        // Verify Charge was looked up with correct include
        expect(Charges.findOne).toHaveBeenCalledWith(expect.objectContaining({
            where: { provider_id: 'prov_123' },
            include: expect.arrayContaining([
                expect.objectContaining({ association: 'sales_items' })
            ])
        }));

        // Verify Fallback Refund lookup used the sale item ID from the charge
        expect(Refunds.findOne).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ id_sale_item: [50] })
        }));

        // Verify UseCase executed
        expect(RefundUseCase).toHaveBeenCalledWith(expect.objectContaining({
            refund_id: 'ref_uuid',
            charge_id: 100
        }));
    });
});
