const SaleOrderBumpOrUpsell = require('../../../services/email/student/saleUpsellOrderBump');

const orderBumpOrUpsell = async (email) => {
  await new SaleOrderBumpOrUpsell({
    email,
    student_name: 'danilo de maria',
    product_name: 'comprar produtos baratos',
    amount: 250,
    producer_name: 'vinicius da palma martins',
    sale_uuid: '1234',
  }).send();
};
module.exports = {
  orderBumpOrUpsell,
};
