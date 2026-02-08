const MailService = require('../MailService');
const { capitalizeName } = require('../../utils/formatters');
const { saleChargeback } = require('../../mails/messages');

class SaleChargeback extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { client_name, email, product_name, additional_text } = this.data;
    const subject = 'Compra reembolsada';
    const toAddress = [
      {
        Email: email,
        Name: client_name,
      },
    ];
    const variables = saleChargeback(
      capitalizeName(client_name),
      capitalizeName(product_name),
      additional_text,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = SaleChargeback;
