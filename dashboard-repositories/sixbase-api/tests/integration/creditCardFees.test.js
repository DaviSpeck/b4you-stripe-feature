const CostCentralMemoryRepository = require('../../repositories/memory/CostCentralRepository');
const TaxesMemoryRepository = require('../../repositories/memory/TaxesRepository');
const CreditCardFees = require('../../useCases/checkout/fees/CreditCardFees');

describe('Testing credit card fees class and method', () => {
  it('should calculate credit card fees with interests on student', async () => {
    const price = 100;

    const settings = {
      id: 4,
      fee_fixed_billet: 2,
      fee_fixed_card: 0,
      fee_fixed_pix: 2,
      release_billet: 10,
      release_credit_card: 10,
      release_pix: 10,
      fee_interest_card: {
        student_fees: [
          { brand: 'visa', monthly_installment_interest: 2.89 },
          { brand: 'master', monthly_installment_interest: 2.89 },
          { brand: 'amex', monthly_installment_interest: 2.89 },
          { brand: 'elo', monthly_installment_interest: 2.89 },
          { brand: 'diners', monthly_installment_interest: 2.89 },
          { brand: 'hiper', monthly_installment_interest: 2.89 },
        ],
        producer_fees: [
          { brand: 'visa', monthly_installment_interest: 2.99 },
          { brand: 'master', monthly_installment_interest: 2.89 },
          { brand: 'amex', monthly_installment_interest: 2.89 },
          { brand: 'elo', monthly_installment_interest: 2.89 },
          { brand: 'diners', monthly_installment_interest: 2.89 },
          { brand: 'hiper', monthly_installment_interest: 2.89 },
        ],
      },
      fee_variable_pix: 0,
      fee_variable_billet: 0,
      fee_variable_percentage_service: 6,
      fee_fixed_amount_service: 2,
    };

    const ccFees = new CreditCardFees({
      fees: await CostCentralMemoryRepository.find(),
      taxes: await TaxesMemoryRepository.find(),
      settings,
      price,
      brand: 'visa',
      installments: 12,
      student_pays_interest: true,
      sales_items: [
        { price: 90, type: 1 },
        { price: 50, type: 3 },
      ],
      discount: 20,
    }).execute();

    const [cost, ...main] = ccFees;

    expect(cost.price_total).toBe(134.16);
    expect(
      main.reduce((acc, { price_total }) => {
        acc += price_total;
        return acc;
      }, 0),
    ).toBe(cost.price_total);
  });
});
