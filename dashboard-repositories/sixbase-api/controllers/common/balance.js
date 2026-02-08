const { Op } = require('sequelize');
const date = require('../../utils/helpers/date');
const WithheldBalance = require('../../useCases/dashboard/withdrawals/WithheldBalance');
const ApiError = require('../../error/ApiError');
const SerializeBankAccount = require('../../presentation/dashboard/bankAccount');
const { findUserByID } = require('../../database/controllers/users');
const {
  findWithdrawalSettings,
} = require('../../database/controllers/withdrawals_settings');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const MaxWithdrawalAmount = require('../../useCases/dashboard/withdrawals/MaxWithdrawalAmount');
const Transactions = require('../../database/models/Transactions');
const Commissions = require('../../database/models/Commissions');
const User_activity = require('../../database/models/User_activity');
const CommissionsRepository = require('../../repositories/sequelize/CommissionsRepository');
const ReferralBalance = require('../../database/models/ReferralBalance');
const { DATABASE_DATE } = require('../../types/dateTypes');

const findUserBalanceController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const promises = [];

  try {
    promises.push(findUserByID(id_user));
    promises.push(
      findWithdrawalSettings({
        id_user,
      }),
    );

    promises.push(
      Commissions.sum('amount', {
        where: { id_user, id_status: 3 },
      }),
    );
    promises.push(
      Commissions.sum('amount', {
        where: { id_user, id_status: 2 },
      }),
    );

    promises.push(
      Transactions.sum('withdrawal_total', {
        where: {
          id_user,
          id_type: findTransactionTypeByKey('withdrawal').id,
          id_status: [
            findTransactionStatusByKey('paid').id,
            findTransactionStatusByKey('pending').id,
          ],
        },
      }),
    );

    promises.push(
      ReferralBalance.findOne({
        raw: true,
        where: { id_user },
        attributes: ['total'],
      }),
    );

    promises.push(
      User_activity.sum('amount', {
        where: { id_user },
      }),
    );

    promises.push(
      Transactions.sum('withdrawal_total', {
        where: {
          id_user,
          id_type: findTransactionTypeByKey('withdrawal').id,
          id_status: [
            findTransactionStatusByKey('paid').id,
            findTransactionStatusByKey('pending').id,
          ],
          created_at: {
            [Op.gt]: date()
              .startOfMonth()
              .add(3, 'hours')
              .format(DATABASE_DATE),
          },
        },
      }),
    );

    promises.push(
      Transactions.sum('withdrawal_total', {
        where: {
          id_user,
          id_type: findTransactionTypeByKey('withdrawal').id,
          id_status: [
            findTransactionStatusByKey('paid').id,
            findTransactionStatusByKey('pending').id,
          ],
        },
      }),
    );

    const [
      user,
      withdrawalSettings,
      balance,
      pendingCommissions,
      confirmedWithdrawalsAmount,
      referralBalance,
      userActivity,
      monthWithdrawals,
      total_withdrawal,
    ] = await Promise.all(promises);

    const calculatedWithheldBalance = await new WithheldBalance(
      CommissionsRepository,
    ).calculate(
      id_user,
      withdrawalSettings.withheld_balance_percentage,
      withdrawalSettings.use_highest_sale,
    );

    const cost = withdrawalSettings.fee_fixed;

    const available_balance =
      (balance ?? 0) +
      (referralBalance ? referralBalance.total : 0) -
      confirmedWithdrawalsAmount +
      (userActivity ?? 0);

    const withheld_balance = Math.min(
      calculatedWithheldBalance ?? 0,
      Math.max(available_balance, 0),
    );

    const onlyHasPending = !available_balance;

    return res.status(200).send({
      available_balance,
      referral_balance: referralBalance ? referralBalance.total : 0,
      // remover após deploy
      blocked_balance: onlyHasPending
        ? pendingCommissions ?? 0
        : (pendingCommissions ?? 0) + (withheld_balance ?? 0),
      pending_balance: onlyHasPending
        ? pendingCommissions ?? 0
        : (pendingCommissions ?? 0) + (withheld_balance ?? 0),
      bank_account: new SerializeBankAccount(user).adapt(),
      withdrawal_settings: {
        cost,
        max_monthly_amount: withdrawalSettings.max_amount,
        min_amount_per_request: withdrawalSettings.min_amount,
        available_amount: withdrawalSettings.max_amount - monthWithdrawals,
      },
      withheld_balance,
      max_withdrawal_amount: new MaxWithdrawalAmount({
        available_amount: available_balance,
        confirmed_amount: monthWithdrawals,
        cost,
        is_company: user.verified_company,
        max_monthly_amount: withdrawalSettings.max_amount,
        withheld_balance,
      }).calculate(),
      blocked: !!withdrawalSettings.blocked,
      total_withdrawal: total_withdrawal ?? 0,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  findUserBalanceController,
};
