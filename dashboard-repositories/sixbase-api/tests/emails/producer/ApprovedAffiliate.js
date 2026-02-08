const ApprovedAffiliate = require('../../../services/email/ApprovedUserAffiliate');

const approvedAffiliate = async (email) => {
  await new ApprovedAffiliate({
    affiliate_name: 'Vinicius da Palma Martins',
    email,
    commission: 25,
    support_email: 'sixbase@ajuda.com',
    product_name: 'Vender whiskeys baratos por caros',
  }).send();
};
module.exports = {
  approvedAffiliate,
};
