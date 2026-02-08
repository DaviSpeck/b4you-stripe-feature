const { findSaleItemsType } = require('../../types/saleItemsTypes');
const { findPaymentMethods } = require('../../types/paymentMethods');
const { findProductFormat } = require('../../types/productFormat');
const { findPaymentTypeByKey } = require('../../types/paymentTypes');
const {
  findReferralCommissionStatus,
} = require('../../status/referralCommissionsStatus');
const { capitalizeName } = require('../../utils/formatters');
const { findStatus } = require('../../status/salesStatus');

const serializeReferralCommission = (referral) => {
  if (!referral) return null;
  return {
    amount: referral.amount,
    status: findReferralCommissionStatus(referral.id_status),
    full_name: capitalizeName(referral.user.full_name),
    user_uuid: referral.user.uuid,
    release_date: referral.release_date,
  };
};
const serializeAffiliate = (affiliate) => {
  if (!affiliate) return null;
  const {
    user: { uuid, first_name, last_name },
  } = affiliate;
  return {
    uuid,
    full_name: capitalizeName(`${first_name} ${last_name}`),
  };
};

module.exports.serializeSale = ({
  created_at,
  price_product,
  id_status,
  uuid,
  payment_method,
  paid_at,
  valid_refund_until,
  type,
  id_affiliate,
  affiliate,
  tracking_code,
  tracking_url,
  tracking_company,
  credit_card,
  referral_commission,
  price_total,
  charges,
  product: {
    name,
    support_email,
    support_whatsapp,
    id_type,
    payment_type,
    uuid: uuid_product,
    producer: { full_name, email, uuid: uuid_producer },
  },
  refund,
  sale,
}) => ({
  uuid,
  created_at,
  price: price_product,
  price_total,
  status: findStatus(id_status),
  paid_at,
  valid_refund_until,
  type_sale: findSaleItemsType(type).name,
  payment_method: findPaymentMethods(payment_method).key,
  type: findProductFormat(id_type).label,
  payment_type: findPaymentTypeByKey(payment_type).label,
  id_affiliate,
  affiliate: serializeAffiliate(affiliate),
  product: {
    uuid: uuid_product,
    name,
    support_email,
    support_whatsapp,
  },
  producer: {
    full_name: capitalizeName(full_name),
    email,
    uuid: uuid_producer,
  },
  refunds:
    findStatus(id_status).key === 'refunded' ||
    findStatus(id_status).key === 'request-refund'
      ? refund
      : null,
  psp_id: charges.map(({ psp_id }) => psp_id).join(' - '),
  provider: charges
    .map(({ provider, provider_id }) =>
      provider && provider_id ? `${provider} - ${provider_id}` : null,
    )
    .map((item) => (item !== null ? item : null))
    .join(' - '),
  payment_transaction: charges[0].uuid,
  charge: charges[0],
  installments: charges[0].installments,
  tracking_code,
  tracking_url,
  tracking_company,
  card: credit_card ? credit_card.last_four : null,
  referral_commission: serializeReferralCommission(referral_commission),
  sale,
});
