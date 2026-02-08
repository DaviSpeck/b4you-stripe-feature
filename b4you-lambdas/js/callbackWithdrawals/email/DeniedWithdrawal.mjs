import { capitalizeName } from '../utils/formatters.mjs';
import { deniedWithdrawal } from './messages.mjs';

export class DeniedWithdrawalEmail {
  #MailService;

  constructor(MailService) {
    this.#MailService = MailService;
  }

  async send({ email, full_name }) {
    const subject = 'Saque negado';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = deniedWithdrawal(capitalizeName(full_name));
    const response = await this.#MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}
