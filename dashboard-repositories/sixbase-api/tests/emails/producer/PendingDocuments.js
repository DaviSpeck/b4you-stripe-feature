const PendingDocuments = require('../../../services/email/PendingDocuments');

const pendingDocuments = async (email) => {
  await new PendingDocuments({
    full_name: 'danilo de maria',
    email,
  }).send();
};
module.exports = {
  pendingDocuments,
};
