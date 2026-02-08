const PaymentService = require('./PaymentService');
const uuid = require('../utils/helpers/uuid');
const CreditCardHelper = require('../utils/helpers/CreditCard');

const amount = 0.01;
class CardService {
  constructor(
    { first_name, last_name, email, document_number, id_student },
    { card_number, cardholder_name, cvv, expiration_date },
  ) {
    const card = new CreditCardHelper({
      card_number,
      cvv,
      expiration_date,
      card_holder: cardholder_name,
    });
    const fullCard = card.getFullData();
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.document_number = document_number;
    this.id_student = id_student;
    this.card_number = fullCard.card_number;
    this.card_holder = fullCard.card_holder;
    this.cvv = fullCard.cvv;
    this.month = fullCard.date.expiration_month;
    this.year = fullCard.date.four_digits_year;
    this.webhook = process.env.URL_REFUND_CARD_VERIFICATION;
  }

  async verify() {
    const transaction_id = uuid.v4();
    const paymentData = await PaymentService.generateCardSale(
      {
        transaction_id,
        price: amount,
        creditcard_descriptior: 'verificacao',
      },
      {
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        document_number: this.document_number,
        document_type: this.document_number.length === 11 ? 'CPF' : 'CNPJ',
      },
      {
        card_number: this.card_number,
        cardholder_name: this.card_holder,
        expiration_month: this.month,
        expiration_year: String(this.year),
        security_code: this.cvv,
      },
    );
    return { paymentData, transaction_id, amount };
  }

  async refund(transaction_id) {
    const refund_id = uuid.v4();
    await PaymentService.refundCard({
      transaction_id,
      refund_id,
      webhook: this.webhook,
    });
    return refund_id;
  }
}
module.exports = CardService;
