const { QueryTypes } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const SalesFilters = require('../../utils/salesFilters');

module.exports = class FindSalesPaginated {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({
    userUuid,
    page,
    size,
    input,
    startDate,
    endDate,
    paymentMethod,
  }) {
    const { rows, count } = await this.SalesItemsRepository.findPaginated({
      userUuid,
      page,
      size,
      startDate,
      endDate,
      input,
      paymentMethod,
    });
    return { rows, count };
  }

  async executeWithSQL({
    userUuid,
    page,
    size,
    input,
    startDate,
    endDate,
    paymentMethod,
  }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = {
        start_date: startDate,
        end_date: endDate,
        payment_method: paymentMethod,
        input,
      };

      const salesWhere = {
        id_user: userUuid,
      };

      const { baseFilters, baseReplacements } =
        SalesFilters.createBaseFiltersSQL(where);
      const { salesFilters, salesReplacements } =
        SalesFilters.createSalesFiltersSQL(salesWhere);

      const results = await SalesItems.sequelize.query(
        `
        SELECT 
          si.id,
          si.uuid,
          si.created_at,
          si.price,
          si.id_status,
          si.payment_method,
          si.paid_at,
          si.price_total,
          si.price_product,
          si.type,
          si.id_affiliate,
          si.tracking_code,
          si.tracking_url,
          si.tracking_company,
          si.credit_card,
          si.valid_refund_until,
          si.id_sale,
          p.name as product_name,
          p.uuid as product_uuid,
          p.support_email,
          p.support_whatsapp,
          p.id_type,
          p.payment_type,
          prod.full_name as producer_name,
          prod.email as producer_email,
          prod.uuid as producer_uuid,
          s.full_name as student_name,
          s.email as student_email,
          s.uuid as student_uuid,
          s.document_number as student_document,
          aff_user.first_name as affiliate_first_name,
          aff_user.last_name as affiliate_last_name,
          aff_user.uuid as affiliate_uuid,
          sale.params as sale_params,
          sale.id_user as sale_user_id,
          sale.state_generated as sale_state,
          c.amount as commission_amount,
          c.id_status as commission_status,
          c.id_role as commission_role,
          c.id_user as commission_user_id,
          c.release_date as commission_release_date
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_user = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        LEFT JOIN commissions c ON si.id = c.id_sale_item AND c.id_user = :userUuid
        WHERE 1=1
        ${baseFilters}
        ${salesFilters}
        ORDER BY si.id DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            limit,
            offset,
            userUuid,
            ...baseReplacements,
            ...salesReplacements,
          },
        },
      );

      const countResult = await SalesItems.sequelize.query(
        `
        SELECT COUNT(DISTINCT si.id) as total
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_user = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        WHERE 1=1
        ${baseFilters}
        ${salesFilters}
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            userUuid,
            ...baseReplacements,
            ...salesReplacements,
          },
        },
      );

      const total = countResult[0]?.total || 0;

      const formattedResults = results.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        created_at: row.created_at,
        price: row.price,
        id_status: row.id_status,
        payment_method: row.payment_method,
        paid_at: row.paid_at,
        price_total: row.price_total,
        price_product: row.price_product,
        type: row.type,
        id_affiliate: row.id_affiliate,
        tracking_code: row.tracking_code,
        tracking_url: row.tracking_url,
        tracking_company: row.tracking_company,
        credit_card: row.credit_card,
        valid_refund_until: row.valid_refund_until,
        id_sale: row.id_sale,
        product: row.product_name
          ? {
              name: row.product_name,
              uuid: row.product_uuid,
              support_email: row.support_email,
              support_whatsapp: row.support_whatsapp,
              id_type: row.id_type,
              payment_type: row.payment_type,
              producer: row.producer_name
                ? {
                    full_name: row.producer_name,
                    email: row.producer_email,
                    uuid: row.producer_uuid,
                  }
                : null,
            }
          : null,
        student: row.student_name
          ? {
              full_name: row.student_name,
              email: row.student_email,
              uuid: row.student_uuid,
              document_number: row.student_document,
            }
          : null,
        affiliate: row.affiliate_first_name
          ? {
              id: row.id_affiliate,
              user: {
                first_name: row.affiliate_first_name,
                last_name: row.affiliate_last_name,
                uuid: row.affiliate_uuid,
              },
            }
          : null,
        sale: row.sale_params
          ? {
              params: row.sale_params,
              id_user: row.sale_user_id,
              state_generated: row.sale_state,
            }
          : null,
        commissions: row.commission_amount
          ? [
              {
                amount: row.commission_amount,
                id_status: row.commission_status,
                id_role: row.commission_role,
                id_user: row.commission_user_id,
                release_date: row.commission_release_date,
              },
            ]
          : [],
      }));

      return {
        rows: formattedResults,
        count: total,
      };
    } catch (error) {
      console.error('Erro ao buscar sales paginadas com SQL direto:', error);
      throw error;
    }
  }
};
