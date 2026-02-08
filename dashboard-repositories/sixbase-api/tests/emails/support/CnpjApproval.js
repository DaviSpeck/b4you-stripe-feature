const CnpjApproval = require('../../../services/email/support/producer/CnpjApproval');

const cnpjApproval = async (email) => {
  await new CnpjApproval({
    email,
    full_name: 'danilo de maria',
    date: '2022-03-31 17:27:53',
    user_uuid: '1324#$%',
    cnpj: '10629593000103',
  }).send();
};
module.exports = {
  cnpjApproval,
};
