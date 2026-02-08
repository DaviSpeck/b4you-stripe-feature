const DeniedWithdrawal = require('../../../services/email/DeniedWithdrawal');

const deniedWithdrawal = async (email) => {
  await new DeniedWithdrawal({
    full_name: 'Vinicius da Palma Martins',
    email,
  }).send();
};
module.exports = {
  deniedWithdrawal,
};
