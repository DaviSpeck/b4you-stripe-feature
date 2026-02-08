import {
  styleBreakLine,
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
} from "./styles.mjs";

export const approvedPaymentEcommerceTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  token,
  sale_uuid
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
      <div ${styleBreakLineBigger}></div>
      <div ${styleText}>A sua compra de <b>${product_name}</b> foi aprovada. Você receberá um novo e-mail com as instruções de acesso ao seu produto.</div>
      <br />
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

export const approvedPaymentAstronTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  token,
  sale_uuid
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
      <div ${styleBreakLineBigger}></div>
      <div ${styleText}>A sua compra de <b>${product_name}</b> foi aprovada. Você receberá um novo e-mail com as instruções de acesso ao seu produto.</div>
      <br />
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

export const approvedPaymentTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  token,
  sale_uuid
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

export const customApprovedPaymentTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  token,
  sale_uuid,
  customHtmlFromClient
) => {
  let parsedCustomHtml = customHtmlFromClient
    .replaceAll("{full_name}", full_name)
    .replaceAll("{product_name}", product_name)
    .replaceAll("{amount}", amount)
    .replaceAll("{producer_name}", producer_name)
    .replaceAll("{support_email}", support_email)
    .replaceAll("{sale_uuid}", sale_uuid);
  if (parsedCustomHtml.includes("{first_access_link}")) {
    const accessLinkHtml = `<div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${token}">ACESSAR MEU PRODUTO</a></div>`;
    parsedCustomHtml = parsedCustomHtml.replaceAll(
      "{first_access_link}",
      accessLinkHtml
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

export const approvedPaymentPhysicalTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  token,
  sale_uuid
) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
      <div ${styleBreakLineBigger}></div>
      <div ${styleText}>A sua compra de <b>${product_name}</b> foi aprovada.</div>
      <div ${styleText}>Detalhes da sua compra:</div>
      <div ${styleText}>Identificação da venda: <b>${sale_uuid}</b></div>
      <div ${styleText}>Nome do produto: <b>${product_name}</b></div>
      <div ${styleText}>Valor: <b>${amount} </b></div> 
      <div ${styleText}>Produtor(a): <b>${producer_name}</b></div>
      <div ${styleBreakLine}></div>
      <div ${styleText}>Para dúvidas relacionadas ao produto, entre em contato com o(a) Produtor(a) através do e-mail <b>${support_email}</b></div>
      <div ${styleBreakLineBigger}></div>
      <div ${styleText}>Abraços,</div>
      <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

export const approvedPaymentProductExternalTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  sale_uuid
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
      <div ${styleText}>Para dúvidas relacionadas ao produto, entre em contato com o(a) Vendedor(a) através do e-mail <b>${support_email}</b></div>
      <div ${styleBreakLineBigger}></div>
      <div ${styleText}>Abraços,</div>
      <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

export const customApprovedPaymentProductExternalTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  support_email,
  sale_uuid,
  customHtmlFromClient
) => {
  const parsedCustomHtml = customHtmlFromClient
    .replaceAll("{full_name}", full_name)
    .replaceAll("{product_name}", product_name)
    .replaceAll("{amount}", amount)
    .replaceAll("{producer_name}", producer_name)
    .replaceAll("{support_email}", support_email)
    .replaceAll("{sale_uuid}", sale_uuid);
  const emailTemplate = {
    body: `
      <div ${styleText}>
        ${parsedCustomHtml}
      </div>
    `,
  };
  return emailTemplate;
};

export const firstAccessTemplate = (
  full_name,
  product_name,
  amount,
  producer_name,
  token,
  support_email,
  sale_uuid
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

export const studentSubscriptionRenewed = (
  student_name,
  product_name,
  amount
) => {
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
