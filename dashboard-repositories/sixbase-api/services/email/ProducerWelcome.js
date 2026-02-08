const MailService = require('../MailService');

const { producerWelcome } = require('../../mails/messages');
const { capitalizeName } = require('../../utils/formatters');

class ProducerWelcome extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { full_name, email } = this.data;
    const subject = `Bem-vindo ${capitalizeName(full_name)}`;
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = producerWelcome(capitalizeName(full_name));
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ProducerWelcome;
