const {
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
} = require('../../styles');

const chargeFailed = (full_name, product_name, amount) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Não foi possível renovar a sua assinatura do produto <b>${product_name}</b> no valor de <b>${amount}</b>, pois a compra não foi aprovada em seu cartão de crédito. Verifique seu meio de pagamento.</div>
          <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}/assinaturas">MINHAS ASSINATURAS</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const canceledPlan = (full_name, product_name, amount) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Após cinco tentativas, não foi possível efetuar a cobrança do produto <b>${product_name}</b> no valor de <b>${amount}</b>, portanto ela foi <b>cancelada</b>. A partir de agora, você não tem mais acesso ao produto.</div>
          <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}">MEUS PRODUTOS</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

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

const expiredSubscription = ({ full_name, product_name }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>A sua assinatura no <b>${product_name}</b> expirou.</div>
          <div ${styleText}>A partir de agora você não tem mais acesso ao conteúdo.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const cardUpdateLink = ({ full_name, product_name, url }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Você precisa atualizar o cartão de crédito da sua assinatura do produto <b>${product_name}</b>.</div>
          <div ${styleText}>Clique no botão abaixo para acessar a página de assinaturas e atualizar seus dados de pagamento:</div>
          <div ${styleButtonCenter}><a ${styleButton} href="${url}">ATUALIZAR CARTÃO</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

module.exports = {
  canceledPlan,
  chargeFailed,
  lateSubscription,
  renewSubscription,
  expiredSubscription,
  cardUpdateLink,
};
