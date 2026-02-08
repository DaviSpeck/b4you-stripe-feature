const MailService = require('../../MailService');
const { capitalizeName, formatBRL } = require('../../../utils/formatters');
const { studentSubscriptionRenewed } = require('../../../mails/messages');

module.exports = class StudentSubscriptionRenewed extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, student_name, product_name, amount } = this.data;
    const subject = `Assinatura renovada com sucesso`;
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    const variables = studentSubscriptionRenewed(
      capitalizeName(student_name),
      capitalizeName(product_name),
      formatBRL(amount),
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
};
