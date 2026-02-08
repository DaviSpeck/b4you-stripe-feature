const MailService = require('../MailService');
const { capitalizeName } = require('../../utils/formatters');
const { inviteTeamCollaborator } = require('../../mails/messages');

class InviteTeamCollaborator extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      collaborator_email,
      collaborator_name,
      producer_name,
      token = null,
    } = this.data;
    const subject = 'Convite para colaborar';
    const toAddress = [
      {
        Email: collaborator_email,
        Name: collaborator_name,
      },
    ];
    const variables = inviteTeamCollaborator(
      capitalizeName(producer_name),
      capitalizeName(collaborator_name),
      token,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = InviteTeamCollaborator;
