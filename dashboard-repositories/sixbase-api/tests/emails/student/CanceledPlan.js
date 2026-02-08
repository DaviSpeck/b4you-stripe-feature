const CanceledPlan = require('../../../services/email/CanceledPlan');

const canceledPlan = async (email) => {
  await new CanceledPlan({
    email,
    full_name: 'danilo de maria',
    product_name: 'vender violão barato',
    support_email: 'nelson@imoveis.com.br',
    valid_date: '25/03/2022',
    custom_id: '1234',
  }).send();
};
module.exports = {
  canceledPlan,
};
