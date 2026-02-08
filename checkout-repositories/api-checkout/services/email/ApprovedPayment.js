const MailService = require('../MailService');

const {
  approvedPaymentTemplate,
  approvedPaymentProductExternalTemplate,
} = require('../../mails/messages');
const { capitalizeName, formatBRL } = require('../../utils/formatters');

class ApprovedPayment extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      email,
      full_name,
      product_name,
      amount,
      producer_name,
      support_email,
      token,
      sale_uuid,
      type,
    } = this.data;
    const toAddress = [
      {
        Email: email,
        Name: capitalizeName(full_name),
      },
    ];
    let subject = '';
    let variables = null;
    if (type === 'external') {
      subject = `Compra realizada com sucesso!`;
      variables = approvedPaymentProductExternalTemplate(
        capitalizeName(full_name),
        capitalizeName(product_name),
        formatBRL(amount),
        capitalizeName(producer_name),
        support_email,
        sale_uuid,
      );
    } else {
      subject = `Compra realizada com sucesso! Seu acesso a ${capitalizeName(
        product_name,
      )} chegou!`;
      variables = approvedPaymentTemplate(
        capitalizeName(full_name),
        capitalizeName(product_name),
        formatBRL(amount),
        capitalizeName(producer_name),
        support_email,
        token,
        sale_uuid,
      );
    }

    let response = null;
    if (process.env.ENVIRONMENT === 'PRODUCTION') {
      response = await this.sendMail({
        subject,
        toAddress,
        variables,
      });
    }
    return response;
  }
}

module.exports = ApprovedPayment;
