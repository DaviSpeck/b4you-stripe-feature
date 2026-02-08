import { date } from '../utils/date.mjs';
import { v4 } from 'uuid';
import { findTransactionStatus, transactionStatus } from '../status/transactionStatus.mjs';
import { findTransactionTypeByKey } from '../types/transactions.mjs';
import { findRoleTypeByKey } from '../types/rolesTypes.mjs';
import { Affiliates } from '../database/models/Affiliates.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Coproductions } from '../database/models/Coproductions.mjs';
import { Sales_settings } from '../database/models/SalesSettings.mjs';

const uuid = { v4: () => v4() };
const [PENDING, PAID] = transactionStatus;

const payment_methods = {
  pix: 'release_pix',
  billet: 'release_billet',
  card: 'release_credit_card',
};

const resolveReleaseDate = ({ paid_at, payment_method, saleSettings, status }) => {
  if (status !== PAID.id) return null;
  return date(paid_at).add(saleSettings[payment_methods[payment_method]], 'd');
};

const resolveStatus = (status) => {
  if (status === PENDING.id || status === PAID.id) return PENDING.id;
  return findTransactionStatus(status).id;
};

export class CalculateCommissionsTransactions {
  static async execute({ id_user, sale_item, first_charge, transaction, shipping_type }) {
    const transactions = [];
    let { split_price, subscription_fee, shipping_price } = transaction;
    const id_status = resolveStatus(transaction.id_status);
    if (split_price > 0 && subscription_fee > 0) {
      split_price = split_price - subscription_fee;
    }
    let total_affiliate_amount = 0;
    let affiliate = null;
    if (sale_item.id_affiliate) {
      affiliate = await Affiliates.findOne({
        raw: true,
        nest: true,
        where: {
          id_user: affiliate.id_user,
          id_product: sale_item.id_product,
          status: 2,
        },
        include: [
          {
            association: 'user',
            attributes: [],
            include: [
              {
                association: 'user_sale_settings',
              },
            ],
          },
        ],
      });

      if (!affiliate) {
        // retira o afiliado da sale_item pois ele não tem afiliação com o produto
        await Sales_items.update(
          { id_affiliate: null },
          {
            where: {
              id: sale_item.id,
            },
          }
        );
      }
    }
    if (affiliate) {
      const releaseDateAffiliate = resolveReleaseDate({
        paid_at: sale_item.paid_at,
        payment_method: sale_item.payment_method,
        saleSettings: affiliate.user.user_sale_settings,
        status: transaction.id_status,
      });

      if (
        split_price > 0 &&
        !affiliate.subscription_fee_only &&
        (first_charge || affiliate.commission_all_charges)
      ) {
        const affiliateAmount =
          (split_price - [2, 3].includes(shipping_type ? shipping_price : 0)) *
          (affiliate.commission / 100);
        total_affiliate_amount += affiliateAmount;
        transactions.push({
          id_type: findTransactionTypeByKey('commission').id,
          id_user: affiliate.id_user,
          user_gross_amount: affiliateAmount,
          user_net_amount: affiliateAmount,
          id_status,
          psp_id: transaction.psp_id,
          release_date: releaseDateAffiliate,
          uuid: uuid.v4(),
          id_role: findRoleTypeByKey('affiliate').id,
          method: sale_item.payment_method,
          card_brand: transaction.card_brand,
          subscription_fee: 0,
        });
      }

      if (subscription_fee && affiliate.subscription_fee) {
        const affiliateAmount = subscription_fee * (affiliate.subscription_fee_commission / 100);
        total_affiliate_amount += affiliateAmount;

        transactions.push({
          id_type: findTransactionTypeByKey('commission').id,
          id_user: affiliate.id_user,
          user_gross_amount: affiliateAmount,
          user_net_amount: affiliateAmount,
          id_status,
          psp_id: transaction.psp_id,
          release_date: releaseDateAffiliate,
          uuid: uuid.v4(),
          id_role: findRoleTypeByKey('affiliate').id,
          method: sale_item.payment_method,
          card_brand: transaction.card_brand,
          subscription_fee: transaction.subscription_fee,
        });
      }
    }

    let amountSale = split_price + subscription_fee;
    amountSale -= total_affiliate_amount;
    const tax = transaction.user_gross_amount - transaction.user_net_amount;
    amountSale -= tax;
    const coproductions = await Coproductions.findAll({
      raw: true,
      attributes: ['commission_percentage', 'id_user'],
      where: {
        status: 2,
        id_product: sale_item.id_product,
      },
    });
    let salesSettings = [];
    const saleSetting = await Sales_settings.findOne({
      raw: true,
      where: {
        id_user,
      },
      attributes: ['release_pix', 'release_credit_card', 'release_billet', 'id_user'],
    });
    salesSettings.push(saleSetting);
    if (coproductions.length > 0) {
      const coproducerSettings = await Sales_settings.findAll({
        raw: true,
        attributes: ['release_pix', 'release_credit_card', 'release_billet', 'id_user'],
        where: {
          id_user: coproductions.map((c) => c.id_user),
        },
      });
      salesSettings.push(...coproducerSettings);
    }
    let totalCoproductionCommission = 0;
    for (const coproduction of coproductions) {
      const coproducerAmount =
        (amountSale - (shipping_type === 3 ? shipping_price : 0)) *
        (coproduction.commission_percentage / 100);
      totalCoproductionCommission += coproducerAmount;
      const releaseDateCoproducer = resolveReleaseDate({
        paid_at: sale_item.paid_at,
        payment_method: sale_item.payment_method,
        saleSettings: salesSettings.find((s) => s.id_user === coproduction.id_user),
        status: transaction.id_status,
      });

      transactions.push({
        id_type: findTransactionTypeByKey('commission').id,
        id_user: coproduction.id_user,
        user_gross_amount: coproducerAmount,
        user_net_amount: coproducerAmount,
        id_status,
        psp_id: transaction.psp_id,
        release_date: releaseDateCoproducer,
        uuid: uuid.v4(),
        id_role: findRoleTypeByKey('coproducer').id,
        method: sale_item.payment_method,
        card_brand: transaction.card_brand,
        subscription_fee: transaction.subscription_fee,
      });
    }
    const releaseDateProducer = resolveReleaseDate({
      paid_at: sale_item.paid_at,
      payment_method: sale_item.payment_method,
      saleSettings: salesSettings.find((c) => c.id_user === id_user),
      status: transaction.id_status,
    });

    const amountProducer = amountSale - totalCoproductionCommission;
    console.log('resto producer -> ', amountProducer);
    transactions.push({
      id_type: findTransactionTypeByKey('commission').id,
      id_user,
      user_gross_amount: amountProducer,
      user_net_amount: amountProducer,
      id_status,
      psp_id: transaction.psp_id,
      release_date: releaseDateProducer,
      uuid: uuid.v4(),
      id_role: findRoleTypeByKey('producer').id,
      method: sale_item.payment_method,
      card_brand: transaction.card_brand,
      subscription_fee: transaction.subscription_fee,
    });

    return transactions;
  }
}
