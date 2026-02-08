const MailService = require('../../../MailService');
const DateHelper = require('../../../../utils/helpers/date');
const {
  capitalizeName,
  formatDocument,
} = require('../../../../utils/formatters');
const {
  cnpjApproval,
} = require('../../../../mails/support/producer/profile/messages');
const { FRONTEND_DATE } = require('../../../../types/dateTypes');

class CnpjApproval extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { user_uuid, full_name, email, cnpj, date } = this.data;
    const subject = 'CNPJ para aprovação';
    const toAddress = [
      {
        Email: process.env.SIXBASE_SUPPORT_EMAIL,
        Name: 'Suporte B4you',
      },
    ];
    const ccAddress = [
      { Email: 'suporte@sixbase.com.br', Name: 'Suporte Sixbase Brasil' },
    ];
    const variables = cnpjApproval({
      user_uuid,
      full_name: capitalizeName(full_name),
      email,
      cnpj: formatDocument(cnpj),
      date: DateHelper(date).format(FRONTEND_DATE),
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
      cc: ccAddress,
    });
    return response;
  }
}

module.exports = CnpjApproval;
