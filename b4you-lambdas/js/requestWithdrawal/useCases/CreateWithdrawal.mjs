import { Op } from 'sequelize';
import { CalculateWithdrawalFeesAndAmounts } from './CalculateWithdrawalFeesAndAmounts.mjs';
import { WithheldBalance } from './WithheldBalance.mjs';
import { date as dateHelper } from '../utils/date.mjs';
import { v4 } from 'uuid';
import { findBank } from '../utils/banks.mjs';
import { findTransactionTypeByKey } from '../types/transactionTypes.mjs';
import { findTransactionStatus, findTransactionStatusByKey } from '../status/transactionStatus.mjs';
import { findDocumentsStatusByKey } from '../status/documentStatus.mjs';
import { BalancesRepository } from '../database/repositories/BalancesRepository.mjs';
import { CostCentralRepository } from '../database/repositories/CostCentralRepository.mjs';
import { TaxesRepository } from '../database/repositories/TaxesRepository.mjs';
import { TransactionsRepository } from '../database/repositories/TransactionsRepository.mjs';
import { UsersRepository } from '../database/repositories/UsersRepository.mjs';
import { WithdrawalRepository } from '../database/repositories/WithdrawalsRepository.mjs';
import { WithdrawalsSettingsRepository } from '../database/repositories/WithdrawalsSettingsRepository.mjs';
import { Transactions } from '../database/models/Transactions.mjs';
import { CommissionsRepository } from '../database/repositories/CommissionsRepository.mjs';
import { ReferralBalance } from '../database/models/ReferralBalances.mjs';

const getPagarmeAccounts = (user, pagarmeProviders) => {
  const {
    pagarme_recipient_id,
    pagarme_recipient_id_cnpj,
    pagarme_recipient_id_3,
    pagarme_recipient_id_cnpj_3,
  } = user;
  const accounts = [];
  const [pagarmeDigital, pagarmeNewKey] = pagarmeProviders;

  if (pagarme_recipient_id_3 && pagarmeDigital) {
    accounts.push({
      recipient_id: pagarme_recipient_id_3,
      instance: pagarmeDigital,
      provider: 'B4YOU_PAGARME_3',
    });
  }

  if (pagarme_recipient_id_cnpj_3 && pagarmeDigital) {
    accounts.push({
      recipient_id: pagarme_recipient_id_cnpj_3,
      instance: pagarmeDigital,
      provider: 'B4YOU_PAGARME_3',
    });
  }

  if (pagarme_recipient_id && pagarmeNewKey) {
    accounts.push({
      recipient_id: pagarme_recipient_id,
      instance: pagarmeNewKey,
      provider: 'B4YOU_PAGARME_2',
    });
  }

  if (pagarme_recipient_id_cnpj && pagarmeNewKey) {
    accounts.push({
      recipient_id: pagarme_recipient_id_cnpj,
      instance: pagarmeNewKey,
      provider: 'B4YOU_PAGARME_2',
    });
  }

  return accounts;
};

function getRandomInteger() {
  return Math.floor(Math.random() * 1000000) + 1;
}

const requestWithdrawal = async ({
  user,
  amount,
  fees,
  referralBalance,
  pagarmeProviders = [],
  isSandbox = false,
}) => {
  const withdrawalsToCreate = [];
  let remainingAmount = amount;
  let remainingReferral = referralBalance ? referralBalance.total : 0;
  const accounts = getPagarmeAccounts(user, pagarmeProviders);

  for await (const account of accounts) {
    if (remainingAmount <= 0) {
      break;
    }
    let withdrawalAmount = remainingAmount;
    let balance = 0;

    try {
      balance = await account.instance.getBalance(account.recipient_id);
      console.log(
        `[${isSandbox ? 'SANDBOX' : 'PROD'}] Balance for ${account.recipient_id}:`,
        balance / 100
      );
    } catch (error) {
      console.log('error while getting balance ->', account.recipient_id, error);
    }

    if (balance === 0) {
      continue;
    }
    // utilizado quando temos tarifa de saque na pagarme
    // if (balance === 397) {
    //   continue;
    // }

    const balanceAmount = balance / 100;
    // utilizado quando temos tarifa de saque na pagarme
    // if (withdrawalAmount - 3.97 > balanceAmount) {
    //   withdrawalAmount = balanceAmount - 3.97;
    // }

    if (withdrawalAmount > balanceAmount) {
      withdrawalAmount = balanceAmount;
    }

    try {
      const response = await account.instance.requestWithdrawal(
        account.recipient_id,
        parseInt((withdrawalAmount * 100).toFixed(0), 10)
      );
      console.log(`[${isSandbox ? 'SANDBOX' : 'PROD'}] Withdrawal response -> `, response);

      remainingAmount -= withdrawalAmount;
      let user_gross_amount = withdrawalAmount;
      let user_net_amount = 0;

      withdrawalsToCreate.push({
        ...fees,
        psp_id: 0,
        id_user: user.id,
        withdrawal_amount: withdrawalAmount,
        withdrawal_total:
          withdrawalsToCreate.length === 0 ? withdrawalAmount + fees.fee_total : withdrawalAmount,
        fee_total: withdrawalsToCreate.length === 0 ? fees.fee_total : 0,
        fee_fixed_amount: withdrawalsToCreate.length === 0 ? fees.fee_fixed_amount : 0,
        user_gross_amount,
        user_net_amount,
        uuid: response.id,
        provider: account.provider,
      });
    } catch (error) {
      console.log('Error requesting withdrawal:', error);
      if (error.response?.data) {
        console.log('Error data:', error.response.data);
      }
    }
  }

  // Saque manual via pay42/iopay para o saldo restante
  if (remainingAmount > 0) {
    const transaction_id = v4();
    //const withdrawalData = getWithdrawalData(user, remainingAmount, transaction_id);
    //const payoutData = await PaymentService.generatePayout(withdrawalData);
    //console.log(payoutData);
    let user_gross_amount = remainingAmount;
    let user_net_amount = 0;
    if (remainingReferral) {
      user_gross_amount = remainingAmount - remainingReferral;
      user_net_amount = remainingReferral;
    }
    withdrawalsToCreate.push({
      ...fees,
      psp_id: getRandomInteger(),
      id_user: user.id,
      withdrawal_amount: remainingAmount,
      withdrawal_total:
        withdrawalsToCreate.length === 0 ? remainingAmount + fees.fee_total : remainingAmount,
      fee_total: withdrawalsToCreate.length === 0 ? fees.fee_total : 0,
      fee_fixed_amount: withdrawalsToCreate.length === 0 ? fees.fee_fixed_amount : 0,
      user_gross_amount,
      user_net_amount,
      uuid: transaction_id,
    });
  }

  return withdrawalsToCreate;
};

