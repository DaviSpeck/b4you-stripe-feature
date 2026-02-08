const Fees = require('./Fees');

module.exports = class BilletFees {
  constructor({
    fees,
    taxes,
    settings,
    student_pays_interest,
    sales_items,
    discount,
    coupon_discount = 0,
  }) {
    this.fees = fees;
    this.taxes = taxes;
    this.settings = settings;
    this.student_pays_interest = student_pays_interest;
    this.sales_items = sales_items;
    this.discount = discount;
    this.coupon_discount = coupon_discount;
  }

  execute() {
    const { psp_fixed_cost, psp_variable_cost } = this.fees.find(
      (fee) => fee.method === 'BILLET',
    );
    const {
      fee_fixed_billet: fee_fixed_method,
      fee_variable_billet: fee_variable_method,
      fee_variable_percentage_service,
      fee_fixed_amount_service,
    } = this.settings;

    return new Fees({
      fees: {
        psp_fixed_cost,
        psp_variable_cost,
      },
      settings: {
        fee_fixed_method,
        fee_variable_method,
        fee_variable_percentage_service,
        fee_fixed_amount_service,
      },
      taxes: this.taxes,
      student_pays_interest: this.student_pays_interest,
      installments: 1,
      sales_items: this.sales_items,
      brand: null,
      discount: this.discount,
      coupon_discount: this.coupon_discount,
    }).sale();
  }
};
