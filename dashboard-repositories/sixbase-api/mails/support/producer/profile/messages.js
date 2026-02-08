const {
  styleBreakLine,
  styleBreakLineBigger,
  styleText,
  styleTextHello,
  styleTextLower,
} = require('../../../styles');

const cnpjApproval = ({ user_uuid, full_name, email, cnpj, date }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá,</div>`,
    body: `<div  ${styleText}>O produtor solicitou uma alteração no CNPJ.</div>
             <div ${styleBreakLineBigger}></div><div ${styleText}>Abaixo segue os dados do usuário.</div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>Identificador do usuário:  <b>${user_uuid}</b></div>
             <div ${styleText}>Nome:  <b>${full_name}</b></div>
             <div ${styleText}>Email: <b>${email} </b></div> 
             <div ${styleText}>Novo CNPJ solicitado para alteração: <b>${cnpj}</b></div>
             <div ${styleText}>Data da solicitação: <b>${date}</b></div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

const kycApproval = ({
  user_uuid,
  full_name,
  email,
  verification_uuid,
  date,
}) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá,</div>`,
    body: `<div  ${styleText}>O produtor enviou a documentação necessária para validação do perfil.</div>
             <div ${styleBreakLineBigger}></div><div ${styleText}>Abaixo segue os dados do usuário.</div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>Identificador do usuário:  <b>${user_uuid}</b></div>
             <div ${styleText}>Nome:  <b>${full_name}</b></div>
             <div ${styleText}>Email: <b>${email} </b></div> 
             <div ${styleText}>Identificador dos documentos: <b>${verification_uuid}</b></div>
             <div ${styleText}>Data da solicitação: <b>${date}</b></div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

const updateEmail = ({ full_name, new_email, old_email, code, ip }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `  <div ${styleText}>E aí, tudo bem?</div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Você solicitou alteração de e-mail da sua conta.</div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>E-mail atual: <b>${old_email}</b></div>
             <div ${styleText}>Novo e-mail: <b>${new_email}</b></div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>Utilize o código abaixo para concluir o processo em sua conta B4you.</div>
             <div ${styleBreakLine}></div>
             <div ${styleTextHello}>Código de verificação: <b>${code}</b></div>
             <div ${styleTextLower}>Este é o endereço de IP de onde foi solicitada a troca: <b>${ip}</b></div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}><b>Caso não tenha feito essa solicitação, altere sua senha e entre em contato com o nosso suporte.</b></div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

const updateEmailSuccess = ({ full_name, new_email, old_email, ip }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `  <div ${styleText}>E aí, tudo bem?</div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Troca de e-mail concluída com sucesso.</div>
             <div ${styleBreakLine}></div>
             <div ${styleText}>E-mail anterior: <b>${old_email}</b></div>
             <div ${styleText}>E-mail atual: <b>${new_email}</b></div>
             <div ${styleBreakLine}></div>            
             <div ${styleTextLower}>Este é o endereço de IP de onde foi efetuado a troca: <b>${ip}</b></div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}><b>Caso não tenha feito essa solicitação, entre em contato com o nosso suporte.</b></div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};

module.exports = { cnpjApproval, kycApproval, updateEmail, updateEmailSuccess };
