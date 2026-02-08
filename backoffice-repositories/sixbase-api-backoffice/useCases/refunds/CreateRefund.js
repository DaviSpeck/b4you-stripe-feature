const ApiError = require('../../error/ApiError');
const TaxesRepository = require('../../repositories/sequelize/TaxesRepository');
const CostCentralRepository = require('../../repositories/sequelize/CostCentralRepository');
const SalesSettingsRepository = require('../../repositories/sequelize/SalesSettingsRepository');
const IntegrationNotifications = require('../../database/models/IntegrationNotifications');
const RefundFees = require('./RefundFees');
const {
  updateSaleItem,
  findSaleItemRefund,
} = require('../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { findRoleTypeByKey } = require('../../types/roles');
const {
  updateSubscription,
} = require('../../database/controllers/subscriptions');
const { createRefund } = require('../../database/controllers/refunds');
const { updateBalance } = require('../../database/controllers/balances');
const uuid = require('../../utils/helpers/uuid');
const PaymentService = require('../../services/PaymentService');
const models = require('../../database/models/index');
const { findUserBalance } = require('../../database/controllers/balances');
const { findRefundStatus } = require('../../status/refundStatus');
const date = require('../../utils/helpers/date');
const { findBank } = require('../../utils/banks');
const Commissions = require('../../database/models/Commissions');
const { findCommissionsStatus } = require('../../status/commissionsStatus');
const { pagarmeRefund } = require('./pagarme');
const SQS = require('../../queues/aws');
const {
  findIntegrationNotificationTypeByKey,
} = require('../../types/integrationNotificationTypes');

const refundCommissions = async (
  { commissions, refundFees, valid_refund_until, created_at },
  transaction,
  type = 'decrement',
) => {
  const affiliateCommission = commissions.find(
    (c) => c.id_role === findRoleTypeByKey('affiliate').id,
  );

  const isWithinRefundPeriod =
    date(created_at).diff(date(valid_refund_until)) <= 0;
  const hasAffiliateCommission = !!affiliateCommission;
  const isAffiliateReleased = affiliateCommission?.released;

  if (isWithinRefundPeriod || !hasAffiliateCommission || !isAffiliateReleased) {
    for await (const commission of commissions) {
      await Commissions.update(
        { id_status: findCommissionsStatus('refunded').id },
        { where: { id: commission.id }, transaction },
      );

      if (commission.id_role === findRoleTypeByKey('producer').id) {
        if (commission.id_status === findCommissionsStatus('waiting').id) {
          await updateBalance(
            commission.id_user,
            refundFees.fee_total,
            type,
            transaction,
          );
        } else {
          await updateBalance(
            commission.id_user,
            commission.amount + refundFees.fee_total,
            type,
            transaction,
          );
        }
      } else if (
        commission.id_status === findCommissionsStatus('released').id
      ) {
        await updateBalance(
          commission.id_user,
          commission.amount,
          type,
          transaction,
        );
      }
    }
  } else {
    const totalCommission = commissions.reduce(
      (acc, { amount: userCommission, id_role }) => {
        acc += id_role !== 3 ? userCommission : 0;
        return acc;
      },
      0,
    );

    let totalAffiliate = affiliateCommission.amount;

    const affiliateBalance = await findUserBalance(affiliateCommission.id_user);

    if (affiliateBalance.amount > 0) {
      let affiliateAmount = 0;
      if (affiliateBalance.amount >= totalAffiliate) {
        affiliateAmount = totalAffiliate;
        totalAffiliate = 0;
      } else {
        totalAffiliate = affiliateCommission.amount - affiliateBalance.amount;
        affiliateAmount = affiliateBalance.amount;
      }

      await Commissions.update(
        { id_status: findCommissionsStatus('refunded').id },
        { where: { id: affiliateCommission.id }, transaction },
      );

      await updateBalance(
        affiliateCommission.id_user,
        affiliateAmount,
        type,
        transaction,
      );
    } else {
      totalAffiliate = affiliateCommission.amount;
    }

    for await (const commission of commissions) {
      const affiliateCommissionRate = Number(
        ((commission.amount / totalCommission) * totalAffiliate).toFixed(2),
      );

      await Commissions.update(
        { id_status: findCommissionsStatus('refunded').id },
        { where: { id: commission.id }, transaction },
      );

      if (commission.id_role === findRoleTypeByKey('producer').id) {
        if (commission.id_status === findCommissionsStatus('paid').id) {
          const balanceAmount =
            commission.amount + refundFees.fee_total + affiliateCommissionRate;
          await updateBalance(
            commission.id_user,
            balanceAmount,
            type,
            transaction,
          );
        } else {
          const balanceAmount = refundFees.fee_total + affiliateCommissionRate;
          await updateBalance(
            commission.id_user,
            balanceAmount,
            type,
            transaction,
          );
        }
      } else if (commission.id_status === findCommissionsStatus('paid').id) {
        const balanceAmount = commission.amount + affiliateCommissionRate;
        await updateBalance(
          commission.id_user,
          balanceAmount,
          type,
          transaction,
        );
      }
    }
  }
};

const updateUsersBalance = async (saleItem, type = 'decrement', t = null) => {
  const refundFees = await new RefundFees(
    TaxesRepository,
    CostCentralRepository,
  ).execute({
    amount: saleItem.price_total,
    method: saleItem.payment_method.toUpperCase(),
    refundSettings: await SalesSettingsRepository.find(
      saleItem.product.id_user,
    ),
  });

  await refundCommissions(
    {
      commissions: saleItem.commissions,
      refundFees,
      payment_type: saleItem.product.payment_type,
      valid_refund_until: saleItem.valid_refund_until,
      created_at: saleItem.created_at,
    },
    t,
    type,
  );
};

const storeRefundData = async ({
  saleItem,
  apiResponse,
  reason,
  refund_uuid,
  bank = {},
  role,
  transaction,
}) => {
  let refundStatus = findRefundStatus('Solicitado pelo produtor').id;
  const saleItemStatus = findSalesStatusByKey('request-refund').id;
  if (role === 'student') {
    refundStatus = findRefundStatus('Solicitado pelo comprador').id;
  }

  const data = await createRefund(
    {
      id_student: saleItem.id_student,
      id_sale_item: saleItem.id,
      id_status: refundStatus,
      requested_by_student: role === 'student',
      reason,
      uuid: refund_uuid,
      api_response: apiResponse,
      bank,
    },
    transaction,
  );

  await updateSaleItem(
    {
      id_status: saleItemStatus,
    },
    { id: saleItem.id },
    transaction,
  );

  return data;
};

const refundPix = async ({ amount, psp_id, refund_uuid }) => {
  const apiResponse = await PaymentService.refundPix({
    refund_id: refund_uuid,
    psp_id,
    amount,
  });
  return apiResponse;
};

const refundBillet = async ({ amount, psp_id, bank_account, refund_uuid }) => {
  const refundBankAccount = {
    ispb: findBank(bank_account.bank_code).ispb,
    bank_name: findBank(bank_account.bank_code).label,
    account_agency: bank_account.account_agency,
    account_number: bank_account.account_number,
  };
  if (bank_account.account_type === 'savings') {
    refundBankAccount.account_type = 'savings';
  }
  const apiResponse = await PaymentService.refundBillet({
    refund_id: refund_uuid,
    psp_id,
    bank: refundBankAccount,
    amount,
  });
  return apiResponse;
};

const studentBankAccount = ({
  bank_code,
  account_agency,
  account_number,
  account_type = 'checking',
}) => {
  if (!bank_code || !account_agency || !account_number || !account_type)
    return false;

  return {
    bank_code,
    account_agency,
    account_number,
    account_type,
  };
};

const refundCard = async ({ psp_id, amount, refund_uuid }) => {
  const apiResponse = await PaymentService.refundCard({
    refund_id: refund_uuid,
    psp_id,
    amount,
  });
  return apiResponse;
};

module.exports = class CreateRefund {
  constructor({
    saleUuid,
    bankAccount,
    reason = 'Reembolso feito pelo suporte',
  }) {
    this.uuid = saleUuid;
    this.reason = reason;
    this.bankAccount = bankAccount;
  }

  async execute() {
    const saleItem = await findSaleItemRefund({
      uuid: this.uuid,
      id_status: findSalesStatusByKey('paid').id,
    });

    if (!saleItem) {
      throw ApiError.badRequest('Venda não encontrada');
    }

    const { charges } = saleItem;

    if (!charges || charges.length === 0) {
      throw ApiError.badRequest('Nenhuma cobrança encontrada para esta venda');
    }

    let apiResponse;
    let studentBank;
    const refundUuid = uuid.v4();

    if (
      ['B4YOU_PAGARME', 'B4YOU_PAGARME_2', 'B4YOU_PAGARME_3'].includes(
        charges[0].provider,
      )
    ) {
      let account = null;
      if (saleItem.payment_method === 'billet') {
        if (Object.keys(this.bankAccount).length > 0) {
          account = studentBankAccount(this.bankAccount);
        } else {
          account = studentBankAccount(saleItem.student);
        }
        if (!account) {
          throw ApiError.badRequest(
            'É necessário que o cliente tenha uma conta bancária cadastrada em seu perfil B4you para solicitar reembolso de valores pagos por boleto',
          );
        }
      }
      const cardCharges =
        saleItem.charges?.filter(
          (charge) => charge.payment_method === 'credit_card',
        ) || [];

      if (cardCharges.length === 2) {
        // Primeiro, processar todos os refunds na API antes de atualizar o banco
        const refundResults = [];

        // eslint-disable-next-line no-restricted-syntax
        for await (const charge of cardCharges) {
          const refund_uuid = uuid.v4();

          try {
            const apiResponseTwoCard = await pagarmeRefund({
              saleItem,
              amount: charge.price,
              provider_id: charge.provider_id,
              provider: charge.provider,
              numCard: 2,
            });

            refundResults.push({
              charge,
              apiResponse: apiResponseTwoCard,
              refund_uuid,
            });
          } catch (error) {
            throw error;
          }
        }

        // Se todos os refunds foram bem-sucedidos, atualizar o banco em uma única transação
        await models.sequelize.transaction(async (t) => {
          try {
            if (saleItem.id_plan) {
              await updateSubscription(
                { id_sale: saleItem.id_sale },
                { active: false },
                t,
              );
            }

            // Criar registros de refund para cada charge
            for (const refundResult of refundResults) {
              await storeRefundData({
                saleItem,
                apiResponse: refundResult.apiResponse,
                reason: this.reason,
                refund_uuid: refundResult.refund_uuid,
                role: 'student',
                transaction: t,
              });
            }

            // Atualizar balance apenas uma vez para toda a saleItem
            await updateUsersBalance(saleItem, 'decrement', t);
          } catch (error) {
            throw error;
          }
        });
      } else {
        try {
          apiResponse = await pagarmeRefund({
            saleItem,
            amount: saleItem.price_total,
            provider_id: charges[0].provider_id,
            bank_account: account,
            provider: charges[0].provider,
            sale_item_uuid: this.uuid,
            numCard: 1,
          });
        } catch (error) {
          throw error;
        }

        await models.sequelize.transaction(async (t) => {
          try {
            if (saleItem.id_plan) {
              await updateSubscription(
                { id_sale: saleItem.id_sale },
                { active: false },
                t,
              );
            }

            await storeRefundData({
              saleItem,
              apiResponse,
              reason: this.reason,
              refund_uuid: refundUuid,
              role: 'student',
              bank: studentBank,
              transaction: t,
            });

            await updateUsersBalance(saleItem, 'decrement', t);
          } catch (error) {
            throw error;
          }
        });
      }
    } else {
      if (saleItem.payment_method === 'pix') {
        try {
          apiResponse = await refundPix({
            amount: saleItem.price_total,
            psp_id: charges[0].psp_id,
            refund_uuid: refundUuid,
          });
        } catch (error) {
          throw error;
        }
      }
      if (saleItem.payment_method === 'billet') {
        if (Object.keys(this.bankAccount).length > 0) {
          studentBank = studentBankAccount(this.bankAccount);
        } else {
          studentBank = studentBankAccount(saleItem.student);
        }
        if (!studentBank) {
          throw ApiError.badRequest(
            'É necessário que o cliente tenha uma conta bancária cadastrada em seu perfil B4you para solicitar reembolso de valores pagos por boleto',
          );
        }

        try {
          apiResponse = await refundBillet({
            amount: saleItem.price_total,
            psp_id: charges[0].psp_id,
            refund_uuid: refundUuid,
            bank_account: {
              bank_code: studentBank.bank_code,
              account_agency: studentBank.account_agency,
              account_number: studentBank.account_number,
              account_type: studentBank.account_type,
            },
          });
        } catch (error) {
          throw error;
        }
      }

      if (saleItem.payment_method === 'card') {
        try {
          apiResponse = await refundCard({
            amount: saleItem.price_total,
            psp_id: charges[0].psp_id,
            refund_uuid: refundUuid,
          });
        } catch (error) {
          throw error;
        }
      }

      // Envolver todos os updates em transação para métodos não-Pagarme
      if (apiResponse) {
        await models.sequelize.transaction(async (t) => {
          try {
            if (saleItem.id_plan) {
              await updateSubscription(
                { id_sale: saleItem.id_sale },
                { active: false },
                t,
              );
            }

            await storeRefundData({
              saleItem,
              apiResponse,
              reason: this.reason,
              refund_uuid: refundUuid,
              role: 'student',
              bank: studentBank,
              transaction: t,
            });

            await updateUsersBalance(saleItem, 'decrement', t);
          } catch (error) {
            throw error;
          }
        });
      }
    }

    try {
      await SQS.add('blingRefund', {
        sale_id: saleItem.id_sale,
      });
    } catch (error) {
      // Error handling for Bling notification
    }

    try {
      let message = '';
      if (this.reason === 'Reembolso solicitado pela Konduto via webhook') {
        message =
          'Reembolso feito pelo sistema de externo de antifraude(konduto)';
      }
      if (this.reason === 'Reembolso manual pelo antifraude interno') {
        message = 'Reembolso feito pelo sistema interno de antifraude';
      }
      if (this.reason === 'Reembolso feito pelo suporte') {
        message = 'Reembolso feito pelo suporte interno';
      }
      await IntegrationNotifications.create({
        id_user: saleItem.product.id_user,
        id_type: findIntegrationNotificationTypeByKey('refund').id,
        id_sale: saleItem.id_sale,
        id_sale_item: saleItem.id,
        read: false,
        params: {
          message,
          action: 'Verique com cautela os dados do comprador',
        },
      });
    } catch (e) {
      // Error handling for integration notification
    }

    try {
      await SQS.add('shopify', {
        id_sale_item: saleItem.id,
        status: 'refunded',
      });
    } catch (error) {
      // Error handling for Shopify notification
    }

    return 'Seu reembolso foi solicitado.';
  }
};
