const MailService = require('../../MailService');
const { capitalizeName, formatBRL } = require('../../../utils/formatters');
const { upSellAndOrderBump } = require('../../../mails/messages');

class ConfirmedUpsellOrOrderBump extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      email,
      student_name,
      producer_name,
      product_name,
      sale_uuid,
      amount,
    } = this.data;
    const subject = 'Compra realizada com sucesso';
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    const variables = upSellAndOrderBump(
      capitalizeName(student_name),
      capitalizeName(product_name),
      capitalizeName(producer_name),
      formatBRL(amount),
      sale_uuid,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ConfirmedUpsellOrOrderBump;
