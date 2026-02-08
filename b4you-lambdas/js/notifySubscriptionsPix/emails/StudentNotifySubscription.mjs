import { date } from '../utils/date.mjs';
import { capitalizeName, formatBRL } from '../utils/formatters.mjs';
import { styleTextHello, styleText, styleBreakLineBigger, styleButtonCenter, styleButton } from './styles.mjs';

const renewSubscription = ({ full_name, product_name, date, url }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>A sua assinatura no <b>${product_name}</b> se encerra no dia <b>${date}</b>.</div>
          <div ${styleText}>Após esta data o seu plano expira automaticamente.
          Faça a renovação se deseja mantê-la ativa, clicando no botão abaixo:</div>
          <div ${styleButtonCenter}><a ${styleButton} href="${url}">RENOVE SUA ASSINATURA</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

export class StudentNotifySubscription {
  constructor(mailService) {
    this.mailService = mailService;
  }

  async send({ email, full_name, product_name, due_date, url }) {
    const subject = 'O seu plano de assinatura termina em breve';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = renewSubscription({
      full_name: capitalizeName(full_name),
      product_name: capitalizeName(product_name),
      date: date(due_date).format('DD/MM/YYYY'),
      url,
    });
    try {
      const response = await this.mailService.sendMail({
        subject,
        toAddress,
        variables,
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
