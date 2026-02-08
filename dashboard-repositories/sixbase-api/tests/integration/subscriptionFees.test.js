const CostCentralMemoryRepository = require('../../repositories/memory/CostCentralRepository');
const TaxesMemoryRepository = require('../../repositories/memory/TaxesRepository');
const CreditCardFees = require('../../useCases/checkout/fees/CreditCardFees');

describe('Testing credit card fees class and method', () => {
  it('should calculate subscription fees', async () => {
    const price = 0;
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
          { brand: 'visa', monthly_installment_interest: 2.99 },
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
      fee_fixed_amount_service: 2.5,
    };

    const ccFees = new CreditCardFees({
      fees: await CostCentralMemoryRepository.find(),
      taxes: await TaxesMemoryRepository.find(),
      settings,
      price,
      brand: 'visa',
      installments: 12,
      student_pays_interest: false,
      sales_items: [{ price: 0, type: 1, subscription_fee: 100 }],
    }).execute();

    // cost transaction
    const [cost, main] = ccFees;

    expect(cost.price_product).toBe(100);
    expect(cost.price_total).toBe(100);
    expect(cost.price_base).toBe(100);
    expect(cost.psp_cost_variable_amount).toBe(10.66);
    expect(cost.psp_cost_total).toBe(10.66);
    expect(cost.revenue).toBe(89.34);
    expect(cost.interest_installment_amount).toBe(0);
    expect(cost.interest_installment_percentage).toBe(0);
    expect(cost.fee_variable_percentage_amount).toBe(0);
    expect(cost.fee_total).toBe(0);
    expect(cost.user_gross_amount).toBe(0);
    expect(cost.user_net_amount).toBe(0);
    expect(cost.company_gross_profit_amount).toBeCloseTo(0);
    expect(cost.tax_fee_total).toBeCloseTo(0);
    expect(cost.tax_interest_total).toBe(0);
    expect(cost.tax_total).toBeCloseTo(0);
    expect(cost.company_net_profit_amount).toBeCloseTo(0);
    expect(cost.spread_over_price_product).toBeCloseTo(0);
    expect(cost.spread_over_price_product).toBeCloseTo(0);
    expect(cost.monthly_installment_interest).toBe(2.99);

    expect(main.price_product).toBe(0);
    expect(main.price_total).toBe(100);
    expect(main.price_base).toBe(82.95);
    expect(main.psp_cost_variable_amount).toBe(0);
    expect(main.psp_cost_total).toBe(0);
    expect(main.revenue).toBe(89.34);
    expect(main.interest_installment_amount).toBe(17.05);
    expect(main.interest_installment_percentage).toBe(17.05);
    expect(main.fee_variable_percentage_amount).toBe(4.977);
    expect(main.fee_total).toBe(7.477);
    expect(main.user_gross_amount).toBe(82.95);
    expect(main.user_net_amount).toBe(75.473);
    expect(main.company_gross_profit_amount).toBeCloseTo(13.867);
    expect(main.tax_fee_total).toBeCloseTo(1.4954);
    expect(main.tax_interest_total).toBeCloseTo(3.41);
    expect(main.tax_total).toBeCloseTo(4.9054);
    expect(main.company_net_profit_amount).toBeCloseTo(8.9616);
    expect(main.spread_over_price_product).toBeCloseTo(8.9616);
    expect(main.monthly_installment_interest).toBe(2.99);
    expect(main.split_price).toBeCloseTo(0);
    expect(main.subscription_fee).toBe(100);
  });
});
