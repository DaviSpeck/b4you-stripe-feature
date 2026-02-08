const {
  updateEmailSuccess,
} = require('../../../../mails/support/producer/profile/messages');
const { capitalizeName } = require('../../../../utils/formatters');

module.exports = class SuccessUpdatedEmail {
  #MailService;

  constructor(MailService) {
    this.#MailService = MailService;
  }

  async send(data) {
    const { full_name, email, new_email, old_email, ip } = data;
    const subject = 'Alteração de e-mail concluída';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = updateEmailSuccess({
      full_name: capitalizeName(full_name),
      new_email,
      old_email,
      ip,
    });
    const response = await this.#MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
};
