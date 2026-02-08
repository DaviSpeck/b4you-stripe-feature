const {
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
} = require('../styles');

const userCreatedTemplate = (full_name, email, password, role_name) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>Seu cadastro no sistema administrativo B4you foi realizado com sucesso!</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Aqui estão suas credenciais de acesso:</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Email:</strong> ${email}</div>
          <div ${styleText}><strong>Senha:</strong> ${password}</div>
          <div ${styleText}><strong>Perfil:</strong> ${
      role_name || 'Sem perfil definido'
    }</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Para acessar o sistema, utilize o link abaixo:</div>
          <div ${styleButtonCenter}><a ${styleButton} href="https://backoffice.b4you.com.br">ACESSAR SISTEMA</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Importante:</strong> Por questões de segurança, recomendamos que você altere sua senha no primeiro acesso.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Como alterar sua senha:</strong></div>
          <div ${styleText}>1. Faça login no sistema com as credenciais fornecidas acima</div>
          <div ${styleText}>2. Clique no ícone do seu perfil no canto superior direito (nome e foto)</div>
          <div ${styleText}>3. Selecione "Alterar Senha" no menu</div>
          <div ${styleText}>4. Digite sua senha atual (a senha que você recebeu neste email)</div>
          <div ${styleText}>5. Digite sua nova senha (mínimo 8 caracteres com letras maiúsculas, minúsculas, números e símbolos especiais)</div>
          <div ${styleText}>6. Confirme a nova senha e clique em "Alterar Senha"</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Se você não solicitou este cadastro, entre em contato com o administrador do sistema.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const passwordChangedTemplate = (full_name, email) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>Sua senha foi alterada com sucesso no sistema administrativo B4you!</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Email:</strong> ${email}</div>
          <div ${styleText}><strong>Data da alteração:</strong> ${new Date().toLocaleString(
      'pt-BR',
    )}</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Para acessar o sistema, utilize o link abaixo:</div>
          <div ${styleButtonCenter}><a ${styleButton} href="https://backoffice.b4you.com.br">ACESSAR SISTEMA</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Importante:</strong> Se você não solicitou esta alteração de senha, entre em contato imediatamente com o administrador do sistema.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Para sua segurança, recomendamos:</div>
          <div ${styleText}>• Não compartilhar sua senha com terceiros</div>
          <div ${styleText}>• Usar senhas únicas e seguras</div>
          <div ${styleText}>• Alterar sua senha periodicamente</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const profileUpdatedTemplate = (full_name, email, changes) => {
  const changesList = changes
    .map(
      (change) =>
        `<div ${styleText}>• <strong>${change.field}:</strong> ${change.oldValue} → ${change.newValue}</div>`,
    )
    .join('');

  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>Seu perfil foi atualizado com sucesso no sistema administrativo B4you!</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Email:</strong> ${email}</div>
          <div ${styleText}><strong>Data da alteração:</strong> ${new Date().toLocaleString(
      'pt-BR',
    )}</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Alterações realizadas:</strong></div>
          ${changesList}
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Para acessar o sistema, utilize o link abaixo:</div>
          <div ${styleButtonCenter}><a ${styleButton} href="https://backoffice.b4you.com.br">ACESSAR SISTEMA</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Importante:</strong> Se você não solicitou estas alterações, entre em contato imediatamente com o administrador do sistema.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const userDeactivatedTemplate = (full_name, email, deactivated_by) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>Seu acesso ao sistema administrativo B4you foi temporariamente desativado.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Email:</strong> ${email}</div>
          <div ${styleText}><strong>Data da desativação:</strong> ${new Date().toLocaleString(
      'pt-BR',
    )}</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>O que isso significa:</strong></div>
          <div ${styleText}>• Você não conseguirá fazer login no sistema</div>
          <div ${styleText}>• Seu acesso foi suspenso temporariamente</div>
          <div ${styleText}>• Entre em contato com o administrador para mais informações</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Importante:</strong> Se você acredita que esta desativação foi um erro, entre em contato imediatamente com o administrador do sistema.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const userReactivatedTemplate = (full_name, email, reactivated_by) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleText}>Seu acesso ao sistema administrativo B4you foi reativado com sucesso!</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Email:</strong> ${email}</div>
          <div ${styleText}><strong>Data da reativação:</strong> ${new Date().toLocaleString(
      'pt-BR',
    )}</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Para acessar o sistema, utilize o link abaixo:</div>
          <div ${styleButtonCenter}><a ${styleButton} href="https://backoffice.b4you.com.br">ACESSAR SISTEMA</a></div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}><strong>Bem-vindo de volta!</strong> Você já pode fazer login normalmente no sistema.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com o administrador do sistema.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

module.exports = {
  userCreatedTemplate,
  passwordChangedTemplate,
  profileUpdatedTemplate,
  userDeactivatedTemplate,
  userReactivatedTemplate,
};
