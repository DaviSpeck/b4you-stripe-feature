const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const {
  profileUpdatedTemplate,
} = require('../../../mails/backoffice/messages');

class ProfileUpdated extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { full_name, email, changes } = this.data;
    const subject = 'Perfil Atualizado - Sistema Administrativo B4you';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = profileUpdatedTemplate(
      capitalizeName(full_name),
      email,
      changes,
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
 * Envia email de notificação quando o perfil do usuário é atualizado
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.full_name - Nome completo do usuário
 * @param {string} userData.email - Email do usuário
 * @param {Array} userData.changes - Array de alterações realizadas
 * @param {string} userData.changes[].field - Campo alterado
 * @param {string} userData.changes[].oldValue - Valor anterior
 * @param {string} userData.changes[].newValue - Valor novo
 */
async function sendProfileUpdatedEmail(userData) {
  try {
    const profileUpdatedEmail = new ProfileUpdated(userData);
    const response = await profileUpdatedEmail.send();

    console.log(
      `Email de perfil atualizado enviado com sucesso para: ${userData.email}`,
    );
    return { success: true, message: 'Email enviado com sucesso', response };
  } catch (error) {
    console.error('Erro ao enviar email de perfil atualizado:', error);
    return {
      success: false,
      message: 'Erro ao enviar email',
      error: error.message,
    };
  }
}

module.exports = {
  sendProfileUpdatedEmail,
  ProfileUpdated,
};
