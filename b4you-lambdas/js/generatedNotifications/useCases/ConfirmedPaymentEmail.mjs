import { capitalizeName } from '../utils/formatters.mjs';
import { confirmedPaymentSale } from '../emails/messages.mjs';
import { date } from '../utils/date.mjs';

const FRONTEND_DATE = 'DD/MM/YYYY - HH:mm:ss';

export class ConfirmedPaymentEmail {
  constructor(mailServiceInstance) {
    this.mailServiceInstance =  mailServiceInstance;
  }

  async send({ full_name, product_name, email, src, uuid, commission, created_at}) {
    const subject = 'Venda realizada';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = confirmedPaymentSale({
      commission,
      created_at: date(created_at).format(FRONTEND_DATE),
      full_name: capitalizeName(full_name),
      product_name,
      src,
      uuid,
    });
    const response = await this.mailServiceInstance.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}
