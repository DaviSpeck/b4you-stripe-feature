const { Op } = require('sequelize');
const WithheldBalance = require('./WithheldBalance');
const CalculateWithdrawalFeesAndAmounts = require('../fees/CalculateWithdrawalsFeesAndAmounts');
const ApiError = require('../../../error/ApiError');
const dateHelper = require('../../../utils/helpers/date');
const { findUserByID } = require('../../../database/controllers/users');
const {
  findWithdrawalSettings,
} = require('../../../database/controllers/withdrawals_settings');
const { findTransactionTypeByKey } = require('../../../types/transactionTypes');
const {
  findTransactionStatusByKey,
} = require('../../../status/transactionStatus');
const { findWithdrawalType } = require('../../../types/withdrawals');
const { findDocumentsStatusByKey } = require('../../../status/documentsStatus');
const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const SQS = require('../../../queues/aws');
const Transactions = require('../../../database/models/Transactions');
const CommissionsRepository = require('../../../repositories/sequelize/CommissionsRepository');

function toCents(aValue) {
  return Math.round((Math.abs(aValue) / 100) * 10000);
}

const userDoesntHaveBalance = (grossAmount, totalBalance, withheld_balance) => {
  const grossAmountCents = toCents(grossAmount);
  const totalBalanceToCents = toCents(totalBalance);
  const withheldBalanceToCents = toCents(withheld_balance);

  return grossAmountCents > totalBalanceToCents - withheldBalanceToCents;
};

const withdrawalIsBlocked = ({ blocked }) => blocked;

const exceedMaxMonthAmount = (
  confirmedWithdrawalsAmount,
  requestedAmount,
  { max_amount },
) => confirmedWithdrawalsAmount + requestedAmount > max_amount;

const isNotVerified = ({ verified_id }) => !verified_id;

const isNotCompany = ({ is_company, verified_company, status_cnpj }) =>
  !is_company &&
  !verified_company &&
  status_cnpj !== findDocumentsStatusByKey('success').id;

const amountLessThanLimit = (amount, limit) => amount < limit;

module.exports = class CreateWithdrawal {
  constructor({ amount, id_user }) {
    this.id_user = id_user;
    this.amount = amount;
  }

  async execute() {
    const user = await findUserByID(this.id_user);

    if (isNotVerified(user))
      throw ApiError.badRequest(
        'Você deve realizar a verificação de conta para poder sacar',
      );
    if (!user.bank_code || !user.account_number || !user.agency) {
      throw ApiError.badRequest(
        'É necessário ter uma conta bancária cadastrada em seu perfil B4you para solicitar um saque',
      );
    }

    const withdrawalSettings = await findWithdrawalSettings({
      id_user: this.id_user,
    });

    if (withdrawalSettings.lock_pending) {
      const pendingWithdrawals = await Transactions.sum('withdrawal_amount', {
        where: {
          id_user: this.id_user,
          id_type: findTransactionTypeByKey('withdrawal').id,
          id_status: findTransactionStatusByKey('pending').id,
        },
      });
      if (pendingWithdrawals > 0)
        throw ApiError.badRequest(
          'Você já tem um saque pendente, aguardando processamento',
        );
    }

    if (amountLessThanLimit(this.amount, withdrawalSettings.min_amount))
      throw ApiError.badRequest(
        `Pedido mínimo de R$ ${withdrawalSettings.min_amount}`,
      );
    if (withdrawalIsBlocked(withdrawalSettings))
      throw ApiError.badRequest(
        'Você está bloqueado para pedir saques, entre em contato com o suporte',
      );

    if (isNotCompany(user)) {
      const confirmedWithdrawalsOnMonth = await Transactions.sum(
        'withdrawal_amount',
        {
          where: {
            id_user: this.id_user,
            id_type: findTransactionTypeByKey('withdrawal').id,
            id_status: findTransactionStatusByKey('paid').id,
            created_at: {
              [Op.gt]: dateHelper().startOfMonth().format('YYYY-MM-DD'),
            },
          },
        },
      );
      if (
        exceedMaxMonthAmount(
          confirmedWithdrawalsOnMonth,
          this.amount,
          withdrawalSettings,
        )
      )
        throw ApiError.badRequest(
          'Você atingiu seu limite de saques, fale com o suporte',
        );
    }

    const feesAndAmountsTransaction =
      await new CalculateWithdrawalFeesAndAmounts(
        TaxesRepository,
        CostCentralRepository,
      ).execute({
        method: findWithdrawalType('PIX').name,
        amount: this.amount,
        withdrawalSettings,
      });

    const withheld_balance = await new WithheldBalance(
      CommissionsRepository,
    ).calculate(
      this.id_user,
      withdrawalSettings.withheld_balance_percentage,
      withdrawalSettings.use_highest_sale,
    );

    const balance = await Transactions.sequelize.query(
      'select UserBalance(:id_user) as total',
      {
        replacements: {
          id_user: this.id_user,
        },
        plain: true,
      },
    );

    if (
      userDoesntHaveBalance(
        feesAndAmountsTransaction.withdrawal_total,
        balance.total,
        withheld_balance,
      )
    )
      throw ApiError.badRequest('Saldo insuficiente');

    await SQS.add('requestWithdrawal', {
      id_user: this.id_user,
      amount: this.amount,
    });
  }
};
