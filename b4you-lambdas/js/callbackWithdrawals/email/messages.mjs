import {
  styleBreakLine,
  styleBreakLineBigger,
  styleText,
  styleTextHello,
} from './styles.mjs';

export const confirmedWithdrawal = (full_name, amount) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
             <div ${styleBreakLineBigger}></div><div ${styleText}>A sua solicitação de saque foi concluída com sucesso. O valor solicitado já se encontra em sua conta bancária.</div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>Informações da transação:</div>
             <div ${styleText}>Valor sacado: <b>${amount}</b></div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

export const deniedWithdrawal = (full_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div><div ${styleText}>A sua solicitação de saque foi negada.</div>
           <div ${styleBreakLine}></div>
           <div ${styleText}>Motivos do saque não ter sido aceito:</div>
           <div ${styleText}><b>- Conta bancária inválida</b></div>
           <div ${styleText}><b>- Saldo insuficiente</b></div>
           <div ${styleText}><b>- Problemas na verificação de documentos</b></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};
