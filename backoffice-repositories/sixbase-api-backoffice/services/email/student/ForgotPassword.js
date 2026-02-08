const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const { forgotPasswordTemplate } = require('../../../mails/students/messages');

class ForgotPassword extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { full_name, token, email, url } = this.data;
    const subject = 'Redefina sua senha';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = forgotPasswordTemplate(
      capitalizeName(full_name),
      token,
      url,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ForgotPassword;
