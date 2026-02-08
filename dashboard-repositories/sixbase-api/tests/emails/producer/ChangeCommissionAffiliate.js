const ChangeCommissionUserAffiliate = require('../../../services/email/ChangeCommissionUserAffiliate');
const MailService = require('../../../services/MailService');

const makeMailService = () => {
  const mailServiceInstance = new MailService(
    process.env.MAILJET_PASSWORD,
    process.env.MAILJET_USERNAME,
  );

  return mailServiceInstance;
};

const changeCommissionAffiliate = async (email) => {
  await new ChangeCommissionUserAffiliate(
    {
      email,
      affiliate_name: 'Danilo de Maria',
      old_commission: 15,
      new_commission: 25,
      product_name: 'vendendo bicicletas',
    },
    makeMailService(),
  ).send();
};
module.exports = {
  changeCommissionAffiliate,
};
