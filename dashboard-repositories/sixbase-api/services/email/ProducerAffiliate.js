const MailService = require('../MailService');
const { capitalizeName } = require('../../utils/formatters');
const { newAffiliateProducer } = require('../../mails/messages');

class ProducerAffiliate extends MailService {
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
    const subject = 'Novo afiliado ao seu produto';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = newAffiliateProducer(
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

module.exports = ProducerAffiliate;
