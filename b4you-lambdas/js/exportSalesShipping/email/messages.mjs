import { styleBreakLine, styleBreakLineBigger, styleText, styleTextHello } from './styles.mjs';

export const attachmentMessage = (first_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${first_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
              <div ${styleBreakLineBigger}></div>
              <div ${styleText}>Segue em anexo sua planilha de vendas para importação do código de rastreio das vendas.</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Abraços,</div>
              <div ${styleText}>Equipe B4you.</div>
          `,
  };
  return emailTemplate;
};
