import { capitalizeName } from '../utils/formatters.mjs';
import { styleTextHello, styleText, styleBreakLineBigger, styleButtonCenter } from './styles.mjs';

const lateSubscription = ({ full_name, product_name, url }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>A sua assinatura no <b>${product_name}</b> está em atraso.</div>
          <div ${styleText}>Para manter o seu acesso, renove o seu plano, clicando no botão abaixo:</div>
          <div ${styleButtonCenter}><a ${styleButton} href="${url}">RENOVE SUA ASSINATURA</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

export class SubscriptionLate {
  constructor(mailService) {
    this.mailService = mailService;
  }

  async send({ email, full_name, product_name, url }) {
    const subject = 'O seu plano de assinatura está em atraso';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = lateSubscription({
      full_name: capitalizeName(full_name),
      product_name: capitalizeName(product_name),
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
