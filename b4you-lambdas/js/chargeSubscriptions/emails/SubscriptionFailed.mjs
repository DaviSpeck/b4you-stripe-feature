import { capitalizeName, formatBRL } from '../utils/formatters.mjs';
import {
  styleTextHello,
  styleText,
  styleButton,
  styleBreakLineBigger,
  styleButtonCenter,
} from './styles.mjs';

const chargeFailed = (full_name, product_name, amount) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Não foi possível renovar a sua assinatura do produto <b>${product_name}</b> no valor de <b>${amount}</b>, pois a compra não foi aprovada em seu cartão de crédito. Verifique seu meio de pagamento.</div>
          <div ${styleButtonCenter}><a ${styleButton} href="https://membros.b4you.com.br/assinaturas">MINHAS ASSINATURAS</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

export class SubscriptionFailed {
  constructor(mailService) {
    this.mailService = mailService;
  }
  async send({ email, full_name, product_name, amount }) {
    console.log(email);
    const subject = 'Sua assinatura está pendente';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = chargeFailed(
      capitalizeName(full_name),
      capitalizeName(product_name),
      formatBRL(amount)
    );
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
