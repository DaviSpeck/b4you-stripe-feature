const ReprovedCNPJ = require('../../../services/email/producer/kyc/ReprovedCNPJ');

const reprovedCNPJ = async (email) => {
  await new ReprovedCNPJ({
    full_name: 'danilo de maria',
    description: 'CNPJ inválido.',
    email,
  }).send();
};
module.exports = {
  reprovedCNPJ,
};
