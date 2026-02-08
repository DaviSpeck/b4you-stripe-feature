import { capitalizeName } from "../utils/formatters.mjs";
import {
  styleTextHello,
  styleText,
  styleButton,
  styleBreakLineBigger,
  styleButtonCenter,
} from "./styles.mjs";

const reactivationTemplate = (
  full_name,
  product_name,
  offer_uuid,
  support_email,
  support_whatsapp
) => {
  let contactInfo = "";
  if (support_email && support_whatsapp) {
    contactInfo = `Email: ${support_email} | WhatsApp: ${support_whatsapp}`;
  } else if (support_email) {
    contactInfo = `Email: ${support_email}`;
  } else if (support_whatsapp) {
    contactInfo = `WhatsApp: ${support_whatsapp}`;
  } else {
    contactInfo = "";
  }

  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Vimos que voce teve uma assinatura cancelada recentemente e queremos te ajudar a recuperar o acesso ao <b>${product_name}</b>.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Para reativar sua assinatura e recuperar o acesso ao produto, clique no botão abaixo:</div>
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

export class SubscriptionReactivation {
  constructor(mailService) {
    this.mailService = mailService;
  }

  async send({
    email,
    full_name,
    product_name,
    amount,
    isFirstEmail = true,
    sendAt = null,
    id_offer = null,
    offer_uuid = null,
    support_email = null,
    support_whatsapp = null,
  }) {
    const subject = "Recupere o acesso ao seu produto - Reative sua assinatura";
    const preheader =
      "Sua assinatura foi cancelada. Reative agora e recupere seu acesso.";

    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];

    const variables = reactivationTemplate(
      capitalizeName(full_name),
      capitalizeName(product_name),
      offer_uuid,
      support_email,
      support_whatsapp
    );

    try {
      const response = await this.mailService.sendMail({
        subject,
        preheader,
        toAddress,
        variables,
        sendAt,
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
