const {
  findDocumentsStatus,
  findDocumentsStatusByKey,
} = require('../../status/documentsStatus');

const serializeVerifiedInfo = ({
  verified_id,
  verified_company,
  status_cnpj,
  verify_identity,
}) => {
  const [verify] = verify_identity;
  return {
    verified_id,
    verified_company,
    status_documents: verify
      ? findDocumentsStatus(verify.status)
      : findDocumentsStatusByKey('waiting'),
    status_cpnj: findDocumentsStatus(status_cnpj),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeVerifiedInfo);
    }
    return serializeVerifiedInfo(this.data);
  }
};
