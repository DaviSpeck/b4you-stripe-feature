const {
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
} = require('../styles');
const { formatPhone } = require('../../utils/formatters');

module.exports.forwarded = ({ full_name, tracking_url, tracking_code }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá, ${full_name}!</div>`,
    body: `<div ${styleBreakLineBigger}></div>
        <div ${styleText}>Seu pedido já está pronto para envio! Você pode acompanhar o seu pedido através do link abaixo.</div>
        <div ${styleButtonCenter}><a ${styleButton} href=${tracking_url}>Clique aqui para rastrear seu pedido</a></div>
        <div ${styleText}>Seu código de rastreio é: <b>${tracking_code}</b></div>
        <div ${styleText}>Agradecemos pela sua compra! Em caso de dúvidas entre em contato com o suporte do produto.</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

module.exports.shipping = ({ full_name, tracking_url, tracking_code }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá, ${full_name}!</div>`,
    body: `<div ${styleBreakLineBigger}></div>
        <div ${styleText}>Seu pedido já está a caminho e em breve estará em suas mãos!</div>
        <div ${styleText}>Seu código de rastreio é: <b>${tracking_code}</b></div>
        <div ${styleText}>Você pode acompanhar o status da entrega a qualquer momento clicando abaixo:</div>
        <div ${styleButtonCenter}><a ${styleButton} href=${tracking_url}>Acompanhe a entrega do seu pedido aqui</a></div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

module.exports.delivered = ({ full_name, tracking_url }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá, ${full_name}!</div>`,
    body: `<div ${styleBreakLineBigger}></div>
        <div ${styleText}>Ótima notícia: seu pedido foi entregue com sucesso! Esperamos que goste e aproveite bastante!</div>
        <div ${styleText}>Caso precise de algo, entre em contato com o suporte do produto</div>
        <div ${styleButtonCenter}><a ${styleButton} href=${tracking_url}>Ver detalhes da entrega</a></div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

module.exports.delivery_problem = ({
  full_name,
  support_email,
  support_phone,
}) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá, ${full_name}!</div>`,
    body: `<div ${styleBreakLineBigger}></div>
        <div ${styleText}>Houve um pequeno imprevisto no envio do seu pedido. Pedimos desculpas pelo transtorno e estamos aqui para resolver rapidamente!</div>
        <div ${styleText}>Por favor, entre em contato com o suporte do produto através do número ou email abaixo</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>${formatPhone(support_phone)}</div>
        <div ${styleText}>${support_email}</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};
