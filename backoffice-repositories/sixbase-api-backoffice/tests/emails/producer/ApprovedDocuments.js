const ApprovedDocuments = require('../../../services/email/producer/kyc/ApprovedDocuments');

const approvedDocuments = async (email) => {
  await new ApprovedDocuments({
    full_name: 'danilo de maria',
    email,
  }).send();
};
module.exports = {
  approvedDocuments,
};