const pspWithdrawalAccountType = (account_type) => {
  if (account_type === 'conta-poupanca' || account_type === 'conta-poupanca-conjunta')
    return 'savings';
  return 'checking';
};

function toCents(aValue) {
  return Math.round((Math.abs(aValue) / 100) * 10000);
}

const userDoesntHaveBalance = (grossAmount, totalBalance, withheld_balance) => {
  const grossAmountCents = toCents(grossAmount);
  const totalBalanceToCents = toCents(totalBalance);
  const withheldBalanceToCents = toCents(withheld_balance);

  return grossAmountCents > totalBalanceToCents - withheldBalanceToCents;
};

const getWithdrawalData = (
  {
    full_name,
    bank_code,
    account_number,
    agency: account_agency,
    account_type,
    document_number,
    is_company,
    cnpj,
    company_bank_code,
    company_agency,
    company_account_number,
    company_account_type,
  },
  amount,
  transaction_id
) => {
  if (is_company) {
    const bankInfo = findBank(company_bank_code);
    return {
      transaction_id,
      amount,
      document_number: cnpj,
      document_type: 'CNPJ',
      name: full_name,
      bank: {
        type: 'PIX',
        bank_name: bankInfo.label,
        ispb: bankInfo.ispb,
        account_agency: company_agency,
        account_number: company_account_number.includes('-')
          ? company_account_number
          : company_account_number.slice(0, company_account_number.length - 1) +
            '-' +
            company_account_number.slice(-1),
        account_type: pspWithdrawalAccountType(company_account_type),
      },
    };
  }
  const bankInfo = findBank(bank_code);
  return {
    transaction_id,
    amount,
    document_number,
    document_type: 'CPF',
    name: full_name,
    bank: {
      type: 'PIX',
      bank_name: bankInfo.label,
      ispb: bankInfo.ispb,
      account_agency,
      account_number: account_number.includes('-')
        ? account_number
        : account_number.slice(0, account_number.length - 1) + '-' + account_number.slice(-1),
      account_type: pspWithdrawalAccountType(account_type),
    },
  };
};

const withdrawalIsBlocked = ({ blocked }) => blocked;

const exceedMaxMonthAmount = (confirmedWithdrawalsAmount, requestedAmount, { max_amount }) => {
  return confirmedWithdrawalsAmount + requestedAmount > max_amount;
};

const isNotCompany = ({ is_company, verified_company, status_cnpj }) =>
  !is_company && !verified_company && status_cnpj !== findDocumentsStatusByKey('success').id;

const amountLessThanLimit = (amount, limit) => amount < limit;

export class CreateWithdrawal {
  #Database;
  #pagarmeProviders;
  #isSandbox;

  constructor({ Database, pagarmeProviders = [], isSandbox = false }) {
    this.#Database = Database;
    this.#pagarmeProviders = pagarmeProviders;
    this.#isSandbox = isSandbox;
  }

