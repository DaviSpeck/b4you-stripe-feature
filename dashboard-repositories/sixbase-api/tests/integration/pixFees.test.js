const CostCentralMemoryRepository = require('../../repositories/memory/CostCentralRepository');
const TaxesMemoryRepository = require('../../repositories/memory/TaxesRepository');
const PixFees = require('../../useCases/checkout/fees/PixFees');

describe('Testing pix fees class and method', () => {
  it('should calculate pix fees', async () => {
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

    const taxes = {
      id: 1,
      tax_variable_percentage: 14,
    };

    const pixFees = new PixFees({
      fees: await CostCentralMemoryRepository.find(),
      taxes,
      settings,
      price,
      student_pays_interest: false,
      sales_items: [
        { price: 100, type: 1 },
        { price: 50, type: 2 },
      ],
    }).execute();

    // cost transaction
    const [cost, main, orderBump] = pixFees;

    expect(cost.price_product).toBe(150);
    expect(cost.price_total).toBe(150);
    expect(cost.price_base).toBe(150);
    expect(cost.psp_cost_variable_amount).toBe(1.5);
    expect(cost.psp_cost_total).toBe(1.5);
    expect(cost.revenue).toBe(148.5);
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
    expect(main.revenue).toBe(98.5);
    expect(main.interest_installment_amount).toBe(0);
    expect(main.interest_installment_percentage).toBe(0);
    expect(main.fee_variable_percentage_amount).toBe(6);
    expect(main.fee_total).toBe(8.5);
    expect(main.user_gross_amount).toBe(100);
    expect(main.user_net_amount).toBe(91.5);
    expect(main.company_gross_profit_amount).toBeCloseTo(7);
    expect(main.tax_fee_total).toBeCloseTo(1.19);
    expect(main.tax_interest_total).toBe(0);
    expect(main.tax_total).toBeCloseTo(1.19);
    expect(main.company_net_profit_amount).toBeCloseTo(5.81);
    expect(main.spread_over_price_product).toBeCloseTo(5.81);
    expect(main.spread_over_price_product).toBeCloseTo(5.81);
    expect(main.monthly_installment_interest).toBe(0);
    expect(main.split_price).toBe(100);

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
    expect(orderBump.tax_fee_total).toBeCloseTo(0.77);
    expect(orderBump.tax_interest_total).toBe(0);
    expect(orderBump.tax_total).toBeCloseTo(0.77);
    expect(orderBump.company_net_profit_amount).toBeCloseTo(4.73);
    expect(orderBump.spread_over_price_product).toBeCloseTo(9.46);
    expect(orderBump.spread_over_price_product).toBeCloseTo(9.46);
    expect(orderBump.monthly_installment_interest).toBe(0);
    expect(orderBump.split_price).toBe(50);
  });

  it('should calculate pix fees with 10 percent discount', async () => {
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

    const pixFees = new PixFees({
      fees: await CostCentralMemoryRepository.find(),
      taxes: await TaxesMemoryRepository.find(),
      settings,
      price,
      student_pays_interest: false,
      sales_items: [{ price: 100, type: 1 }],
      discount: 10,
    }).execute();

    // cost transaction
    const [cost, main] = pixFees;

    expect(cost.price_product).toBe(90);
    expect(cost.price_total).toBe(90);
    expect(cost.price_base).toBe(90);
    expect(cost.psp_cost_variable_amount).toBe(0.9);
    expect(cost.psp_cost_total).toBe(0.9);
    expect(cost.revenue).toBe(89.1);
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
    expect(main.price_total).toBe(90);
    expect(main.price_base).toBe(90);
    expect(main.psp_cost_variable_amount).toBe(0);
    expect(main.psp_cost_total).toBe(0);
    expect(main.revenue).toBe(89.1);
    expect(main.interest_installment_amount).toBe(0);
    expect(main.interest_installment_percentage).toBe(0);
    expect(main.fee_variable_percentage_amount).toBeCloseTo(5.399999999);
    expect(main.fee_total).toBeCloseTo(7.899999999);
    expect(main.user_gross_amount).toBe(90);
    expect(main.user_net_amount).toBe(82.1);
    expect(main.company_gross_profit_amount).toBeCloseTo(7);
    expect(main.tax_fee_total).toBeCloseTo(1.58);
    expect(main.tax_interest_total).toBe(0);
    expect(main.tax_total).toBeCloseTo(1.58);
    expect(main.company_net_profit_amount).toBeCloseTo(5.42);
    expect(main.spread_over_price_product).toBeCloseTo(5.42);
    expect(main.spread_over_price_product).toBeCloseTo(5.42);
    expect(main.monthly_installment_interest).toBe(0);
    expect(main.split_price).toBe(90);
  });
});
