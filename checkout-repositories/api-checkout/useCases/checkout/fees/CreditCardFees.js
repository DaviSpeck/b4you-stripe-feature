const ApiError = require('../../../error/ApiError');
const { capitalizeName } = require('../../../utils/formatters');
const Fees = require('./Fees');

module.exports = class CreditCardFees {
  constructor({
    fees,
    taxes,
    settings,
    brand,
    installments,
    student_pays_interest,
    sales_items,
    discount,
    coupon,
    document_number,
  }) {
    this.fees = fees;
    this.taxes = taxes;
    this.settings = settings;
    this.brand = brand;
    this.installments = installments;
    this.student_pays_interest = student_pays_interest;
    this.sales_items = sales_items;
    this.discount = discount;
    this.coupon = coupon;
    this.document_number = document_number;
  }

  async execute() {
    const pspFees = this.fees.find(
      (fee) =>
        fee.installments === this.installments && fee.brand === this.brand,
    );

    if (!pspFees)
      throw ApiError.badRequest(
        `Bandeira ${capitalizeName(this.brand)} não suportada`,
      );

    const { psp_fixed_cost, psp_variable_cost } = pspFees;

    const { fee_variable_card_service, fee_fixed_card_service } = this.settings;

    return new Fees({
      fees: {
        psp_fixed_cost,
        psp_variable_cost,
      },
      settings: {
        fee_variable_percentage_service:
          fee_variable_card_service[this.installments],
        fee_fixed_amount_service: fee_fixed_card_service[this.installments],
      },
      taxes: this.taxes,
      student_pays_interest: this.student_pays_interest,
      installments: this.installments,
      brand: this.brand,
      sales_items: this.sales_items,
      discount: this.discount,
      coupon: this.coupon,
      monthly_installment_interest: 3.49,
      document_number: this.document_number,
    }).sale();
  }
};
