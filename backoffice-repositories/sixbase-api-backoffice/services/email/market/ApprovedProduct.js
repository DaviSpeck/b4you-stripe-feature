const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const { approvedProduct } = require('../../../mails/market/messages');

class ApprovedProduct extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, producer_name, product_name, uuid_product } = this.data;
    const subject = 'Seu produto foi aprovado na B4you';
    const toAddress = [
      {
        Email: email,
        Name: producer_name,
      },
    ];
    const variables = approvedProduct({
      product_name,
      producer_name: capitalizeName(producer_name),
      uuid_product,
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ApprovedProduct;
