const RefundUseCase = require('../../useCases/callbacks/Refund');
const RefundsModel = require('../../database/models/Refunds');
const Charges = require('../../database/models/Charges');
const Commissions = require('../../database/models/Commissions');

// Mocks
jest.mock('../../database/models/Refunds');
jest.mock('../../database/models/Sales_items');
jest.mock('../../database/models/Charges');
jest.mock('../../database/models/Commissions');
jest.mock('../../database/models/ReferralCommissions');
jest.mock('../../database/models/ReferralBalance');
jest.mock('../../database/models/Subscriptions');
jest.mock('../../queues/aws');
jest.mock('../../database/models/index', () => ({
    sequelize: {
        transaction: jest.fn((callback) => callback({
            afterCommit: jest.fn((cb) => cb()),
        })),
    },
}));

jest.mock('../../database/controllers/refunds', () => ({
    updateRefund: jest.fn(),
}));
jest.mock('../../database/controllers/sales_items', () => ({
    updateSaleItem: jest.fn(),
}));
jest.mock('../../database/controllers/student_products', () => ({
    deleteStudentProduct: jest.fn(),
}));
jest.mock('../../database/controllers/charges', () => ({
    updateChargeTransaction: jest.fn(),
}));

jest.mock('../../status/refundStatus', () => ({
    findRefundStatus: () => ({ id: 3 }), // Aceito
    findRefundStatusByKey: () => ({ id: 3 }),
}));
jest.mock('../../status/salesStatus', () => ({
    findSalesStatusByKey: (key) => ({ id: key === 'refunded' ? 99 : 10 }), // Mocked IDs
}));
jest.mock('../../status/chargeStatus', () => ({
    findChargeStatusByKey: (key) => ({ id: key === 'refunded' ? 88 : 77 }), // Mocked IDs
}));
jest.mock('../../status/commissionsStatus', () => ({
    findCommissionsStatus: () => ({ id: 5 }),
}));
jest.mock('../../status/referralCommissionStatus', () => ({
    findReferralCommissionStatus: () => ({ id: 4 }),
}));
jest.mock('../../status/subscriptionsStatus', () => ({
    findSubscriptionStatusByKey: () => ({ id: 2 }),
}));
jest.mock('../../types/integrationRulesTypes', () => ({
    findRulesTypesByKey: () => ({ id: 1 }),
}));
jest.mock('../../services/email/SaleChargeback', () => class MockEmail {
        // eslint-disable-next-line class-methods-use-this
        send() { return Promise.resolve(); }
    });
jest.mock('../../utils/helpers/date', () => () => ({
    subtract: () => ({ format: () => 'date' }),
    format: () => 'date'
}));

const { updateSaleItem } = require('../../database/controllers/sales_items');
const { updateChargeTransaction } = require('../../database/controllers/charges');

describe('RefundUseCase Multi-Charge Logic', () => {
    let refundData;
    let charge1; let charge2;

    beforeEach(() => {
        jest.clearAllMocks();

        charge1 = {
            id: 101,
            price: 10000,
            refund_amount: 0,
            id_status: 77, // Paid
        };
        charge2 = {
            id: 102,
            price: 10000,
            refund_amount: 0,
            id_status: 77, // Paid
        };

        refundData = {
            id: 1,
            id_sale_item: 50,
            uuid: 'refund-uuid',
            student: { id: 1, full_name: 'Test Student', email: 'test@test.com' },
            sale_item: {
                id: 50,
                id_status: 10, // Paid
                price_total: 20000,
                charges: [charge1, charge2],
                commissions: [],
                product: { id: 5, name: 'Test Product', id_user: 1, uuid: 'prod-uuid' },
            },
        };

        RefundsModel.findOne.mockResolvedValue(refundData);
        Charges.increment.mockResolvedValue();
        // No changes needed for UseCase test data as it mocks Refund model directly.
        // I will proceed to create a new test file for the controller.
        Commissions.sequelize = { query: jest.fn().mockResolvedValue({ refund_suppliers: 0 }) };
        Commissions.update.mockResolvedValue();
    });

    it('should mark SaleItem as refunded on the FIRST charge refund', async () => {
        // Setup: Charge 1 is being refunded
        const useCase = new RefundUseCase({
            status: 1, // PAID (callback status)
            refund_id: 'refund-uuid',
            charge_id: 101
        });

        await useCase.execute();

        // Verify Charge 1 was updated
        expect(updateChargeTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ id_status: 88, refund_amount: 10000 }),
            expect.objectContaining({ id: 101 }),
            expect.anything()
        );

        // Verify Sale Item is updated to REFUNDED
        expect(updateSaleItem).toHaveBeenCalledWith(
            expect.objectContaining({ id_status: 99 }), // 99 was our mocked 'refunded' status
            expect.objectContaining({ id: 50 }),
            expect.anything()
        );
    });

    it('should NOT mark SaleItem as refunded AGAIN on the SECOND charge refund', async () => {
        // Charge 2 is being refunded now
        // Explicitly update the mocked return value for this specific test to ensure state is reflected
        const refundedSaleItem = {
            ...refundData.sale_item,
            id_status: 99, // Refunded
            charges: [
                { ...charge1, id_status: 88, refund_amount: 10000 },
                charge2
            ]
        };
        const refundedRefundData = { ...refundData, sale_item: refundedSaleItem };

        RefundsModel.findOne.mockResolvedValue(refundedRefundData);
        const useCase = new RefundUseCase({
            status: 1,
            refund_id: 'refund-uuid',
            charge_id: 102
        });

        await useCase.execute();

        // Verify Charge 2 was updated
        expect(updateChargeTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ id_status: 88, refund_amount: 10000 }),
            expect.objectContaining({ id: 102 }),
            expect.anything()
        );

        // Verify Sale Item update was NOT called again
        expect(updateSaleItem).not.toHaveBeenCalled();
    });

    it('should mark Charge with Partial Refund amount if it is a Single-Charge Cart refund', async () => {
        // Setup: Single Charge for multiple items (Partial Refund scenario)
        // Restoring missing variable definition
        const singleCharge = { ...charge1, id: 201, price: 50000, refund_amount: 0, id_status: 77 };

        // Modify sales item to look like "Cart" (1 Charge, but refund is for specific item value)
        refundData.sale_item.charges = [singleCharge];
        refundData.sale_item.price_total = 15000; // This specific item being refunded is 15000, charge is 50000

        const useCase = new RefundUseCase({
            status: 1,
            refund_id: 'refund-uuid',
            charge_id: 201
        });

        await useCase.execute();

        // Verify Charge was INCREMENTED or UPDATED with correct partial amount

        expect(Charges.increment).toHaveBeenCalledWith('refund_amount', {
            by: 15000,
            where: { id: 201 },
            transaction: expect.anything()
        });

        // Also verify Sale Item IS marked refunded (since this specific item is fully refunded)
        expect(updateSaleItem).toHaveBeenCalled();
    });
});
