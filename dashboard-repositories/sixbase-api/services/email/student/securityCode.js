const { capitalizeName } = require('../../../utils/formatters');
const { accessCode } = require('../../../mails/messages');

module.exports = class SecurityCode {
  #MailService;

  constructor(MailService) {
    this.#MailService = MailService;
  }

  async send(data) {
    const { email, student_name, verification_code } = data;
    const subject = `Código de segurança`;
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    const variables = accessCode(
      capitalizeName(student_name),
      verification_code,
    );
    const response = await this.#MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
};
