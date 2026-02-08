const RejectedRefund = require('../../../services/email/RejectedRefundStudent');

const rejectedRefund = async (email) => {
  await new RejectedRefund({
    email,
    full_name: 'danilo de amaria',
    product_name: 'vendendo vicicleta',
    amount: 200,
    reason: 'conta bancaria inexistente',
    date: '03/03/2022',
    payment_method: 'TED',
  }).send();
};
module.exports = {
  rejectedRefund,
};
