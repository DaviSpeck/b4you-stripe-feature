const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const {
  userReactivatedTemplate,
} = require('../../../mails/backoffice/messages');

class UserReactivated extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { full_name, email, reactivated_by } = this.data;
    const subject = 'Acesso Reativado - Sistema Administrativo B4you';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = userReactivatedTemplate(
      capitalizeName(full_name),
      email,
      reactivated_by,
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
 * Envia email de notificação quando o usuário é reativado
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.full_name - Nome completo do usuário
 * @param {string} userData.email - Email do usuário
 * @param {string} userData.reactivated_by - Nome de quem reativou o usuário
 */
async function sendUserReactivatedEmail(userData) {
  try {
    const userReactivatedEmail = new UserReactivated(userData);
    const response = await userReactivatedEmail.send();

    console.log(
      `Email de usuário reativado enviado com sucesso para: ${userData.email}`,
    );
    return { success: true, message: 'Email enviado com sucesso', response };
  } catch (error) {
    console.error('Erro ao enviar email de usuário reativado:', error);
    return {
      success: false,
      message: 'Erro ao enviar email',
      error: error.message,
    };
  }
}

module.exports = {
  sendUserReactivatedEmail,
  UserReactivated,
};
