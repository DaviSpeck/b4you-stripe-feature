const { QueryTypes } = require('sequelize');
const ApiError = require('../../error/ApiError');
const { findDocumentsStatus } = require('../../status/documentsStatus');
const KycFilters = require('../../utils/kycFilters');
const models = require('../../database/models');

module.exports = class FindUserKyc {
  constructor(VerifyIdentityRepository, UsersRepository) {
    this.UsersRepository = UsersRepository;
    this.VerifyIdentityRepository = VerifyIdentityRepository;
  }

  async execute({ user_uuid, page, size }) {
    const user = await this.UsersRepository.findByUUID(user_uuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    const kyc = await this.VerifyIdentityRepository.findPaginated({
      page,
      size,
      where: { id_user: user.id },
    });
    kyc.rows.map((element) => {
      element.status = findDocumentsStatus(element.status);
    });
    const cnpj = await this.UsersRepository.findCnpjByUUID(user_uuid);
    cnpj.status = findDocumentsStatus(cnpj.status_cnpj);
    delete cnpj['status_cnpj'];
    return { kyc, cnpj };
  }

  async executeWithSQL({ user_uuid, page, size }) {
    try {
      const user = await this.UsersRepository.findByUUID(user_uuid);
      if (!user) throw ApiError.badRequest('Usuário não encontrado');

      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const sql = `
        SELECT
          vi.id,
          vi.uuid,
          vi.status,
          vi.doc_front as document_front,
          vi.doc_back as document_back,
          vi.selfie,
          vi.created_at,
          vi.updated_at,
          vi.id_user,
          u.id as user_id,
          u.uuid as user_uuid,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          u.whatsapp as user_phone,
          u.document_number as user_document_number
        FROM verify_identity vi
        LEFT JOIN users u ON vi.id_user = u.id
        WHERE vi.id_user = :id_user
        ORDER BY vi.id DESC
        LIMIT :limit OFFSET :offset
      `;

      const rows = await models.sequelize.query(sql, {
        replacements: {
          id_user: user.id,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(*) as count
        FROM verify_identity vi
        WHERE vi.id_user = :id_user
      `;

      const countResult = await models.sequelize.query(countSql, {
        replacements: { id_user: user.id },
        type: QueryTypes.SELECT,
        plain: true,
      });

      const count = countResult ? countResult.count : 0;

      const formattedRows = rows.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        document_type: row.document_type,
        status: findDocumentsStatus(row.status),
        document_front: row.document_front,
        document_back: row.document_back,
        selfie: row.selfie,
        created_at: row.created_at,
        updated_at: row.updated_at,
        id_user: row.id_user,
        user: {
          id: row.user_id,
          uuid: row.user_uuid,
          first_name: row.user_first_name,
          last_name: row.user_last_name,
          email: row.user_email,
          phone: row.user_phone,
          document_number: row.user_document_number,
        },
      }));

      const cnpjSql = `
        SELECT
          u.id,
          u.uuid,
          u.status_cnpj,
          u.cnpj,
          u.company_name,
          u.created_at,
          u.updated_at
        FROM users u
        WHERE u.uuid = :user_uuid
      `;

      const cnpjResult = await models.sequelize.query(cnpjSql, {
        replacements: { user_uuid },
        type: QueryTypes.SELECT,
        plain: true,
      });

      const cnpj = cnpjResult
        ? {
            id: cnpjResult.id,
            uuid: cnpjResult.uuid,
            status: findDocumentsStatus(cnpjResult.status_cnpj),
            cnpj: cnpjResult.cnpj,
            company_name: cnpjResult.company_name,
            created_at: cnpjResult.created_at,
            updated_at: cnpjResult.updated_at,
          }
        : null;

      return {
        kyc: {
          count,
          rows: formattedRows,
        },
        cnpj,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Erro ao buscar KYC do usuário com SQL direto:', error);
      throw error;
    }
  }
};
