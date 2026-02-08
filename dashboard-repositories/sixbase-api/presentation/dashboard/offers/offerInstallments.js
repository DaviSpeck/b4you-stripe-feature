const resolveFees = ({ producer_fees, student_fees }) => ({
  fee_interest_producer: producer_fees.find(({ brand }) => brand === 'master')
    .monthly_installment_interest,
  fee_interest_student: student_fees.find(({ brand }) => brand === 'master')
    .monthly_installment_interest,
});

const serializeOfferInstallments = (fee_interest_card, installments) => {
  const { fee_interest_producer, fee_interest_student } =
    resolveFees(fee_interest_card);
  return {
    max_installments: installments,
    fee_interest_producer,
    fee_interest_student,
  };
};

module.exports = class {
  constructor(data, installments) {
    this.data = data;
    this.installments = installments;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeOfferInstallments);
    }
    return serializeOfferInstallments(this.data, this.installments);
  }
};
