const MailService = require('../MailService');
const { capitalizeName, formatBRL } = require('../../utils/formatters');
const { rejectedRefundStudent } = require('../../mails/messages');

class RejectedRefundStudent extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      email,
      full_name,
      product_name,
      amount,
      reason,
      date,
      payment_method,
    } = this.data;
    const subject = 'Solicitação de reembolso não finalizada';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = rejectedRefundStudent(
      capitalizeName(full_name),
      capitalizeName(product_name),
      formatBRL(amount),
      reason,
      date,
      payment_method,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = RejectedRefundStudent;
