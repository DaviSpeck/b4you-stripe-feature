const { QueryTypes } = require('sequelize');
const Users = require('../../database/models/Users');
const ApiError = require('../../error/ApiError');
const { findManagerStatusContactType } = require('../../types/manager_status_contact');

module.exports = class FindUserInfo {
  constructor(UsersRepository) {
    this.UsersRepository = UsersRepository;
  }

  async executeWithSQL({ userUuid }) {
    try {
      const results = await Users.sequelize.query(
        `
        SELECT 
          u.id,
          u.uuid,
          u.full_name,
          u.first_name,
          u.last_name,
          u.email,
          u.document_number,
          u.cnpj,
          u.whatsapp,
          u.profile_picture,
          u.created_at,
          u.updated_at,
          u.follow_up,
          u.zipcode,
          u.street,
          u.number,
          u.neighborhood,
          u.city,
          u.state,
          u.complement,
          u.bank_code,
          u.agency,
          u.account_number,
          u.account_type,
          u.operation,
          u.verified_id,
          u.verified_company,
          u.status_cnpj,
          u.instagram,
          u.tiktok,
          u.active,
          u.award_eligible,
          u.birth_date,
          u.pagarme_recipient_id,
          u.pagarme_recipient_id_cnpj,
          u.pagarme_recipient_id_3,
          u.pagarme_recipient_id_cnpj_3,
          u.pagarme_cpf_id,
          u.pagarme_cnpj_id,
          u.verified_pagarme,
          u.verified_company_pagarme,
          u.verified_pagarme_3,
          u.verified_company_pagarme_3,
          u.id_manager,
          u.id_manager_status_contact,
          u.next_contact_date,
          u.manager_phase,
          b.amount as balance_amount,
          b.updated_at as balance_updated_at,
          ws.blocked as withdrawal_blocked,
          ws.updated_at as withdrawal_settings_updated_at,
          ws.withheld_balance_percentage,
          ws.use_highest_sale,
          uss.release_billet,
          uss.release_pix,
          uss.release_credit_card,
          uss.fee_variable_pix_service,
          uss.fee_variable_billet_service,
          uss.fee_variable_card_service,
          uss.fee_fixed_pix_service,
          uss.fee_fixed_billet_service,
          uss.fee_fixed_card_service,
          (SELECT f.form_type FROM form_answers fa 
           JOIN forms f ON f.id = fa.id_form 
           WHERE fa.id_user = u.id AND f.is_active = 1 
           ORDER BY fa.created_at DESC LIMIT 1) as form_type,
          (SELECT MIN(fa.created_at) FROM form_answers fa 
           JOIN forms f ON f.id = fa.id_form 
           WHERE fa.id_user = u.id AND f.is_active = 1) as form_created_at,
          COUNT(DISTINCT p.id) as total_products,
          COUNT(DISTINCT si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_revenue,
          MAX(si.created_at) as last_sale_date
        FROM users u
        LEFT JOIN balances b ON u.id = b.id_user
        LEFT JOIN withdrawals_settings ws ON u.id = ws.id_user
        LEFT JOIN sales_settings uss ON u.id = uss.id_user
        LEFT JOIN products p ON u.id = p.id_user
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE u.uuid = :userUuid
        GROUP BY u.id, u.uuid, u.full_name, u.first_name, u.last_name, u.email, u.document_number, u.cnpj,
                 u.whatsapp, u.profile_picture, u.created_at, u.updated_at, u.follow_up,
                 u.zipcode, u.street, u.number, u.neighborhood, u.city, u.state, u.complement,
                 u.bank_code, u.agency, u.account_number, u.account_type, u.operation,
                 u.verified_id, u.verified_company, u.status_cnpj, u.instagram, u.tiktok,
                 u.active, u.birth_date, u.pagarme_recipient_id, u.pagarme_recipient_id_cnpj,
                u.award_eligible,
                 u.pagarme_recipient_id_3, u.pagarme_recipient_id_cnpj_3, u.pagarme_cpf_id,
                 u.pagarme_cnpj_id, u.verified_pagarme, u.verified_company_pagarme,
                 u.verified_pagarme_3, u.verified_company_pagarme_3, u.id_manager,
                 b.amount, b.updated_at, ws.blocked, ws.updated_at, ws.withheld_balance_percentage, ws.use_highest_sale,
                 uss.release_billet, uss.release_pix, uss.release_credit_card,
                 uss.fee_variable_pix_service, uss.fee_variable_billet_service, uss.fee_variable_card_service,
                 uss.fee_fixed_pix_service, uss.fee_fixed_billet_service, uss.fee_fixed_card_service
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: { userUuid },
        },
      );

      if (!results || results.length === 0) {
        throw ApiError.badRequest('Usuário não encontrado');
      }

      const userData = results[0];
      const statusId = userData.id_manager_status_contact || 0;
      const statusObj = findManagerStatusContactType(statusId);

      const contactStatusKey = statusObj?.key || 'NAO_CONTATADO';

      const formattedUser = {
        id: userData.id,
        uuid: userData.uuid,
        full_name: userData.full_name,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        document_number: userData.document_number,
        cnpj: userData.cnpj,
        whatsapp: userData.whatsapp,
        profile_picture: userData.profile_picture,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        follow_up: userData.follow_up,
        zipcode: userData.zipcode,
        street: userData.street,
        number: userData.number,
        neighborhood: userData.neighborhood,
        city: userData.city,
        state: userData.state,
        complement: userData.complement,
        bank_code: userData.bank_code,
        agency: userData.agency,
        account_number: userData.account_number,
        account_type: userData.account_type,
        operation: userData.operation,
        verified_id: userData.verified_id,
        verified_company: userData.verified_company,
        status_cnpj: userData.status_cnpj,
        instagram: userData.instagram,
        tiktok: userData.tiktok,
        active: userData.active,
        award_eligible: userData.award_eligible,
        birth_date: userData.birth_date,
        id_manager: userData.id_manager,
        id_manager_status_contact: userData.id_manager_status_contact,
        contact_status: contactStatusKey,
        next_contact_date: userData.next_contact_date,
        manager_phase: userData.manager_phase,
        pagarme_recipient_id: userData.pagarme_recipient_id,
        pagarme_recipient_id_cnpj: userData.pagarme_recipient_id_cnpj,
        pagarme_recipient_id_3: userData.pagarme_recipient_id_3,
        pagarme_recipient_id_cnpj_3: userData.pagarme_recipient_id_cnpj_3,
        pagarme_cpf_id: userData.pagarme_cpf_id,
        pagarme_cnpj_id: userData.pagarme_cnpj_id,
        verified_pagarme: userData.verified_pagarme,
        verified_company_pagarme: userData.verified_company_pagarme,
        verified_pagarme_3: userData.verified_pagarme_3,
        verified_company_pagarme_3: userData.verified_company_pagarme_3,
        balance:
          userData.balance_amount !== null
            ? {
              amount: userData.balance_amount,
              updated_at: userData.balance_updated_at,
            }
            : null,
        withdrawal_settings:
          userData.withdrawal_blocked !== null
            ? {
              blocked: userData.withdrawal_blocked,
              updated_at: userData.withdrawal_settings_updated_at,
              withheld_balance_percentage:
                userData.withheld_balance_percentage,
              use_highest_sale: userData.use_highest_sale,
            }
            : null,
        user_sale_settings:
          userData.release_billet !== null
            ? {
              release_billet: userData.release_billet,
              release_pix: userData.release_pix,
              release_credit_card: userData.release_credit_card,
              fee_variable_pix_service: userData.fee_variable_pix_service,
              fee_variable_billet_service:
                userData.fee_variable_billet_service,
              fee_variable_card_service: userData.fee_variable_card_service,
              fee_fixed_pix_service: userData.fee_fixed_pix_service,
              fee_fixed_billet_service: userData.fee_fixed_billet_service,
              fee_fixed_card_service: userData.fee_fixed_card_service,
            }
            : null,
        onboarding: userData.form_type
          ? {
            user_type: userData.form_type === 2 ? 'creator' : 'marca',
            form_type: userData.form_type,
            created_at: userData.form_created_at,
          }
          : null,
        statistics: {
          total_products: userData.total_products,
          total_sales: userData.total_sales,
          total_revenue: userData.total_revenue,
          last_sale_date: userData.last_sale_date,
        },
      };

      return formattedUser;
    } catch (error) {
      console.error(
        'Erro ao buscar informações do usuário com SQL direto:',
        error,
      );
      throw error;
    }
  }
};
