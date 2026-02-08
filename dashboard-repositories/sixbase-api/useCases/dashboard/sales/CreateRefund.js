const ApiError = require('../../../error/ApiError');
const UpdateStudentBankAccountEmail = require('../../../services/email/UpdateStudentBankAccount');
const ProducerRequestRefundEmail = require('../../../services/email/producer/refunds/ProducerRequested');
const DateHelper = require('../../../utils/helpers/date');
const {
  findSaleItemRefund,
} = require('../../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../../status/salesStatus');
const { DATABASE_DATE } = require('../../../types/dateTypes');
const { capitalizeName } = require('../../../utils/formatters');
const { findRoleType } = require('../../../types/roles');
const { refundBillet, refundCard, refundPix } = require('../../refunds/common');
const {
  updateSubscription,
} = require('../../../database/controllers/subscriptions');
const { updateBalance } = require('../../../database/controllers/balances');
const Students = require('../../../database/models/Students');
const Balances = require('../../../database/models/Balances');
const models = require('../../../database/models');
const { findCommissionsStatus } = require('../../../status/commissionsStatus');
const Commissions = require('../../../database/models/Commissions');

const { SIXBASE_URL_STUDENT_PROFILE } = process.env;

const validateSaleItem = async (sale_item_uuid, id_producer) => {
  const saleItem = await findSaleItemRefund({
    uuid: sale_item_uuid,
    id_status: findSalesStatusByKey('paid').id,
  });

  if (!saleItem) throw ApiError.badRequest('Venda não encontrada');
  if (saleItem.product.id_user !== id_producer)
    throw ApiError.badRequest('Venda não encontrada');
  const thirtyDaysAfterBuyProduct = DateHelper(saleItem.paid_at)
    .add(30, 'd')
    .format(DATABASE_DATE);
  if (DateHelper().isAfter(thirtyDaysAfterBuyProduct))
    throw ApiError.badRequest('Não é possível reembolsar vendas após 30 dias');

  return saleItem;
};

