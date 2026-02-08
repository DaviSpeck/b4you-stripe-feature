const CanceledCoproduction = require('../../../services/email/CoproductionCancelActive');

const canceledCoproduction = async (email) => {
  await new CanceledCoproduction({
    email,
    full_name: 'danilo de maria',
    coproducer_name: 'vinicius da palma martins',
    product_name: 'controle sua diabete em 5 passos',
  }).send();
};
module.exports = {
  canceledCoproduction,
};
