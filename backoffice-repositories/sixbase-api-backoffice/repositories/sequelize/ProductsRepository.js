const { Op, QueryTypes } = require('sequelize');
const Products = require('../../database/models/Products');
const { rawAttributes } = require('../../database/models/Users');
const ProductFilters = require('../../utils/productFilters');
const models = require('../../database/models');
const Product_offer = require('../../database/models/Product_offer');

const userFields = Object.keys(rawAttributes).filter(
  (field) => field !== 'id_user',
);

module.exports = class ProductsRepository {
  static async findUserProductsPaginated({
    page = 0,
    size = 10,
    userUuid,
    input = null,
  }) {
    let where = {};
    if (input) {
      where = {
        [Op.or]: {
          name: {
            [Op.like]: `%${input}%`,
          },
          uuid: {
            [Op.like]: `%${input}%`,
          },
        },
      };
    }
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const { rows, count } = await Products.findAndCountAll({
      offset,
      limit,
      where,
      logging: false,
      paranoid: false,
      include: [
        {
          association: 'producer',
          where: {
            uuid: userUuid,
          },
          attributes: userFields,
        },
      ],
    });

    return {
      count,
      rows: rows.map((r) => r.toJSON()),
    };
  }

  static async find(where) {
    const product = await Products.findOne({
      where,
      paranoid: false,
      include: [
        {
          association: 'affiliate_settings',
        },
        {
          association: 'product_offer',
          attributes: [
            'name',
            'uuid',
            'price',
            'allow_affiliate',
            'hide',
            'active',
          ],
        },
        {
          association: 'producer',
          attributes: ['full_name', 'email'],
        },
      ],
    });
    if (!product) return null;
    return product.toJSON();
  }

  static async findByUUID(uuid) {
    const product = await Products.findOne({
      where: {
        uuid,
      },
      paranoid: false,
    });
    if (!product) return null;
    return product.toJSON();
  }

  static async findAll(where) {
    const products = await Products.findAll({
      where,
      raw: true,
    });

    return products;
  }
  static async findUserProductsPaginatedWithSQL({
    page,
    size,
    userUuid,
    input,
  }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = { input, producerUuid: userUuid };
      const { filters, replacements } =
        ProductFilters.createAllFiltersSQL(where);

      const sql = `
        SELECT
          p.id,
          p.uuid,
          p.name,
          p.description,
          p.id_type,
          p.payment_type,
          p.warranty,
          p.warranty as warranty_days,
          p.content_delivery,
          p.cover,
          p.id_status_market as status,
          p.visible,
          p.allow_affiliate,
          p.list_on_market,
          p.recommended_market,
          p.deleted_at,
          CASE WHEN p.deleted_at IS NULL THEN true ELSE false END as deleted,
          COALESCE(pp.price, 0) as price,
          p.created_at,
          p.updated_at,
          u.id as producer_id,
          u.uuid as producer_uuid,
          u.full_name as producer_name,
          u.email as producer_email,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_revenue,
          MAX(si.created_at) as last_sale_date
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        LEFT JOIN sales_items si ON p.id = si.id_product
        LEFT JOIN product_plans pp ON pp.id_product = p.id
        WHERE 1=1
        ${filters}
        GROUP BY p.id, p.uuid, p.name, p.description, p.id_type, p.payment_type, p.warranty, 
                 p.content_delivery, p.cover, p.id_status_market, p.visible, p.allow_affiliate,
                 p.list_on_market, p.recommended_market, p.deleted_at, pp.price, 
                 p.created_at, p.updated_at, u.id, u.uuid, u.full_name, u.email
        ORDER BY p.id ASC
        LIMIT :limit OFFSET :offset
      `;

      const rows = await models.sequelize.query(sql, {
        replacements: {
          ...replacements,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(DISTINCT p.id) as count
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        WHERE 1=1
        ${filters}
      `;

      const countResult = await models.sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      });

      const count = countResult ? countResult.count : 0;

      return {
        rows,
        count,
      };
    } catch (error) {
      console.error('Erro ao buscar produtos com SQL direto:', error);
      return this.findUserProductsPaginated({ page, size, userUuid, input });
    }
  }

  static async findByUUIDWithSQL(uuid) {
    try {
      const sql = `
        SELECT
          p.id,
          p.uuid,
          p.name,
          p.description,
          COALESCE(pp.price, 0) as price,
          p.id_status_market as status,
          p.created_at,
          p.updated_at,
          p.id_user as id_producer,
          p.payment_type,
          p.warranty,
          p.id_type,
          p.cover,
          p.sales_page_url,
          p.support_email,
          p.support_whatsapp,
          p.logo,
          p.nickname,
          p.creditcard_descriptor,
          p.deleted_at,
          p.category,
          p.allow_affiliate,
          p.list_on_market,
          p.recommended_market,
          p.recommend_market_position,
          p.secure_email,
          pas.manual_approve,
          pas.email_notification,
          pas.show_customer_details,
          pas.support_email as affiliate_support_email,
          pas.description as affiliate_description,
          pas.general_rules,
          pas.commission,
          pas.subscription_fee,
          pas.subscription_fee_only,
          pas.subscription_fee_commission,
          pas.commission_all_charges,
          pas.click_attribution,
          pas.cookies_validity,
          pas.url_promotion_material,
          pas.allow_access,
          u.id as producer_id,
          u.uuid as producer_uuid,
          u.full_name as producer_name,
          u.email as producer_email,
          u.document_number as producer_document,
          u.whatsapp as producer_phone,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN si.id_status = 2 THEN si.price_total ELSE 0 END), 0) as paid_revenue,
          COALESCE(SUM(CASE WHEN si.id_status = 4 THEN si.price_total ELSE 0 END), 0) as refunded_revenue,
          MAX(si.created_at) as last_sale_date,
          MIN(si.created_at) as first_sale_date
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        LEFT JOIN sales_items si ON p.id = si.id_product
        LEFT JOIN product_plans pp ON pp.id_product = p.id
        LEFT JOIN product_affiliate_settings pas ON p.id = pas.id_product
        WHERE p.uuid = :uuid
        GROUP BY p.id, p.uuid, p.name, p.description, pp.price, p.id_status_market, 
                 p.created_at, p.updated_at, p.id_user, p.payment_type, p.warranty, 
                 p.id_type, p.cover, p.sales_page_url, p.support_email, p.support_whatsapp, 
                 p.logo, p.nickname, p.creditcard_descriptor, p.deleted_at, p.category, 
                 p.allow_affiliate, p.list_on_market, p.recommended_market, 
                 p.recommend_market_position, p.secure_email, pas.manual_approve, 
                 pas.email_notification, pas.show_customer_details, pas.support_email, 
                 pas.description, pas.general_rules, pas.commission, pas.subscription_fee, 
                 pas.subscription_fee_only, pas.subscription_fee_commission, 
                 pas.commission_all_charges, pas.click_attribution, pas.cookies_validity, 
                 pas.url_promotion_material, pas.allow_access, u.id, u.uuid, 
                 u.full_name, u.email, u.document_number, u.whatsapp
      `;

      const result = await models.sequelize.query(sql, {
        replacements: { uuid },
        type: QueryTypes.SELECT,
        plain: true,
      });

      if (!result) {
        return null;
      }

      const product = {
        id: result.id,
        uuid: result.uuid,
        name: result.name,
        description: result.description,
        price: result.price,
        status: result.status,
        created_at: result.created_at,
        updated_at: result.updated_at,
        deleted_at: result.deleted_at,
        id_producer: result.id_producer,
        payment_type: result.payment_type,
        warranty: result.warranty,
        id_type: result.id_type,
        cover: result.cover,
        sales_page_url: result.sales_page_url,
        support_email: result.support_email,
        support_whatsapp: result.support_whatsapp,
        logo: result.logo,
        nickname: result.nickname,
        creditcard_descriptor: result.creditcard_descriptor,
        category: result.category,
        allow_affiliate: result.allow_affiliate,
        list_on_market: result.list_on_market,
        recommended_market: result.recommended_market,
        recommend_market_position: result.recommend_market_position,
        secure_email: result.secure_email,
        id_status_market: result.status,
        affiliate_settings: result.commission
          ? {
              manual_approve: result.manual_approve,
              email_notification: result.email_notification,
              show_customer_details: result.show_customer_details,
              support_email: result.affiliate_support_email,
              description: result.affiliate_description,
              general_rules: result.general_rules,
              commission: result.commission,
              subscription_fee: result.subscription_fee,
              subscription_fee_only: result.subscription_fee_only,
              subscription_fee_commission: result.subscription_fee_commission,
              commission_all_charges: result.commission_all_charges,
              click_attribution: result.click_attribution,
              cookies_validity: result.cookies_validity,
              url_promotion_material: result.url_promotion_material,
              allow_access: result.allow_access,
            }
          : null,
        producer: {
          id: result.producer_id,
          uuid: result.producer_uuid,
          full_name: result.producer_name,
          email: result.producer_email,
          document_number: result.producer_document,
          phone: result.producer_phone,
        },
        statistics: {
          total_sales: result.total_sales,
          total_revenue: result.total_revenue,
          paid_revenue: result.paid_revenue,
          refunded_revenue: result.refunded_revenue,
          last_sale_date: result.last_sale_date,
          first_sale_date: result.first_sale_date,
        },
      };
      const productOffers = await Product_offer.findAll({
        where: { id_product: product.id },
        attributes: [
          'uuid',
          'name',
          'price',
          'allow_affiliate',
          'hide',
          'active',
        ],
        raw: true,
        paranoid: true,
        logging: false,
      });
      product.product_offer = Array.isArray(productOffers) ? productOffers : [];

      return product;
    } catch (error) {
      console.error('Erro ao buscar produto com SQL direto:', error);
      return this.findByUUID(uuid);
    }
  }

  static async findFilteredProductsWithSQL({ input, page, size }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = { input };
      const { filters, replacements } =
        ProductFilters.createAllFiltersSQL(where);

      const sql = `
        SELECT
          p.id,
          p.uuid,
          p.name,
          p.description,
          COALESCE(pp.price, 0) as price,
          p.id_status_market as status,
          p.created_at,
          p.updated_at,
          u.id as producer_id,
          u.uuid as producer_uuid,
          u.full_name as producer_name,
          u.email as producer_email,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_revenue,
          MAX(si.created_at) as last_sale_date
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        LEFT JOIN sales_items si ON p.id = si.id_product
        LEFT JOIN product_plans pp ON pp.id_product = p.id
        WHERE 1=1
        ${filters}
        GROUP BY p.id, p.uuid, p.name, p.description, pp.price, p.id_status_market, 
                 p.created_at, p.updated_at, u.id, u.uuid, u.full_name, u.email
        ORDER BY p.id ASC
        LIMIT :limit OFFSET :offset
      `;

      const rows = await models.sequelize.query(sql, {
        replacements: {
          ...replacements,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(DISTINCT p.id) as count
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        WHERE 1=1
        ${filters}
      `;

      const countResult = await models.sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      });

      const count = countResult ? countResult.count : 0;

      return {
        rows,
        count,
      };
    } catch (error) {
      console.error('Erro ao buscar produtos filtrados com SQL direto:', error);
      return this.findAll({ name: { [Op.like]: `%${input}%` } });
    }
  }
};
