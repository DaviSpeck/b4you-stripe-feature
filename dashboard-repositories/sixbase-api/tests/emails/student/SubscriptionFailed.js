const StudentSubscriptionFailed = require('../../../services/email/student/susbcriptionFailed');

const studentSubscriptionFailed = async (email) => {
  await new StudentSubscriptionFailed({
    email,
    student_name: 'danilo de maria',
    product_name: 'comprar produtos baratos',
    amount: 250,
  }).send();
};
module.exports = {
  studentSubscriptionFailed,
};
