const ProducerRefundRejected = require('../../../services/email/producer/refunds/Rejected');

const producerRefundRejected = async (email) => {
  await new ProducerRefundRejected({
    email,
    full_name: 'danilo de maria',
    product_name: 'Javascript na prática',
    amount: 250,
    student_name: 'vinicius da palma martins',
    reason:
      'O reembolso por Pix falhou. Reembolse esta venda novamente pela plataforma.',
  }).send();
};
module.exports = {
  producerRefundRejected,
};
