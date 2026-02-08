const CardService = require('../../services/CardService');
const logger = require('../../utils/logger');
const {
  createCardVerification,
  updateCardVerification,
} = require('../../database/controllers/card_verification');
const {
  findCardVerificationStatusByKey,
} = require('../../status/cardVerification');

module.exports = class {
  constructor(
    { first_name, last_name, email, document_number, id_student },
    { card_number, cardholder_name, cvv, expiration_date },
    dbTransaction,
  ) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.document_number = document_number;
    this.id_student = id_student;
    this.card_number = card_number;
    this.card_holder = cardholder_name;
    this.cvv = cvv;
    this.expiration_date = expiration_date;
    this.dbTransaction = dbTransaction;
  }

  async verify() {
    try {
      const card = new CardService(
        {
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          document_number: this.document_number,
          id_student: this.id_student,
        },
        {
          card_number: this.card_number,
          cardholder_name: this.card_holder,
          cvv: this.cvv,
          expiration_date: this.expiration_date,
        },
      );
      const { paymentData, transaction_id, amount } = await card.verify();
      const { id: psp_id, status } = paymentData;
      if (status.label === 'paid') {
        const cardVerification = await createCardVerification(
          {
            id_status: findCardVerificationStatusByKey('approved').id,
            transaction_id,
            amount,
            psp_id,
            id_student: this.id_student,
          },
          this.dbTransaction,
        );
        const refund_id = await card.refund(transaction_id);
        await updateCardVerification(
          { id: cardVerification.id },
          {
            id_status: findCardVerificationStatusByKey('refund-requested').id,
            refund_id,
          },
          this.dbTransaction,
        );
        return true;
      }
      await createCardVerification(
        {
          id_status: findCardVerificationStatusByKey('failed').id,
          transaction_id,
          amount,
          psp_id,
          id_student: this.id_student,
        },
        this.dbTransaction,
      );
      return false;
    } catch (error) {
      logger.error(error);
    }
    return false;
  }
};
