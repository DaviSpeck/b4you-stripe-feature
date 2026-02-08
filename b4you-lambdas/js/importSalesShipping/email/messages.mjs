import {
  styleBreakLine,
  styleBreakLineBigger,
  styleText,
  styleTextHello,
  styleButtonCenter,
  styleButton,
} from './styles.mjs';

export const trackingEmail = (first_name, code, url, product_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${first_name}! </div>`,
    body: `   <div ${styleText}>O código de rastreio para seu pedido <b>${product_name}</b> foi atualizado! O seu código é <b>${code}</b>.</div>
              <div ${styleBreakLineBigger}></div>
              <div ${styleText}>Você pode acompanhar o seu pedido apertando no botão abaixo.</div>
              <div ${styleButtonCenter}><a ${styleButton} href=${url}>RASTREAR PEDIDO</a></div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Lembre-se de que os Correios tem até 24 horas para atualizar a situação. Sempre que houver uma atualização informaremos.</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Este email é automático. Caso deseje contatar o vendedor, por favor, obtenha os dados de contato no site do produto ou nos emails anteriores.</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Abraços, B4you.</div>
          `,
  };
  return emailTemplate;
};
