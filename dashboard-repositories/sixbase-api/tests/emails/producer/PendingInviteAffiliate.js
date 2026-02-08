const PendingInvite = require('../../../services/email/producer/affiliates/PendingInvite');

const pendingAffiliateInvite = async (email) => {
  await new PendingInvite({
    email,
    full_name: 'danilo de maria',
    product_name: 'vender violão barato',
    affiliate_name: 'vinicius da palma martins',
    affiliate_email: 'daniloctg2007@gmail.com',
    commission: 25,
  }).send();
};
module.exports = {
  pendingAffiliateInvite,
};
