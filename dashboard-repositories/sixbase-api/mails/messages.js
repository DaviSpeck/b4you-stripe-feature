const {
  styleBreakLine,
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
  styleTextLower,
} = require('./styles');

const firstAccessTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  token,
  support_email,
  sale_uuid,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
      <div ${styleBreakLineBigger}></div>
      <div ${styleText}>A sua compra de <b>${product_name}</b> foi realizada com sucesso. 
      Agora você precisa cadastrar uma senha para acessar sua compra na B4you. 
      Certifique-se de cadastrar uma senha segura.</div>
      <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}/cadastrar-senha/${token}/first">CADASTRAR SENHA</a></div>
      <div ${styleText}>Identificação da venda:  <b>${sale_uuid}</b></div>
      <div ${styleText}>Nome do produto:  <b>${product_name}</b></div>
      <div ${styleText}>Valor: <b>${amount} </b></div> 
      <div ${styleText}>Produtor(a): <b>${producer_name}</b></div>
      <div ${styleBreakLine}></div>
      <div ${styleText}>Para dúvidas relacionadas ao conteúdo do produto,entre em contato com o(a) Produtor(a) através do 
      e-mail <b>${support_email}</div>
      <div ${styleBreakLineBigger}></div>
      <div ${styleText}>Abraços,</div>
      <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const forgotPasswordTemplate = (full_name, token, url) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>É tanta senha nessa vida que às vezes a gente esquece, não é mesmo? Clique no botão para redefinir sua senha:</div>
        <div ${styleButtonCenter}><a ${styleButton} href="${url}/cadastrar-senha/${token}/new">REDEFINIR SENHA</a></div>
        <div ${styleText}>Este e-mail foi um engano? Tudo bem, é só desconsiderá-lo.</div>   
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const approvedPaymentTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  token,
  sale_uuid,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>A sua compra de <b>${product_name}</b> foi aprovada. Seu acesso será feito pela nossa plataforma.</div>
    <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${token}">ACESSAR MEU PRODUTO</a></div>
    <div ${styleText}>Detalhes da sua compra:</div>
    <div ${styleText}>Identificação da venda: <b>${sale_uuid}</b></div>
    <div ${styleText}>Nome do produto: <b>${product_name}</b></div>
    <div ${styleText}>Valor: <b>${amount} </b></div> 
    <div ${styleText}>Produtor(a): <b>${producer_name}</b></div>
    <div ${styleBreakLine}></div>
    <div ${styleText}>Para dúvidas relacionadas ao conteúdo do produto, entre em contato com o(a) Produtor(a) através do e-mail <b>${support_email}</b></div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const customApprovedPaymentTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  token,
  sale_uuid,
  customHtmlFromClient,
) => {
  let parsedCustomHtml = customHtmlFromClient
    .replaceAll('{full_name}', full_name)
    .replaceAll('{product_name}', product_name)
    .replaceAll('{amount}', amount)
    .replaceAll('{producer_name}', producer_name)
    .replaceAll('{support_email}', support_email)
    .replaceAll('{sale_uuid}', sale_uuid);
  if (parsedCustomHtml.includes('{first_access_link}')) {
    const accessLinkHtml = `<div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${token}">ACESSAR MEU PRODUTO</a></div>`;
    parsedCustomHtml = parsedCustomHtml.replaceAll(
      '{first_access_link}',
      accessLinkHtml,
    );
  }
  const emailTemplate = {
    body: `
      <div ${styleText}>
        ${parsedCustomHtml}
      </div>
    `,
  };
  return emailTemplate;
};

const approvedPaymentProductExternalTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  sale_uuid,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>A sua compra de <b>${product_name}</b> foi aprovada.</div>
    <div ${styleBreakLine}></div>
    <div ${styleText}>Detalhes da sua compra:</div>
    <div ${styleText}>Identificação da venda: <b>${sale_uuid}</b></div>
    <div ${styleText}>Produto: <b>${product_name}</b></div>
    <div ${styleText}>Valor: <b>${amount} </b></div> 
    <div ${styleText}>Vendedor(a): <b>${producer_name}</b></div>
    <div ${styleBreakLine}></div>
    <div ${styleText}>Para dúvidas relacionadas ao conteúdo do produto, entre em contato com o(a) Vendedor(a) através do e-mail <b>${support_email}</b></div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const customApprovedPaymentProductExternalTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  sale_uuid,
  customHtmlFromClient,
) => {
  const parsedCustomHtml = customHtmlFromClient
    .replaceAll('{full_name}', full_name)
    .replaceAll('{product_name}', product_name)
    .replaceAll('{amount}', amount)
    .replaceAll('{producer_name}', producer_name)
    .replaceAll('{support_email}', support_email)
    .replaceAll('{sale_uuid}', sale_uuid);
  const emailTemplate = {
    body: `
      <div ${styleText}>
        ${parsedCustomHtml}
      </div>
    `,
  };
  return emailTemplate;
};

const coproductionInviteTemplate = (
  full_name,
  producer,
  product_name,
  due_date,
  commission,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá  ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Você recebeu um convite de <b>${producer}</b>, para ser tornar um coprodutor(a) no produto <b>${product_name}.</b></div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}><b>Condições oferecidas:</b></div>
        <div ${styleBreakLine}></div>
        <div ${styleText}>Validade da coprodução: <b>${due_date}</b></div>
        <div ${styleText}>Você receberá: <b>${commission}%</b> de comissão sobre a venda do produto.</div>
        <div ${styleBreakLine}></div>
        <div ${styleText}>Clique no botão abaixo para acessar a plataforma e visualizar o convite de coprodução:</div>
        <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/produtos/coproducoes">VER MEU CONVITE</a></div>
        <div ${styleTextLower}>Ao aceitar o convite, você estará de acordo com os Termos de Uso e a proposta acima oferecida pelo produtor.</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const coproductionCancelInviteTemplate = (
  full_name,
  producer,
  product_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}><b>${producer}</b> cancelou o convite de coprodução para o produto <b>${product_name}</b>.</div>
    <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/produtos/coproducoes">MINHAS COPRODUÇÕES</a></div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const coproductionCancelTemplate = (
  full_name,
  coproducer_name,
  product_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>O coprodutor <b>${coproducer_name}</b> cancelou o contrato de coprodução no produto <b>${product_name}</b>.</div>
    <div ${styleBreakLine}></div>
    <div ${styleText}>Confira abaixo as coproduções ativas em todos os seus produtos:</div>
    <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/produtos/listar">MEUS PRODUTOS</a></div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Equipe B4you.</div>`,
  };
  return emailTemplate;
};

const coproductionCanceledProducerTemplate = (
  full_name,
  coproducer_name,
  product_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${coproducer_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>O produtor <b>${full_name}</b> cancelou o contrato de coprodução no produto <b>${product_name}</b>.</div>
    <div ${styleBreakLine}></div>
    <div ${styleText}>Confira abaixo suas coproduções ativas:</div>
    <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/produtos/coproducoes">MINHAS COPRODUÇÕES</a></div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Equipe B4you.</div>`,
  };
  return emailTemplate;
};

