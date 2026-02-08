const _ = require('lodash');
const date = require('../../../utils/helpers/date');
const { findRoleTypeByKey } = require('../../../types/roles');
const Affiliates = require('../../../database/models/Affiliates');
const Managers = require('../../../database/models/Managers');
const Sales_items = require('../../../database/models/Sales_items');

const Suppliers = require('../../../database/models/Suppliers');
const Sales_settings = require('../../../database/models/Sales_settings');

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
  if (status !== 2) return null;
  return date(paid_at).add(saleSettings[payment_methods[payment_method]], 'd');
};

const resolveStatus = (status) => {
  if (status === 2) return 2;
  return 1;
};

module.exports = class CalculateCommissions {
  static async execute({ sale_item, first_charge, affiliate, shipping_type }) {
    const transactions = [];
    const totalCoproductionCommission = [];
    let { split_price } = sale_item;
    const { subscription_fee, shipping_price, id_offer } = sale_item;
    const id_status = resolveStatus(sale_item.id_status);
    if (split_price > 0 && subscription_fee > 0) {
      split_price -= subscription_fee;
    }
    let total_affiliate_amount = 0;
    let total_affiliate_amount_shipping = 0;
    let affiliate_commission = 0;
    if (affiliate) {
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
          },
        );
      }
    }
    let affiliateManager = null;
    if (affiliate) {
      affiliate_commission = affiliate.commission;
      const offer = await Managers.sequelize.query(
        'select toggle_commission, affiliate_commission from product_offer where id = :id_offer',
        {
          replacements: {
            id_offer: sale_item.id_offer,
          },
          plain: true,
        },
      );
      if (offer) {
        if (offer.toggle_commission) {
          affiliate_commission = offer.affiliate_commission;
        }
      }
      if (affiliate.id_manager) {
        affiliateManager = await Managers.findOne({
          raw: true,
          where: { id: affiliate.id_manager, id_status: 2 },
        });
      }
      const releaseDateAffiliate = resolveReleaseDate({
        paid_at: sale_item.paid_at,
        payment_method: sale_item.payment_method,
        saleSettings: affiliate.user.user_sale_settings,
        status: sale_item.id_status,
      });

      if (
        (split_price > 0 || (+shipping_type === 1 && shipping_price > 0)) &&
        !affiliate.subscription_fee_only &&
        (first_charge || affiliate.commission_all_charges)
      ) {
        let affiliateAmount =
          split_price > 0
            ? (split_price - shipping_price) * (affiliate_commission / 100)
            : 0;
        total_affiliate_amount_shipping +=
          (+shipping_type === 1 ? shipping_price : 0) *
          (affiliate_commission / 100);
        total_affiliate_amount += affiliateAmount;
        if (
          affiliateAmount + total_affiliate_amount_shipping >
          split_price +
            (+shipping_type === 1 ? shipping_price : 0) -
            sale_item.fee_total
        ) {
          const amountProducer = 0.01;
          affiliateAmount += total_affiliate_amount_shipping;
          affiliateAmount -= amountProducer;
          affiliateAmount -= sale_item.fee_total;
          transactions.push({
            id_user: affiliate.id_user,
            amount: affiliateAmount,
            id_status,
            release_date: releaseDateAffiliate,
            id_role: findRoleTypeByKey('affiliate').id,
            id_sale_item: sale_item.id,
            id_product: sale_item.id_product,
          });

          const releaseDateProducer = resolveReleaseDate({
            paid_at: sale_item.paid_at,
            payment_method: sale_item.payment_method,
            saleSettings: sale_item.product.producer.user_sale_settings,
            status: sale_item.id_status,
          });

          transactions.push({
            id_user: sale_item.product.id_user,
            amount: amountProducer,
            id_status,
            release_date: releaseDateProducer,
            id_role: findRoleTypeByKey('producer').id,
            id_sale_item: sale_item.id,
            id_product: sale_item.id_product,
          });

          return transactions;
        }

        transactions.push({
          id_user: affiliate.id_user,
          amount: affiliateAmount + total_affiliate_amount_shipping,
          id_status,
          release_date: releaseDateAffiliate,
          id_role: findRoleTypeByKey('affiliate').id,
          id_sale_item: sale_item.id,
          id_product: sale_item.id_product,
        });
      }

      if (subscription_fee && affiliate.subscription_fee) {
        const affiliateAmount =
          subscription_fee * (affiliate.subscription_fee_commission / 100);
        total_affiliate_amount += affiliateAmount;

        transactions.push({
          id_user: affiliate.id_user,
          amount: affiliateAmount,
          id_status,
          release_date: releaseDateAffiliate,
          id_role: findRoleTypeByKey('affiliate').id,
          id_sale_item: sale_item.id,
          id_product: sale_item.id_product,
        });
      }
    }

    let amountSale = split_price + subscription_fee;
    amountSale -= total_affiliate_amount;
    amountSale -= sale_item.fee_total;
    if (split_price === 0) {
      amountSale = 0;
    }
    if (amountSale > 0) {
      for (const coproduction of sale_item.product.coproductions) {
        const coproducerAmount =
          (amountSale -
            shipping_price +
            (+shipping_type === 2 ? shipping_price : 0)) *
          (coproduction.commission_percentage / 100);
        totalCoproductionCommission.push(coproducerAmount);
        const releaseDateCoproducer = resolveReleaseDate({
          paid_at: sale_item.paid_at,
          payment_method: sale_item.payment_method,
          saleSettings: coproduction.user.user_sale_settings,
          status: sale_item.id_status,
        });

        transactions.push({
          id_user: coproduction.user.id,
          amount: coproducerAmount,
          id_status,
          release_date: releaseDateCoproducer,
          id_role: findRoleTypeByKey('coproducer').id,
          id_sale_item: sale_item.id,
          id_product: sale_item.id_product,
        });
      }
    }
    const releaseDateProducer = resolveReleaseDate({
      paid_at: sale_item.paid_at,
      payment_method: sale_item.payment_method,
      saleSettings: sale_item.product.producer.user_sale_settings,
      status: sale_item.id_status,
    });

    console.log(releaseDateProducer);

    let amountProducer =
      amountSale -
      total_affiliate_amount_shipping -
      _.sum(totalCoproductionCommission);
    if (split_price === 0) {
      amountProducer =
        shipping_price -
        total_affiliate_amount -
        total_affiliate_amount_shipping -
        sale_item.fee_total -
        _.sum(totalCoproductionCommission);
    }

    const suppliers = await Suppliers.findAll({
      raw: true,
      where: { id_offer, id_status: 2 },
    });
    if (suppliers.length > 0) {
      const totalSuppliers = suppliers.reduce((acc, s) => {
        acc += s.amount;
        return acc;
      }, 0);
      const minProducer = 0.01;
      amountProducer -= minProducer;
      if (totalSuppliers >= amountProducer) {
        const e = amountProducer / totalSuppliers;
        for (const s of suppliers) {
          // eslint-disable-next-line
          const saleSettings = await Sales_settings.findOne({
            raw: true,
            where: { id_user: s.id_user },
          });
          const releaseDate = resolveReleaseDate({
            paid_at: sale_item.paid_at,
            payment_method: sale_item.payment_method,
            saleSettings,
            status: sale_item.id_status,
          });
          const amount = e * s.amount;
          transactions.push({
            id_user: s.id_user,
            amount,
            id_status,
            release_date: releaseDate,
            id_role: findRoleTypeByKey('supplier').id,
            id_sale_item: sale_item.id,
            id_product: sale_item.id_product,
          });
          amountProducer -= amount;
        }
      } else {
        for (const s of suppliers) {
          // eslint-disable-next-line
          const saleSettings = await Sales_settings.findOne({
            raw: true,
            where: { id_user: s.id_user },
          });
          const releaseDate = resolveReleaseDate({
            paid_at: sale_item.paid_at,
            payment_method: sale_item.payment_method,
            saleSettings,
            status: sale_item.id_status,
          });

          transactions.push({
            id_user: s.id_user,
            amount: s.amount,
            id_status,
            release_date: releaseDate,
            id_role: findRoleTypeByKey('supplier').id,
            id_sale_item: sale_item.id,
            id_product: sale_item.id_product,
          });
        }
        amountProducer -= totalSuppliers;
      }
      amountProducer += minProducer;
    }

    if (affiliateManager) {
      amountSale -= shipping_price;
      const minProducer = 0.01;
      amountProducer -= minProducer;
      const totalManager =
        affiliateManager.commission_type === 'percentage'
          ? amountSale * (affiliateManager.commission_with_affiliate / 100)
          : affiliateManager.commission_with_affiliate;
      let amount = totalManager;
      if (totalManager > amountProducer) {
        amount = amountProducer;
      }
      amountProducer -= amount;
      const saleSettings = await Sales_settings.findOne({
        raw: true,
        where: { id_user: affiliateManager.id_user },
      });
      const releaseDate = resolveReleaseDate({
        paid_at: sale_item.paid_at,
        payment_method: sale_item.payment_method,
        saleSettings,
        status: sale_item.id_status,
      });
      transactions.push({
        id_user: affiliateManager.id_user,
        amount,
        id_status,
        release_date: releaseDate,
        id_role: findRoleTypeByKey('manager').id,
        id_sale_item: sale_item.id,
        id_product: sale_item.id_product,
      });
    }

    console.log('resto producer -> ', amountProducer);

    transactions.push({
      id_user: sale_item.product.id_user,
      amount: amountProducer,
      id_status,
      release_date: releaseDateProducer,
      id_role: findRoleTypeByKey('producer').id,
      id_sale_item: sale_item.id,
      id_product: sale_item.id_product,
    });

    return transactions;
  }
};
