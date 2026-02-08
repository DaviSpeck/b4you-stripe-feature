const ApiError = require('../error/ApiError');
const rawData = require('../database/rawData');
const { findSaleDelivery } = require('../database/controllers/sales');
const { findSaleItemsType } = require('../types/saleItemsTypes');
const {
  findResetRequestByIdStudent,
} = require('../database/controllers/resetStudent');
const {
  findStudentSession,
} = require('../database/controllers/student_sessions');
const models = require('../database/models');

module.exports = class Delivery {
  constructor(saleItemId, session) {
    this.saleItemId = saleItemId;
    this.session = session;
  }

  async execute() {
    const saleItem = await models.sequelize.query(
      'select id, id_sale from sales_items where uuid = :uuid',
      {
        replacements: {
          uuid: this.saleItemId,
        },
        plain: true,
      },
    );
    if (!saleItem) throw ApiError.badRequest('Venda não encontrada');
    const sale = await findSaleDelivery(saleItem.id_sale);

    const currentItem = sale.products?.find(
      (item) => item.id === saleItem.id,
    );
    const mainProduct = sale.products.find(
      (s) => s.type === findSaleItemsType('Produto Principal').id,
    );
    if (mainProduct.id_status !== 2)
      throw ApiError.badRequest('Venda não paga');

    let token;
    if (sale.student.status === 'pending') {
      token = await findResetRequestByIdStudent(sale.student.id);
    } else {
      token = await findStudentSession({ id_student: sale.student.id });
    }

    const offer = currentItem.offer ?? null;
    const plan = currentItem.plan ?? null;
    const product = currentItem.product;

    const deliveryContext = {
      sale_item: {
        uuid: this.saleItemId,
        is_upsell: currentItem.is_upsell,
        quantity: currentItem.quantity,
        payment_method: currentItem.payment_method,
      },

      product: {
        id: product.id,
        uuid: product.uuid,
        name: product.name,
        cover: product.cover,
      },

      offer: offer
        ? {
          id: offer.id,
          uuid: offer.uuid,
          name: offer.alternative_name || offer.name,
          price: offer.price,
        }
        : null,

      plan: plan
        ? {
          id: plan.id,
          uuid: plan.uuid,
          label: plan.label,
          frequency_label: plan.frequency_label,
        }
        : null,
    };

    return { ...rawData(sale), delivery_context: deliveryContext, token: token ? token.uuid : null };
  }
};
