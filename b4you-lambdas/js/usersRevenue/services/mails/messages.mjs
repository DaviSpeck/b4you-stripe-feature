import {
  styleBreakLineBigger,
  styleBreakLine,
  styleText,
  styleTextHello,
  styleButtonCenter,
  styleButton,
} from "../../styles/styles.mjs";

export const AwardAchieved = ({ full_name, milestone }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>🎉 <b>PARABÉNS!</b> Você acabou de alcançar o marco de <b>R$ ${milestone}</b> em vendas!</div>
    <div ${styleBreakLine}></div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>Você conquistou uma premiação especial! Nossa equipe irá preparar e enviar seu prêmio em breve.</div>
    <div ${styleBreakLine}></div>
    <div ${styleText}><b>⚠️ IMPORTANTE:</b> Certifique-se de que seu endereço de entrega está atualizado em seu perfil para receber sua premiação.</div>
    <div ${styleBreakLine}></div>
    <div ${styleText}>Para atualizar seu endereço, acesse: <a href="https://dash.b4you.com.br/configuracoes" target="_blank">https://dash.b4you.com.br/configuracoes?tab=3</a></div>
    <div ${styleBreakLine}></div>
    <div ${styleText}>Continue vendendo e conquistando novos marcos! Sua dedicação está sendo recompensada.</div>
    <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}">ACESSE A B4YOU</a></div>
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Equipe B4you.</div>
  `,
  };
  return emailTemplate;
};
