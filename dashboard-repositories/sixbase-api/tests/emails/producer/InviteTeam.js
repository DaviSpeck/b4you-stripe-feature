const InviteTeam = require('../../../services/email/InviteTeamCollaborator');

const inviteTeam = async (email) => {
  await new InviteTeam({
    collaborator_email: email,
    collaborator_name: 'danil de maria',
    producer_name: 'nina araldi',
  }).send();
};
module.exports = {
  inviteTeam,
};
