const { findTransactionTypeByKey } = require('../../../types/transactionTypes');
const {
  findTransactionStatusByKey,
} = require('../../../status/transactionStatus');

const resolveAffiliateBalance = (
  {
    user: {
      balance: { amount, id_user },
    },
  },
  transactions,
) => {
  const commissionTransactions = transactions.find(
    (t) =>
      t.id_user === id_user &&
      t.id_type === findTransactionTypeByKey('commission').id,
  );

  const affiliate_has_balance =
    commissionTransactions.user_net_amount < amount ||
    commissionTransactions.id_status ===
      findTransactionStatusByKey('pending').id;

  const affiliate_amount = affiliate_has_balance
    ? commissionTransactions.user_net_amount
    : 0;
  return {
    hasBalance: affiliate_has_balance,
    affiliateAmount: affiliate_amount,
  };
};

const resolveRefundFee = (
  payment_method,
  { fee_fixed_refund_billet, fee_fixed_refund_card, fee_fixed_refund_pix },
) => {
  if (payment_method === 'card') return fee_fixed_refund_card;
  if (payment_method === 'billet') return fee_fixed_refund_billet;
  if (payment_method === 'pix') return fee_fixed_refund_pix;
  return 0;
};

const resolveProducerCommission = (transactions, id_user) =>
  transactions.find(
    (t) =>
      t.id_user === id_user &&
      t.id_type === findTransactionTypeByKey('commission').id,
  ).user_net_amount;

const serializeSaleItem = (saleItem) => {
  const {
    id_affiliate,
    transactions,
    affiliate,
    payment_method,
    product: { producer },
  } = saleItem;

  let affiliate_has_balance = false;
  let affiliate_amount = 0;
  if (id_affiliate) {
    const { hasBalance, affiliateAmount } = resolveAffiliateBalance(
      affiliate,
      transactions,
    );
    affiliate_has_balance = hasBalance;
    affiliate_amount = affiliateAmount;
  }

  const refund_fee = resolveRefundFee(
    payment_method,
    producer.user_sale_settings,
  );

  const commission_amount = resolveProducerCommission(
    transactions,
    producer.id,
  );
  const refund_total = refund_fee + commission_amount + affiliate_amount;
  return {
    sale_has_affiliate: !!id_affiliate,
    affiliate_has_balance,
    affiliate_amount,
    refund_fee,
    commission_amount,
    refund_total,
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
