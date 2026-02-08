const { findStatus } = require('../../status/salesStatus');
const { findRoleType } = require('../../types/roles');
const { resolveType } = require('../common');
const { formatDocument, capitalizeName } = require('../../utils/formatters');
const { findSaleItemsType } = require('../../types/saleItemsTypes');
const { findCommissionsStatus } = require('../../status/commissionsStatus');

const resolveStatus = (id_status) => findStatus(id_status);

const resolveProducts = ({ uuid, name, id_type, payment_type }) => ({
  uuid,
  name,
  type: resolveType(id_type),
  payment_type,
});

const resolveStudent = (student) => {
  const { full_name, email, document_number, whatsapp } = student;
  return {
    full_name: capitalizeName(full_name),
    email,
    whatsapp,
    document_number: formatDocument(document_number),
  };
};

const resolvePlan = (plan) => {
  if (!plan) return null;

  return {
    label: plan.label,
    price: plan.price,
    frequency_label: plan.frequency_label,
  };
};

const resolvePayment = ({
  charges,
  type,
  plan,
  payment_method,
  price_base,
  fee_total,
  split_price,
  discount_percentage: dp,
  discount_amount: da,
  fee_variable_percentage,
  fee_variable_amount,
  fee_fixed,
  shipping_price,
  price_product,
}) => ({
  charges: charges.map(
    ({
      payment_method: method,
      installments,
      provider_response_details,
      price,
      card_brand,
    }) => ({
      card_brand,
      price,
      payment_method: method,
      installments,
      provider_response_details,
    }),
  ),
  student_pays_interest: split_price !== price_base,
  price: price_base,
  type: findSaleItemsType(type),
  plan: resolvePlan(plan),
  payment_method,
  discount_percentage: dp,
  total_discount_amount: da,
  total_fee: fee_total,
  fee_variable_percentage,
  fee_variable_amount,
  fee_fixed,
  shipping_price,
  original_price: price_product,
});

const mapSplits = (commissions) =>
  commissions.map(({ amount, release_date, user, id_role, id_status }) => ({
    user_id: user.uuid,
    amount,
    release_date: release_date || null,
    status: findCommissionsStatus(id_status).label,
    name: capitalizeName(user.full_name),
    role: findRoleType(id_role).label,
  }));

const resolveSplits = (commissions) => {
  const orderedCommissions = commissions.sort((a, b) => a.id_role - b.id_role);
  return mapSplits(orderedCommissions);
};

const resolveStudentBankAccount = ({
  bank_code,
  account_agency,
  account_number,
  account_type,
}) => !!(bank_code && account_agency && account_number && account_type);

const resolveTracking = (tracking) => {
  const keys = Object.keys(tracking);
  if (keys.length === 0) return {};
  const params = {};
  for (const key of keys) {
    if (tracking[key] !== null) {
      params[key] = tracking[key];
    }
  }
  if (Object.keys(params).length === 0) return {};

  return tracking;
};

const serializeSingleSaleitem = (sale_item) => {
  const {
    id,
    quantity,
    product,
    created_at,
    updated_at,
    paid_at,
    uuid,
    id_status,
    type,
    payment_method,
    plan,
    id_user,
    id_affiliate,
    src,
    sck,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    offer,
    tracking_code,
    tracking_url,
    tracking_company,
    coupon_sale,
    sale,
    student,
    charges,
    commissions,
    price_total,
    price_base,
    price_product,
    fee_total,
    split_price,
    discount_percentage,
    discount_amount,
    fee_variable_percentage,
    fee_variable_amount,
    fee_fixed,
    shipping_price,
    integration_shipping_company,
    sale_item_plugin = null,
  } = sale_item;
  const trackingParameters = {
    src,
    sck,
    utm_campaign,
    utm_content,
    utm_medium,
    utm_source,
    utm_term,
    integration_shipping_company,
  };

  const userCommission = commissions.find((c) => c.id_user === id_user);
  return {
    sale_item: {
      id,
      uuid,
      status: resolveStatus(id_status),
      product: resolveProducts(product),
      created_at,
      created_at_plain: created_at,
      has_affiliate: !!id_affiliate,
      updated_at,
      paid_at,
      quantity,
      tracking: {
        code: tracking_code,
        url: tracking_url,
        company: tracking_company,
        frenet: integration_shipping_company,
      },
    },
    qrcode: payment_method === 'pix' ? charges[0].pix_code : null,
    qrcode_link:
      payment_method === 'pix'
        ? `${process.env.URL_SIXBASE_CHECKOUT}/sales/pix/info/${uuid}`
        : null,
    payment: resolvePayment({
      charges,
      type,
      plan,
      payment_method,
      price_total,
      price_base,
      price_product,
      fee_total,
      split_price,
      discount_amount,
      discount_percentage,
      fee_variable_percentage,
      fee_variable_amount,
      fee_fixed,
      shipping_price,
    }),
    splits: resolveSplits(commissions),
    student: resolveStudent(sale),
    student_has_bank_account: resolveStudentBankAccount(student),
    role: findRoleType(userCommission.id_role),
    address: sale.address,
    tracking: resolveTracking(trackingParameters),
    offer: offer || null,
    coupon:
      coupon_sale && coupon_sale.coupons_sales
        ? {
            amount: coupon_sale.amount,
            percentage: coupon_sale.percentage,
            coupon: coupon_sale.coupons_sales.toJSON().coupon,
          }
        : null,
    id_order_bling: sale.id_order_bling ?? sale_item_plugin?.id_bling ?? null,
    id_order_notazz: sale.id_order_notazz ?? null,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleSaleitem);
    }
    return serializeSingleSaleitem(this.data);
  }
};
