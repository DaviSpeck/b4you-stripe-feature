const { PMT } = require('../../../utils/math');

module.exports = class CalculateInstallments {
  constructor({
    settings,
    price,
    student_pays_interest,
    installments: max_installments,
  }) {
    this.settings = settings;
    this.price = price;
    this.student_pays_interest = student_pays_interest;
    this.max_installments = max_installments;
  }

  execute() {
    const list = [];
    list.push({
      n: 1,
      price: this.price,
      total: this.price,
    });
    if (this.student_pays_interest) {
      const brand = this.settings.fee_interest_card.student_fees.find(
        (fee) => fee.brand === 'master',
      );
      for (
        let installment = 2;
        installment <= this.max_installments;
        installment += 1
      ) {
        const pmt = PMT(
          brand.monthly_installment_interest / 100,
          installment,
          this.price,
        );
        const total = Math.abs(pmt) * installment;
        const price = total / installment;

        list.push({
          n: installment,
          price,
          total,
        });
      }
    } else {
      for (
        let installment = 2;
        installment <= this.max_installments;
        installment += 1
      ) {
        const total = this.price;
        const price = total / installment;
        list.push({
          n: installment,
          price,
          total,
        });
      }
    }

    return list;
  }
};