const coproductionWarningDaysTemplate = (
  full_name,
  coproductor,
  days,
  product_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá  ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>O contrato de coprodução no produto <b>${product_name}</b> com <b>${coproductor}</b> irá expirar em <b>${days}</b> dia(s).</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Equipe B4you.</div>`,
  };
  return emailTemplate;
};

const coproductionExpiredTemplate = (full_name, coproductor, product_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>O contrato de coprodução no produto <b>${product_name}</b> com <b>${coproductor}</b> expirou. Agora você não tem mais coprodução neste produto.</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}>Abraços,</div>
    <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const classroomAccessTemplate = (
  full_name,
  url_action,
  product_name,
  productor_name,
  support_email,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Seu acesso para o produto <b>${product_name}</b> chegou!</div>
          <div ${styleButtonCenter}><a ${styleButton} href=${url_action}>ACESSAR MEU PRODUTO</a></div>
          <div ${styleText}>Produto: <b>${product_name}</b></div>
          <div ${styleText}>Produtor(a): <b>${productor_name}</b></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Está com dúvidas relacionadas ao conteúdo do produto? Entre em contato com o(a) Produtor(a) através do e-mail ${support_email}</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const newAffiliateProducer = (
  producer_name,
  affiliate_name,
  affiliate_email,
  product_name,
  commission,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${producer_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Você recebeu um novo afiliado no produto <b>${product_name}.</b></div>
          <div ${styleText}>Comissão: <b>${commission}%</b></div>
          <div ${styleText}>Nome: <b>${affiliate_name}</b></div>
          <div ${styleText}>E-mail: <b>${affiliate_email}</b></div>
          <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>MEUS AFILIADOS</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const pendingNewAffiliateProducer = (
  producer_name,
  affiliate_name,
  affiliate_email,
  product_name,
  commission,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${producer_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Você recebeu um novo pedido para afiliação no produto <b>${product_name}.</b> Acesse o painel de afiliados
          para <b>aceitá-lo</b> ou <b>recusá-lo</b>.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>ACESSAR PAINEL</a></div>
          <div ${styleBreakLine}></div>
          <div ${styleText}><b>Informações do pedido de afiliação:</b></div>
          <div ${styleBreakLine}></div>
          <div ${styleText}>Comissão: <b>${commission}%</b></div>
          <div ${styleText}>Nome: <b>${affiliate_name}</b></div>
          <div ${styleText}>E-mail: <b>${affiliate_email}</b></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const newApprovedAffiliateUser = (
  affiliate_name,
  support_email,
  commission,
  product_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${affiliate_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>A sua solicitação de afiliação ao produto <b>${product_name}</b> foi aprovada.</div>
          <div ${styleText}>Comissão:<b> ${commission}%</b></div>
          <div ${styleText}>E-mail de suporte aos afiliados: <b>${support_email}</b></div>
          <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>MINHAS AFILIAÇÕES</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
    `,
  };
  return emailTemplate;
};

