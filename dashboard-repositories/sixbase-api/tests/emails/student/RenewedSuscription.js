const StudentSubscriptionRenewed = require('../../../services/email/student/renewedSubscription');

const studentSubscriptionRenewed = async (email) => {
  await new StudentSubscriptionRenewed({
    email,
    student_name: 'danilo de maria',
    product_name: 'comprar produtos baratos',
    amount: 250,
  }).send();
};
module.exports = {
  studentSubscriptionRenewed,
};
