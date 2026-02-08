const MailService = require('../../../MailService');
const { capitalizeName } = require('../../../../utils/formatters');
const { reprovedDocuments } = require('../../../../mails/kyc/messages');

class ReprovedDocuments extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, full_name, description } = this.data;
    const subject = 'Resultado da verificação de documentos';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = reprovedDocuments({
      full_name: capitalizeName(full_name),
      description,
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ReprovedDocuments;
