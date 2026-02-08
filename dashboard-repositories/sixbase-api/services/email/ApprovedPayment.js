const MailService = require('../MailService');

const {
  approvedPaymentTemplate,
  approvedPaymentProductExternalTemplate,
  customApprovedPaymentProductExternalTemplate,
  customApprovedPaymentTemplate,
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
      email_subject = null,
      email_template = null,
    } = this.data;
    const toAddress = [
      {
        Email: email,
        Name: capitalizeName(full_name),
      },
    ];
    let subject = email_subject || '';
    let variables = null;
    if (type === 'external') {
      subject = email_subject || `Compra realizada com sucesso!`;
      if (email_template) {
        variables = customApprovedPaymentProductExternalTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          sale_uuid,
          email_template,
        );
      } else {
        variables = approvedPaymentProductExternalTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          sale_uuid,
        );
      }
    } else {
      subject =
        email_subject ||
        `Compra realizada com sucesso! Seu acesso a ${capitalizeName(
          product_name,
        )} chegou!`;
      if (email_template) {
        variables = customApprovedPaymentTemplate(
          capitalizeName(full_name),
          capitalizeName(product_name),
          formatBRL(amount),
          capitalizeName(producer_name),
          support_email,
          token,
          sale_uuid,
          email_template,
        );
      } else {
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
