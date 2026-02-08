const {
  styleBreakLine,
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
} = require('../../styles');

const refundWarrantyRequested = ({ full_name, product_name, date, amount }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
              <div ${styleBreakLineBigger}></div>
              <div ${styleText}>A sua solicitação de reembolso no produto <b>${product_name}</b> foi recebida e será realizada de forma automática no dia <b>${date}</b>, no valor de <b>${amount}</b>, após o encerramento do prazo de garantia da compra.</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Agora é só aguardar que já está tudo certo!</div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Se você quer cancelar o seu pedido de reembolso e continuar com o acesso a seu produto, clique no botão abaixo:</div>
              <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}/atividade">MINHAS ATIVIDADES</a></div>
              <div ${styleBreakLine}></div>
              <div ${styleText}>Abraços,</div>
              <div ${styleText}>Equipe B4you.</div>
          `,
  };
  return emailTemplate;
};

module.exports = {
  refundWarrantyRequested,
};
