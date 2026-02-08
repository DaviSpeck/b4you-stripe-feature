const MailService = require('../MailService');

const { firstAccessTemplate } = require('../../mails/messages');
const { capitalizeName, formatBRL } = require('../../utils/formatters');

class FirstAccess extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      full_name,
      product_name,
      amount,
      producer_name,
      token,
      email,
      support_email,
      sale_uuid,
    } = this.data;
    const subject = 'Compra realizada com sucesso';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = firstAccessTemplate(
      capitalizeName(full_name),
      capitalizeName(product_name),
      formatBRL(amount),
      capitalizeName(producer_name),
      token,
      support_email,
      sale_uuid,
    );
    let response = null;
    if (process.env.ENVIRONMENT === 'PRODUCTION') {
      response = await this.sendMail({
        subject,
        toAddress,
        variables,
      });
    }
    return response;
  }
}

module.exports = FirstAccess;
