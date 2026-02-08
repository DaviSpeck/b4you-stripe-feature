const MailService = require('../../../MailService');
const { capitalizeName, formatBRL } = require('../../../../utils/formatters');
const {
  refundRejected,
} = require('../../../../mails/refunds/producer/messages');

class RefundProducerRejected extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, full_name, product_name, amount, student_name, reason } =
      this.data;
    const subject = `Solicitação de reembolso não finalizada`;
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = refundRejected(
      capitalizeName(full_name),
      capitalizeName(product_name),
      formatBRL(amount),
      capitalizeName(student_name),
      reason,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = RefundProducerRejected;
