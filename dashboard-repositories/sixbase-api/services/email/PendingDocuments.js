const MailService = require('../MailService');
const { capitalizeName } = require('../../utils/formatters');
const { pendingDocuments } = require('../../mails/messages');

class PendingDocuments extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, full_name } = this.data;
    const subject = 'Seus documentos foram recebidos para análise';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = pendingDocuments(capitalizeName(full_name));
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = PendingDocuments;
