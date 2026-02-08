const {
  styleBreakLineBigger,
  styleBreakLine,
  styleText,
  styleTextHello,
  styleButtonCenter,
  styleButton,
} = require('../styles');

const awardAchievedAndShipped = ({
  full_name,
  milestone,
  tracking_code,
  tracking_link,
}) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    
    <!-- Conquista -->
    <div ${styleText}>🎉 <b>PARABÉNS!</b> Você acabou de alcançar o marco de <b>R$ ${milestone}</b> em vendas!</div>
    <div ${styleBreakLine}></div>
    <div ${styleText}>Você conquistou uma premiação especial! Nossa equipe preparou e enviou seu prêmio.</div>
    <div ${styleBreakLineBigger}></div>
    
    <!-- Detalhes do envio -->
    <div ${styleText}>📦 Detalhes do envio:</div>
    <div ${styleText}>• Código de rastreamento: <b>${tracking_code}</b></div>
    <div ${styleText}>• Acompanhe seu pedido: <a href="${tracking_link}" target="_blank">Clique aqui</a></div>
    <div ${styleBreakLineBigger}></div>

    <!-- Encerramento + Botão -->
    <div ${styleText}>Continue vendendo e conquistando novos marcos! Sua dedicação está sendo recompensada.</div>
    <div ${styleBreakLine}></div>
    
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Time B4you.</div>
  `,
  };
  return emailTemplate;
};

module.exports = {
  awardAchievedAndShipped,
};