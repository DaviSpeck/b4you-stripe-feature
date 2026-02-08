const ApiError = require('../../error/ApiError');
const WithheldBalance = require('./WithheldBalance');
const MaxWithdrawalAmount = require('./MaxWithdrawalAmount');
const Transactions = require('../../database/models/Transactions');
const ReferralBalance = require('../../database/models/ReferralBalance');
const Commissions = require('../../database/models/Commissions');

module.exports = class FindUserBalances {
  constructor({
    UsersRepository,
    BalanceRepository,
    TransactionsRepository,
    WithdrawalsSettingsRepository,
    UsersRevenueRepository,
    CommissionsRepository,
  }) {
    this.UsersRepository = UsersRepository;
    this.BalanceRepository = BalanceRepository;
    this.TransactionsRepository = TransactionsRepository;
    this.WithdrawalsSettingsRepository = WithdrawalsSettingsRepository;
    this.UsersRevenueRepository = UsersRevenueRepository;
    this.CommissionsRepository = CommissionsRepository;
  }

  async execute({ user_uuid }) {
    const user = await this.UsersRepository.findByUUID(user_uuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    const promises = [];
    const balance_promise = Commissions.sequelize.query(
      'select UserBalance(:id_user) as total',
      {
        replacements: {
          id_user: user.id,
        },
        plain: true,
      },
    );
    promises.push(balance_promise);
    const blocked_balance_promise = this.CommissionsRepository.findWaiting(
      user.id,
    );
    promises.push(blocked_balance_promise);
    const withdrawal_settings = await this.WithdrawalsSettingsRepository.find({
      id_user: user.id,
    });
    const future_releases_promise =
      await this.CommissionsRepository.findFutureReleases(user.id);
    promises.push(future_releases_promise);
    const withheld_balance_promise = new WithheldBalance(
      this.CommissionsRepository,
    ).calculate(
      user.id,
      withdrawal_settings.withheld_balance_percentage,
      withdrawal_settings.use_highest_sale,
    );
    promises.push(withheld_balance_promise);
    const confirmed_withdrawals_promise =
      this.TransactionsRepository.findConfirmedWithdrawals(user.id);
    promises.push(confirmed_withdrawals_promise);
    promises.push(
      Transactions.sum('withdrawal_total', {
        where: {
          id_type: 1,
          id_status: [1, 2],
          id_user: user.id,
        },
      }),
    );
    promises.push(
      ReferralBalance.findOne({
        raw: true,
        where: {
          id_user: user.id,
        },
        attributes: ['total'],
      }),
    );

    const [
      available_balance,
      blocked_balance,
      future_releases,
      withheld_balance,
      confirmed_amount,
      total_withdrawal,
      referralBalance,
    ] = await Promise.all(promises);
    const pending_balance = Array.isArray(future_releases)
      ? future_releases.reduce(
          (acc, item) => acc + (Number(item.amount) || 0),
          0,
        )
      : 0;
    const cost = withdrawal_settings.fee_fixed;
    const data = {
      available_balance: available_balance.total,
      referral_balance: referralBalance ? referralBalance.total : 0,
      total_withdrawal,
      blocked_balance,
      pending_balance,
      withdrawal_blocked: withdrawal_settings.blocked,
      withheld_balance,
      max_withdrawal_amount: new MaxWithdrawalAmount({
        available_amount: available_balance.total,
        confirmed_amount,
        cost,
        is_company: user.verified_company,
        max_monthly_amount: withdrawal_settings.max_amount,
        withheld_balance,
      }).calculate(),
      future_releases,
    };
    return data;
  }
};
