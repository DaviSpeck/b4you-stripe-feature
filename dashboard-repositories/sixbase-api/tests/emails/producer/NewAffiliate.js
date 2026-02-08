const ProducerAffiliate = require('../../../services/email/ProducerAffiliate');

const newAffiliate = async (email) => {
  await new ProducerAffiliate({
    email,
    full_name: 'nina araldi',
    product_name: 'bicicletas outras',
    affiliate_name: 'danilo de maria',
    affiliate_email: 'daniloctg@msn.com',
    commission: 20,
  }).send();
};
module.exports = {
  newAffiliate,
};
