const _ = require('lodash');
const date = require('../../../utils/helpers/date');
const uuid = require('../../../utils/helpers/uuid');
const APiError = require('../../../error/ApiError');
const {
  findTransactionStatus,
  transactionStatus,
} = require('../../../status/transactionStatus');
const { findTransactionTypeByKey } = require('../../../types/transactionTypes');
const { findRoleTypeByKey } = require('../../../types/roles');

const [PENDING, PAID] = transactionStatus;

const payment_methods = {
  pix: 'release_pix',
  billet: 'release_billet',
  card: 'release_credit_card',
};

const resolveReleaseDate = ({
  paid_at,
  payment_method,
  saleSettings,
  status,
}) => {
  if (status !== PAID.id) return null;
  return date(paid_at).add(saleSettings[payment_methods[payment_method]], 'd');
};

const resolveStatus = (status) => {
  if (status === PENDING.id || status === PAID.id) return PENDING.id;
  return findTransactionStatus(status).id;
};

module.exports = class CalculateCommissionsTransactions {
  #sale_item;

  #first_charge;

  #affiliate;

  #transaction_id;

  #TransactionRepository;

  #dbTransaction;

  constructor(
    { sale_item, first_charge, affiliate, transaction_id },
    TransactionRepository,
    dbTransaction,
  ) {
    this.#sale_item = sale_item;
    this.#first_charge = first_charge;
    this.#affiliate = affiliate;
    this.#transaction_id = transaction_id;
    this.#TransactionRepository = TransactionRepository;
    this.#dbTransaction = dbTransaction;
  }

  async execute() {
    const transactions = [];
    const totalCoproductionCommission = [];
    const transaction = await this.#TransactionRepository.find(
      {
        id: this.#transaction_id,
      },
      this.#dbTransaction,
    );
    if (!transaction) throw APiError.badRequest('Transação não encontrada');

    const { split_price, subscription_fee } = transaction;
    const id_status = resolveStatus(transaction.id_status);
    let amountSale = split_price + subscription_fee;
    let total_affiliate_amount = 0;
    if (this.#affiliate) {
      const releaseDateAffiliate = resolveReleaseDate({
        paid_at: this.#sale_item.paid_at,
        payment_method: this.#sale_item.payment_method,
        saleSettings: this.#affiliate.user.user_sale_settings,
        status: transaction.id_status,
      });

      if (
        split_price > 0 &&
        !this.#affiliate.subscription_fee_only &&
        (this.#first_charge || this.#affiliate.commission_all_charges)
      ) {
        const affiliateAmount =
          split_price * (this.#affiliate.commission / 100);
        total_affiliate_amount += affiliateAmount;

        transactions.push({
          id_type: findTransactionTypeByKey('commission').id,
          id_user: this.#affiliate.id_user,
          user_gross_amount: affiliateAmount,
          user_net_amount: affiliateAmount,
          id_status,
          psp_id: transaction.psp_id,
          release_date: releaseDateAffiliate,
          uuid: uuid.v4(),
          id_role: findRoleTypeByKey('affiliate').id,
          method: this.#sale_item.payment_method,
          card_brand: transaction.card_brand,
          subscription_fee: 0,
        });
      }

      if (subscription_fee && this.#affiliate.subscription_fee) {
        const affiliateAmount =
          subscription_fee *
          (this.#affiliate.subscription_fee_commission / 100);
        total_affiliate_amount += affiliateAmount;

        transactions.push({
          id_type: findTransactionTypeByKey('commission').id,
          id_user: this.#affiliate.id_user,
          user_gross_amount: affiliateAmount,
          user_net_amount: affiliateAmount,
          id_status,
          psp_id: transaction.psp_id,
          release_date: releaseDateAffiliate,
          uuid: uuid.v4(),
          id_role: findRoleTypeByKey('affiliate').id,
          method: this.#sale_item.payment_method,
          card_brand: transaction.card_brand,
          subscription_fee: transaction.subscription_fee,
        });
      }
    }

    amountSale -= total_affiliate_amount;
    const tax = transaction.user_gross_amount - transaction.user_net_amount;
    amountSale -= tax;
    for (const coproduction of this.#sale_item.product.coproductions) {
      const coproducerAmount =
        amountSale * (coproduction.commission_percentage / 100);
      totalCoproductionCommission.push(coproducerAmount);
      const releaseDateCoproducer = resolveReleaseDate({
        paid_at: this.#sale_item.paid_at,
        payment_method: this.#sale_item.payment_method,
        saleSettings: coproduction.user.user_sale_settings,
        status: transaction.id_status,
      });

      transactions.push({
        id_type: findTransactionTypeByKey('commission').id,
        id_user: coproduction.user.id,
        user_gross_amount: coproducerAmount,
        user_net_amount: coproducerAmount,
        id_status,
        psp_id: transaction.psp_id,
        release_date: releaseDateCoproducer,
        uuid: uuid.v4(),
        id_role: findRoleTypeByKey('coproducer').id,
        method: this.#sale_item.payment_method,
        card_brand: transaction.card_brand,
        subscription_fee: transaction.subscription_fee,
      });
    }
    const releaseDateProducer = resolveReleaseDate({
      paid_at: this.#sale_item.paid_at,
      payment_method: this.#sale_item.payment_method,
      saleSettings: this.#sale_item.product.producer.user_sale_settings,
      status: transaction.id_status,
    });

    const amountProducer = amountSale - _.sum(totalCoproductionCommission);
    transactions.push({
      id_type: findTransactionTypeByKey('commission').id,
      id_user: this.#sale_item.product.id_user,
      user_gross_amount: amountProducer,
      user_net_amount: amountProducer,
      id_status,
      psp_id: transaction.psp_id,
      release_date: releaseDateProducer,
      uuid: uuid.v4(),
      id_role: findRoleTypeByKey('producer').id,
      method: this.#sale_item.payment_method,
      card_brand: transaction.card_brand,
      subscription_fee: transaction.subscription_fee,
    });

    return transactions;
  }
};
