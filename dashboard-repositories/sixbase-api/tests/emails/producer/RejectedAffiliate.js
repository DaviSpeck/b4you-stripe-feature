const RejectedAffiliate = require('../../../services/email/RejectUserAffiliate');

const rejectedAffiliate = async (email) => {
  await new RejectedAffiliate({
    affiliate_name: 'danilo de maria',
    email,
    support_email: 'sixbase@ajuda.com',
    product_name: 'bicicleta outra',
  }).send();
};
module.exports = {
  rejectedAffiliate,
};
