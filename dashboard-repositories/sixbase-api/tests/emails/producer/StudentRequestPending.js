const StudentRequestPending = require('../../../services/email/producer/refunds/StudentRequestPending');

const studentRequestPending = async (email) => {
  await new StudentRequestPending({
    email,
    full_name: 'Vinicius da palma martins de maria',
    product_name: 'ligando o foda-se',
    amount: 120,
    student_name: 'danilinho das marias',
    student_email: 'daniloctg@msn.com',
    student_whatsapp: '47 9 9911-6698',
    due_date: new Date(),
    sale_uuid: '1234!#!@#',
  }).send();
};
module.exports = {
  studentRequestPending,
};
