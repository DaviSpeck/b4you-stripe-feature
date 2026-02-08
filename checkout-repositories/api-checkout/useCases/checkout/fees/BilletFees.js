const Fees = require('./Fees');

module.exports = class BilletFees {
  constructor({
    fees,
    taxes,
    settings,
    student_pays_interest,
    sales_items,
    discount,
    coupon,
    document_number,
  }) {
    this.fees = fees;
    this.taxes = taxes;
    this.settings = settings;
    this.student_pays_interest = student_pays_interest;
    this.sales_items = sales_items;
    this.discount = discount;
    this.coupon = coupon;
    this.document_number = document_number;
  }

  async execute() {
    const { psp_fixed_cost, psp_variable_cost } = this.fees.find(
      (fee) => fee.method === 'BILLET',
    );
    const { fee_variable_billet_service, fee_fixed_billet_service } =
      this.settings;

    return new Fees({
      fees: {
        psp_fixed_cost,
        psp_variable_cost,
      },
      settings: {
        fee_variable_percentage_service: fee_variable_billet_service,
        fee_fixed_amount_service: fee_fixed_billet_service,
      },
      taxes: this.taxes,
      student_pays_interest: this.student_pays_interest,
      installments: 1,
      sales_items: this.sales_items,
      brand: null,
      discount: this.discount,
      email: this.email,
      document_number: this.document_number,
      coupon: this.coupon,
    }).sale();
  }
};
