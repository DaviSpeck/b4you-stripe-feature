const InviteCoproduction = require('../../../services/email/CoproductionInvite');

const inviteCoproduction = async (email) => {
  await new InviteCoproduction({
    email,
    full_name: 'danilo de maria',
    producer: 'vinicius da palma martins',
    product_name: 'vender doces no semaforo',
    due_date: '03/03/20222',
    commission: 25,
  }).send();
};
module.exports = {
  inviteCoproduction,
};
