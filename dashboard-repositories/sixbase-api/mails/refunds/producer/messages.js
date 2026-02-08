const {
  styleBreakLine,
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
} = require('../../styles');

const refundRequested = (full_name, product_name, amount, student_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}> Recebemos a sua solicitação de reembolso para o aluno <b>${student_name}</b>, no curso <b>${product_name}</b> no valor de <b>${amount}</b>. O prazo para esta análise é de 5 dias úteis. Aguarde nosso retorno via e-mail ou entre em contato conosco pelo nosso suporte após este prazo.</div>
            <div ${styleBreakLine}></div>
            <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/vendas">MINHAS VENDAS</a></div>
            <div ${styleBreakLine}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

const refundRequestedPhysical = (
  full_name,
  product_name,
  amount,
  student_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}> Recebemos a sua solicitação de reembolso para o cliente <b>${student_name}</b>, no produto <b>${product_name}</b> no valor de <b>${amount}</b>. O prazo para esta análise é de 5 dias úteis. Aguarde nosso retorno via e-mail ou entre em contato conosco pelo nosso suporte após este prazo.</div>
            <div ${styleBreakLine}></div>
            <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/vendas">MINHAS VENDAS</a></div>
            <div ${styleBreakLine}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

const refundRejected = (
  full_name,
  product_name,
  amount,
  student_name,
  reason,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}> A sua solicitação de reembolso para <b>${student_name}</b>, no produto <b>${product_name}</b> no valor de <b>${amount}</b> não foi processada.</div>
            <div ${styleBreakLine}></div>
            <div ${styleText}><b>Motivo e ação:</b> ${reason}</div>
            <div ${styleBreakLine}></div>
            <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/vendas">MINHAS VENDAS</a></div>
            <div ${styleBreakLine}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

const refundPendingRequested = ({
  full_name,
  product_name,
  amount,
  student_name,
  student_email,
  student_whatsapp,
  due_date,
  sale_uuid,
}) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Você recebeu uma solicitação de reembolso em nome de <b>${student_name}</b>, no produto <b>${product_name}</b> no valor de <b>${amount}</b>.</div> <div ${styleBreakLine}></div>
            <div ${styleText}>Que tal tentar recuperar esta venda? Você tem até <b>${due_date}</b>. 
            Após esta data, o reembolso é feito automaticamente.</div><div ${styleBreakLine}></div>
            <div ${styleText}>Caso <b>${student_name}</b> decida permanecer
            com o produto, ele poderá cancelar a solicitação de reembolso através do cadastro
            de aluno na área de membros B4you.</div>
            <div ${styleBreakLine}></div>
            <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/vendas">MINHAS VENDAS</a></div>
            <div ${styleText}>Venda: <b>${sale_uuid}</b></div>
            <div ${styleText}>Nome:  <b>${student_name}</b></div>
            <div ${styleText}>Email:  <b>${student_email}</b></div>
            <div ${styleText}>Telefone: <b>${student_whatsapp} </b></div> 
            <div ${styleBreakLine}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

module.exports = {
  refundRequested,
  refundRejected,
  refundPendingRequested,
  refundRequestedPhysical,
};
