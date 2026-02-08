import { Fees } from './Fees.mjs';

const resolveFeeVariableMethod = (fee_variable_method, student_pays_interest) => {
  if (student_pays_interest) return fee_variable_method.student_fees;
  return fee_variable_method.producer_fees;
};

const capitalizeName = (name) => {
  if (!name) return '';
  name = name.toLowerCase().replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());
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
  }

  execute() {
    if (!this.fees) throw new Error(`Bandeira ${capitalizeName(this.brand)} não suportada`);
    const { psp_fixed_cost, psp_variable_cost } = this.fees;
    const {
      fee_fixed_card: fee_fixed_method,
      fee_interest_card: fee_variable_method,
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
        fee_variable_method: resolveFeeVariableMethod(
          fee_variable_method,
          this.student_pays_interest
        ).find((fee) => fee.brand === this.brand),
        fee_variable_percentage_service,
        fee_fixed_amount_service,
      },
      taxes: this.taxes,
      student_pays_interest: this.student_pays_interest,
      installments: this.installments,
      brand: this.brand,
      sales_items: this.sales_items,
      discount: this.discount,
      coupon_discount: this.coupon_discount,
    }).sale();
  }
}
