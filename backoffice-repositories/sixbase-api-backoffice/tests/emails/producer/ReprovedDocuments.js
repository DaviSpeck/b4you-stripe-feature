const ReprovedDocuments = require('../../../services/email/producer/kyc/ReprovedDocuments');

const reprovedDocuments = async (email) => {
  await new ReprovedDocuments({
    full_name: 'danilo de maria',
    description: 'Fotos com qualidade baixa, dados ilegíveis.',
    email,
  }).send();
};
module.exports = {
  reprovedDocuments,
};
