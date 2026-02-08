const UpdateBankAccount = require('../../../services/email/UpdateStudentBankAccount');

const updateBankAccount = async (email) => {
  await new UpdateBankAccount({
    student_name: 'danilo de maria',
    producer_name: 'vinicius da pálma',
    product_name: 'vender violão',
    url_action: 'https://www.sixbase.com.br',
    email,
  }).send();
};
module.exports = {
  updateBankAccount,
};
