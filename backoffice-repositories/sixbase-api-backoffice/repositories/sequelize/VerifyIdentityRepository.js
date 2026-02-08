const Verify_identity = require('../../database/models/Verify_identity');
const { findDocumentsStatus } = require('../../status/documentsStatus');
module.exports = class VerifyIdentidyRepository {
  static async findPaginated({ page = 0, size = 10, where }) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const { rows, count } = await Verify_identity.findAndCountAll({
      offset,
      limit,
      where,
      order: [['id', 'DESC']],
      attributes: [
        'status',
        'created_at',
        'updated_at',
        'details',
        'doc_front_key',
        'doc_back_key',
        'selfie_key',
        'address_key',
      ],
    });
    return {
      count,
      rows: rows.map((r) => r.toJSON()),
    };
  }
};
