const CostCentralMemoryRepository = require('../../repositories/memory/CostCentralRepository');
const TaxesMemoryRepository = require('../../repositories/memory/TaxesRepository');
const SalesSettingsMemoryRepository = require('../../repositories/memory/SalesSettingsRepository');
const SalesFees = require('../../useCases/checkout/sales/SalesFees');

describe('Testing billet fees class and method', () => {
  it('should calculate billet fees', async () => {
    const salesFees = await new SalesFees(
      CostCentralMemoryRepository,
      SalesSettingsMemoryRepository,
      TaxesMemoryRepository,
    ).calculate({
      installments: 1,
      payment_method: 'billet',
      id_user: 1,
      sales_items: [
        { price: 100, type: 1 },
        { price: 50, type: 2 },
      ],
      student_pays_interest: true,
    });

    expect(salesFees.length).toBe(3);

    // cost transaction
    const [cost, main, orderBump] = salesFees;

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
    expect(main.fee_total).toBe(8);
    expect(main.user_gross_amount).toBe(100);
    expect(main.user_net_amount).toBe(92);
    expect(main.company_gross_profit_amount).toBeCloseTo(6.51);
    expect(main.tax_fee_total).toBeCloseTo(1.6);
    expect(main.tax_interest_total).toBe(0);
    expect(main.tax_total).toBeCloseTo(1.6);
    expect(main.company_net_profit_amount).toBeCloseTo(4.91);
    expect(main.spread_over_price_product).toBeCloseTo(4.91);
    expect(main.spread_over_price_product).toBeCloseTo(4.91);
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
    expect(orderBump.fee_total).toBe(5);
    expect(orderBump.user_gross_amount).toBe(50);
    expect(orderBump.user_net_amount).toBe(45);
    expect(orderBump.company_gross_profit_amount).toBeCloseTo(5);
    expect(orderBump.tax_fee_total).toBeCloseTo(1);
    expect(orderBump.tax_interest_total).toBe(0);
    expect(orderBump.tax_total).toBeCloseTo(1);
    expect(orderBump.company_net_profit_amount).toBeCloseTo(4);
    expect(orderBump.spread_over_price_product).toBeCloseTo(8);
    expect(orderBump.spread_over_price_product).toBeCloseTo(8);
    expect(orderBump.monthly_installment_interest).toBe(0);
  });
});

describe('Testing credit card fees class and method', () => {
  it('should calculate credit card fees with interests on producer', async () => {
    const salesFees = await new SalesFees(
      CostCentralMemoryRepository,
      SalesSettingsMemoryRepository,
      TaxesMemoryRepository,
    ).calculate({
      brand: 'visa',
      installments: 12,
      payment_method: 'card',
      id_user: 1,
      sales_items: [{ price: 100, type: 1 }],
      student_pays_interest: false,
    });

    // cost transaction
    const [cost, main] = salesFees;

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
    expect(cost.monthly_installment_interest).toBe(2.89);

    expect(main.price_product).toBe(100);
    expect(main.price_total).toBe(100);
    expect(main.price_base).toBe(83.45);
    expect(main.psp_cost_variable_amount).toBe(0);
    expect(main.psp_cost_total).toBe(0);
    expect(main.revenue).toBe(89.34);
    expect(main.interest_installment_amount).toBe(16.55);
    expect(main.interest_installment_percentage).toBe(16.55);
    expect(main.fee_variable_percentage_amount).toBe(5.007);
    expect(main.fee_total).toBe(7.007);
    expect(main.user_gross_amount).toBe(83.45);
    expect(main.user_net_amount).toBe(76.443);
    expect(main.company_gross_profit_amount).toBeCloseTo(12.897);
    expect(main.tax_fee_total).toBeCloseTo(1.401);
    expect(main.tax_interest_total).toBeCloseTo(3.31);
    expect(main.tax_total).toBeCloseTo(4.711);
    expect(main.company_net_profit_amount).toBeCloseTo(8.1856);
    expect(main.spread_over_price_product).toBeCloseTo(8.1856);
    expect(main.spread_over_price_product).toBeCloseTo(8.1856);
    expect(main.monthly_installment_interest).toBe(2.89);
    expect(main.split_price).toBeCloseTo(100 - 16.55);
  });

  it('should calculate credit card fees with interests on student', async () => {
    const salesFees = await new SalesFees(
      CostCentralMemoryRepository,
      SalesSettingsMemoryRepository,
      TaxesMemoryRepository,
    ).calculate({
      brand: 'visa',
      installments: 12,
      payment_method: 'card',
      id_user: 1,
      sales_items: [{ price: 100, type: 1 }],
      student_pays_interest: true,
    });

    const [cost, main] = salesFees;

    expect(cost.price_product).toBeCloseTo(119.76, 2);
    expect(cost.price_total).toBeCloseTo(119.76, 2);
    expect(cost.price_base).toBeCloseTo(119.76, 2);
    expect(cost.psp_cost_variable_amount).toBeCloseTo(12.77);
    expect(cost.psp_cost_total).toBeCloseTo(12.77);
    expect(cost.revenue).toBeCloseTo(106.993584);
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
    expect(cost.monthly_installment_interest).toBe(2.89);

    expect(main.price_product).toBe(100);
    expect(main.price_total).toBeCloseTo(119.76, 2);
    expect(main.price_base).toBe(100);
    expect(main.psp_cost_variable_amount).toBeCloseTo(0);
    expect(main.psp_cost_fixed_amount).toBe(0);
    expect(main.psp_cost_total).toBeCloseTo(0);
    expect(main.revenue).toBeCloseTo(107.029);
    expect(main.interest_installment_amount).toBe(19.8);
    expect(main.interest_installment_percentage).toBe(19.8);
    expect(main.fee_variable_percentage_amount).toBe(6);
    expect(main.fee_total).toBe(8);
    expect(main.user_gross_amount).toBe(100);
    expect(main.user_net_amount).toBe(92);
    expect(main.company_gross_profit_amount).toBeCloseTo(15.029);
    expect(main.tax_fee_total).toBeCloseTo(1.6);
    expect(main.tax_interest_total).toBeCloseTo(3.96);
    expect(main.tax_total).toBeCloseTo(5.56);
    expect(main.company_net_profit_amount).toBeCloseTo(9.469);
    expect(main.spread_over_price_product).toBeCloseTo(9.469);
    expect(main.spread_over_price_total).toBeCloseTo(7.9);
    expect(main.installments).toBe(12);
    expect(main.monthly_installment_interest).toBe(2.89);
    expect(main.card_brand).toBe('visa');
    expect(main.split_price).toBe(100);
  });
});

