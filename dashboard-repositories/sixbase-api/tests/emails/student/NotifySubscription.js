const StudentSubscriptionNotify = require('../../../services/email/student/notifySubscription;');

const studentSubscriptionNotify = async (email) => {
  await new StudentSubscriptionNotify({
    email,
    student_name: 'danilo de maria',
    product_name: 'comprar produtos baratos',
    due_date: '2022-06-29',
    url: 'http://www.google.com.br',
  }).send();
};
module.exports = {
  studentSubscriptionNotify,
};
