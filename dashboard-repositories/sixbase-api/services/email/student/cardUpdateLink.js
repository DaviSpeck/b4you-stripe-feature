const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const {
  cardUpdateLink,
} = require('../../../mails/subscriptions/student/messages');

class CardUpdateLink extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, student_name, product_name, url } = this.data;
    const subject = 'Atualize seu cartão de crédito';
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    const variables = cardUpdateLink({
      full_name: capitalizeName(student_name),
      product_name: capitalizeName(product_name),
      url,
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = CardUpdateLink;
