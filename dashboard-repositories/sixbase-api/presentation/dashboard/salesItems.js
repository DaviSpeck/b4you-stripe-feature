const { findStatus } = require('../../status/salesStatus');
const { capitalizeName } = require('../../utils/formatters');
const { findSaleItemsType } = require('../../types/saleItemsTypes');
const { findRoleType } = require('../../types/roles');

const resolveProducts = ({ uuid, name }) => ({
  uuid,
  name,
});

const resolveStudent = (student) => {
  const { full_name } = student;
  return {
    full_name: capitalizeName(full_name),
  };
};
const serializeSingleSaleitem = (sale_item, id_user) => {
  const {
    product,
    created_at,
    uuid,
    id_status,
    price_product,
    type,
    payment_method,
    affiliate,
    src,
    sck,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    sale,
    commissions,
    coupon_sale,
  } = sale_item;

  const commission = commissions.find((t) => t.id_user === id_user);
  return {
    uuid,
    status: findStatus(id_status),
    price: price_product,
    commission_amount: commission.amount,
    payment_method,
    type: findSaleItemsType(type),
    product: resolveProducts(product),
    student: resolveStudent(sale),
    created_at,
    created_at_plain: created_at,
    role: findRoleType(commission.id_role),
    has_affiliate: !!affiliate,
    affiliate,
    src,
    sck,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    group_id: sale.uuid,
    coupon_sale: coupon_sale
      ? {
          coupon: coupon_sale?.coupons_sales?.coupon,
          id_coupon: coupon_sale?.id_coupon,
        }
      : null,
  };
};

module.exports = class {
  constructor(data, id_user) {
    this.data = data;
    this.id_user = id_user;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map((saleItem) =>
        serializeSingleSaleitem(saleItem, this.id_user),
      );
    }
    return serializeSingleSaleitem(this.data, this.id_user);
  }
};
