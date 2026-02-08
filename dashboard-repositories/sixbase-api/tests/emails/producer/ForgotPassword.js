const ForgotPassword = require('../../../services/email/ForgotPassword');

const forgotPassword = async (email) => {
  await new ForgotPassword({
    full_name: 'danilo de maria',
    token: '1234',
    email,
    url: 'http://www.sixbase.com.br',
  }).send();
};
module.exports = {
  forgotPassword,
};