  async execute({ amount, id_user }) {
    const user = await UsersRepository.find(id_user);
    console.log(
      `[${this.#isSandbox ? 'SANDBOX' : 'PROD'}] Processing withdrawal for user ->`,
      user.id
    );

    if (!user.bank_code || !user.account_number || !user.agency) {
      return 'É necessário ter uma conta bancária cadastrada em seu perfil B4you para solicitar um saque';
    }

    const withdrawalSettings = await WithdrawalsSettingsRepository.find({
      id_user,
    });

    if (withdrawalSettings.lock_pending) {
      const pendingWithdrawals = await Transactions.sum('withdrawal_amount', {
        where: {
          id_user,
          id_type: findTransactionTypeByKey('withdrawal').id,
          id_status: findTransactionStatusByKey('pending').id,
        },
      });
      console.log('pending withdrawal -> ', pendingWithdrawals);
      if (pendingWithdrawals > 0) return 'Você já tem um saque pendente, aguardando processamento';
    }

    console.log(withdrawalSettings);
    if (amountLessThanLimit(amount, withdrawalSettings.min_amount))
      return `Pedido mínimo de R$ ${withdrawalSettings.min_amount}`;
    if (withdrawalIsBlocked(withdrawalSettings))
      return 'Você está bloqueado para pedir saques, entre em contato com o suporte';

    if (isNotCompany(user)) {
      const confirmedWithdrawalsOnMonth = await Transactions.sum('withdrawal_amount', {
        where: {
          id_user,
          id_type: findTransactionTypeByKey('withdrawal').id,
          id_status: findTransactionStatusByKey('paid').id,
          created_at: {
            [Op.gte]: dateHelper().startOfMonth().format('YYYY-MM-DD'),
          },
        },
      });
      console.log(confirmedWithdrawalsOnMonth);
      if (exceedMaxMonthAmount(confirmedWithdrawalsOnMonth, amount, withdrawalSettings))
        return 'Você atingiu seu limite de saques, fale com o suporte';
    }

    const feesAndAmountsTransaction = await new CalculateWithdrawalFeesAndAmounts(
      TaxesRepository,
      CostCentralRepository
    ).execute({
      method: 'PIX',
      amount,
      withdrawalSettings,
    });
    console.log(feesAndAmountsTransaction);

    const [withheld_balance, balance, referralBalance] = await Promise.all([
      new WithheldBalance(CommissionsRepository).calculate(
        id_user,
        withdrawalSettings.withheld_balance_percentage,
        withdrawalSettings.use_highest_sale
      ),
      Transactions.sequelize.query('select UserBalance(:id_user) as total', {
        replacements: {
          id_user: user.id,
        },
        plain: true,
      }),
      ReferralBalance.findOne({
        raw: true,
        attributes: ['total'],
        where: {
          id_user: user.id,
        },
      }),
    ]);

    console.log('withheld_balance:', withheld_balance);
    console.log('balance:', balance);
    console.log('referralBalance:', referralBalance);

    if (
      userDoesntHaveBalance(
        feesAndAmountsTransaction.withdrawal_total,
        balance.total,
        withheld_balance
      )
    )
      return 'Saldo insuficiente';

    console.log(`[${this.#isSandbox ? 'SANDBOX' : 'PROD'}] Requesting withdrawal...`);
    const withdrawalsToCreate = await requestWithdrawal({
      user,
      amount,
      fees: feesAndAmountsTransaction,
      referralBalance,
      pagarmeProviders: this.#pagarmeProviders,
      isSandbox: this.#isSandbox,
    });

    console.log(
      `[${this.#isSandbox ? 'SANDBOX' : 'PROD'}] Withdrawals to create:`,
      withdrawalsToCreate.length
    );

    const dbTransaction = await this.#Database.sequelize.transaction();
    const withdrawalData = getWithdrawalData(user, amount, null);

    try {
      for await (const withdrawal of withdrawalsToCreate) {
        const { provider, ...rest } = withdrawal;
        const transaction = await TransactionsRepository.create(
          {
            ...rest,
            method: 'pix',
            id_type: findTransactionTypeByKey('withdrawal').id,
            id_status: findTransactionStatus('Pendente').id,
          },
          dbTransaction
        );

        await WithdrawalRepository.create(
          {
            id_transaction: transaction.id,
            id_user,
            bank_address: withdrawalData.bank,
            provider,
          },
          dbTransaction
        );
      }

      const balanceDecrement = withdrawalsToCreate.reduce((acc, v) => {
        acc += v.user_gross_amount;
        return acc;
      }, 0);
      await BalancesRepository.update(id_user, balanceDecrement, 'decrement', dbTransaction);

      const referralDecrement = withdrawalsToCreate.reduce((acc, v) => {
        acc += v.user_net_amount;
        return acc;
      }, 0);

      if (referralDecrement) {
        const referBalance = await ReferralBalance.findOne({
          where: {
            id_user,
          },
          transaction: dbTransaction,
          lock: dbTransaction.LOCK.UPDATE,
        });
        if (referBalance) {
          referBalance.decrement('total', {
            by: referralDecrement,
            transaction: dbTransaction,
          });
        }
      }

      await dbTransaction.commit();
      console.log(`[${this.#isSandbox ? 'SANDBOX' : 'PROD'}] Withdrawal created successfully`);

      return {
        success: true,
        withdrawals: withdrawalsToCreate,
        message: 'Saque solicitado com sucesso',
      };
    } catch (error) {
      await dbTransaction.rollback();
      console.error(`[${this.#isSandbox ? 'SANDBOX' : 'PROD'}] Error creating withdrawal:`, error);
      throw error;
    }
  }
}
