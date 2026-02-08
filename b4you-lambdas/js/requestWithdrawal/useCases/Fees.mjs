export class Fees {
  constructor({
    fees: { psp_fixed_cost, psp_variable_cost }, // custo fixo e variável do PSP
    settings: {
      fee_fixed_method, // taxa da six do meio de pagamento (fixa)
      fee_variable_method, // taxa da six do meio de pagamento (percentual)
      fee_variable_percentage_service, // tarifa de serviço percentual
      fee_fixed_amount_service, // tarifa de serviço fixa
    },
    taxes: { tax_variable_percentage },
    price,
    brand,
    installments,
    student_pays_interest,
    sales_items,
    discount = 0,
  }) {
    this.psp_cost_variable_percentage = psp_variable_cost; // custo % do PSP
    this.psp_cost_fixed_amount = psp_fixed_cost; // custo fixo do PSP
    this.fee_fixed_method = fee_fixed_method;
    this.fee_variable_method = brand
      ? fee_variable_method.monthly_installment_interest
      : fee_variable_method;
    this.fee_variable_percentage_service = fee_variable_percentage_service; // tarifa variavel
    this.fee_fixed_amount_service = fee_fixed_amount_service; // tarifa fixa
    this.tax_fee_percentage = tax_variable_percentage; // % de imposto sobre tarifa
    this.tax_interest_percentage = tax_variable_percentage; // % de imposto sobre juros
    this.price_product = price; // preço do produto
    this.student_pays_interest = student_pays_interest;
    this.installments = installments; // parcelas
    this.brand = brand; // bandeira do cartão
    this.sales_items = sales_items; // itens de venda - array de objetos { price, type, subscription_fee }
    this.discount = discount;
  }

  static withdrawal({
    amount,
    psp_cost_fixed_amount,
    psp_cost_variable_percentage,
    fee_fixed_method,
    fee_variable_method,
    tax_variable_percentage,
  }) {
    const withdrawal_amount = amount;
    const psp_cost_variable_amount = withdrawal_amount * (psp_cost_variable_percentage / 100);
    const psp_cost_total = psp_cost_variable_amount + psp_cost_fixed_amount;
    const interest_installment_percentage = 0;
    const interest_installment_amount = 0;
    const fee_variable_percentage_amount = withdrawal_amount * (fee_variable_method / 100);
    const fee_fixed_amount = fee_fixed_method;
    const fee_total = fee_variable_percentage_amount + fee_fixed_amount;
    const revenue = fee_total;
    const withdrawal_total = withdrawal_amount + fee_total;
    const user_gross_amount = 0;
    const user_net_amount = 0;
    const company_gross_profit_amount = fee_total - psp_cost_total;
    const tax_fee_total = fee_total * (tax_variable_percentage / 100);
    const tax_interest_total = 0;
    const tax_total = tax_fee_total + tax_interest_total;
    const company_net_profit_amount = company_gross_profit_amount - tax_total;
    const spread_over_price_product = 0;
    const spread_over_price_total = 0;

    return {
      withdrawal_amount,
      withdrawal_total,
      price_product: 0,
      price_total: 0,
      price_base: 0,
      psp_cost_variable_percentage,
      psp_cost_variable_amount,
      psp_cost_fixed_amount,
      psp_cost_total,
      revenue,
      interest_installment_percentage,
      interest_installment_amount,
      fee_variable_percentage: fee_variable_method,
      fee_variable_percentage_amount,
      fee_fixed_amount,
      fee_total,
      user_gross_amount,
      user_net_amount,
      company_gross_profit_amount,
      tax_fee_percentage: tax_variable_percentage,
      tax_fee_total,
      tax_interest_percentage: 0,
      tax_interest_total: 0,
      tax_total,
      company_net_profit_amount,
      spread_over_price_product,
      spread_over_price_total,
      installments: 1,
      monthly_installment_interest: 0,
      card_brand: null,
      type: 1,
    };
  }
}
