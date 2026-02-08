const KycApproval = require('../../../services/email/support/producer/KycApproval');

const kycApproval = async (email) => {
  await new KycApproval({
    email,
    full_name: 'danilo de maria',
    date: '2022-03-31 17:27:53',
    user_uuid: '1324#$%',
    verification_uuid: '123456789&&',
  }).send();
};
module.exports = {
  kycApproval,
};