const studentBankAccount = ({
  bank_code,
  account_agency,
  account_number,
  account_type,
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

const sendStudentEmail = async (student, product, producer) => {
  const mailToStudent = {
    student_name: capitalizeName(student.full_name),
    producer_name: capitalizeName(producer.full_name),
    product_name: capitalizeName(product.name),
    url_action: SIXBASE_URL_STUDENT_PROFILE,
    email: student.email,
  };
  await new UpdateStudentBankAccountEmail(mailToStudent).send();
};

const isThereBalanceToRefund = async ({ commissions }) => {
  for await (const { amount, id_status, id_user } of commissions) {
    if (id_status === findCommissionsStatus('released').id) {
      const userBalance = await Balances.sequelize.query(
        'select userBalance(:id_user) as amount',
        {
          plain: true,
          replacements: {
            id_user,
          },
        },
      );

      if (amount > userBalance.amount) {
        return false;
      }
    }
  }
  return true;
};

/**
 * @typedef {object} RefundData
 * @property {String} sale_item_uuid sale item uuid
 * @property {{ id: number, full_name: string, email: string}} producer Producer info
 * @property {String} reason the refund reason
 * @property {{ bank_code: string | undefined , account_agency: string | undefined, account_number: string | undefined }} bank_account student bank account
 *
 */

module.exports = class {
  /**
   * @param {RefundData} RefundData Sale item uuid
   */
  constructor({ sale_item_uuid, producer, reason, bank_account }) {
    this.sale_item_uuid = sale_item_uuid;
    this.reason = reason;
    this.producer = producer;
    this.bank_account = bank_account;
  }

  async execute() {
    const saleItem = await validateSaleItem(
      this.sale_item_uuid,
      this.producer.id,
    );

    const { commissions } = saleItem;

    // Validar saldo do afiliado se houver
    const affiliateCommission = commissions.find(
      (c) => c.id_role === findRoleType('Afiliado').id,
    );

    if (
      affiliateCommission &&
      affiliateCommission.id_status === findCommissionsStatus('released').id
    ) {
      const affiliateBalance = await Balances.sequelize.query(
        'select UserBalance(:id_user) as total',
        {
          replacements: {
            id_user: affiliateCommission.id_user,
          },
          plain: true,
        },
      );
      if (affiliateBalance.total < affiliateCommission.amount) {
        throw ApiError.badRequest('Afiliado sem saldo para efetuar reembolso');
      }
    }

    // Validar saldo de produtores e coprodutores
    const producerAndCoproducerCommissions = commissions.filter(
      (c) =>
        c.id_role === findRoleType('Produtor').id ||
        c.id_role === findRoleType('Coprodutor').id,
    );

    const isThereBalance = await isThereBalanceToRefund({
      commissions: producerAndCoproducerCommissions,
    });
    if (!isThereBalance) throw ApiError.badRequest('Saldo indisponível');

    const student = await Students.findByPk(saleItem.id_student, {
      raw: true,
      attributes: [
        'full_name',
        'document_number',
        'email',
        'bank_code',
        'account_agency',
        'account_number',
        'document_number',
      ],
    });

    // Validar conta bancária antes se for boleto
    let studentBank = null;
    if (saleItem.payment_method === 'billet') {
      if (Object.keys(this.bank_account).length > 0) {
        studentBank = studentBankAccount(this.bank_account);
      } else {
        studentBank = studentBankAccount(student);
      }
      if (!studentBank) {
        await sendStudentEmail(student, saleItem.product, this.producer);
        throw ApiError.badRequest(
          'É necessário que o cliente tenha uma conta bancária cadastrada em seu perfil B4you para solicitar reembolso de valores pagos por boleto',
        );
      }
    }

    await models.sequelize.transaction(async (t) => {
      // Processar reembolso dentro da transaction
      if (saleItem.payment_method === 'pix') {
        await refundPix({
          saleItem,
          amount: saleItem.price_total,
          reason: this.reason,
          role: 'producer',
          provider_id: saleItem.charges[0].provider_id,
          provider: saleItem.charges[0].provider,
          transaction: t,
        });
      }
      
      if (saleItem.payment_method === 'billet') {
        await refundBillet({
          saleItem,
          amount: saleItem.price_total,
          reason: this.reason,
          role: 'producer',
          bank_account: studentBank,
          provider_id: saleItem.charges[0].provider_id,
          provider: saleItem.charges[0].provider,
          transaction: t,
        });
      }

      if (saleItem.payment_method === 'card') {
        await refundCard({
          saleItem,
          amount: saleItem.price_total,
          reason: this.reason,
          role: 'producer',
          provider_id: saleItem.charges[0].provider_id,
          provider: saleItem.charges[0].provider,
          transaction: t,
        });
      }
      // Cancelar subscription se houver
      if (saleItem.product.payment_type === 'subscription') {
        await updateSubscription(
          { id_sale: saleItem.id_sale },
          {
            active: false,
          },
          t,
        );
      }

      // Atualizar status das comissões para reembolsado e decrementar saldo
      for await (const commission of commissions) {
        await Commissions.update(
          {
            id_status: findCommissionsStatus('refunded').id,
          },
          { where: { id: commission.id }, transaction: t },
        );

        if (commission.id_status === findCommissionsStatus('released').id) {
          await updateBalance(
            commission.id_user,
            commission.amount,
            'decrement',
            t,
          );
        }
      }
    });
    await new ProducerRequestRefundEmail({
      email: saleItem.product.refund_email
        ? saleItem.product.refund_email
        : this.producer.email,
      full_name: this.producer.full_name,
      product_name: saleItem.product.name,
      amount: saleItem.price_base,
      student_name: student.full_name,
      type:
        saleItem.product.content_delivery === 'physical'
          ? 'physical'
          : 'digital',
    }).send();
  }
};
