import { Fees } from './Fees.mjs';

const resolveFeeVariableMethod = (fee_variable_method, student_pays_interest) => {
  if (student_pays_interest) return fee_variable_method.student_fees;
  return fee_variable_method.producer_fees;
};

export class CreditCardFees {
  constructor({
    fees,
    taxes,
    settings,
    brand,
    installments,
    student_pays_interest,
    sales_items,
    discount,
    coupon_discount = 0,
    coupon = null,
  }) {
    this.fees = fees;
    this.taxes = taxes;
    this.settings = settings;
    this.brand = brand;
    this.installments = installments;
    this.student_pays_interest = student_pays_interest;
    this.sales_items = sales_items;
    this.discount = discount;
    this.coupon_discount = coupon_discount;
    this.coupon = coupon;
  }

  execute() {
    if (!this.brand) {
      this.brand = 'master';
    }
    const pspFees = this.fees.find(
      (fee) => fee.installments === this.installments && fee.brand === this.brand
    );

    const { psp_fixed_cost, psp_variable_cost } = pspFees;

    const { fee_variable_card_service, fee_fixed_card_service } = this.settings;

    return new Fees({
      fees: {
        psp_fixed_cost,
        psp_variable_cost,
      },
      settings: {
        fee_variable_percentage_service: fee_variable_card_service[this.installments],
        fee_fixed_amount_service: fee_fixed_card_service[this.installments],
      },
      taxes: this.taxes,
      student_pays_interest: this.student_pays_interest,
      installments: this.installments,
      brand: this.brand,
      sales_items: this.sales_items,
      discount: this.discount,
      coupon_discount: this.coupon_discount,
      coupon: this.coupon,
      monthly_installment_interest: 2.99,
    }).sale();
  }
}
