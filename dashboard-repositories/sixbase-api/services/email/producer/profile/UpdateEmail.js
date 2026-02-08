const {
  updateEmail,
} = require('../../../../mails/support/producer/profile/messages');
const { capitalizeName } = require('../../../../utils/formatters');

module.exports = class UpdateUserEmail {
  #MailService;

  constructor(MailService) {
    this.#MailService = MailService;
  }

  async send(data) {
    const { full_name, email, new_email, old_email, code, ip } = data;
    const subject = 'Alteração de e-mail';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = updateEmail({
      full_name: capitalizeName(full_name),
      new_email,
      old_email,
      code,
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
