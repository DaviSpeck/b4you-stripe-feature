const GeneratedBillet = require('../../../services/email/student/generatedBillet');

const generatedBillet = async (email) => {
  await new GeneratedBillet({
    email,
    amount: 154.29,
    bar_code: '34191.09107 33010.517309 71444.640008 1 90260000010000',
    due_date: '2022-01-01',
    student_name: 'danilo de maria',
    producer_name: 'vinicius da palma martins',
    product_name: 'masterizando campo harmônico',
    support_email: 'vinixp@vp.com',
    url: 'https://sandbox.pay42.com.br/v2/boleto/pdf/5848468681654272',
  }).send();
};
module.exports = {
  generatedBillet,
};
