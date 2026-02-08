const ApiError = require('../../../error/ApiError');
const SendFileToStorage = require('../../common/files/SendFileToStorage');
const PendingDocumentsEmail = require('../../../services/email/PendingDocuments');
const KycSupportEmail = require('../../../services/email/support/producer/KycApproval');
const DateHelper = require('../../../utils/helpers/date');
const { documentsStatus } = require('../../../status/documentsStatus');
const {
  createVerifyIdentity,
} = require('../../../database/controllers/verify_identity');
const { findDocumentsStatus } = require('../../../status/documentsStatus');

const [, ANALYSIS] = documentsStatus;

const filesLabelsRequired = ['doc_front', 'address', 'selfie'];

const userAlreadyVerified = (verified_id) => verified_id;

const documentsPending = (verify_identity) => {
  if (!verify_identity) return false;
  const { status } = verify_identity;
  return findDocumentsStatus(status).id === ANALYSIS.id;
};

const missingFiles = (files) =>
  Object.keys(files).length < filesLabelsRequired.length;

const findMissingFiles = (files) => {
  const filesKeys = Object.keys(files);
  return filesLabelsRequired.filter((label) => !filesKeys.includes(label));
};

module.exports = class UploadDocuments {
  constructor(user, files) {
    this.user = user;
    this.files = files;
  }

  async execute() {
    const { verified_id, verify_identity } = this.user;
    const [verify] = verify_identity;
    if (userAlreadyVerified(verified_id))
      throw ApiError.badRequest('Usuário já verificado');
    if (documentsPending(verify))
      throw ApiError.badRequest('Documentos estão pendentes');
    if (missingFiles(this.files)) {
      const filesMissing = findMissingFiles(this.files);
      throw ApiError.badRequest(`missing files: ${filesMissing.map((f) => f)}`);
    }
    const promises = [];
    const keys = Object.keys(this.files);
    keys.forEach((key) => {
      promises.push(
        new SendFileToStorage({
          file: this.files[key],
          readPermission: 'private',
          bucket: process.env.BUCKET_DOCUMENTS,
        }).execute(),
      );
    });
    const filesUploaded = await Promise.all(promises);
    const data = {};
    filesUploaded.forEach((f, index) => {
      const { key, file } = f;
      data[keys[index]] = file;
      data[`${keys[index]}_key`] = key;
    });
    data.status = ANALYSIS.id;
    data.id_user = this.user.id;

    const documents = await createVerifyIdentity(data);

    await new PendingDocumentsEmail({
      email: this.user.email,
      full_name: `${this.user.first_name} ${this.user.last_name}`,
    }).send();
    await new KycSupportEmail({
      user_uuid: this.user.uuid,
      full_name: `${this.user.first_name} ${this.user.last_name}`,
      email: this.user.email,
      verification_uuid: documents.uuid,
      date: DateHelper().now(),
    }).send();
  }
};
