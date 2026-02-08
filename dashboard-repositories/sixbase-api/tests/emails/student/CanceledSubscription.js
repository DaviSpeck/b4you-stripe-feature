const CanceledSubscription = require('../../../services/email/StudentCanceledSubscription');

const canceledSubscription = async (email) => {
  await new CanceledSubscription({
    student_name: 'danilo de maria',
    product_name: 'violão iniciante',
    amount: 200,
    valid_date_until: '25/03/2022',
    support_email: 'joao@imoveis.com',
    email,
  }).send();
};
module.exports = {
  canceledSubscription,
};
