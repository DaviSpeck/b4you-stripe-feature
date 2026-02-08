const MailService = require('../MailService');
const { capitalizeName, formatBRL } = require('../../utils/formatters');
const { subscriptionCanceledByProducer } = require('../../mails/messages');

class StudentCanceledSubscriptionByProducer extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      student_name,
      product_name,
      amount,
      valid_date_until,
      support_email,
      email,
    } = this.data;
    const subject = 'Sua assinatura foi cancelada';
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    const variables = subscriptionCanceledByProducer(
      capitalizeName(student_name),
      capitalizeName(product_name),
      formatBRL(amount),
      valid_date_until,
      support_email,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = StudentCanceledSubscriptionByProducer;
