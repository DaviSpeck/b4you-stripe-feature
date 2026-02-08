const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const {
  userDeactivatedTemplate,
} = require('../../../mails/backoffice/messages');

class UserDeactivated extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { full_name, email, deactivated_by } = this.data;
    const subject = 'Acesso Desativado - Sistema Administrativo B4you';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = userDeactivatedTemplate(
      capitalizeName(full_name),
      email,
      deactivated_by,
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
 * Envia email de notificação quando o usuário é desativado
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.full_name - Nome completo do usuário
 * @param {string} userData.email - Email do usuário
 * @param {string} userData.deactivated_by - Nome de quem desativou o usuário
 */
async function sendUserDeactivatedEmail(userData) {
  try {
    const userDeactivatedEmail = new UserDeactivated(userData);
    const response = await userDeactivatedEmail.send();

    console.log(
      `Email de usuário desativado enviado com sucesso para: ${userData.email}`,
    );
    return { success: true, message: 'Email enviado com sucesso', response };
  } catch (error) {
    console.error('Erro ao enviar email de usuário desativado:', error);
    return {
      success: false,
      message: 'Erro ao enviar email',
      error: error.message,
    };
  }
}

module.exports = {
  sendUserDeactivatedEmail,
  UserDeactivated,
};
