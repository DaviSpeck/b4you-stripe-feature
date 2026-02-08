const MailService = require('../../../MailService');

const { refundProductorSubscription } = require('../../../../mails/messages');
const { capitalizeName, formatBRL } = require('../../../../utils/formatters');

class StudentRefundSubscriptionProducer extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      email,
      producer_name,
      product_name,
      student_name,
      amount,
      reason,
      date,
      sale_uuid,
    } = this.data;
    const subject = 'Você recebeu uma solicitação de reembolso';
    const toAddress = [
      {
        Email: email,
        Name: capitalizeName(producer_name),
      },
    ];
    const variables = refundProductorSubscription(
      capitalizeName(producer_name),
      capitalizeName(product_name),
      capitalizeName(student_name),
      formatBRL(amount),
      reason || 'Não informado',
      date,
      sale_uuid,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = StudentRefundSubscriptionProducer;
