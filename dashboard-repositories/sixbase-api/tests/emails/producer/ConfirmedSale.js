const ConfirmedPaymentSale = require('../../../services/email/ConfirmedPaymentSale');

const confirmedPaymentSale = async (email) => {
  await new ConfirmedPaymentSale({
    full_name: 'Danilo de Maria',
    product_name: 'Vender bebidas alcóolicas para menores',
    email,
  }).send();
};
module.exports = {
  confirmedPaymentSale,
};
