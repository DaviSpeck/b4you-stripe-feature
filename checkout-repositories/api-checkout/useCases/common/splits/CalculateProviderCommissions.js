const _ = require('lodash');
const { findRoleTypeByKey } = require('../../../types/roles');
const Managers = require('../../../database/models/Managers');
const Suppliers = require('../../../database/models/Suppliers');
const Coproductions = require('../../../database/models/Coproductions');

const resolveStatus = (status) => {
  if (status === 2) return 2;
  return 1;
};

const formatNumber = (value) => Math.round(value * 100) / 100;

const calculateSupplierAmount = ({
  supplier,
  amountProducer,
  totalSuppliers,
  shipping_price,
}) => {
  let supplierAmount = 0;
  if (supplier.receives_shipping_amount) {
    supplierAmount += shipping_price;
  }
  if (totalSuppliers >= amountProducer) {
    const e = amountProducer / totalSuppliers;
    supplierAmount += e * supplier.amount;
  } else {
    supplierAmount += supplier.amount;
  }
  return supplierAmount;
};

module.exports = class CommissionsProvider {
  static async calculate({
    sale_item,
    shipping_type,
    affiliate,
    first_charge = true,
  }) {
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
            id_role: findRoleTypeByKey('affiliate').id,
            id_sale_item: sale_item.id,
            id_product: sale_item.product.id,
          });

          transactions.push({
            id_user: sale_item.product.id_user,
            amount: amountProducer,
            id_status,
            id_role: findRoleTypeByKey('producer').id,
            id_sale_item: sale_item.id,
            id_product: sale_item.product.id,
          });

          return transactions.map((t) => ({
            ...t,
            amount: formatNumber(t.amount),
          }));
        }

        transactions.push({
          id_user: affiliate.id_user,
          amount: affiliateAmount + total_affiliate_amount_shipping,
          id_status,
          id_role: findRoleTypeByKey('affiliate').id,
          id_sale_item: sale_item.id,
          id_product: sale_item.product.id,
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
          id_role: findRoleTypeByKey('affiliate').id,
          id_sale_item: sale_item.id,
          id_product: sale_item.product.id,
        });
      }
    }

    let amountSale = split_price + subscription_fee;
    amountSale -= total_affiliate_amount;
    amountSale -= sale_item.fee_total;
    if (split_price === 0) {
      amountSale = 0;
    }
    const coproductions = await Coproductions.findAll({
      raw: true,
      where: { id_product: sale_item.product.id, status: 2 },
      attributes: ['commission_percentage', 'id_user'],
    });
    if (amountSale > 0) {
      for (const coproduction of coproductions) {
        const coproducerAmount =
          (amountSale -
            shipping_price +
            (+shipping_type === 2 ? shipping_price : 0)) *
          (coproduction.commission_percentage / 100);
        totalCoproductionCommission.push(coproducerAmount);

        transactions.push({
          id_user: coproduction.id_user,
          amount: coproducerAmount,
          id_status,
          id_role: findRoleTypeByKey('coproducer').id,
          id_sale_item: sale_item.id,
          id_product: sale_item.product.id,
        });
      }
    }

    let amountProducer =
      amountSale -
      total_affiliate_amount_shipping -
      _.sum(totalCoproductionCommission);
    if (split_price === 0) {
      amountProducer =
        subscription_fee +
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
      const total_producer = amountProducer;
      for (const s of suppliers) {
        const amount = calculateSupplierAmount({
          supplier: s,
          amountProducer: total_producer,
          totalSuppliers,
          shipping_price,
        });
        transactions.push({
          id_user: s.id_user,
          amount,
          id_status,
          id_role: findRoleTypeByKey('supplier').id,
          id_sale_item: sale_item.id,
          id_product: sale_item.product.id,
        });
        amountProducer -= amount;
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
      transactions.push({
        id_user: affiliateManager.id_user,
        amount,
        id_status,
        id_role: findRoleTypeByKey('manager').id,
        id_sale_item: sale_item.id,
        id_product: sale_item.product.id,
      });
    }

    transactions.push({
      id_user: sale_item.product.id_user,
      amount: amountProducer,
      id_status,
      id_role: findRoleTypeByKey('producer').id,
      id_sale_item: sale_item.id,
      id_product: sale_item.product.id,
    });

    return transactions.map((t) => ({
      ...t,
      amount: formatNumber(t.amount),
    }));
  }
};
