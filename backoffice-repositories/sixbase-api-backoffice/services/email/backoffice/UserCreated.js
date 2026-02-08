const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const { userCreatedTemplate } = require('../../../mails/backoffice/messages');

class UserCreated extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { full_name, email, password, role_name } = this.data;
    const subject = 'Cadastro Realizado - Sistema Administrativo B4you';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = userCreatedTemplate(
      capitalizeName(full_name),
      email,
      password,
      role_name,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

/**
 * Envia email de notificação quando um usuário do backoffice é criado
 * @param {Object} userData - Dados do usuário criado
 * @param {string} userData.full_name - Nome completo do usuário
 * @param {string} userData.email - Email do usuário
 * @param {string} userData.password - Senha do usuário
 * @param {string} userData.role_name - Nome da role do usuário
 */
async function sendUserCreatedEmail(userData) {
  try {
    const userCreatedEmail = new UserCreated(userData);
    const response = await userCreatedEmail.send();

    console.log(
      `Email de cadastro enviado com sucesso para: ${userData.email}`,
    );
    return { success: true, message: 'Email enviado com sucesso', response };
  } catch (error) {
    console.error('Erro ao enviar email de cadastro:', error);
    return {
      success: false,
      message: 'Erro ao enviar email',
      error: error.message,
    };
  }
}

module.exports = {
  sendUserCreatedEmail,
  UserCreated,
};
