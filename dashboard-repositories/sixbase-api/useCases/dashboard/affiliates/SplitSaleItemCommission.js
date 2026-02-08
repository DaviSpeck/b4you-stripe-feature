const ApiError = require('../../../error/ApiError');
const aws = require('../../../queues/aws');
const { findAffiliateStatusByKey } = require('../../../status/affiliateStatus');
const { findCommissionsStatus } = require('../../../status/commissionsStatus');
const {
  findSalesStatusByKey,
  findStatus,
} = require('../../../status/salesStatus');
const { DATABASE_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');
const { findRoleTypeByKey } = require('../../../types/roles');
const date = require('../../../utils/helpers/date');
const UpdateBalance = require('../../common/balances/UpdateBalance');
const CalculateCommissions = require('../../common/splits/CalculateCommissionsTransactions');
const Commission = require('../../common/splits/Commission');
const Commissions = require('../../../database/models/Commissions');
const SalesMetricsDaily = require('../../../database/models/SalesMetricsDaily');

const calculateDateDiffInDays = (dateToDiff) => date().diff(dateToDiff, 'd');
module.exports = class SplitAffiliateCommission {
  #affiliate_uuid;

  #sale_item_uuid;

  #id_user;

  #SaleItemRepository;

  #AffiliateRepository;

  #BalanceRepository;

  #SubscriptionRepository;

  #DatabaseConfig;

  constructor(
    { sale_item_uuid, affiliate_uuid, id_user },
    SaleItemRepository,
    AffiliateRepository,
    BalanceRepository,
    SubscriptionRepository,
    DatabaseConfig,
  ) {
    this.#affiliate_uuid = affiliate_uuid;
    this.#sale_item_uuid = sale_item_uuid;
    this.#id_user = id_user;
    this.#SaleItemRepository = SaleItemRepository;
    this.#AffiliateRepository = AffiliateRepository;
    this.#BalanceRepository = BalanceRepository;
    this.#SubscriptionRepository = SubscriptionRepository;
    this.#DatabaseConfig = DatabaseConfig;
  }

  async execute() {
    const saleItem = await this.#SaleItemRepository.find({
      uuid: this.#sale_item_uuid,
      id_status: findSalesStatusByKey('paid').id,
    });

    if (!saleItem) throw ApiError.badRequest('Venda não encontrada');

    const { product, commissions } = saleItem;

    if (product.id_user !== this.#id_user) {
      throw ApiError.badRequest('Venda não encontrada');
    }

    if (saleItem.id_affiliate) {
      throw ApiError.badRequest('Afiliado já tem comissão');
    }

    const affiliate = await this.#AffiliateRepository.find({
      uuid: this.#affiliate_uuid,
      id_product: product.id,
      status: findAffiliateStatusByKey('active').id,
    });

    if (!affiliate) throw ApiError.badRequest('Afiliado não encontrado');

    const commissionsData = await CalculateCommissions.execute({
      affiliate,
      first_charge: true,
      sale_item: saleItem,
      shipping_type: saleItem.offer.shipping_type,
    });

    const dbTransaction = await this.#DatabaseConfig.transaction();
    try {
      for await (const commission of commissions) {
        const { id_user, amount } = commissionsData.find(
          (c) => c.id_user === commission.id_user,
        );
        const decrementAmount = commission.amount - amount;

        if (commission.id_status === findCommissionsStatus('released').id) {
          await new UpdateBalance(
            {
              amount: decrementAmount,
              id_user,
              operation: 'decrement',
            },
            this.#BalanceRepository,
          ).execute();
        }

        await Commissions.update(
          { amount },
          { where: { id: commission.id }, transaction: dbTransaction },
        );
        await SalesMetricsDaily.decrement('paid_total', {
          by: decrementAmount,
          transaction: dbTransaction,
          logging: true,
          where: {
            id_user: commission.id_user,
            id_product: saleItem.id_product,
            time: `${date(saleItem.paid_at).format('YYYY-MM-DD')} 03:00:00`,
          },
        });

        dbTransaction.afterCommit(async () => {
          await aws.add('usersRevenue', {
            id_user: commission.id_user,
            amount: decrementAmount,
            paid_at: date(saleItem.paid_at)
              .subtract(3, 'hours')
              .format(DATABASE_DATE_WITHOUT_TIME),
            operation: 'decrement',
          });
        });
      }

      const affiliateCommissionData = commissionsData.find(
        (c) => c.id_role === findRoleTypeByKey('affiliate').id,
      );

      const affiliateCommission = await Commissions.create(
        affiliateCommissionData,
      );

      if (calculateDateDiffInDays(affiliateCommission.release_date) >= 0) {
        await new Commission(
          {
            amount: affiliateCommission.amount,
            id_user: affiliateCommission.id_user,
            id: affiliateCommission.id,
          },
          this.#BalanceRepository,
          this.#DatabaseConfig,
        ).pay();
      }

      dbTransaction.afterCommit(async () => {
        await aws.add('usersRevenue', {
          id_user: affiliateCommission.id_user,
          amount: affiliateCommission.amount,
          paid_at: date(saleItem.paid_at)
            .subtract(3, 'hours')
            .format(DATABASE_DATE_WITHOUT_TIME),
        });
        try {
          await aws.add('sales-metrics-hourly', {
            id_user: affiliateCommission.id_user,
            id_product: saleItem.id_product,
            amount: affiliateCommission.amount,
            paid_at: saleItem.paid_at,
            created_at: saleItem.created_at,
            statusAfter: findStatus(saleItem.id_status).key,
            statusBefore: null,
            payment_method: saleItem.payment_method,
          });
        } catch (error) {
          // eslint-disable-next-line
          console.log(error);
        }
      });

      await this.#SaleItemRepository.update(
        { id: saleItem.id },
        { id_affiliate: affiliate.id },
        dbTransaction,
      );

      await this.#SubscriptionRepository.update(
        { id_sale_item: saleItem.id },
        {
          id_affiliate: affiliate.id,
          affiliate_commission: affiliate.commission,
        },
        dbTransaction,
      );

      await dbTransaction.commit();
      return commissionsData;
    } catch (error) {
      dbTransaction.rollback();
      throw error;
    }
  }
};
