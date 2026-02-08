import {
  styleBreakLine,
  styleBreakLineBigger,
  styleText,
  styleTextHello,
  styleButtonCenter,
  styleButton,
} from './styles.mjs';

export const trackingEmail = (first_name, code, url) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${first_name}! </div>`,
    body: `   <div ${styleText}>O código de rastreio para seu pedido foi atualizado! O seu código é <b>${code}</b>.</div>
              <div ${styleBreakLineBigger}></div>
              <div ${styleText}>Você pode acompanhar o seu pedido clicando no botão abaixo.</div>
              <div ${styleButtonCenter}><a ${styleButton} href=${url}>RASTREAR PEDIDO</a></div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Este email é automático. Caso deseje contatar o vendedor, por favor, obtenha os dados de contato no site do produto ou nos emails anteriores.</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Abraços, B4you.</div>
          `,
  };
  return emailTemplate;
};

export const trackingEmailCompany = (first_name, code, company) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${first_name}! </div>`,
    body: `   <div ${styleText}>O código de rastreio para seu pedido foi atualizado. Agora você pode acompanhar a entrega diretamente no site da transportadora.</div>
              <div ${styleBreakLineBigger}></div>
              <div ${styleText}>Transportadora: <b>${company}</b>.</div>
              <div ${styleText}>Código de rastreio: <b>${code}</b>.</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Acesse o site da transportadora indicada e acompanhe o seu pedido.</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Este é um e-mail automático, por isso não é possível responder a esta mensagem. Caso precise de mais informações, entre em contato diretamente com o vendedor. Você encontra os dados de contato no site do produto ou nos emails anteriores.</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Abraços, B4you.</div>
          `,
  };
  return emailTemplate;
};