describe('Testing pix fees class and method', () => {
  it('should calculate pix fees', async () => {
    const salesFees = await new SalesFees(
      CostCentralMemoryRepository,
      SalesSettingsMemoryRepository,
      TaxesMemoryRepository,
    ).calculate({
      payment_method: 'pix',
      id_user: 1,
      sales_items: [
        { price: 100, type: 1 },
        { price: 50, type: 2 },
      ],
      student_pays_interest: false,
    });

    // cost transaction
    const [cost, main, orderBump] = salesFees;

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
    expect(main.fee_total).toBe(8);
    expect(main.user_gross_amount).toBe(100);
    expect(main.user_net_amount).toBe(92);
    expect(main.company_gross_profit_amount).toBeCloseTo(6.5);
    expect(main.tax_fee_total).toBeCloseTo(1.6);
    expect(main.tax_interest_total).toBe(0);
    expect(main.tax_total).toBeCloseTo(1.6);
    expect(main.company_net_profit_amount).toBeCloseTo(4.9);
    expect(main.spread_over_price_product).toBeCloseTo(4.9);
    expect(main.spread_over_price_product).toBeCloseTo(4.9);
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
    expect(orderBump.fee_total).toBe(5);
    expect(orderBump.user_gross_amount).toBe(50);
    expect(orderBump.user_net_amount).toBe(45);
    expect(orderBump.company_gross_profit_amount).toBeCloseTo(5);
    expect(orderBump.tax_fee_total).toBeCloseTo(1);
    expect(orderBump.tax_interest_total).toBe(0);
    expect(orderBump.tax_total).toBeCloseTo(1);
    expect(orderBump.company_net_profit_amount).toBeCloseTo(4);
    expect(orderBump.spread_over_price_product).toBeCloseTo(8);
    expect(orderBump.spread_over_price_product).toBeCloseTo(8);
    expect(orderBump.monthly_installment_interest).toBe(0);
    expect(orderBump.split_price).toBe(50);
  });

  it('should calculate pix fees with 10 percent discount', async () => {
    const salesFees = await new SalesFees(
      CostCentralMemoryRepository,
      SalesSettingsMemoryRepository,
      TaxesMemoryRepository,
    ).calculate({
      payment_method: 'pix',
      id_user: 1,
      sales_items: [{ price: 100, type: 1 }],
      student_pays_interest: false,
      discount: 10,
    });

    // cost transaction
    const [cost, main] = salesFees;

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
    expect(main.fee_total).toBeCloseTo(7.3999);
    expect(main.user_gross_amount).toBe(90);
    expect(main.user_net_amount).toBe(82.6);
    expect(main.company_gross_profit_amount).toBeCloseTo(6.5);
    expect(main.tax_fee_total).toBeCloseTo(1.48);
    expect(main.tax_interest_total).toBe(0);
    expect(main.tax_total).toBeCloseTo(1.48);
    expect(main.company_net_profit_amount).toBeCloseTo(5.02);
    expect(main.spread_over_price_product).toBeCloseTo(5.02);
    expect(main.spread_over_price_product).toBeCloseTo(5.02);
    expect(main.monthly_installment_interest).toBe(0);
    expect(main.split_price).toBe(90);
  });

  it('should throw error if payment method is null or undefined', async () => {
    let error = null;
    try {
      await new SalesFees(
        CostCentralMemoryRepository,
        SalesSettingsMemoryRepository,
        TaxesMemoryRepository,
      ).calculate({
        id_user: 1,
        sales_items: [{ price: 100, type: 1 }],
        student_pays_interest: false,
        discount: 10,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('payment method is not defined');
  });
});
