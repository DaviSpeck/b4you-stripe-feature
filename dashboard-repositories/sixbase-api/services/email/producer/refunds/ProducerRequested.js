const MailService = require('../../../MailService');
const { capitalizeName, formatBRL } = require('../../../../utils/formatters');
const {
  refundRequested,
  refundRequestedPhysical,
} = require('../../../../mails/refunds/producer/messages');

class RefundProducerRequested extends MailService {
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
      student_name,
      type = 'digital',
    } = this.data;
    const subject = `Você solicitou um reembolso`;
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    let variables = null;
    if (type === 'digital') {
      variables = refundRequested(
        capitalizeName(full_name),
        capitalizeName(product_name),
        formatBRL(amount),
        capitalizeName(student_name),
      );
    } else {
      variables = refundRequestedPhysical(
        capitalizeName(full_name),
        capitalizeName(product_name),
        formatBRL(amount),
        capitalizeName(student_name),
      );
    }

    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = RefundProducerRequested;
