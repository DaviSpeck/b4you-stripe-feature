const { Op, QueryTypes } = require('sequelize');
const { findUserFiltered } = require('../../database/controllers/users');
const UsersBankAccounts = require('../../database/models/Users_bank_accounts');
const Users = require('../../database/models/Users');
const UserFilters = require('../../utils/userFilters');

const formatWhere = ({
  input
}) => {
  let where = {};
  if (input) {
    const trimmedInput = input.trim();
    let orObject = {
      full_name: { [Op.like]: `%${trimmedInput}%` },
      email: { [Op.like]: `%${trimmedInput}%` },
    };

    const sanitizedInput = input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0 && !/[a-zA-Z]/gm.test(trimmedInput)) {
      orObject = {
        ...orObject,
        document_number: { [Op.like]: `%${sanitizedInput}%` },
        cnpj: { [Op.like]: `%${sanitizedInput}%` },
      };
    }

    where = {
      ...where,
      [Op.or]: orObject,
    };
  }

  return where;
};

module.exports = class {

  static async findOneById({ id }) {
    try {
      const row = await UsersBankAccounts.findByPk(id, {
        raw: true, 
      });

      return row || null;
    } catch (error) {
      console.error('Erro ao buscar user_bank_account por id:', error);
      throw error;
    }
  }

  static async executeWithSQL({ input, page, size, status = 'pending', start_date = null, end_date = null }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = { input, start_date, end_date, date_column: 'uba.created_at' };
      const { baseFilters, baseReplacements } = UserFilters.createBaseFiltersSQL(where);

      const statusClause = (() => {
        switch (status) {
          case 'approved':
            return ' AND uba.pending_approval = 0 AND uba.approved = 1 ';
          case 'rejected':
            return ' AND uba.pending_approval = 0 AND uba.approved = 0 ';
          case 'pending':
          default:
            return ' AND uba.pending_approval = 1 ';
        }
      })();

      const usersResults = await UsersBankAccounts.sequelize.query(
        `
        SELECT 
          u.first_name,
          u.last_name,
          u.email,
          uba.id,
          uba.id_user,
          uba.pending_approval,
          uba.approved,
          uba.rejected,
          uba.is_company,
          uba.document_number,
          uba.bank_code, 
          uba.agency,
          uba.account_number,
          uba.account_type,
          uba.bank_code_old,
          uba.agency_old,
          uba.account_number_old,
          uba.account_type_old,
          uba.cnpj,
          uba.company_account_type,
          uba.company_agency,
          uba.company_account_number,
          uba.company_bank_code,
          uba.company_account_type_old,
          uba.company_agency_old,
          uba.company_account_number_old,
          uba.company_bank_code_old,
          uba.created_at
        FROM user_bank_accounts uba
        INNER JOIN users u ON uba.id_user = u.id
        WHERE 1=1
          ${statusClause}
          ${baseFilters}
        ORDER BY u.id DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: { limit, offset, ...baseReplacements },
        },
      );

      const countResult = await UsersBankAccounts.sequelize.query(
        `
        SELECT COUNT(DISTINCT uba.id) as total
        FROM user_bank_accounts uba
        INNER JOIN users u ON uba.id_user = u.id
        WHERE 1=1
          ${statusClause}  
          ${baseFilters}
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: baseReplacements,
        },
      );

      const total = countResult[0]?.total || 0;
      return { rows: usersResults, count: total };
    } catch (error) {
      console.error('Erro ao buscar user_bank_accounts com SQL direto:', error);
      throw error;
    }
  }

  static async approveById({ id, reviewerId = null, reviewerName = null }) {
      try {
        const user = await UsersBankAccounts.findByPk(id);
        if (!user) {
          throw new Error('Usuario não encontrado');
        }

        await UsersBankAccounts.update(
          {
            pending_approval: 0,
            approved: 1,
            rejected: 0,
            updated_at: new Date()
          },
          { where: { id }}
        );
        return true;
      } catch (err) {
        await tx.rollback();
        console.error('Erro ao aprovar solicitação:', err);
        throw err;
      }
  }

  static async rejectById({ id }) {
    const sequelize = UsersBankAccounts.sequelize;
    const tx = await sequelize.transaction();
    try {
      const user = await UsersBankAccounts.findByPk(id, { transaction: tx });
      if (!user) {
        throw new Error('Usuario não encontrado');
      }
      await UsersBankAccounts.update(
        {
          pending_approval: 0,
          approved: 0,
          rejected: 1,
          updated_at: new Date()
        },
        { where: { id }, transaction: tx }
      );

      if (user.is_company) {
        await Users.update({
          company_bank_code: user.company_bank_code_old ?? user.company_bank_code,
          company_agency: user.company_agency_old ?? user.company_agency,
          company_account_number: user.company_account_number_old ?? user.company_account_number,
          company_account_type: user.company_account_type_old ?? user.company_account_type
        }, { where: { id: user.id_user }, transaction: tx });
      } else {
        await Users.update({
          bank_code: user.bank_code_old ?? user.bank_code,
          agency: user.agency_old ?? user.agency,
          account_number: user.account_number_old ?? user.account_number,
          account_type: user.account_type_old ?? user.account_type
        }, { where: { id: user.id_user }, transaction: tx });
      }
      await tx.commit();
      return true;
    } catch (err) {
      await tx.rollback();
      console.error('Erro ao reprovar solicitação:', err);
      throw err;
    }
  }

};
