const {
  styleBreakLineBigger,
  styleBreakLine,
  styleText,
  styleTextHello,
  styleButtonCenter,
  styleButton,
} = require('../styles');

const approvedDocuments = ({ full_name }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Os documentos que você enviou para verificação foram <b>aprovados</b> com sucesso.</div> <div ${styleBreakLine}></div>
        <div ${styleText}>Agora você está apto para efetuar o saque de suas comissões na plataforma B4you.</div> <div ${styleBreakLine}></div>
        <div ${styleText}>Lembre-se! Para efetuar saques na sua conta B4you, você precisa ter sua conta bancária cadastrada</div>
        <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>ACESSE A B4YOU</a></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const pendingKyc = ({ full_name }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Você precisa realizar a prova de vida novamente em sua conta.</div> <div ${styleBreakLine}></div>
        <div ${styleText}>Clique no botão abaixo e realize o procedimento solicitado.</div> <div ${styleBreakLine}></div>
        <div ${styleButtonCenter}><a ${styleButton} href="${process.env.URL_SIXBASE_DASHBOARD}/verificar-identidade">ACESSE A B4YOU</a></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const reprovedDocuments = ({ full_name, description }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Infelizmente, os documentos que você enviou para verificação foram recusados.</div> <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Motivo da recusa:</div>
        <div ${styleText}>${description}</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Para validar seus documentos com a B4you, é necessário regularizar a situação acima. 
        Em caso de dúvidas, entre em contato com o nosso suporte.</div> <div ${styleBreakLine}></div>
        <div ${styleText}><b>Suporte B4you: https://ajuda.b4you.com.br</b></div>
        <div ${styleBreakLine}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const approvedCNPJ = ({ full_name }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>O seu CNPJ foi <b>aprovado</b> com sucesso.</div> <div ${styleBreakLine}></div>
        <div ${styleText}>Agora a sua conta na B4you é PJ!.</div> <div ${styleBreakLine}></div>
        <div ${styleText}>Lembre-se de trocar a sua conta bancária para uma conta da sua empresa. Caso contrário, seus saques não serão aprovados.</div>
        <div ${styleButtonCenter}><a ${styleButton} href=${process.env.URL_SIXBASE_DASHBOARD}>ACESSE A B4YOU</a></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const reprovedCNPJ = ({ full_name, description }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>E aí, tudo bem?</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Infelizmente, o seu CNPJ não foi aprovado.</div> <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Motivo da recusa:</div>
        <div ${styleText}>${description}</div>
        <div ${styleBreakLineBigger}></div>
        <div ${styleText}>Para validar seu CNPJ com a B4you, é necessário regularizar a situação acima.</div> <div ${styleBreakLine}></div>
        <div ${styleText}>Em caso de dúvidas, entre em contato com o nosso suporte.</div> <div ${styleBreakLine}></div>
        <div ${styleText}><b>Suporte B4you: https://ajuda.b4you.com.br</b></div>
        <div ${styleBreakLine}></div>
        <div ${styleText}>Abraços,</div>
        <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

module.exports = {
  approvedCNPJ,
  approvedDocuments,
  reprovedCNPJ,
  reprovedDocuments,
  pendingKyc,
};
