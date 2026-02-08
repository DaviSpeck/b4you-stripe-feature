import { registerPage } from '../emails/messages.mjs';
import { capitalizeName, transformEmailToName } from '../utils/formatters.mjs';

export class RegisterPage {
  constructor(MailService) {
    this.MailService = MailService;
  }

  async send({ email, producer_name, url_dashboard }) {
    const subject = 'Você recebeu um convite de afiliação';
    const toAddress = [
      {
        Email: email,
        Name: transformEmailToName(email),
      },
    ];
    const variables = registerPage(capitalizeName(producer_name), url_dashboard);
    const response = await this.MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}
