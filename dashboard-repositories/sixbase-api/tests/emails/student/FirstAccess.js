const FirstAccess = require('../../../services/email/FirstAccess');

const firstAccess = async (email) => {
  await new FirstAccess({
    full_name: 'danilo de maria',
    product_name: 'testes automatizados',
    amount: 200,
    producer_name: 'vinicius da palma martins',
    token: '1234',
    email,
    support_email: 'teste@gmail.com',
  }).send();
};
module.exports = {
  firstAccess,
};
