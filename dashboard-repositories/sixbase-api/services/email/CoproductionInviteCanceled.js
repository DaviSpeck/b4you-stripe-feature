const { capitalizeName } = require('../../utils/formatters');
const { coproductionCancelInviteTemplate } = require('../../mails/messages');

module.exports = class CoproductionCancel {
  #data;

  #MailService;

  constructor(data, MailService) {
    this.#data = data;
    this.#MailService = MailService;
  }

  async send() {
    const { email, full_name, producer, product_name } = this.#data;
    const subject = 'Convite para coprodução cancelado';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = coproductionCancelInviteTemplate(
      capitalizeName(full_name),
      capitalizeName(producer),
      capitalizeName(product_name),
    );
    const response = await this.#MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
};
