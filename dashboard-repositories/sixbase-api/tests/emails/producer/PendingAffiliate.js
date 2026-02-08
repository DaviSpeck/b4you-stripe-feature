const PendingAffiliate = require('../../../services/email/PendingUserAffiliate');

const pendingAffiliate = async (email) => {
  await new PendingAffiliate({
    affiliate_name: 'danilo de maria',
    email,
    commission: 20,
    support_email: 'ajuda@sixbase.com',
    product_name: 'vendendo doces',
  }).send();
};
module.exports = {
  pendingAffiliate,
};
