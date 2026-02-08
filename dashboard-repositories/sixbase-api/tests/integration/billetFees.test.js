const BilletFees = require('../../useCases/checkout/fees/BilletFees');
const CostCentralMemoryRepository = require('../../repositories/memory/CostCentralRepository');
const TaxesMemoryRepository = require('../../repositories/memory/TaxesRepository');

describe('Testing billet fees class and method', () => {
  it('should calculate billet fees', async () => {
    const price = 100;
    const settings = {
      id: 4,
      fee_fixed_billet: 0,
      fee_fixed_card: 0,
      fee_fixed_pix: 0,
      release_billet: 10,
      release_credit_card: 10,
      release_pix: 10,
      fee_interest_card: [
        { brand: 'visa', monthly_installment_interest: 2.99 },
        { brand: 'master', monthly_installment_interest: 2.89 },
        { brand: 'amex', monthly_installment_interest: 2.89 },
        { brand: 'elo', monthly_installment_interest: 2.89 },
        { brand: 'diners', monthly_installment_interest: 2.89 },
        { brand: 'hiper', monthly_installment_interest: 2.89 },
      ],
      fee_variable_pix: 0,
      fee_variable_billet: 0,
      fee_variable_percentage_service: 6,
      fee_fixed_amount_service: 2.5,
    };

    const billetFees = new BilletFees({
      fees: await CostCentralMemoryRepository.find(),
      taxes: await TaxesMemoryRepository.find(),
      settings,
      price,
      student_pays_interest: true,
      sales_items: [
        { price: 100, type: 1 },
        { price: 50, type: 2 },
      ],
    }).execute();

    expect(billetFees.length).toBe(3);

    // cost transaction
    const [cost, main, orderBump] = billetFees;

    expect(cost.price_product).toBe(150);
    expect(cost.price_total).toBe(150);
    expect(cost.price_base).toBe(150);
    expect(cost.psp_cost_variable_amount).toBe(0);
    expect(cost.psp_cost_total).toBe(1.49);
    expect(cost.revenue).toBe(148.51);
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
    expect(cost.monthly_installment_interest).toBe(0);

    expect(main.price_product).toBe(100);
    expect(main.price_total).toBe(100);
    expect(main.price_base).toBe(100);
    expect(main.psp_cost_variable_amount).toBe(0);
    expect(main.psp_cost_total).toBe(0);
    expect(main.revenue).toBe(98.51);
    expect(main.interest_installment_amount).toBe(0);
    expect(main.interest_installment_percentage).toBe(0);
    expect(main.fee_variable_percentage_amount).toBe(6);
    expect(main.fee_total).toBe(8.5);
    expect(main.user_gross_amount).toBe(100);
    expect(main.user_net_amount).toBe(91.5);
    expect(main.company_gross_profit_amount).toBeCloseTo(7.01);
    expect(main.tax_fee_total).toBeCloseTo(1.7);
    expect(main.tax_interest_total).toBe(0);
    expect(main.tax_total).toBeCloseTo(1.7);
    expect(main.company_net_profit_amount).toBeCloseTo(5.31);
    expect(main.spread_over_price_product).toBeCloseTo(5.31);
    expect(main.spread_over_price_product).toBeCloseTo(5.31);
    expect(main.monthly_installment_interest).toBe(0);

    expect(orderBump.price_product).toBe(50);
    expect(orderBump.price_total).toBe(50);
    expect(orderBump.price_base).toBe(50);
    expect(orderBump.psp_cost_variable_amount).toBe(0);
    expect(orderBump.psp_cost_total).toBe(0);
    expect(orderBump.revenue).toBe(50);
    expect(orderBump.interest_installment_amount).toBe(0);
    expect(orderBump.interest_installment_percentage).toBe(0);
    expect(orderBump.fee_variable_percentage_amount).toBe(3);
    expect(orderBump.fee_total).toBe(5.5);
    expect(orderBump.user_gross_amount).toBe(50);
    expect(orderBump.user_net_amount).toBe(44.5);
    expect(orderBump.company_gross_profit_amount).toBeCloseTo(5.5);
    expect(orderBump.tax_fee_total).toBeCloseTo(1.1);
    expect(orderBump.tax_interest_total).toBe(0);
    expect(orderBump.tax_total).toBeCloseTo(1.1);
    expect(orderBump.company_net_profit_amount).toBeCloseTo(4.4);
    expect(orderBump.spread_over_price_product).toBeCloseTo(8.8);
    expect(orderBump.spread_over_price_product).toBeCloseTo(8.8);
    expect(orderBump.monthly_installment_interest).toBe(0);
  });
});
