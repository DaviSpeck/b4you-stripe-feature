const ProducerRefundRequested = require('../../../services/email/producer/refunds/ProducerRequested');

const producerRefundRequested = async (email) => {
  await new ProducerRefundRequested({
    email,
    full_name: 'danilo de maria',
    product_name: 'Javascript na prática',
    amount: 250,
    student_name: 'vinicius da palma martins',
  }).send();
};
module.exports = {
  producerRefundRequested,
};
