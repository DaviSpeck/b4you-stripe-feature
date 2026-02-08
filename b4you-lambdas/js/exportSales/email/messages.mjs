import { styleBreakLine, styleBreakLineBigger, styleButton, styleText, styleTextHello, styleButtonCenter } from './styles.mjs';

export const attachmentMessage = (first_name, url) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${first_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
              <div ${styleBreakLineBigger}></div>
              <div ${styleText}>Sua planilha de vendas está pronta.</div>
              <div ${styleBreakLine}></div>
              <div ${styleButtonCenter}><a ${styleButton} href="${url}">PLANILHA DE VENDAS</a></div>
              <div ${styleText}>Abraços,</div>
              <div ${styleText}>Equipe B4you.</div>
          `,
  };
  return emailTemplate;
};
