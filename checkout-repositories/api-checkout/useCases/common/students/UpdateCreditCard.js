const PaymentService = require('../../../services/PaymentService');
const { updateStudent } = require('../../../database/controllers/students');
const { creditCardBrandParser } = require('../../../utils/card');

module.exports = class {
  constructor({
    student: { id, full_name },
    card: {
      card_holder,
      card_number,
      cvv,
      date: { expiration_month, expiration_year },
      hash,
    },
    dbTransaction,
  }) {
    this.id_student = id;
    this.student_name = full_name;
    this.card_holder = card_holder;
    this.card_number = card_number;
    this.cvv = cvv;
    this.expiration_month = expiration_month;
    this.expiration_year = expiration_year;
    this.dbTransaction = dbTransaction;
    this.hash = hash;
  }

  async execute() {
    if (!this.hash) {
      const card_token = await PaymentService.storeCustomerCard({
        cardholder_name: this.card_holder,
        card_number: this.card_number,
        expiration_month: this.expiration_month,
        expiration_year: this.expiration_year,
        name: this.student_name,
      });
      this.hash = card_token;
    }
    await updateStudent(
      this.id_student,
      {
        credit_card: {
          card_token: this.hash,
          cvv: this.cvv,
          brand: creditCardBrandParser(this.card_number),
          last_four_digits: this.card_number.slice(-4),
        },
      },
      this.dbTransaction,
    );
    return true;
  }
};
