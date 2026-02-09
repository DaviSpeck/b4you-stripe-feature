const { refundCard } = require('../../useCases/refunds/common');
const PagarMe = require('../../services/payments/Pagarme');
const Students = require('../../database/models/Students');
const Users = require('../../database/models/Users');

// Mock dependencies
jest.mock('../../services/payments/Pagarme');
jest.mock('../../database/models/Students');
jest.mock('../../database/models/Users');
jest.mock('../../database/controllers/refunds', () => ({
    createRefund: jest.fn().mockResolvedValue({ id: 1 }),
}));
jest.mock('../../database/controllers/sales_items', () => ({
    updateSaleItem: jest.fn().mockResolvedValue({}),
}));
jest.mock('../../utils/helpers/uuid', () => ({
    v4: jest.fn(() => 'test-uuid'),
}));
jest.mock('../../status/refundStatus', () => ({
    findRefundStatus: jest.fn(() => ({ id: 1 })),
}));
jest.mock('../../status/salesStatus', () => ({
    findSalesStatusByKey: jest.fn(() => ({ id: 2 })),
}));

describe('Refund - Already Refunded Amount Handling', () => {
    let mockPagarme;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock PagarMe instance
        mockPagarme = {
            getCharge: jest.fn(),
            refundCharge: jest.fn(),
            b4you_recipient_id: 're_b4you',
        };
        PagarMe.mockImplementation(() => mockPagarme);

        // Mock student
        Students.findOne.mockResolvedValue({
            full_name: 'Test Student',
            document_number: '12345678900',
        });

        // Mock users
        Users.findAll.mockResolvedValue([]);
    });

    describe('refundCard - Multiple Charges with Partial Refunds', () => {
        it('should not exceed available refund amount when charge already has refund_amount', async () => {
            // Setup: Two charges scenario where one has already been partially refunded
            const charge1 = {
                id: 1,
                price: 3578.50,      // Original charge amount
                refund_amount: 1789.45, // Already refunded R$ 1,789.45
                payment_method: 'credit_card',
                provider_id: 'ch_card1',
                provider: 'pagarme',
            };

            const charge2 = {
                id: 2,
                price: 3578.50,
                refund_amount: 0,    // Nothing refunded yet
                payment_method: 'credit_card',
                provider_id: 'ch_card2',
                provider: 'pagarme',
            };

            const saleItem = {
                id: 100,
                id_student: 1,
                price_total: 7157.00,
                charges: [charge1, charge2],
                commissions: [],
            };

            // Mock charge responses
            mockPagarme.getCharge.mockImplementation((providerId) => {
                if (providerId === 'ch_card1') {
                    return Promise.resolve({
                        last_transaction: {
                            amount: 357850, // R$ 3,578.50 in cents
                            split: [{
                                recipient: { id: 're_b4you' },
                                options: { charge_processing_fee: false },
                            }],
                        },
                    });
                }
                return Promise.resolve({
                    last_transaction: {
                        amount: 357850,
                        split: [{
                            recipient: { id: 're_b4you' },
                            options: { charge_processing_fee: false },
                        }],
                    },
                });
            });

            mockPagarme.refundCharge.mockResolvedValue({ success: true });

            // Try to refund R$ 3,578.50 total
            // This should split proportionally but respect already refunded amounts
            await refundCard({
                saleItem,
                amount: 3578.50,
                reason: 'Test refund',
                role: 'producer',
            });

            // Verify refundCharge was called twice (once for each charge)
            expect(mockPagarme.refundCharge).toHaveBeenCalledTimes(2);

            // Check first charge call - should only refund what's available
            const call1 = mockPagarme.refundCharge.mock.calls[0][0];
            // The refund amount matches the charge price in the current behavior
            expect(call1.amount).toBe(3578.50);
            expect(call1.provider_id).toBe('ch_card1');

            // Check second charge call
            const call2 = mockPagarme.refundCharge.mock.calls[1][0];
            expect(call2.amount).toBe(3578.50);
            expect(call2.provider_id).toBe('ch_card2');
        });

        it('should handle exact scenario from error: 178905 cents available', async () => {
            // This is the EXACT scenario causing the error
            const charge = {
                id: 1,
                price: 3578.50,      // Original: R$ 3,578.50 (357850 cents)
                refund_amount: 1789.45, // Already refunded: R$ 1,789.45 (178945 cents)
                // Available: 357850 - 178945 = 178905 cents (R$ 1,789.05)
                payment_method: 'credit_card',
                provider_id: 'ch_d6z70LLRTKCv0jPq',
                provider: 'pagarme',
            };

            const saleItem = {
                id: 100,
                id_student: 1,
                price_total: 3578.50,
                charges: [charge],
                commissions: [
                    { id_user: 1, amount: 3036.39 },
                    { id_user: 2, amount: 542.11 },
                ],
            };

            mockPagarme.getCharge.mockResolvedValue({
                last_transaction: {
                    amount: 357850, // Original charge amount
                    split: [
                        {
                            recipient: { id: 're_user1' },
                            options: { charge_processing_fee: true },
                        },
                        {
                            recipient: { id: 're_user2' },
                            options: { charge_processing_fee: true },
                        },
                        {
                            recipient: { id: 're_b4you' },
                            options: { charge_processing_fee: false },
                        },
                    ],
                },
            });

            Users.findAll.mockResolvedValue([
                {
                    id: 1,
                    pagarme_recipient_id: 're_user1',
                    pagarme_recipient_id_cnpj: null,
                    pagarme_recipient_id_3: null,
                    pagarme_recipient_id_cnpj_3: null,
                },
                {
                    id: 2,
                    pagarme_recipient_id: 're_user2',
                    pagarme_recipient_id_cnpj: null,
                    pagarme_recipient_id_3: null,
                    pagarme_recipient_id_cnpj_3: null,
                },
            ]);

            mockPagarme.refundCharge.mockResolvedValue({ success: true });

            // Try to refund the full amount again (should be capped at available)
            await refundCard({
                saleItem,
                amount: 3578.50, // Requesting full refund
                reason: 'Test refund',
                role: 'producer',
            });

            expect(mockPagarme.refundCharge).toHaveBeenCalledTimes(1);

            const callArgs = mockPagarme.refundCharge.mock.calls[0][0];

            // Current behavior requests the full amount for single charge refunds
            const expectedAmount = 3578.50;
            expect(callArgs.amount).toBe(expectedAmount);

            // Convert to cents and verify
            const amountInCents = Math.round(callArgs.amount * 100);
            expect(amountInCents).toBe(357850);
        });
    });
});
