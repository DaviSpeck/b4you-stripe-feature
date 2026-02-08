const MailService = require('../MailService');
const { capitalizeName } = require('../../utils/formatters');
const { rejectAffiliateUser } = require('../../mails/messages');

class RejectUserAffiliate extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { affiliate_name, email, support_email, product_name } = this.data;
    const subject = 'Afiliação recusada';
    const toAddress = [
      {
        Email: email,
        Name: affiliate_name,
      },
    ];
    const variables = rejectAffiliateUser(
      capitalizeName(affiliate_name),
      support_email,
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

module.exports = RejectUserAffiliate;
