const { QueryTypes } = require('sequelize');
const ApiError = require('../../error/ApiError');

module.exports = class FindSingleProduct {
  constructor(ProductsRepository) {
    this.ProductsRepository = ProductsRepository;
  }

  async execute({ productUuid }) {
    const product = await this.ProductsRepository.find({
      uuid: productUuid,
    });

    if (!product) throw ApiError.badRequest('Produto não encontrado');

    return product;
  }

  async executeWithSQL({ productUuid }) {
    try {
      const sql = `
        SELECT
          p.id,
          p.uuid,
          p.name,
          p.description,
          p.created_at,
          p.updated_at,
          p.id_user as id_producer,
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
        WHERE p.uuid = :productUuid
        GROUP BY p.id, p.uuid, p.name, p.description, 
                 p.created_at, p.updated_at, p.id_user, u.id, u.uuid, 
                 u.full_name, u.email, u.document_number, u.whatsapp
      `;

      const models = require('../../database/models');
      const result = await models.sequelize.query(sql, {
        replacements: { productUuid },
        type: QueryTypes.SELECT,
        plain: true,
      });

      if (!result) {
        throw ApiError.badRequest('Produto não encontrado');
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
        id_producer: result.id_producer,
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

      return product;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Erro ao buscar produto com SQL direto:', error);
      throw error;
    }
  }
};
