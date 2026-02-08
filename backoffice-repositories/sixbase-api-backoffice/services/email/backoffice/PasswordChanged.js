const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const {
  passwordChangedTemplate,
} = require('../../../mails/backoffice/messages');

class PasswordChanged extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { full_name, email } = this.data;
    const subject = 'Senha Alterada - Sistema Administrativo B4you';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = passwordChangedTemplate(capitalizeName(full_name), email);
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

/**
 * Envia email de notificação quando a senha do usuário é alterada
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.full_name - Nome completo do usuário
 * @param {string} userData.email - Email do usuário
 */
async function sendPasswordChangedEmail(userData) {
  try {
    const passwordChangedEmail = new PasswordChanged(userData);
    const response = await passwordChangedEmail.send();

    console.log(
      `Email de senha alterada enviado com sucesso para: ${userData.email}`,
    );
    return { success: true, message: 'Email enviado com sucesso', response };
  } catch (error) {
    console.error('Erro ao enviar email de senha alterada:', error);
    return {
      success: false,
      message: 'Erro ao enviar email',
      error: error.message,
    };
  }
}

module.exports = {
  sendPasswordChangedEmail,
  PasswordChanged,
};
