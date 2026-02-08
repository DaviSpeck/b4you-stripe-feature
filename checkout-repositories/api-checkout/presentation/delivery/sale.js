const {
  findStatus,
  findSalesStatusByKey,
} = require('../../status/salesStatus');
const { findSaleItemsType } = require('../../types/saleItemsTypes');
const { pixelsTypes } = require('../../types/pixelsTypes');

const resolvePayment = (saleItem) => {
  const { payment_method, id_status } = saleItem;

  return {
    amount: saleItem.price_total,
    payment_method,
    status: findStatus(id_status),
  };
};

const serializePixels = (pixels, sessionPixelsEventId) =>
  pixelsTypes.reduce(
    (a, v) => ({
      ...a,
      [v.type]: pixels
        .filter((p) => p.id_type === v.id)
        .map(({ uuid, settings }) => {
          const { api_token, domain, ...rest } = settings;
          return {
            uuid,
            sessionPixelsEventId,
            settings: {
              domain: domain ? `pixel.${domain}` : `${process.env.PIXEL_URL}`,
              api_token: !!api_token,
              ...rest,
            },
          };
        }),
    }),
    {},
  );

const resolveProducts = (saleItems, sessionPixelsEventId) =>
  saleItems.map((saleItem) => ({
    name: saleItem.product.name,
    uuid: saleItem.product.uuid,
    payment: resolvePayment(saleItem),
    type: findSaleItemsType(saleItem.type).type,
    pixels: serializePixels(saleItem.product.pixels, sessionPixelsEventId),
    id_type: saleItem.product.id_type,

    sale_item_uuid: saleItem.uuid,
    is_upsell: !!saleItem.is_upsell,

    product: {
      id: saleItem.product.id,
      uuid: saleItem.product.uuid,
      name: saleItem.product.name,
      cover: saleItem.product.cover,
    },

    offer: saleItem.offer
      ? {
        id: saleItem.offer.id,
        uuid: saleItem.offer.uuid,
        name:
          saleItem.offer.alternative_name ||
          saleItem.offer.name,
        price: saleItem.offer.price,
      }
      : null,

    plan: saleItem.plan
      ? {
        id: saleItem.plan.id,
        uuid: saleItem.plan.uuid,
        label: saleItem.plan.label,
        frequency_label: saleItem.plan.frequency_label,
      }
      : null,
  }));

const resolveStudent = ({ full_name, email }) => ({
  full_name,
  email,
});

const getRedirectUrl = (student, token) => {
  if (!token) return `${process.env.URL_SIXBASE_MEMBERSHIP}`;
  if (student.status === 'pending')
    return `${process.env.URL_SIXBASE_MEMBERSHIP}/cadastrar-senha/${token}/first`;
  return `${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${token}`;
};

const serializeSingleSale = (sale, sessionPixelsEventId) => {
  const { student, products, token } = sale;

  const paidProducts = products.filter(
    (p) => p.id_status === findSalesStatusByKey('paid').id,
  );

  const total = paidProducts.reduce((acc, { price_total }) => {
    acc += price_total;
    return acc;
  }, 0);

  const orderedProducts = products.sort((a, b) => a.type - b.type);

  const membership_redirect = getRedirectUrl(student, token);

  return {
    total,
    payment_method: orderedProducts[0].payment_method,
    products: resolveProducts(orderedProducts, sessionPixelsEventId),
    student: resolveStudent(student),
    membership_redirect,
    physical: ![1, 2].includes(orderedProducts[0].product.id_type),
  };
};

module.exports = class {
  constructor(data, sessionPixelsEventId) {
    this.data = data;
    this.sessionPixelsEventId = sessionPixelsEventId;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map((sale) =>
        serializeSingleSale(sale, this.sessionPixelsEventId),
      );
    }
    return serializeSingleSale(this.data, this.sessionPixelsEventId);
  }
};
