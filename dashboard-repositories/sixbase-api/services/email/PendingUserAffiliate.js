const MailService = require('../MailService');

const { newPendingAffiliateUser } = require('../../mails/messages');
const { capitalizeName } = require('../../utils/formatters');

class PendingUserAffiliate extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { affiliate_name, email, commission, support_email, product_name } =
      this.data;
    const subject = 'Solicitação de afiliação pendente';
    const toAddress = [
      {
        Email: email,
        Name: affiliate_name,
      },
    ];
    const variables = newPendingAffiliateUser(
      capitalizeName(affiliate_name),
      support_email,
      commission,
      capitalizeName(product_name),
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = PendingUserAffiliate;
