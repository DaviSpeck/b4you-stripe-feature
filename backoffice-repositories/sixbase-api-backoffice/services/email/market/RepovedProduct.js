const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const { reprovedProduct } = require('../../../mails/market/messages');

class ReprovedProduct extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, producer_name, product_name, reason } = this.data;
    const subject = 'Seu produto foi reprovado na B4you';
    const toAddress = [
      {
        Email: email,
        Name: producer_name,
      },
    ];
    const variables = reprovedProduct({
      product_name,
      producer_name: capitalizeName(producer_name),
      reason,
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ReprovedProduct;
