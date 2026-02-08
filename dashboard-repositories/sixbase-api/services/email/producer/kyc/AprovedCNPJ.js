const MailService = require('../../../MailService');
const { capitalizeName } = require('../../../../utils/formatters');
const { approvedCNPJ } = require('../../../../mails/kyc/messages');

class ApprovedCNPJ extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, full_name } = this.data;
    const subject = 'Seu CNPJ foi aprovado na B4you';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = approvedCNPJ({
      full_name: capitalizeName(full_name),
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ApprovedCNPJ;
