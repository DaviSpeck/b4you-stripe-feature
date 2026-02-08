const MailService = require('../../../MailService');
const DateHelper = require('../../../../utils/helpers/date');
const { capitalizeName } = require('../../../../utils/formatters');
const {
  kycApproval,
} = require('../../../../mails/support/producer/profile/messages');
const { FRONTEND_DATE } = require('../../../../types/dateTypes');

class CnpjApproval extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { user_uuid, full_name, email, verification_uuid, date } = this.data;
    const subject = 'KYC para aprovação';
    const toAddress = [
      {
        Email: process.env.SIXBASE_SUPPORT_EMAIL,
        Name: 'Suporte B4you',
      },
    ];
    const variables = kycApproval({
      user_uuid,
      full_name: capitalizeName(full_name),
      email,
      verification_uuid,
      date: DateHelper(date).format(FRONTEND_DATE),
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = CnpjApproval;
