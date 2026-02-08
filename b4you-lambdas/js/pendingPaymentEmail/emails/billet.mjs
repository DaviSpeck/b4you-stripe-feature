import {
  styleBreakLine,
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
  withoutLink,
} from './styles.mjs';

export const generatedBillet = ({
  amount,
  bar_code,
  due_date,
  student_name,
  product_name,
  support_email,
  url,
}) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Somos a B4you, a empresa que gerencia os pagamentos do produto <b>${product_name}</b>.</div>
        <div ${styleText}>Para finalizar a sua compra, acesse o boleto para pagamento clicando no botão abaixo.</div>
        <div ${styleButtonCenter}><a ${styleButton} href=${url}>VER BOLETO</a></div>
        <div ${styleText}>O boleto pode ser pago em qualquer banco em sua cidade ou pelo site do seu banco com o código de barras abaixo:</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Código de barras:</div>
        <div ${styleText}><b>${bar_code}</b></div> 
        <div ${styleBreakLine}></div>
        <div ${styleText}>Data de vecimento: <b>${due_date}</b></div>
        <div ${styleBreakLine}></div>
        <div ${styleText}>Valor: <b>${amount}</b></div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>⚠️IIMPORTANTE!</div>
        <div ${styleText}>Para ter acesso ao produto, é necessário aguardar a confirmação do pagamento do boleto, que acontece automaticamente em até 48 horas. </div>
        <div ${styleText}>Se você tiver qualquer dúvida, entre em contato direto com o vendedor do produto pelo e-mail abaixo:</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>${support_email}</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

export const generatePix = ({
  amount,
  qrcode,
  pix_code,
  student_name,
  product_name,
  support_email,
  url,
}) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Somos a B4you, a empresa que gerencia os pagamentos do produto <b>${product_name}</b>.</div>
        <div ${styleText}>Para finalizar a sua compra, acesse o pix para pagamento clicando no botão abaixo.</div>
        <div ${styleButtonCenter}><a ${styleButton} href=${url}>VER PIX</a></div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Código para pagamento do Pix:</div>
        <div ${styleBreakLine}></div>
        <div ${styleText}><a ${withoutLink}>${pix_code}</a></div> 
        <div ${styleBreakLine}></div>
        <div ${styleButtonCenter}><img src="${qrcode}" width="300" height="300"></img></div>
        <div ${styleText}>Valor: <b>${amount}</b></div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Se você tiver qualquer dúvida, entre em contato direto com o vendedor do produto pelo e-mail abaixo:</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>${support_email}</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};
