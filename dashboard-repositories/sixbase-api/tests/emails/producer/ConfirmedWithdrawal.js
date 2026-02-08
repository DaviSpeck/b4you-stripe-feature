const ConfirmedWithdrawal = require('../../../services/email/ConfirmedWithdrawal');

const confirmedWithdrawal = async (email) => {
  await new ConfirmedWithdrawal({
    full_name: 'Vinicius da Palma Martins',
    email,
    amount: 254.98,
  }).send();
};
module.exports = {
  confirmedWithdrawal,
};
