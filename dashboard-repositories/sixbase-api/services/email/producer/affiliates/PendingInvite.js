const MailService = require('../../../MailService');

const { pendingNewAffiliateProducer } = require('../../../../mails/messages');
const { capitalizeName } = require('../../../../utils/formatters');

class PendingNewAffiliateProducer extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      email,
      full_name,
      product_name,
      affiliate_name,
      affiliate_email,
      commission,
    } = this.data;
    const subject = 'Você recebeu um convite de afiliação';
    const toAddress = [
      {
        Email: email,
        Name: capitalizeName(full_name),
      },
    ];
    const variables = pendingNewAffiliateProducer(
      capitalizeName(full_name),
      capitalizeName(affiliate_name),
      affiliate_email,
      capitalizeName(product_name),
      commission,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = PendingNewAffiliateProducer;
