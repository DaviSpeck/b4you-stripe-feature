import { capitalizeName, FRONTEND_DATE } from './utils.mjs';
import { confirmedPaymentSale } from './messages.mjs';
import { date } from './date.mjs';
import { MailService } from './MailService.mjs';

const { MAILJET_PASSWORD, MAILJET_USERNAME } = process.env;

export class ConfirmePaymentEmail extends MailService {
  constructor(data) {
    super(MAILJET_PASSWORD, MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      full_name,
      product_name,
      email,
      src,
      uuid,
      commission,
      created_at,
    } = this.data;
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
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}
