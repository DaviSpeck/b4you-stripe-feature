const StudentSubscriptionLateNotify = require('../../../services/email/student/lateSubscription');

const studentSubscriptionLateNotify = async (email) => {
  await new StudentSubscriptionLateNotify({
    email,
    student_name: 'danilo de maria',
    product_name: 'comprar produtos baratos',
    url: 'http://www.google.com.br',
  }).send();
};
module.exports = {
  studentSubscriptionLateNotify,
};
