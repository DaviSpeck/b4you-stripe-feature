const CoproductionInviteCanceled = require('../../../services/email/CoproductionInviteCanceled');

const canceledCoproductionInvite = async (email) => {
  await new CoproductionInviteCanceled({
    email,
    full_name: 'danilo de maria',
    producer: 'vinicius da palma',
    product_name: 'bicicleta para todos',
  }).send();
};
module.exports = {
  canceledCoproductionInvite,
};
