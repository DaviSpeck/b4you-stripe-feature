const ClassroomAccess = require('../../../services/email/ClassroomAccess');

const classroomAccess = async (email) => {
  await new ClassroomAccess({
    full_name: 'danilo de maria',
    email,
    product_name: 'ovos baratos',
    productor_name: 'vinicius da palma martins',
    support_email: 'ajuda@vini.com.br',
    url_action: 'https://www.sixbase.com.br',
  }).send();
};
module.exports = {
  classroomAccess,
};