const newPendingAffiliateUser = (
  affiliate_name,
  support_email,
  commission,
  product_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${affiliate_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>A sua solicitação de afiliação ao produto <b>${product_name}</b> está pendente. Avisaremos assim que o produtor aceitá-la.</div>
            <div ${styleText}>Comissão:<b> ${commission}%</b></div>
            <div ${styleText}>E-mail de suporte aos afiliados: <b>${support_email}</b></div>
            <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>MINHAS AFILIAÇÕES</a></div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const blockAffiliateUser = (affiliate_name, support_email, product_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${affiliate_name},</div>`,
    body: ` <div  ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>O produtor bloqueou a sua afiliação ao produto <b>${product_name}</b>.</div>
            <div ${styleText}>Isso significa que você não receberá mais nenhuma comissão a partir de agora. Caso tenha alguma dúvida, você poderá entrar em contato com o e-mail de suporte abaixo.</b></div>
            <div ${styleBreakLine}></div>
            <div ${styleText}>E-mail de suporte aos afiliados: <b>${support_email}</b></div>
            <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>MINHAS AFILIAÇÕES</a></div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const rejectAffiliateUser = (affiliate_name, support_email, product_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${affiliate_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>O produtor <b>recusou</b> a sua afiliação ao produto <b>${product_name}</b>.</div>
            <div ${styleText}>Isso significa que sua solicitação de afiliação não foi aceita. Caso tenha alguma dúvida, você poderá entrar em contato com o e-mail de suporte abaixo.</div>
            <div ${styleBreakLine}></div>
            <div ${styleText}>E-mail de suporte aos afiliados: <b>${support_email}</b></div>
            <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>MINHAS AFILIAÇÕES</a></div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const changeAffiliateCommission = (
  affiliate_name,
  old_commission,
  new_commission,
  product_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${affiliate_name},</div>`,
    body: ` <div  ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>O produtor alterou a sua comissão para o produto <b>${product_name}</b>.</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Comissão antiga: <b>${old_commission}%</b></div>
            <div ${styleText}>Comissão nova: <b>${new_commission}%</b></div>
            <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>ACESSAR DASHBOARD</a></div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const inviteTeamCollaborator = (producer_name, collaborator_name, token) => {
  let url = `${process.env.URL_SIXBASE_DASHBOARD}/colaboradores`;
  if (token) {
    url = `${process.env.URL_SIXBASE_DASHBOARD}/cadastrar-senha/${token}/new?redirect_url=/colaboradores`;
    return {
      header: `<div ${styleTextHello}>Olá ${collaborator_name},</div>`,
      body: `<div  ${styleText}>E aí, tudo bem?</div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Seja bem-vindo à B4you.</div>
             <div ${styleText}>Antes de tudo, queremos celebrar que você está aqui! A partir de agora você está dando início à sua jornada na B4you.</div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Você foi convidado(a) para colaborar na equipe de <b>${producer_name}</b>.</div>
             <div ${styleButtonCenter}><a ${styleButton} href=${url}>ACESSAR CONVITE</a></div>
             <div ${styleText}>Com a B4you você vende, gerencia e planeja suas estratégias para escalar seu negócio digital.</div>
             <div ${styleBreakLine}></div>
             <div ${styleText}><i>Conte com a gente!</i></div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
    };
  }

  return {
    header: `<div ${styleTextHello}>Olá ${collaborator_name},</div>`,
    body: ` <div  ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Você foi convidado(a) para colaborar na equipe de <b>${producer_name}</b>.</div>
           <div ${styleButtonCenter}><a ${styleButton} href=${url}>ACESSAR CONVITE</a></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
};

const saleChargeback = (client_name, product_name, additional_text) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${client_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>
           A sua compra do produto <b>${product_name}</b> acabou de ser reembolsada.</div>
           <div ${styleBreakLine}></div>
           <div ${styleText}>${additional_text}</div>
           <div ${styleBreakLine}></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const canceledPlan = (client_name, product_name, support_email, valid_date) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${client_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>O seu plano de assinatura no produto <b>${product_name}</b> acabou de ser cancelado. Você poderá utilizar o produto até a data <b>${valid_date}</b>. Caso tenha alguma dúvida, você poderá entrar em contato com o e-mail de suporte abaixo:</div>
           <div ${styleBreakLine}></div>
           <div ${styleText}><b>${support_email}</b></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>

      `,
  };
  return emailTemplate;
};

const updateStudentBankAccount = (
  student_name,
  producer_name,
  product_name,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>O produtor(a) ${producer_name}, solicitou o seu reembolso referente ao produto <b>${product_name}</b>. No entanto, não existe uma conta bancária cadastrada em seu perfil na B4you para realizarmos a devolução do valor.</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Por gentileza, acesse a plataforma, vá em <b>minha conta</b> e depois em <b>conta bancária</b>. É só adicionar os dados da sua conta bancária nos campos e salvar.</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleTextLower}><b>IMPORTANTE:</b> Só será realizado o reembolso se o favorecido da conta bancária for a mesma pessoa que efetuou a compra.</div>
           <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}/aluno">MEU PERFIL</a></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const rejectedRefundStudent = (
  student_name,
  product_name,
  amount,
  reason,
  date,
  payment_method,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>A sua solicitação de reembolso foi recebida, porém ocorreu um erro ao finalizá-la, devido às nossas políticas de uso.</div>
          <div ${styleBreakLine}></div>
           <div ${styleText}><b>Motivo e ação:</b> ${reason}</div>
           <div ${styleText}><b>Valor solicitado:</b> ${amount}</div>
           <div ${styleText}><b>Data da solicitação:</b> ${date}</div>
           <div ${styleText}><b>Nome do produto:</b> ${product_name}</div>
           <div ${styleText}><b>Método de pagamento da compra:</b> ${payment_method}</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const refundProductor = (
  producer_name,
  product_name,
  student_name,
  amount,
  reason,
  date,
  payment_method,
  sale_uuid,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${producer_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>O aluno ${student_name} solicitou o reembolso do produto <b>${product_name}.</b></div>
          <div ${styleBreakLine}></div>
          <div ${styleText}><b>Identificação da venda:</b> ${sale_uuid}</div>
           <div ${styleText}><b>Motivo:</b> ${reason}</div>
           <div ${styleText}><b>Valor solicitado:</b> ${amount}</div>
           <div ${styleText}><b>Data da solicitação:</b> ${date}</div>
           <div ${styleText}><b>Método de pagamento da compra:</b> ${payment_method}</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const refundProductorSubscription = (
  producer_name,
  product_name,
  student_name,
  amount,
  reason,
  date,
  sale_uuid,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${producer_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>O aluno ${student_name} solicitou o reembolso da assinatura do produto <b>${product_name}.</b></div>
          <div ${styleBreakLine}></div>
          <div ${styleText}><b>Identificação da venda:</b> ${sale_uuid}</div>
           <div ${styleText}><b>Motivo:</b> ${reason}</div>
           <div ${styleText}><b>Valor da assinatura:</b> ${amount}</div>
           <div ${styleText}><b>Data da solicitação:</b> ${date}</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const subscriptionCanceledByStudent = (
  student_name,
  product_name,
  amount,
  valid_date_until,
  support_email,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>O seu plano de assinatura de  <b>${product_name}</b> no valor de <b>${amount}</b> foi cancelado com sucesso. Você poderá acessá-lo até <b>${valid_date_until}</b>. Caso tenha alguma dúvida, você poderá entrar em contato pelo o e-mail de suporte abaixo:</div>
            <div ${styleBreakLine}></div>
            <div ${styleText}>E-mail de suporte: <b>${support_email}</b></div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>`,
  };
  return emailTemplate;
};

const subscriptionCanceledByProducer = (
  student_name,
  product_name,
  amount,
  valid_date_until,
  support_email,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Informamos que sua assinatura do produto <b>${product_name}</b> no valor de <b>${amount}</b> foi cancelada. Você poderá continuar acessando o conteúdo até <b>${valid_date_until}</b>.</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Caso tenha alguma dúvida ou precise de suporte, entre em contato conosco através do e-mail:</div>
            <div ${styleBreakLine}></div>
            <div ${styleText}>E-mail de suporte: <b>${support_email}</b></div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Estamos à disposição para ajudar!</div>
            <div ${styleBreakLineBigger}></div>
            <div ${styleText}>Abraços,</div>
            <div ${styleText}>Equipe B4you.</div>`,
  };
  return emailTemplate;
};

const producerWelcome = (
  full_name,
  url = process.env.URL_SIXBASE_DASHBOARD,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Seja bem-vindo à B4you.</div>
           <div ${styleText}>Antes de tudo, queremos celebrar que você está aqui! A partir de agora você está dando início à sua jornada na B4you.</div>
           <div ${styleText}>O seu cadastro está pronto e você já pode iniciar suas vendas.</div>
           <div ${styleButtonCenter}><a ${styleButton} href=${url}>ACESSE SUA CONTA</a></div>
           <div ${styleText}>Com a B4you você vende, gerencia e planeja suas estratégias para escalar seu negócio.</div>
           <div ${styleBreakLine}></div>
           <div ${styleText}><i>Conte com a gente!</i></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const confirmedPaymentSale = (full_name, product_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div><div ${styleText}>Você acabou de efetuar uma venda no produto <b>${product_name}</b>.</div>
           <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>ACESSAR MINHA CONTA</a></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const confirmedWithdrawal = (full_name, amount) => {
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

const deniedWithdrawal = (full_name) => {
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

const pendingDocuments = (full_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div><div ${styleText}>Recebemos os seus documentos para análise. Este processo pode levar até 3 dias úteis.</div>
           <div ${styleBreakLine}></div>
           <div ${styleText}>Após análise, você receberá o resultado por e-mail.</div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const confirmedDocuments = (full_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div><div ${styleText}>Os documentos enviados para verificação de identidade foram aprovados. Agora você já pode fazer solicitações de saque através da plataforma.</div>
           <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}/carteira>SOLICITAR SAQUE</a></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const upSellAndOrderBump = (
  student_name,
  product_name,
  producer_name,
  amount,
  sale_uuid,
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div><div ${styleText}>A sua compra de <b>${product_name}</b> foi realizada com sucesso. O acesso ao seu produto já está disponível em seus produtos. </div>
           <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_MEMBERSHIP}/>MEUS PRODUTOS</a></div>
           <div ${styleText}>Identificação da venda:  <b>${sale_uuid}</b></div>
           <div ${styleText}>Nome do produto:  <b>${product_name}</b></div>
           <div ${styleText}>Valor: <b>${amount} </b></div> 
           <div ${styleText}>Produtor(a): <b>${producer_name}</b></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const studentSubscriptionRenewed = (student_name, product_name, amount) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `<div  ${styleText}>E aí, tudo bem?</div>
           <div ${styleBreakLineBigger}></div><div ${styleText}>A renovação da assinatura de <b>${product_name}</b> no valor de <b>${amount}</b> foi realizada com sucesso. Você pode gerenciar suas assinaturas em seu cadastro na B4you.</div>
           <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}/assinaturas">Gerenciar assinaturas</a></div>
           <div ${styleBreakLineBigger}></div>
           <div ${styleText}>Abraços,</div>
           <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const studentRefundCode = (student_name, verification_code) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `  <div ${styleText}>E aí, tudo bem?</div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Para acessar a página de reeembolso, utilize o código abaixo para concluir o processo em sua conta B4you.</div>
             <div ${styleBreakLine}></div>
             <div ${styleTextHello}>Código de verificação: <b>${verification_code}</b></div>           
             <div ${styleBreakLineBigger}></div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

const accessCode = (student_name, verification_code) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${student_name},</div>`,
    body: `  <div ${styleText}>E aí, tudo bem?</div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Utilize o código abaixo para concluir o processo em sua conta B4you.</div>
             <div ${styleBreakLine}></div>
             <div ${styleTextHello}>Código de verificação: <b>${verification_code}</b></div>           
             <div ${styleBreakLineBigger}></div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

module.exports = {
  accessCode,
  approvedPaymentProductExternalTemplate,
  approvedPaymentTemplate,
  blockAffiliateUser,
  canceledPlan,
  changeAffiliateCommission,
  classroomAccessTemplate,
  confirmedDocuments,
  confirmedPaymentSale,
  confirmedWithdrawal,
  coproductionCancelInviteTemplate,
  coproductionCancelTemplate,
  coproductionExpiredTemplate,
  coproductionInviteTemplate,
  coproductionWarningDaysTemplate,
  deniedWithdrawal,
  firstAccessTemplate,
  forgotPasswordTemplate,
  inviteTeamCollaborator,
  newAffiliateProducer,
  newApprovedAffiliateUser,
  newPendingAffiliateUser,
  pendingDocuments,
  pendingNewAffiliateProducer,
  producerWelcome,
  refundProductor,
  refundProductorSubscription,
  rejectAffiliateUser,
  rejectedRefundStudent,
  saleChargeback,
  studentSubscriptionRenewed,
  subscriptionCanceledByStudent,
  subscriptionCanceledByProducer,
  updateStudentBankAccount,
  upSellAndOrderBump,
  coproductionCanceledProducerTemplate,
  studentRefundCode,
  customApprovedPaymentProductExternalTemplate,
  customApprovedPaymentTemplate,
};
