const PaymentService = require('../../../services/PaymentService');

module.exports = class CardTokenPayment {
  constructor(
    { transaction_id, price, installments = 1, creditcard_descriptor },
    { full_name, document_number, document_type, email },
    { card_token, security_code },
  ) {
    this.transaction_id = transaction_id;
    this.price = price;
    this.installments = installments;
    this.full_name = full_name;
    this.document_number = document_number;
    this.document_type = document_type;
    this.email = email;
    this.card_token = card_token;
    this.security_code = security_code;
    this.creditcard_descriptor = creditcard_descriptor;
  }

  async execute() {
    const payment = {
      transaction_id: this.transaction_id,
      price: this.price,
      creditcard_descriptor: this.creditcard_descriptor,
    };
    const student = {
      full_name: this.full_name,
      document_number: this.document_number,
      document_type: this.document_type,
      email: this.email,
    };
    const card = {
      card_token: this.card_token,
      security_code: this.security_code,
    };
    const data = await PaymentService.generateSaleWithCardToken(
      payment,
      student,
      card,
    );
    return data;
  }
};
