const DateHelper = require('../../utils/helpers/date');
const { capitalizeName } = require('../../utils/formatters');
const { translatePaymentMethod } = require('../common');
const {
  findStatus,
  findSalesStatusByKey,
} = require('../../status/salesStatus');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../types/dateTypes');
const { findSaleItemsType } = require('../../types/saleItemsTypes');

const resolveCardData = (cardData) => {
  if (!cardData) return cardData;
  const { brand, last_four } = cardData;
  return {
    brand,
    number: `**** **** **** ${last_four}`,
  };
};

const serializeSaleItem = (saleItem) => {
  const {
    created_at,
    payment_method,
    product,
    student,
    uuid,
    valid_refund_until,
    credit_card,
    id_status,
    paid_at,
    type,
    price_total,
  } = saleItem;

  let warranty = null;
  const SEVEN_DAYS = 7;
  const diff = DateHelper().diff(paid_at, 'd');
  const expire_date = DateHelper(paid_at).add(SEVEN_DAYS, 'd');
  if (
    id_status === findSalesStatusByKey('request-refund').id ||
    id_status === findSalesStatusByKey('refunded').id
  ) {
    if (diff < SEVEN_DAYS) {
      warranty = `Você receberá o seu reembolso no dia ${expire_date.format(
        FRONTEND_DATE_WITHOUT_TIME,
      )} após o encerramento do prazo de garantia da compra.`;
    } else {
      warranty =
        'Seu reembolso foi solicitado, você receberá conforme o meio de pagamento utilizado';
    }
  }
  return {
    uuid,
    price: price_total,
    type: findSaleItemsType(type),
    is_refundable:
      DateHelper(valid_refund_until).isAfter(DateHelper()) &&
      id_status === findSalesStatusByKey('paid').id,
    purchase_date: created_at,
    valid_date_refund: valid_refund_until,
    status: findStatus(id_status),
    payment_method: translatePaymentMethod(payment_method),
    credit_card: resolveCardData(credit_card),
    warranty,
    student: {
      id: student.id,
      email: student.email,
      document_number: student.document_number,
      full_name: student.full_name,
    },
    product: {
      name: capitalizeName(product.name),
      cover: product.cover,
      producer: capitalizeName(product.producer.full_name),
      support_email: product.support_email,
      support_whatsapp: product.support_whatsapp,
      content_delivery: product.content_delivery,
      payment_type: product.payment_type,
      type: product.id_type,
    },
    student_name: `${student.full_name.split(' ')[0]} ${''.padStart(
      student.full_name.split(' ')[1]
        ? student.full_name.split(' ')[1].length
        : 5,
      '*',
    )}`,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSaleItem);
    }
    return serializeSaleItem(this.data);
  }
};
