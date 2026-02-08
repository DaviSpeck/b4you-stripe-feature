const ApprovedPayment = require('../../../services/email/ApprovedPayment');

const approvedPayment = async (email) => {
  await new ApprovedPayment({
    email,
    full_name: 'danilo de maria',
    product_name: 'comprar produtos baratos',
    amount: 250,
    producer_name: 'vinicius da palma martins',
    support_email: 'ajuda@sixbase.com',
    token: '!@123',
    type: 'external',
  }).send();
};
module.exports = {
  approvedPayment,
};
