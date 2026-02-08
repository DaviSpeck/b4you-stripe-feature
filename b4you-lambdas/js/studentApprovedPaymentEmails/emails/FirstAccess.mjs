import { capitalizeName, formatBRL } from '../utils/formatters.mjs';
import { firstAccessTemplate } from './messages.mjs';

export class FirstAccess {
  constructor(data, MailService) {
    this.data = data;
    this.MailService = MailService;
  }

  async send() {
    const {
      full_name,
      product_name,
      amount,
      producer_name,
      token,
      email,
      support_email,
      sale_uuid,
    } = this.data;
    const subject = 'Compra realizada com sucesso';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = firstAccessTemplate(
      capitalizeName(full_name),
      capitalizeName(product_name),
      formatBRL(amount),
      capitalizeName(producer_name),
      token,
      support_email,
      sale_uuid
    );
    const response = await this.MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}
