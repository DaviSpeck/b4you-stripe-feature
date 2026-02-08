const { capitalizeName } = require('../../utils/formatters');
const { coproductionInviteTemplate } = require('../../mails/messages');

class CoproductionInvite {
  #data;

  #EmailService;

  constructor(data, EmailService) {
    this.#data = data;
    this.#EmailService = EmailService;
  }

  async send() {
    const { email, full_name, producer, product_name, due_date, commission } =
      this.#data;
    const subject = 'Convite para coprodução';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = coproductionInviteTemplate(
      capitalizeName(full_name),
      capitalizeName(producer),
      capitalizeName(product_name),
      due_date,
      commission,
    );
    const response = await this.#EmailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = CoproductionInvite;
