import { capitalizeName, formatBRL } from '../utils/formatters.mjs';
import { studentSubscriptionRenewed } from './messages.mjs';

export class StudentSubscriptionRenewed {
  constructor(data, MailService) {
    this.data = data;
    this.MailService = MailService;
  }

  async send() {
    const { email, student_name, product_name, amount } = this.data;
    const subject = `Assinatura renovada com sucesso`;
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    const variables = studentSubscriptionRenewed(
      capitalizeName(student_name),
      capitalizeName(product_name),
      formatBRL(amount)
    );
    const response = await this.MailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}
