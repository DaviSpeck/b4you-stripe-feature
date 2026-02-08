import { capitalizeName } from '../utils/formatters.mjs';
import { affiliateInvite } from '../emails/messages.mjs';

export class ProducerInvite {
  constructor(MailService) {
    this.MailService = MailService;
  }

  async send(data) {
    const { email, producer_name, affiliate_name, product_name, url } = data;
    const subject = 'Você recebeu um convite de afiliação';
    const toAddress = [
      {
        Email: email,
        Name: capitalizeName(affiliate_name),
      },
    ];
    const variables = affiliateInvite({
      producer_name: capitalizeName(producer_name),
      affiliate_name: capitalizeName(affiliate_name),
      product_name,
      url,
    });
    const response = await this.MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}
