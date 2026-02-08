const { QueryTypes } = require('sequelize');
const ApiError = require('../../error/ApiError');
const models = require('../../database/models');

module.exports = class FindProductsCoproductions {
  constructor(ProductsRepository, CoproductionsRepository) {
    this.CoproductionsRepository = CoproductionsRepository;
    this.ProductsRepository = ProductsRepository;
  }

  async execute({ productUuid }) {
    const product = await this.ProductsRepository.findByUUID(productUuid);
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    const coproductions =
      await this.CoproductionsRepository.findUserCoproductions(product.id);
    return coproductions;
  }

  async executeWithSQL({ productUuid }) {
    try {
      const sql = `
        SELECT
          c.id,
          c.uuid,
          c.commission_percentage,
          c.status,
          c.created_at,
          c.updated_at,
          c.id_user,
          c.id_product,
          u.id as user_id,
          u.uuid as user_uuid,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          u.whatsapp as user_phone,
          u.document_number as user_document_number,
          p.id as product_id,
          p.uuid as product_uuid,
          p.name as product_name,
          COALESCE(MIN(pp.price), 0) as product_price,
          p.id_status_market as product_status
        FROM coproductions c
        LEFT JOIN users u ON c.id_user = u.id
        LEFT JOIN products p ON c.id_product = p.id
        LEFT JOIN product_plans pp ON pp.id_product = p.id
        WHERE p.uuid = :product_uuid
        GROUP BY c.id, c.uuid, c.commission_percentage, c.status, c.created_at, c.updated_at, 
                 c.id_user, c.id_product, u.id, u.uuid, u.first_name, u.last_name, 
                 u.email, u.whatsapp, u.document_number, p.id, p.uuid, p.name, p.id_status_market
        ORDER BY c.id DESC
      `;

      const rows = await models.sequelize.query(sql, {
        replacements: { product_uuid: productUuid },
        type: QueryTypes.SELECT,
      });

      const formattedRows = rows.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        percentage: row.commission_percentage,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        id_user: row.id_user,
        id_product: row.id_product,
        user: {
          id: row.user_id,
          uuid: row.user_uuid,
          first_name: row.user_first_name,
          last_name: row.user_last_name,
          email: row.user_email,
          phone: row.user_phone,
          document_number: row.user_document_number,
        },
        product: {
          id: row.product_id,
          uuid: row.product_uuid,
          name: row.product_name,
          price: row.product_price,
          status: row.product_status,
        },
      }));

      return formattedRows;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error(
        'Erro ao buscar coproduções do produto com SQL direto:',
        error,
      );
      throw error;
    }
  }
};
