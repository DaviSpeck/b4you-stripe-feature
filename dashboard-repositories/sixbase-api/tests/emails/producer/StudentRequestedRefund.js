const StudentRequestRefund = require('../../../services/email/producer/refunds/StudentRequested');

const studentRequestRefund = async (email) => {
  await new StudentRequestRefund({
    email,
    producer_name: 'Danilo de Maria',
    product_name: 'Violão X',
    student_name: 'Vinicius da Palma',
    amount: 100,
    reason: 'Arrependi de comprar',
    date: '11/04/2022',
    payment_method: 'Boleto',
    sale_uuid: '1234!@#$',
  }).send();
};
module.exports = {
  studentRequestRefund,
};
