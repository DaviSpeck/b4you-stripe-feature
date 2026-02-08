const birthday = require('./birthday');
const firstSale = require('./firstSale');
const firstSignup = require('./firstSignup');
const userInactive30Days = require('./userInactive30Days');

const defaultEvents = {
  birthday,
  first_sale: firstSale,
  first_signup: firstSignup,
  user_inactive_30_days: userInactive30Days,
};

module.exports = { defaultEvents };
