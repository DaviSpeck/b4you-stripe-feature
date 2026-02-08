const _ = require('lodash');
const { Op, Sequelize } = require('sequelize');
const CostCentralRepository = require('../repositories/sequelize/CostCentralRepository');
const date = require('../utils/helpers/date');
const ApiError = require('../error/ApiError');
const Transactions = require('../database/models/Transactions');
const Balances = require('../database/models/Balances');
const Sales_items = require('../database/models/Sales_items');
const Charges = require('../database/models/Charges');
const Commissions = require('../database/models/Commissions');
const UserActivity = require('../database/models/UserActivity');

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);

module.exports = class ReportsController {
  static async getCombinedSalesData(startAt, endExclusiveAt) {
    try {
      const salesData = await Sales_items.findAll({
        raw: true,
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('price_total')), 'total_income'],
          [
            Sequelize.fn('SUM', Sequelize.col('fee_variable_amount')),
            'total_variable_fee',
          ],
          [Sequelize.fn('SUM', Sequelize.col('fee_fixed')), 'total_fixed_fee'],
          [
            Sequelize.fn('SUM', Sequelize.col('interest_installment_amount')),
            'total_interest',
          ],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_count'],
        ],
        where: {
          id_status: 2,
          created_at: {
            [Op.gte]: startAt,
            [Op.lt]: endExclusiveAt,
          },
        },
      });

      return (
        salesData[0] || {
          total_income: 0,
          total_variable_fee: 0,
          total_fixed_fee: 0,
          total_interest: 0,
          total_count: 0,
        }
      );
    } catch (error) {
      return {
        total_income: 0,
        total_variable_fee: 0,
        total_fixed_fee: 0,
        total_interest: 0,
        total_count: 0,
      };
    }
  }
  static async changeCardCost(req, res, next) {
    const {
      body: { percentage, installments },
    } = req;
    try {
      await CostCentralRepository.update(
        { method: 'CARD', installments },
        { psp_variable_cost: parseFloat(percentage) },
      );
      return res.sendStatus(200);
    } catch (error) {
      return next(
        ApiError.internalservererror(
          `Internal Server Error, ${Object.keys(
            req.route.methods,
          )[0].toUpperCase()}: ${req.originalUrl}`,
          error,
        ),
      );
    }
  }

  static async getCosts(req, res, next) {
    try {
      const costs = await CostCentralRepository.findAll();
      const cardCosts = costs.filter((c) => c.method === 'CARD');
      const brandGroupedCosts = _.groupBy(cardCosts, 'brand');
      const card = {};
      Object.keys(brandGroupedCosts).forEach((brand) => {
        card[brand] = brandGroupedCosts[brand].map((b) => ({
          variable: b.psp_variable_cost,
          fixed: b.psp_fixed_cost,
          installment: b.installments,
        }));
      });
      const pixCost = costs.find((c) => c.method === 'PIX');
      const billetCost = costs.find((c) => c.method === 'BILLET');
      const withdrawal = costs.find((c) => c.method === 'WITHDRAWAL_PIX');
      const refunds = costs.filter((c) => c.method.includes('REFUND'));
      const refundPix = refunds.find((c) => c.method === 'REFUND_PIX');
      const refundBillet = refunds.find((c) => c.method === 'REFUND_BILLET');
      const refundCard = refunds.find((c) => c.method === 'REFUND_CARD');

      return res.json({
        sales: {
          pix: {
            variable: pixCost.psp_variable_cost,
            fixed: pixCost.psp_fixed_cost,
          },
          billet: {
            variable: billetCost.psp_variable_cost,
            fixed: billetCost.psp_fixed_cost,
          },

          card,
        },
        withdrawals: {
          variable: withdrawal.psp_variable_cost,
          fixed: withdrawal.psp_fixed_cost,
        },
        refunds: {
          pix: {
            variable: refundPix.psp_variable_cost,
            fixed: refundPix.psp_fixed_cost,
          },
          billet: {
            variable: refundBillet.psp_variable_cost,
            fixed: refundBillet.psp_fixed_cost,
          },
          card: {
            variable: refundCard.psp_variable_cost,
            fixed: refundCard.psp_fixed_cost,
          },
        },
      });
    } catch (error) {
      if (error instanceof ApiError) return res.status(error.code).send(error);
      return next(
        ApiError.internalservererror(
          `Internal Server Error, ${Object.keys(
            req.route.methods,
          )[0].toUpperCase()}: ${req.originalUrl}`,
          error,
        ),
      );
    }
  }

  static async getMetrics(req, res, next) {
    const {
      query: {
        start_date = date('2022-01-01').utc().startOf('day'),
        end_date = date().endOf('day'),
      },
    } = req;

    const startDate = date(start_date).startOf('day').utc();
    const endDate = date(end_date).endOf('day').utc();

    const startTime = Date.now();

    const promises = [];
    try {
      const sales_income_promise = Sales_items.sum('price_total', {
        where: {
          id_status: 2,
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(sales_income_promise);

      const withdrawal_gross_profit_promise = Transactions.sum('revenue', {
        where: {
          id_type: 1,
          id_status: 2,
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(withdrawal_gross_profit_promise);

      const withdrawal_net_profit_promise = Transactions.sum(
        'company_gross_profit_amount',
        {
          where: {
            id_type: 1,
            id_status: 2,
            created_at: { [Op.between]: [startDate, endDate] },
          },
        },
      );
      promises.push(withdrawal_net_profit_promise);

      const installments_group_promise = await Charges.findAll({
        raw: true,
        attributes: [
          'installments',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('SUM', Sequelize.col('price')), 'total'],
        ],
        group: [['installments', 'desc']],
        where: {
          id_status: 2,
          payment_method: 'credit_card',
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(installments_group_promise);

      const sales_variable_gross_promise = Sales_items.sum(
        'fee_variable_amount',
        {
          where: {
            id_status: 2,
            created_at: { [Op.between]: [startDate, endDate] },
          },
        },
      );
      promises.push(sales_variable_gross_promise);

      const sales_fixed_gross_promise = Sales_items.sum('fee_fixed', {
        where: {
          id_status: 2,
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(sales_fixed_gross_promise);

      const cost_total_promise = Charges.sum('psp_cost_total', {
        where: {
          id_status: 2,
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(cost_total_promise);

      const withdrawal_cost_promise = Transactions.sum('psp_cost_total', {
        where: {
          id_type: 1,
          id_status: 2,
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(withdrawal_cost_promise);

      const balance_total_negative_promise = Balances.sum('amount', {
        where: { amount: { [Op.lt]: 0 } },
      });
      promises.push(balance_total_negative_promise);

      const sales_costs_method_promise = await Charges.findAll({
        raw: true,
        attributes: [
          'payment_method',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('SUM', Sequelize.col('psp_cost_total')), 'total'],
        ],
        group: [['payment_method', 'desc']],
        where: {
          id_status: 2,
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(sales_costs_method_promise);

      // Count será derivado do agrupamento de parcelas

      const interest_installment_amount_promise = Sales_items.sum(
        'interest_installment_amount',
        {
          where: {
            id_status: 2,
            payment_method: 'card',
            created_at: { [Op.between]: [startDate, endDate] },
          },
        },
      );
      promises.push(interest_installment_amount_promise);

      const card_cost_total_promise = Charges.sum('psp_cost_total', {
        where: {
          id_status: 2,
          payment_method: 'card',
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(card_cost_total_promise);

      const pending_total_promise = Commissions.sum('amount', {
        where: { id_status: 2 },
      });
      promises.push(pending_total_promise);

      const pending_withdrawals_promise = Transactions.sum(
        'withdrawal_amount',
        {
          logging: false,
          where: { id_type: 1, id_status: 1 },
        },
      );
      promises.push(pending_withdrawals_promise);

      const withdrawal_amount_promise = Transactions.sum('withdrawal_amount', {
        where: {
          id_type: 1,
          id_status: 2,
          created_at: { [Op.between]: [startDate, endDate] },
        },
      });
      promises.push(withdrawal_amount_promise);

      const total_commissions_promise = Commissions.sum('amount', {
        where: { id_status: 3 },
      });
      promises.push(total_commissions_promise);

      const total_withdrawals_paid_promise = Transactions.sum(
        'withdrawal_amount',
        {
          where: { id_type: 1, id_status: [1, 2] },
        },
      );
      promises.push(total_withdrawals_paid_promise);

      const user_activity_promise = UserActivity.sum('amount');
      promises.push(user_activity_promise);

      const [
        sales_income,
        withdrawal_gross_profit,
        withdrawal_net_profit,
        installments_group,
        gross_percentage,
        gross_fixed,
        cost_total,
        withdrawal_cost,
        balance_total_negative,
        sales_cost_by_method,
        interest_installment_amount,
        card_cost_total,
        pending_total,
        pending_withdrawals,
        withdrawal_amount,
        total_commissions_paid,
        total_withdrawals_paid,
        user_activity,
      ] = await Promise.all(promises);

      const count_total_sales_card = installments_group.reduce(
        (acc, { count }) => acc + count,
        0,
      );

      const methods = { card: 'Cartão', pix: 'Pix', billet: 'Boleto' };

      const result = {
        balance_total:
          total_commissions_paid - total_withdrawals_paid + user_activity,
        pending_total,
        balance_total_negative,
        pending_withdrawals,
        sales: {
          income: sales_income,
          gross_profit:
            gross_fixed + gross_percentage + interest_installment_amount,
          net_profit:
            gross_fixed +
            gross_percentage +
            interest_installment_amount -
            cost_total,
          installment_amount: interest_installment_amount - card_cost_total,
          gross_percentage,
          gross_fixed,
          cost_total,
          count: sales_cost_by_method.reduce(
            (acc, value) => acc + value.count,
            0,
          ),
          sales_cost_by_method: sales_cost_by_method.map((s) => ({
            ...s,
            method: methods[s.method],
          })),
          card: {
            count: count_total_sales_card,
            installments: installments_group
              .map((installment) => ({
                ...installment,
                percentage: (installment.count / count_total_sales_card) * 100,
              }))
              .sort((a, b) => a.installments - b.installments),
          },
        },
        withdrawals: {
          gross_profit: withdrawal_gross_profit,
          net_profit: withdrawal_net_profit,
          cost_total: withdrawal_cost,
          count: withdrawal_cost * 2,
          withdrawal_amount,
        },
      };

      const endTime = Date.now();

      return res.json(result);
    } catch (error) {
      if (error instanceof ApiError) return res.status(error.code).send(error);
      return next(
        ApiError.internalservererror(
          `Internal Server Error, ${Object.keys(
            req.route.methods,
          )[0].toUpperCase()}: ${req.originalUrl}`,
          error.message,
        ),
      );
    }
  }
};
