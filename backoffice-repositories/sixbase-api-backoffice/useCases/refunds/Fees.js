module.exports = class Fees {
  static refund({
    amount,
    psp_cost_fixed_amount,
    psp_cost_variable_percentage,
    fee_fixed_method,
    fee_variable_method,
    tax_variable_percentage,
  }) {
    const psp_cost_variable_amount =
      amount * (psp_cost_variable_percentage / 100);
    const psp_cost_total = psp_cost_variable_amount + psp_cost_fixed_amount;
    const fee_variable_percentage_amount = amount * (fee_variable_method / 100);
    const fee_fixed_amount = fee_fixed_method;
    const fee_total = fee_variable_percentage_amount + fee_fixed_amount;
    const revenue = fee_total;
    const company_gross_profit_amount = fee_total - psp_cost_total;
    const tax_fee_total = fee_total * (tax_variable_percentage / 100);
    const tax_total = tax_fee_total;
    const company_net_profit_amount = company_gross_profit_amount - tax_total;

    // Transação principal
    return {
      withdrawal_amount: 0,
      withdrawal_total: 0,
      price_product: 0,
      price_total: 0,
      price_base: 0,
      psp_cost_variable_percentage,
      psp_cost_variable_amount,
      psp_cost_fixed_amount,
      psp_cost_total,
      revenue,
      interest_installment_percentage: 0,
      interest_installment_amount: 0,
      fee_variable_percentage: fee_variable_method,
      fee_variable_percentage_amount,
      fee_fixed_amount,
      fee_total,
      user_gross_amount: 0,
      user_net_amount: 0,
      company_gross_profit_amount,
      tax_fee_percentage: tax_variable_percentage,
      tax_fee_total,
      tax_interest_percentage: 0,
      tax_interest_total: 0,
      tax_total,
      company_net_profit_amount,
      spread_over_price_product: 0,
      spread_over_price_total: 0,
      installments: 1,
      monthly_installment_interest: 0,
      card_brand: null,
      type: 8,
    };
  }
};
