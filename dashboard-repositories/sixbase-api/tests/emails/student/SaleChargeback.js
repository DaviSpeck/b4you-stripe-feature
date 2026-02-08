const SaleChargeback = require('../../../services/email/SaleChargeback');

const saleChargeback = async (email) => {
  await new SaleChargeback({
    client_name: 'danilo de maria',
    email,
    product_name: 'vender motos',
    additional_text:
      'O reembolso foi efetuado para o mesmo pix utilizado no momento da compra do produto.',
    // additional_text:
    //   'O reembolso foi efetuado via transferência bancária para a conta cadastrada em seu perfil Sixbase.',
  }).send();
};
module.exports = {
  saleChargeback,
};
