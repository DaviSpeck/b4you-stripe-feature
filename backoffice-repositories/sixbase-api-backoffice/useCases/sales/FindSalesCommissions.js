const { QueryTypes } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');

module.exports = class FindSalesCommissions {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute(saleUuid) {
    const sales = await this.SalesItemsRepository.findSaleTransactions(
      saleUuid,
    );
    return sales;
  }

  async executeWithSQL(saleUuid) {
    try { 
      const results = await SalesItems.sequelize.query(
        `
        SELECT 
          si.id,
          si.uuid,
          si.price_product,
          si.valid_refund_until,
          si.payment_method,
          si.uuid as sale_item_uuid,
          si.price_total,
          si.id_sale,
          si.id_student,
          si.id_product,
          si.id_affiliate,
          si.id_status,
          si.created_at,
          si.updated_at,
          si.paid_at,
          si.type,
          si.tracking_code,
          si.tracking_url,
          si.tracking_company,
          si.credit_card,
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
          c.id as commission_id,
          c.amount as commission_amount,
          c.id_status as commission_status,
          c.id_role as commission_role,
          c.id_user as commission_user_id,
          c.release_date as commission_release_date,
          c_user.full_name as commission_user_name,
          c_user.uuid as commission_user_uuid,
          ch.installments as charge_installments,
          ch.price as charge_price,
          ch.psp_id as charge_psp_id,
          ch.provider as charge_provider,
          ch.provider_id as charge_provider_id,
          ch.billet_url as charge_billet_url,
          ch.uuid as charge_uuid,
          ch.provider_response_details as charge_provider_response_details,
          ref.created_at as refund_created_at,
          ref.id_status as refund_status,
          ref.updated_at as refund_updated_at,
          ref.reason as refund_reason,
          ref.amount as refund_amount,
          rc.id as referral_commission_id,
          rc.amount as referral_commission_amount,
          rc.id_status as referral_commission_status,
          rc.release_date as referral_commission_release_date,
          rc_user.full_name as referral_commission_user_name,
          rc_user.uuid as referral_commission_user_uuid,
          cs.id as coupon_sale_id,
          cs.coupon_id as coupon_id,
          cp.code as coupon_code,
          cp.discount_type as coupon_discount_type,
          cp.discount_value as coupon_discount_value
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_user = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        LEFT JOIN commissions c ON si.id = c.id_sale_item
        LEFT JOIN users c_user ON c.id_user = c_user.id
        LEFT JOIN charges ch ON si.id = ch.id_sale_item
        LEFT JOIN refunds ref ON si.id = ref.id_sale_item
        LEFT JOIN referral_commissions rc ON si.id = rc.id_sale_item
        LEFT JOIN users rc_user ON rc.id_user = rc_user.id
        LEFT JOIN coupon_sales cs ON si.id = cs.id_sale_item
        LEFT JOIN coupons cp ON cs.coupon_id = cp.id
        WHERE si.uuid = :saleUuid
        ORDER BY c.id ASC, ch.id ASC, ref.id ASC, rc.id ASC, cs.id ASC
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: { saleUuid },
        },
      );

      if (!results || results.length === 0) {
        return null;
      }

      const saleItem = {
        id: results[0].id,
        uuid: results[0].sale_item_uuid,
        price_product: results[0].price_product,
        valid_refund_until: results[0].valid_refund_until,
        payment_method: results[0].payment_method,
        price_total: results[0].price_total,
        id_sale: results[0].id_sale,
        id_student: results[0].id_student,
        id_product: results[0].id_product,
        id_affiliate: results[0].id_affiliate,
        id_status: results[0].id_status,
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        paid_at: results[0].paid_at,
        type: results[0].type,
        tracking_code: results[0].tracking_code,
        tracking_url: results[0].tracking_url,
        tracking_company: results[0].tracking_company,
        credit_card: results[0].credit_card,
        product: results[0].product_name
          ? {
              name: results[0].product_name,
              uuid: results[0].product_uuid,
              support_email: results[0].support_email,
              support_whatsapp: results[0].support_whatsapp,
              id_type: results[0].id_type,
              payment_type: results[0].payment_type,
              producer: results[0].producer_name
                ? {
                    full_name: results[0].producer_name,
                    email: results[0].producer_email,
                    uuid: results[0].producer_uuid,
                  }
                : null,
            }
          : null,
        student: results[0].student_name
          ? {
              full_name: results[0].student_name,
              email: results[0].student_email,
              uuid: results[0].student_uuid,
              document_number: results[0].student_document,
            }
          : null,
        affiliate: results[0].affiliate_first_name
          ? {
              id: results[0].id_affiliate,
              user: {
                first_name: results[0].affiliate_first_name,
                last_name: results[0].affiliate_last_name,
                uuid: results[0].affiliate_uuid,
              },
            }
          : null,
        sale: results[0].sale_params
          ? {
              params: results[0].sale_params,
              id_user: results[0].sale_user_id,
              state_generated: results[0].sale_state,
            }
          : null,
        commissions: [],
        charges: [],
        refund: null,
        referral_commission: null,
        coupon_sale: null,
      };

      const processedCommissions = new Set();
      const processedCharges = new Set();
      const processedRefunds = new Set();
      const processedReferralCommissions = new Set();
      const processedCouponSales = new Set();

      results.forEach((row) => {
        if (row.commission_id && !processedCommissions.has(row.commission_id)) {
          processedCommissions.add(row.commission_id);
          saleItem.commissions.push({
            id: row.commission_id,
            amount: row.commission_amount,
            id_status: row.commission_status,
            id_role: row.commission_role,
            id_user: row.commission_user_id,
            release_date: row.commission_release_date,
            user: {
              full_name: row.commission_user_name,
              uuid: row.commission_user_uuid,
            },
          });
        }

        if (row.charge_uuid && !processedCharges.has(row.charge_uuid)) {
          processedCharges.add(row.charge_uuid);
          saleItem.charges.push({
            installments: row.charge_installments,
            price: row.charge_price,
            psp_id: row.charge_psp_id,
            provider: row.charge_provider,
            provider_id: row.charge_provider_id,
            billet_url: row.charge_billet_url,
            uuid: row.charge_uuid,
            provider_response_details: row.charge_provider_response_details,
          });
        }

        if (
          row.refund_created_at &&
          !processedRefunds.has(row.refund_created_at)
        ) {
          processedRefunds.add(row.refund_created_at);
          saleItem.refund = {
            created_at: row.refund_created_at,
            id_status: row.refund_status,
            updated_at: row.refund_updated_at,
            reason: row.refund_reason,
            amount: row.refund_amount,
          };
        }

        if (
          row.referral_commission_id &&
          !processedReferralCommissions.has(row.referral_commission_id)
        ) {
          processedReferralCommissions.add(row.referral_commission_id);
          saleItem.referral_commission = {
            id: row.referral_commission_id,
            amount: row.referral_commission_amount,
            id_status: row.referral_commission_status,
            release_date: row.referral_commission_release_date,
            user: {
              full_name: row.referral_commission_user_name,
              uuid: row.referral_commission_user_uuid,
            },
          };
        }

        if (
          row.coupon_sale_id &&
          !processedCouponSales.has(row.coupon_sale_id)
        ) {
          processedCouponSales.add(row.coupon_sale_id);
          saleItem.coupon_sale = {
            id: row.coupon_sale_id,
            coupon_id: row.coupon_id,
            coupon: {
              code: row.coupon_code,
              discount_type: row.coupon_discount_type,
              discount_value: row.coupon_discount_value,
            },
          };
        }
      });

      return saleItem;
    } catch (error) {
      console.error(
        'Erro ao buscar transações de venda com SQL direto:',
        error,
      );
      throw error;
    }
  }
};
