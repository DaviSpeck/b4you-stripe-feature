import { capitalizeName, formatBRL } from '../utils/formatters.mjs';
import { styleTextHello, styleText, styleButton, styleBreakLineBigger, styleButtonCenter} from './styles.mjs';

const canceledPlan = (full_name, product_name, offer_uuid, amount, support_email, support_whatsapp) => {
  let contactInfo = '';
  if (support_email && support_whatsapp) {
    contactInfo = `Email: ${support_email} | WhatsApp: ${support_whatsapp}`;
  } else if (support_email) {
    contactInfo = `Email: ${support_email}`;
  } else if (support_whatsapp) {
    contactInfo = `WhatsApp: ${support_whatsapp}`;
  } else {
    contactInfo = ''; 
  }

  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Após cinco tentativas, não foi possível efetuar a cobrança do produto <b>${product_name}</b> no valor de <b>${amount}</b>, portanto ela foi <b>cancelada</b>. A partir de agora, você não tem mais acesso ao produto.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Caso queira recuperar o acesso, basta clicar no botão abaixo:</div>
          <div ${styleButtonCenter}><a ${styleButton} href="https://checkout.b4you.com.br/${offer_uuid}">REATIVAR MINHA ASSINATURA</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Se preferir, fale com nosso time: ${contactInfo}</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

export class SubscriptionCanceled {
  constructor(mailService) {
    this.mailService = mailService;
  }

  async send({ email, full_name, product_name, amount, offer_uuid = null, support_email = null, support_whatsapp = null }) {
    const subject = 'Sua assinatura foi cancelada';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = canceledPlan(
      capitalizeName(full_name),
      capitalizeName(product_name),
      offer_uuid,
      formatBRL(amount),
      support_email,
      support_whatsapp
    );
    
    const fullEmailContent = variables.header + variables.body;
    
    try {
      const response = await this.mailService.sendMail({
        subject,
        toAddress,
        variables: { body: fullEmailContent },
        useTemplate: false, 
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}