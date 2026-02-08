const { parseInt } = require('lodash');
const Users = require('../models/Users');
const VerifyIdentity = require('../models/Verify_identity');
const { findDocumentsStatus } = require('../../status/documentsStatus');

const createVerifyIdentity = async (data) => VerifyIdentity.create(data);

const findVerifyIdentity = async (where) => VerifyIdentity.findOne({ where });

const findVerifyIdentities = async (where, page, size) => {
  const limit = parseInt(size, 10);
  const offset = limit * parseInt(page, 10);
  const verify = await VerifyIdentity.findAndCountAll({
    where,
    nest: true,
    raw: true,
    limit,
    offset,
    order: [['updated_at', 'asc']],
    attributes: [
      'id',
      'uuid',
      'doc_front_key',
      'doc_back_key',
      'address_key',
      'selfie_key',
      'status',
      'created_at',
      'updated_at',
      'deleted_at',
    ],
    include: [
      {
        attributes: [
          'id',
          'uuid',
          'full_name',
          'email',
          'document_number',
          'cnpj',
          'cnpj_details',
          'company_name',
          'is_company',
          'status_cnpj',
          'verified_company',
          'verified_id',
          'whatsapp',
          'profile_picture',
        ],
        association: 'user',
      },
    ],
  });
  return verify;
};

const findVerifyIdentitiesCNPJ = async (where) =>
  Users.findAll({
    where,
    order: [['updated_at', 'desc']],
    attributes: [
      'id',
      'uuid',
      'email',
      'full_name',
      'company_name',
      'trade_name',
      'verified_id',
      'verified_company',
      'status_cnpj',
      'document_number',
      'cnpj',
      'cnpj_details',
      'is_company',
      'created_at',
      'updated_at',
      'cnpj_requested_at',
      'profile_picture',
    ],
  });

const findUserHistory = async (where) => {
  const verifications = await VerifyIdentity.findAll({
    where,
    attributes: ['created_at', 'id', 'updated_at', 'details', 'status'],
    include: [{ association: 'user', attributes: ['full_name', 'email'] }],
  });
  verifications.map((element) => {
    element.status = findDocumentsStatus(element.status).label;
  });
  return verifications;
};

module.exports = {
  createVerifyIdentity,
  findVerifyIdentity,
  findVerifyIdentities,
  findVerifyIdentitiesCNPJ,
  findUserHistory,
};
