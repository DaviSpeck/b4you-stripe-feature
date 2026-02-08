const PaymentService = require('../../../services/PaymentService');

module.exports = class CardTokenPayment {
  constructor(
    {
      transaction_id,
      price,
      installments = 1,
      creditcard_descriptor,
      products,
      id_type,
      commissions,
      offer_name,
    },
    student,
  ) {
    this.transaction_id = transaction_id;
    this.price = price;
    this.installments = installments;
    this.creditcard_descriptor = creditcard_descriptor;
    this.products = products;
    this.id_type = id_type;
    this.commissions = commissions;
    this.student = student;
    this.offer_name = offer_name;
  }

  async execute() {
    const payment = {
      transaction_id: this.transaction_id,
      price: this.price,
      creditcard_descriptor: this.creditcard_descriptor,
      installments: this.installments,
      id_type: this.id_type,
      commissions: this.commissions,
    };
    const data = await PaymentService.generateSaleWithCardToken(
      payment,
      this.products,
      this.student,
      this.offer_name,
    );
    return data;
  }
};
