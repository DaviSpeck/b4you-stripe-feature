const MailService = require('../MailService');
const { capitalizeName } = require('../../utils/formatters');
const { coproductionCancelTemplate } = require('../../mails/messages');

module.exports = class CoproductionCancel extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, full_name, coproducer_name, product_name } = this.data;
    const subject = 'Coprodução cancelada pelo coprodutor';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = coproductionCancelTemplate(
      capitalizeName(full_name),
      capitalizeName(coproducer_name),
      capitalizeName(product_name),
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
};
