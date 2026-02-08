const StudentSubscriptionCanceled = require('../../../services/email/student/canceledSubscription');

const studentSubscriptionCanceled = async (email) => {
  await new StudentSubscriptionCanceled({
    email,
    student_name: 'danilo de maria',
    product_name: 'comprar produtos baratos',
    amount: 250,
  }).send();
};
module.exports = {
  studentSubscriptionCanceled,
};
