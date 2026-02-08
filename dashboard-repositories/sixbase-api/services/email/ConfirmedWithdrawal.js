const { capitalizeName, formatBRL } = require('../../utils/formatters');
const { confirmedWithdrawal } = require('../../mails/messages');

module.exports = class ConfimedWithdrawal {
  #MailService;

  constructor(MailService) {
    this.#MailService = MailService;
  }

  async send({ email, full_name, amount }) {
    const subject = 'Saque concluído com sucesso';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = confirmedWithdrawal(
      capitalizeName(full_name),
      formatBRL(amount),
    );
    const response = await this.#MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
};
