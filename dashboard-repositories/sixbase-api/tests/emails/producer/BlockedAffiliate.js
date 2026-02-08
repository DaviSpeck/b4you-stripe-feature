const BlockedAffiliate = require('../../../services/email/BlockUserAffiliate');

const blockedAffiliate = async (email) => {
  await new BlockedAffiliate({
    affiliate_name: 'Danilo de maria',
    email,
    support_email: 'sixbase@ajuda.com',
    url_action: 'nao sei ainda',
    product_name: 'Vender bicicletas',
  }).send();
};
module.exports = {
  blockedAffiliate,
};
