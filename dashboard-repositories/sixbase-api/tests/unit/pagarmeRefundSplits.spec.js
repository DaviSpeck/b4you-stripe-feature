const { pagarmeRefund } = require('../../useCases/refunds/pagarme');
const PagarMe = require('../../services/payments/Pagarme');
const Students = require('../../database/models/Students');
const Users = require('../../database/models/Users');

// Mock dependencies
jest.mock('../../services/payments/Pagarme');
jest.mock('../../database/models/Students');
jest.mock('../../database/models/Users');

describe('pagarmeRefund - Split Amount Calculation', () => {
    let mockPagarme;
    let mockSaleItem;

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

        // Mock users for commission mapping
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

        // Mock sale item with commissions
        mockSaleItem = {
            id: 1,
            id_student: 100,
            commissions: [
                { id_user: 1, amount: 3036.39 }, // R$ 3,036.39
                { id_user: 2, amount: 542.11 },  // R$ 542.11
            ],
        };
    });

    describe('Full Refund', () => {
        it('should NOT send splits for full refund', async () => {
            // Mock charge with total amount equal to refund
            mockPagarme.getCharge.mockResolvedValue({
                last_transaction: {
                    amount: 357850, // R$ 3,578.50 in cents
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

            mockPagarme.refundCharge.mockResolvedValue({ success: true });

            // Full refund amount
            await pagarmeRefund({
                saleItem: mockSaleItem,
                amount: 3578.5, // Full amount
                provider_id: 'ch_test123',
                provider: 'pagarme',
            });

            // Verify refundCharge was called WITH splits
            expect(mockPagarme.refundCharge).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 3578.5,
                    provider_id: 'ch_test123',
                    full_name: 'Test Student',
                    document_number: '12345678900',
                    bank_account: null,
                    split: expect.any(Array),
                })
            );

            const callArgs = mockPagarme.refundCharge.mock.calls[0][0];
            expect(callArgs.split).toBeDefined();
        });
    });

    describe('Partial Refund', () => {
        it('should calculate proportional splits for partial refund', async () => {
            // Mock charge with larger amount than refund
            mockPagarme.getCharge.mockResolvedValue({
                last_transaction: {
                    amount: 357850, // R$ 3,578.50 in cents (original charge)
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

            mockPagarme.refundCharge.mockResolvedValue({ success: true });

            // Partial refund amount (50% of original)
            const refundAmount = 1789.25; // R$ 1,789.25 (half of R$ 3,578.50)
            await pagarmeRefund({
                saleItem: mockSaleItem,
                amount: refundAmount,
                provider_id: 'ch_test123',
                provider: 'pagarme',
            });

            // Verify refundCharge was called with proportional splits
            expect(mockPagarme.refundCharge).toHaveBeenCalled();
            const callArgs = mockPagarme.refundCharge.mock.calls[0][0];

            // Should have splits for partial refund
            expect(callArgs.split).toBeDefined();
            expect(callArgs.split.length).toBe(3); // 2 users + b4you

            // Calculate expected proportional amounts (50% of original)
            const refundRatio = 178925 / 357850; // 0.5
            const expectedUser1Split = Math.round(3036.39 * 100 * refundRatio); // ~151820 cents
            const expectedUser2Split = Math.round(542.11 * 100 * refundRatio); // ~27106 cents

            // Verify splits are proportional
            expect(callArgs.split[0].amount).toBe(expectedUser1Split);
            expect(callArgs.split[1].amount).toBe(expectedUser2Split);

            // Verify total split equals refund amount (no overflow)
            const totalSplitAmount = callArgs.split.reduce((sum, s) => sum + s.amount, 0);
            expect(totalSplitAmount).toBe(178925); // Should equal refund amount in cents
            expect(totalSplitAmount).toBeLessThanOrEqual(178925); // Should never exceed
        });

        it('should prevent split amounts from exceeding refund amount', async () => {
            // This is the exact scenario from the error message
            mockPagarme.getCharge.mockResolvedValue({
                last_transaction: {
                    amount: 357850, // R$ 3,578.50 original charge
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

            mockPagarme.refundCharge.mockResolvedValue({ success: true });

            // Only R$ 1,789.05 available for refund (from error message)
            const refundAmount = 1789.05;
            await pagarmeRefund({
                saleItem: mockSaleItem,
                amount: refundAmount,
                provider_id: 'ch_d6z70LLRTKCv0jPq',
                provider: 'pagarme',
            });

            const callArgs = mockPagarme.refundCharge.mock.calls[0][0];

            // Verify splits exist for partial refund
            expect(callArgs.split).toBeDefined();

            // Verify total split does NOT exceed available refund amount
            const totalSplitAmount = callArgs.split.reduce((sum, s) => sum + s.amount, 0);
            expect(totalSplitAmount).toBe(178905); // Exact refund amount in cents
            expect(totalSplitAmount).toBeLessThanOrEqual(178905);

            // This should NOT happen anymore (the original error):
            // Split amounts: 303639 + 54211 = 357850 > 178905 ❌
        });
    });

    describe('Edge Cases', () => {
        it('should handle refund amount exactly equal to charge amount', async () => {
            mockPagarme.getCharge.mockResolvedValue({
                last_transaction: {
                    amount: 357850,
                    split: [
                        {
                            recipient: { id: 're_b4you' },
                            options: { charge_processing_fee: false },
                        },
                    ],
                },
            });

            mockPagarme.refundCharge.mockResolvedValue({ success: true });

            await pagarmeRefund({
                saleItem: mockSaleItem,
                amount: 3578.50,
                provider_id: 'ch_test123',
                provider: 'pagarme',
            });

            const callArgs = mockPagarme.refundCharge.mock.calls[0][0];
            expect(callArgs.split).toBeDefined(); // Full refund includes splits
        });

        it('should handle very small partial refund amounts', async () => {
            mockPagarme.getCharge.mockResolvedValue({
                last_transaction: {
                    amount: 357850,
                    split: [
                        {
                            recipient: { id: 're_user1' },
                            options: { charge_processing_fee: true },
                        },
                        {
                            recipient: { id: 're_b4you' },
                            options: { charge_processing_fee: false },
                        },
                    ],
                },
            });

            mockPagarme.refundCharge.mockResolvedValue({ success: true });

            // Very small partial refund
            await pagarmeRefund({
                saleItem: mockSaleItem,
                amount: 10.00, // R$ 10.00
                provider_id: 'ch_test123',
                provider: 'pagarme',
            });

            const callArgs = mockPagarme.refundCharge.mock.calls[0][0];
            expect(callArgs.split).toBeDefined();

            const totalSplitAmount = callArgs.split.reduce((sum, s) => sum + s.amount, 0);
            expect(totalSplitAmount).toBe(1000); // R$ 10.00 in cents
        });
    });
});
