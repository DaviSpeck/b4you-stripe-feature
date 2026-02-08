const ApprovedCNPJ = require('../../../services/email/producer/kyc/AprovedCNPJ');

const approvedCNPJ = async (email) => {
  await new ApprovedCNPJ({
    full_name: 'danilo de maria',
    email,
  }).send();
};
module.exports = {
  approvedCNPJ,
};
