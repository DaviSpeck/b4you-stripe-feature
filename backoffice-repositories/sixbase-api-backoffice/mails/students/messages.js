const {
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
} = require('../styles');

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

module.exports = {
  forgotPasswordTemplate,
};
