const ProducerWelcomeEmail = require('../../../services/email/ProducerWelcome');

const welcome = async (email) => {
  await new ProducerWelcomeEmail({
    full_name: 'Danilo de Maria',
    email,
  }).send();
};
module.exports = {
  welcome,
};
