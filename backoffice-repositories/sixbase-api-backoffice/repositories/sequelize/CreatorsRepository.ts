import { QueryTypes } from 'sequelize';
import SalesItems from '../../database/models/Sales_items';
import { findSalesStatusByKey } from '../../status/salesStatus';
import { findRoleTypeByKey } from '../../types/roles';

import {
  CreatorWithSales,
  CreatorsActiveStats,
  CreatorsAllTimeStats,
  CreatorsChartData,
  CreatorsConversionStats,
  CreatorsKpiStats,
  CreatorsNewStats,
  CreatorsRegisteredStats,
  CreatorsRevenueStats,
  CreatorsSummary,
  CreatorsWithSalesResult,
  FindCreatorsWithSalesParams,
  FindProducersWithCreatorsParams,
  FindProductsWithCreatorsParams,
  GetCreatorsActiveStatsParams,
  GetCreatorsAllTimeStatsParams,
  GetCreatorsConversionStatsParams,
  GetCreatorsKpiStatsParams,
  GetCreatorsNewStatsParams,
  GetCreatorsPerformanceChartParams,
  GetCreatorsRegisteredStatsParams,
  GetCreatorsRevenueStatsParams,
  GetCreatorsSummaryParams,
  GetNewCreatorsPerformanceChartParams,
  ProducerWithCreators,
  ProductWithCreators,
} from '../../interfaces/creators.interface';
import { findCommissionsStatus } from '@status/commissionsStatus';

const { dateHelperTZ } = require('../../utils/helpers/date-tz');

export default class CreatorsRepository {
  private static formatDate(date: string | Date, isEnd = false): string {
    const tz = process.env.TZ || 'America/Sao_Paulo';

    const base = dateHelperTZ(date, tz)[isEnd ? 'endOf' : 'startOf']('day');

    return base.format('YYYY-MM-DD HH:mm:ss');
  }

  private static get creatorsOnboardingSubquery(): string {
    return `(
      SELECT
        fup.id_user,
        fup.completed_at AS created_at
      FROM form_user_profiles fup
      WHERE fup.form_type = 2
      GROUP BY fup.id_user
    )`;
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  private static get creatorsIdentificationSubquery(): string {
    return `(
      SELECT DISTINCT
        c.id_user,
        MIN(si.paid_at) AS created_at
      FROM commissions c
      JOIN sales_items si ON si.id = c.id_sale_item
      WHERE c.id_role = :affiliateRole
        AND c.id_status IN (:waitingStatus, :releasedStatus)
      GROUP BY c.id_user
    )`;
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async findProducersWithCreators({
    startDate = null,
    endDate = null,
  }: FindProducersWithCreatorsParams = {}): Promise<ProducerWithCreators[]> {
    try {
      let dateFilter = '';
      const replacements: any = {};

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);

        dateFilter = 'AND si.paid_at BETWEEN :startDate AND :endDate';
        replacements.startDate = start;
        replacements.endDate = end;
      }

      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      const query = `
        SELECT DISTINCT
          prod.id,
          prod.uuid,
          prod.full_name,
          prod.email
        FROM users prod
        INNER JOIN products p ON p.id_user = prod.id
        INNER JOIN sales_items si ON si.id_product = p.id
        INNER JOIN commissions c ON c.id_sale_item = si.id
        INNER JOIN users u ON u.id = c.id_user
        INNER JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        WHERE 1=1
          ${dateFilter}
          AND si.id_status = :paidStatus
        ORDER BY prod.full_name ASC;
      `;

      const producers = await SalesItems.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements,
      });

      return producers as ProducerWithCreators[];
    } catch (error) {
      console.error('❌ Erro ao buscar produtores com creators:', error);
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async findProductsWithCreators({
    producerId = null,
    startDate = null,
    endDate = null,
  }: FindProductsWithCreatorsParams = {}): Promise<ProductWithCreators[]> {
    try {
      const replacements: any = {};
      let producerFilter = '';
      let dateFilter = '';

      if (producerId) {
        producerFilter = 'AND prod.id = :producerId';
        replacements.producerId = producerId;
      }

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);

        dateFilter = 'AND si.paid_at BETWEEN :startDate AND :endDate';
        replacements.startDate = start;
        replacements.endDate = end;
      }

      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      // ─── Query principal ────────────────────────────────────────────────
      const query = `
        SELECT DISTINCT
          p.id,
          p.uuid,
          p.name,
          prod.full_name AS producer_name
        FROM products p
        INNER JOIN users prod ON prod.id = p.id_user
        INNER JOIN sales_items si ON si.id_product = p.id
        INNER JOIN commissions c ON c.id_sale_item = si.id
        INNER JOIN users u ON u.id = c.id_user
        INNER JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        WHERE 1=1
          ${producerFilter}
          ${dateFilter}
          AND si.id_status = :paidStatus
        ORDER BY p.name ASC;
      `;

      const products = await SalesItems.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements,
      });

      return products as ProductWithCreators[];
    } catch (error) {
      console.error('❌ Erro ao buscar produtos com creators:', error);
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async findCreatorsWithSales({
    page = 0,
    size = 10,
    input = null,
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
    sortBy = 'ranking',
    sortOrder = 'asc',
    newOnly = false,
    origin = 'all',
    verified = 'all',
  }: FindCreatorsWithSalesParams): Promise<CreatorsWithSalesResult> {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);
      const replacements: Record<string, any> = { limit, offset };

      let dateFilter = '';
      if (startDate && endDate) {
        replacements.startDate = this.formatDate(startDate);
        replacements.endDate = this.formatDate(endDate, true);
        dateFilter = 'AND si.paid_at BETWEEN :startDate AND :endDate';
      }

      const searchFilter = input?.trim()
        ? `
          AND (
            LOWER(u.full_name) LIKE LOWER(:input)
            OR LOWER(u.email) LIKE LOWER(:input)
            OR LOWER(u.whatsapp) LIKE LOWER(:input)
          )
        `
        : '';
      if (input?.trim()) replacements.input = `%${input.trim()}%`;

      let originFilter = '';

      if (origin !== 'all') {
        if (origin === '0') {
          originFilter = 'AND (ob.origem = :origin OR ob.origem IS NULL)';
        } else {
          originFilter = 'AND ob.origem = :origin';
        }
      }

      let verifiedFilter = '';

      if (verified !== 'all') {
        if (verified === '3') {
          verifiedFilter = `
            AND (
              u.verified_pagarme = :verified
              OR u.verified_pagarme_3 = :verified
              OR u.verified_company_pagarme = :verified
              OR u.verified_company_pagarme_3 = :verified
            )
          `;
        }
        else if (verified === '4') {
          verifiedFilter = `
            AND (
              u.verified_pagarme = :verified
              OR u.verified_pagarme_3 = :verified
              OR u.verified_company_pagarme = :verified
              OR u.verified_company_pagarme_3 = :verified
            )
            AND 3 NOT IN (
              u.verified_pagarme,
              u.verified_pagarme_3,
              u.verified_company_pagarme,
              u.verified_company_pagarme_3
            )
          `;
        }
        else {
          verifiedFilter = `
            AND (
              u.verified_pagarme = :verified
              OR u.verified_pagarme_3 = :verified
              OR u.verified_company_pagarme = :verified
              OR u.verified_company_pagarme_3 = :verified
            )
            AND 3 NOT IN (
              u.verified_pagarme,
              u.verified_pagarme_3,
              u.verified_company_pagarme,
              u.verified_company_pagarme_3
            )
            AND 4 NOT IN (
              u.verified_pagarme,
              u.verified_pagarme_3,
              u.verified_company_pagarme,
              u.verified_company_pagarme_3
            )
          `;
        }
      }

      const producerFilter = producerId ? 'AND p.id_user = :producerId' : '';
      const productFilter = productId ? 'AND si.id_product = :productId' : '';
      if (producerId) replacements.producerId = producerId;
      if (productId) replacements.productId = productId;
      if (origin !== 'all') replacements.origin = origin;
      if (verified !== 'all') replacements.verified = verified;

      const orderMap: Record<string, string> = {
        totalSalesValue: 'totalSalesValue',
        numberOfSales: 'numberOfSales',
        totalCommission: 'totalCommission',
        conversionRate: 'conversionRate',
        averageTicket: 'averageTicket',
      };

      const orderBy = orderMap[sortBy]
        ? `ORDER BY ${orderMap[sortBy]} ${sortOrder.toUpperCase()}`
        : 'ORDER BY totalSalesValue DESC';

      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      const mainQuery = `
        SELECT 
          u.id,
          u.uuid,
          u.full_name AS name,
          u.profile_picture AS avatar,
          u.whatsapp,
          COALESCE(ss.total_items_sold, 0) AS numberOfSales,
          COALESCE(ss.total_sales_value, 0) AS totalSalesValue,
          COALESCE(ss.total_commission, 0) AS totalCommission,
          COALESCE(ss.b4you_fee, 0) AS b4youFee,
          COALESCE(cs.click_amount, 0) AS totalClicks,
          ROUND(
            CASE WHEN COALESCE(ss.total_items_sold, 0) > 0 
              THEN COALESCE(ss.total_sales_value, 0) / ss.total_items_sold 
              ELSE 0 END, 2
          ) AS averageTicket,
          ROUND(
            CASE WHEN COALESCE(cs.click_amount, 0) > 0 
              THEN (ss.total_items_sold / cs.click_amount) * 100 
              ELSE 0 END, 2
          ) AS conversionRate
        FROM users u
        INNER JOIN (
          SELECT 
            c.id_user AS id_user_creator,
            COUNT(
              DISTINCT CASE 
                WHEN c.id_role = :affiliateRole
                THEN si.id
              END
            ) AS total_items_sold,
            COALESCE(SUM(
                      CASE 
                        WHEN EXISTS (
                          SELECT 1
                          FROM commissions cx
                          WHERE cx.id_sale_item = si.id
                            AND cx.id_user = c.id_user
                            AND cx.id_role = :affiliateRole
                        )
                        THEN si.price_total
                        ELSE 0
                      END
                    ), 0) AS total_sales_value,
            SUM(
              CASE 
                WHEN c.id_role = :affiliateRole
                  AND c.id_status IN (:waitingStatus, :releasedStatus)
                THEN c.amount
                ELSE 0
              END
            ) AS total_commission,
            COALESCE(SUM(
              CASE 
                WHEN EXISTS (
                  SELECT 1
                  FROM commissions cx
                  WHERE cx.id_sale_item = si.id
                    AND cx.id_user = c.id_user
                    AND cx.id_role = :affiliateRole
                )
                THEN si.fee_total
                ELSE 0
              END
            ), 0) AS b4you_fee
          FROM commissions c
          JOIN sales_items si ON si.id = c.id_sale_item
          JOIN products p ON p.id = si.id_product
          JOIN ${this.creatorsIdentificationSubquery
        } cl ON cl.id_user = c.id_user
          WHERE si.id_status = :paidStatus
            ${dateFilter}
            ${producerFilter}
            ${productFilter}
            ${newOnly && startDate && endDate
          ? 'AND cl.created_at BETWEEN :startDate AND :endDate'
          : ''
        }
          GROUP BY c.id_user
        ) ss ON ss.id_user_creator = u.id
        LEFT JOIN (
          SELECT 
            af.id_user AS id_user_creator,
            COALESCE(SUM(ac.click_amount), 0) AS click_amount
          FROM affiliate_clicks ac
          JOIN affiliates af ON af.id = ac.id_affiliate
          JOIN ${this.creatorsIdentificationSubquery
        } cl ON cl.id_user = af.id_user
          WHERE 1=1
            ${startDate && endDate
          ? 'AND ac.created_at BETWEEN :startDate AND :endDate'
          : ''
        }
          GROUP BY af.id_user
        ) cs ON cs.id_user_creator = u.id
        LEFT JOIN onboarding ob ON ob.id_user = u.id
        WHERE 1=1
          ${searchFilter}
          ${originFilter}
          ${verifiedFilter}
        ${orderBy}
        LIMIT :limit OFFSET :offset;
      `;

      const countQuery = `
        SELECT COUNT(
          DISTINCT CASE 
            WHEN c.id_role = :affiliateRole
            THEN c.id_user
          END
        ) AS total_count
        FROM commissions c
        JOIN users u ON u.id = c.id_user
        JOIN sales_items si ON si.id = c.id_sale_item
        JOIN products p ON p.id = si.id_product
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = c.id_user
        LEFT JOIN onboarding ob ON ob.id_user = c.id_user
        WHERE si.id_status = :paidStatus
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          ${dateFilter}
          ${producerFilter}
          ${productFilter}
          ${originFilter}
          ${searchFilter}
          ${newOnly && startDate && endDate
          ? 'AND cl.created_at BETWEEN :startDate AND :endDate'
          : ''
        };
      `;

      const [rawResults, countResult] = await Promise.all([
        SalesItems.sequelize.query<CreatorWithSales>(mainQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          nest: true,
          replacements,
        }),
        SalesItems.sequelize.query<{ total_count: number }>(countQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
      ]);

      const results = rawResults.map((r) => ({
        ...r,
        numberOfSales: Number(r.numberOfSales) || 0,
        totalSalesValue: Number(r.totalSalesValue) || 0,
        totalCommission: Number(r.totalCommission) || 0,
        b4youFee: Number(r.b4youFee) || 0,
        averageTicket: Number(r.averageTicket) || 0,
        totalClicks: Number(r.totalClicks) || 0,
        conversionRate: Number(r.conversionRate) || 0,
      }));

      return {
        rows: results,
        count: countResult?.[0]?.total_count || 0,
      };
    } catch (error) {
      console.error('❌ [findCreatorsWithSales] Erro crítico', {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Erro ao buscar creators com vendas: ${error.message}`);
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsSummary({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsSummaryParams = {}): Promise<CreatorsSummary> {
    try {
      const replacements: any = {};
      let dateFilter = '';
      let clickDateFilter = '';

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);
        dateFilter = 'AND si.paid_at BETWEEN :startDate AND :endDate';
        clickDateFilter = 'AND ac.created_at BETWEEN :startDate AND :endDate';
        replacements.startDate = start;
        replacements.endDate = end;
      }

      let producerFilter = '';
      let productFilter = '';

      if (producerId) {
        producerFilter = 'AND p.id_user = :producerId';
        replacements.producerId = producerId;
      }

      if (productId) {
        productFilter = 'AND si.id_product = :productId';
        replacements.productId = productId;
      }

      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      const summaryQuery = `
        SELECT 
          COUNT(
            DISTINCT CASE 
              WHEN c.id_role = :affiliateRole
              THEN si.id
            END
          ) AS totalSales,
          SUM(
            CASE 
              WHEN EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
              THEN si.price_total
              ELSE 0
            END
          ) AS totalRevenue,
          SUM(
            CASE 
              WHEN c.id_role = :affiliateRole
                AND c.id_status IN (:waitingStatus, :releasedStatus)
              THEN commission_amount
              ELSE 0
            END
          ) AS totalCommission,
          COALESCE(SUM(
            CASE 
              WHEN EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
              THEN si.fee_total
              ELSE 0
            END
          ), 0) AS totalB4youFee
        FROM (
          SELECT 
            si.id,
            si.price_total,
            si.fee_total,
            c.amount AS commission_amount
          FROM sales_items si
          JOIN commissions c ON c.id_sale_item = si.id
          JOIN users u ON u.id = c.id_user
          JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
          JOIN products p ON p.id = si.id_product
          WHERE si.id_status = :paidStatus
            AND EXISTS (
                  SELECT 1
                  FROM commissions cx
                  WHERE cx.id_sale_item = si.id
                    AND cx.id_user = u.id
                    AND cx.id_role = :affiliateRole
                )
            ${dateFilter}
            ${productFilter}
          GROUP BY si.id
        ) distinct_items;
      `;

      const clickQuery = `
        SELECT COALESCE(SUM(ac.click_amount), 0) AS totalClicks
        FROM affiliate_clicks ac
        JOIN affiliates af ON af.id = ac.id_affiliate
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = af.id_user
        WHERE 1=1
          ${clickDateFilter};
      `;

      const registeredAllTimeQuery = `
        SELECT COUNT(DISTINCT cl.id_user) AS totalCreatorsRegisteredAllTime
        FROM ${this.creatorsOnboardingSubquery} cl
      `;

      const activeCreatorsQuery = `
        SELECT COUNT(
          DISTINCT CASE 
            WHEN c.id_role = :affiliateRole
            THEN c.id_user
          END
        ) AS totalCreatorsActive
        FROM sales_items si
        JOIN commissions c ON c.id_sale_item = si.id
        JOIN users u ON u.id = c.id_user
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        JOIN products p ON p.id = si.id_product
        WHERE si.id_status = :paidStatus
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          AND si.paid_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          ${producerFilter}
          ${productFilter}
      `;

      const activeCreatorsAllTimeQuery = `
        SELECT COUNT(
          DISTINCT CASE 
            WHEN c.id_role = :affiliateRole
            THEN c.id_user
          END
        ) AS totalCreatorsActiveAllTime
        FROM sales_items si
        JOIN commissions c ON c.id_sale_item = si.id
        JOIN users u ON u.id = c.id_user
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        JOIN products p ON p.id = si.id_product
        WHERE si.id_status = :paidStatus
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          AND si.paid_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          ${producerFilter}
          ${productFilter};
      `;

      let newCreatorsSalesQuery = '';
      if (startDate && endDate) {
        newCreatorsSalesQuery = `
          SELECT 
            COUNT(DISTINCT o.id_user) AS newCreatorsCount,
            COUNT(
              DISTINCT CASE 
                WHEN c.id_role = :affiliateRole
                THEN si.id
              END
            ) AS newCreatorsSales,
            SUM(
              CASE 
                WHEN EXISTS (
                  SELECT 1
                  FROM commissions cx
                  WHERE cx.id_sale_item = si.id
                    AND cx.id_user = u.id
                    AND cx.id_role = :affiliateRole
                )
                THEN si.price_total
                ELSE 0
              END
            ) AS newCreatorsRevenue,
            COUNT(DISTINCT CASE WHEN si.id_status = :paidStatus THEN c.id_user END) AS newCreatorsActiveCount
          FROM ${this.creatorsOnboardingSubquery} cl
          LEFT JOIN users u ON u.id = cl.id_user
          LEFT JOIN commissions c ON c.id_user = u.id
          JOIN sales_items si ON si.id = c.id_sale_item
            AND si.id_status = :paidStatus
          LEFT JOIN products p ON p.id = si.id_product
          WHERE 1=1
            AND cl.created_at BETWEEN :startDate AND :endDate
            ${producerFilter}
            ${productFilter};
        `;
      }

      const queries = [
        SalesItems.sequelize.query(summaryQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
        SalesItems.sequelize.query(clickQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
        SalesItems.sequelize.query(registeredAllTimeQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
        SalesItems.sequelize.query(activeCreatorsAllTimeQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
        SalesItems.sequelize.query(activeCreatorsQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
      ];

      if (newCreatorsSalesQuery) {
        queries.push(
          SalesItems.sequelize.query(newCreatorsSalesQuery, {
            type: QueryTypes.SELECT,
            raw: true,
            replacements,
          }),
        );
      }

      const results = await Promise.all(queries);
      let summaryResults;
      let clickResults;
      let registeredResults;
      let activeAllTimeResults;
      let activeResults;
      let newCreatorsResults;

      if (startDate && endDate) {
        [
          summaryResults,
          clickResults,
          registeredResults,
          activeAllTimeResults,
          activeResults,
          newCreatorsResults,
        ] = results;
      } else {
        [
          summaryResults,
          clickResults,
          registeredResults,
          activeAllTimeResults,
          activeResults,
        ] = results;
      }

      const totals = {
        totalCreatorsRegisteredAllTime: parseInt(
          registeredResults?.[0]?.totalCreatorsRegisteredAllTime || 0,
        ),
        totalCreatorsRegistered: parseInt(
          registeredResults?.[0]?.totalCreatorsRegisteredAllTime || 0,
        ),
        totalCreatorsActive: parseInt(
          activeResults?.[0]?.totalCreatorsActive || 0,
        ),
        totalCreatorsActiveAllTime: parseInt(
          activeAllTimeResults?.[0]?.totalCreatorsActiveAllTime || 0,
        ),
        newCreatorsCount: parseInt(
          newCreatorsResults?.[0]?.newCreatorsCount || 0,
        ),
        newCreatorsSales: parseInt(
          newCreatorsResults?.[0]?.newCreatorsSales || 0,
        ),
        newCreatorsRevenue: parseFloat(
          newCreatorsResults?.[0]?.newCreatorsRevenue || 0,
        ),
        newCreatorsActiveCount: parseInt(
          newCreatorsResults?.[0]?.newCreatorsActiveCount || 0,
        ),
        totalRevenue: parseFloat(summaryResults?.[0]?.totalRevenue || 0),
        totalSales: parseInt(summaryResults?.[0]?.totalSales || 0),
        totalB4youFee: parseFloat(summaryResults?.[0]?.totalB4youFee || 0),
        totalClicks: parseInt(clickResults?.[0]?.totalClicks || 0),
        totalCommission: parseFloat(summaryResults?.[0]?.totalCommission || 0),
      };

      const averageTicket =
        totals.totalSales > 0 ? totals.totalRevenue / totals.totalSales : 0;
      const averageConversionRate =
        totals.totalClicks > 0
          ? Math.min((totals.totalSales / totals.totalClicks) * 100, 100)
          : 0;

      return {
        ...totals,
        averageTicket,
        averageConversionRate,
      };
    } catch (error) {
      console.error('Erro ao buscar resumo dos creators:', error);
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsKpiStats({
    startDate = null,
    endDate = null,
  }: GetCreatorsKpiStatsParams = {}): Promise<CreatorsKpiStats> {
    try {
      const replacements: any = {};
      let dateFilter = '';

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);
        dateFilter = 'AND o.created_at BETWEEN :startDate AND :endDate';
        replacements.startDate = start;
        replacements.endDate = end;
      }

      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      // ─── Total de creators registrados (onboarding) ─────────────────────────────
      const totalRegisteredQuery = `
        SELECT COUNT(DISTINCT cl.id_user) AS totalRegistered
        FROM ${this.creatorsIdentificationSubquery} cl
        WHERE 1=1
          ${dateFilter};
      `;

      // ─── Total de creators ativos (venderam nos últimos 30 dias) ────────────────
      const totalActiveQuery = `
        SELECT COUNT(
          DISTINCT CASE 
            WHEN c.id_role = :affiliateRole
            THEN c.id_user
          END
        ) AS totalActive
        FROM sales_items si
        JOIN commissions c ON c.id_sale_item = si.id
        JOIN users u ON u.id = c.id_user
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        WHERE si.paid_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          AND si.id_status = :paidStatus
      `;

      const [registeredResults, activeResults] = await Promise.all([
        SalesItems.sequelize.query(totalRegisteredQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
        SalesItems.sequelize.query(totalActiveQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
      ]);

      return {
        totalRegistered: parseInt(
          (registeredResults as any)[0]?.totalRegistered || 0,
        ),
        totalActive: parseInt((activeResults as any)[0]?.totalActive || 0),
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de KPI dos creators:', error);
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsPerformanceChart({
    startDate = null,
    endDate = null,
    period = 'day',
    producerId = null,
    productId = null,
  }: GetCreatorsPerformanceChartParams = {}): Promise<CreatorsChartData[]> {
    try {
      const replacements: any = {};
      let dateFilter = '';
      let clickDateFilter = '';

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);

        dateFilter = 'AND si.paid_at BETWEEN :startDate AND :endDate';
        clickDateFilter = 'AND ac.created_at BETWEEN :startDate AND :endDate';
        replacements.startDate = start;
        replacements.endDate = end;
      }

      let producerFilter = '';
      let productFilter = '';
      if (producerId) {
        producerFilter = 'AND p.id_user = :producerId';
        replacements.producerId = producerId;
      }
      if (productId) {
        productFilter = 'AND si.id_product = :productId';
        replacements.productId = productId;
      }

      let dateFormat = '%Y-%m-%d';
      if (period === 'week') dateFormat = '%Y-%u';
      else if (period === 'month') dateFormat = '%Y-%m';

      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      const salesQuery = `
        SELECT 
          DATE_FORMAT(si.paid_at, '${dateFormat}') AS period,
          COUNT(
            DISTINCT CASE 
              WHEN c.id_role = :affiliateRole
              THEN si.id
            END
          ) AS totalSales,
          COALESCE(SUM(
                    CASE 
                      WHEN EXISTS (
                        SELECT 1
                        FROM commissions cx
                        WHERE cx.id_sale_item = si.id
                          AND cx.id_user = u.id
                          AND cx.id_role = :affiliateRole
                      )
                      THEN si.price_total
                      ELSE 0
                    END
                  ), 0) AS totalRevenue,
          SUM(
            CASE 
              WHEN c.id_role = :affiliateRole
                AND c.id_status IN (:waitingStatus, :releasedStatus)
              THEN c.amount
              ELSE 0
            END
          ) AS totalCommission
        FROM sales_items si
        JOIN commissions c ON c.id_sale_item = si.id
        JOIN users u ON u.id = c.id_user
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        JOIN products p ON p.id = si.id_product
        WHERE si.id_status = :paidStatus
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          ${dateFilter}
          ${producerFilter}
          ${productFilter}
        GROUP BY DATE_FORMAT(si.paid_at, '${dateFormat}')
        ORDER BY period ASC;
      `;

      const clicksQuery = `
        SELECT 
          DATE_FORMAT(ac.created_at, '${dateFormat}') AS period,
          COALESCE(SUM(ac.click_amount), 0) AS totalClicks
        FROM affiliate_clicks ac
        JOIN affiliates af ON af.id = ac.id_affiliate
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = af.id_user
        WHERE 1=1
          ${clickDateFilter}
        GROUP BY DATE_FORMAT(ac.created_at, '${dateFormat}')
        ORDER BY period ASC;
      `;

      const [salesResults, clicksResults] = await Promise.all([
        SalesItems.sequelize.query(salesQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
        SalesItems.sequelize.query(clicksQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
      ]);

      const periodMap = new Map<string, CreatorsChartData>();

      (salesResults as any[]).forEach((row) => {
        const totalSales = parseInt(row.totalSales || 0);
        const totalRevenue = parseFloat(row.totalRevenue || 0);
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        periodMap.set(row.period, {
          period: row.period,
          totalSales,
          totalRevenue,
          totalCommission: parseFloat(row.totalCommission || 0),
          totalClicks: 0,
          averageTicket,
        });
      });

      (clicksResults as any[]).forEach((row) => {
        const clicks = parseInt(row.totalClicks || 0);
        if (periodMap.has(row.period)) {
          periodMap.get(row.period)!.totalClicks = clicks;
        } else {
          periodMap.set(row.period, {
            period: row.period,
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
            totalClicks: clicks,
            averageTicket: 0,
          });
        }
      });

      return Array.from(periodMap.values()).sort((a, b) =>
        a.period.localeCompare(b.period),
      );
    } catch (error) {
      console.error(
        '❌ Erro ao buscar dados do gráfico de performance:',
        error,
      );
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getNewCreatorsPerformanceChart({
    startDate = null,
    endDate = null,
    period = 'day',
    producerId = null,
    productId = null,
  }: GetNewCreatorsPerformanceChartParams = {}): Promise<CreatorsChartData[]> {
    try {
      const replacements: any = {};
      let dateFilter = '';
      let clickDateFilter = '';

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);
        replacements.startDate = start;
        replacements.endDate = end;
        dateFilter = 'AND si.paid_at BETWEEN :startDate AND :endDate';
        clickDateFilter = 'AND ac.created_at BETWEEN :startDate AND :endDate';
      }

      let producerFilter = '';
      let productFilter = '';
      if (producerId) {
        producerFilter = 'AND p.id_user = :producerId';
        replacements.producerId = producerId;
      }
      if (productId) {
        productFilter = 'AND si.id_product = :productId';
        replacements.productId = productId;
      }

      let dateFormat = '%Y-%m-%d';
      if (period === 'week') dateFormat = '%Y-%u';
      else if (period === 'month') dateFormat = '%Y-%m';

      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      const salesQuery = `
        SELECT 
          DATE_FORMAT(si.paid_at, '${dateFormat}') AS period,
          COUNT(
            DISTINCT CASE 
              WHEN c.id_role = :affiliateRole
              THEN si.id
            END
          ) AS totalSales,
          COALESCE(SUM(
                    CASE 
                      WHEN EXISTS (
                        SELECT 1
                        FROM commissions cx
                        WHERE cx.id_sale_item = si.id
                          AND cx.id_user = u.id
                          AND cx.id_role = :affiliateRole
                      )
                      THEN si.price_total
                      ELSE 0
                    END
                  ), 0) AS totalRevenue,
          SUM(
            CASE 
              WHEN c.id_role = :affiliateRole
                AND c.id_status IN (:waitingStatus, :releasedStatus)
              THEN c.amount
              ELSE 0
            END
          ) AS totalCommission
        FROM ${this.creatorsOnboardingSubquery} cl
        LEFT JOIN users u ON u.id = cl.id_user
        LEFT JOIN commissions c ON c.id_user = u.id
        JOIN sales_items si ON si.id = c.id_sale_item
          AND si.id_status = :paidStatus
        LEFT JOIN products p ON p.id = si.id_product
        WHERE 1=1
          AND cl.created_at BETWEEN :startDate AND :endDate
          ${dateFilter}
          ${producerFilter}
          ${productFilter}
        GROUP BY DATE_FORMAT(si.paid_at, '${dateFormat}')
        ORDER BY period ASC;
      `;

      const clicksQuery = `
        SELECT 
          DATE_FORMAT(ac.created_at, '${dateFormat}') AS period,
          COALESCE(SUM(ac.click_amount), 0) AS totalClicks
        FROM affiliate_clicks ac
        JOIN affiliates af ON af.id = ac.id_affiliate
        JOIN ${this.creatorsOnboardingSubquery} cl ON cl.id_user = af.id_user
        WHERE 1=1
          AND cl.created_at BETWEEN :startDate AND :endDate
          ${clickDateFilter}
        GROUP BY DATE_FORMAT(ac.created_at, '${dateFormat}')
        ORDER BY period ASC;
      `;

      const [salesResults, clicksResults] = await Promise.all([
        SalesItems.sequelize.query(salesQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
        SalesItems.sequelize.query(clicksQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
      ]);

      const periodMap = new Map<string, CreatorsChartData>();

      (salesResults as any[]).forEach((row) => {
        const totalSales = parseInt(row.totalSales || 0);
        const totalRevenue = parseFloat(row.totalRevenue || 0);
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        periodMap.set(row.period, {
          period: row.period,
          totalSales,
          totalRevenue,
          totalCommission: parseFloat(row.totalCommission || 0),
          totalClicks: 0,
          averageTicket,
        });
      });

      (clicksResults as any[]).forEach((row) => {
        const clicks = parseInt(row.totalClicks || 0);
        if (periodMap.has(row.period)) {
          periodMap.get(row.period)!.totalClicks = clicks;
        } else {
          periodMap.set(row.period, {
            period: row.period,
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
            totalClicks: clicks,
            averageTicket: 0,
          });
        }
      });

      return Array.from(periodMap.values()).sort((a, b) =>
        a.period.localeCompare(b.period),
      );
    } catch (error) {
      console.error(
        '❌ Erro ao buscar dados do gráfico de performance (novos):',
        error,
      );
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsRegisteredStats({
    startDate = null,
    endDate = null,
  }: GetCreatorsRegisteredStatsParams = {}): Promise<CreatorsRegisteredStats> {
    try {
      const replacements: any = {};

      let registeredInPeriodQuery = '';

      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);

        replacements.startDate = start;
        replacements.endDate = end;

        // 📅 Creators cadastrados no período
        registeredInPeriodQuery = `
          SELECT COUNT(DISTINCT cl.id_user) AS totalCreatorsRegisteredInPeriod
          FROM ${this.creatorsOnboardingSubquery} cl
          LEFT JOIN commissions c ON c.id_user = cl.id_user
          WHERE 1=1
            AND cl.created_at BETWEEN :startDate AND :endDate;
        `;
      }

      // 🧾 Total de creators cadastrados (sem período)
      const registeredAllTimeQuery = `
        SELECT COUNT(DISTINCT cl.id_user) AS totalCreatorsRegisteredAllTime
        FROM ${this.creatorsOnboardingSubquery} cl
        LEFT JOIN commissions c ON c.id_user = cl.id_user
      `;

      const queries = [
        SalesItems.sequelize.query(registeredAllTimeQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
      ];

      if (registeredInPeriodQuery) {
        queries.push(
          SalesItems.sequelize.query(registeredInPeriodQuery, {
            type: QueryTypes.SELECT,
            raw: true,
            replacements,
          }),
        );
      }

      const results = await Promise.all(queries);
      const [registeredAllTimeResults, registeredInPeriodResults] = results;

      const totalCreatorsRegisteredAllTime = parseInt(
        (registeredAllTimeResults as any)[0]?.totalCreatorsRegisteredAllTime ||
        0,
      );

      const totalCreatorsRegisteredInPeriod =
        startDate && endDate
          ? parseInt(
            (registeredInPeriodResults as any)[0]
              ?.totalCreatorsRegisteredInPeriod || 0,
          )
          : 0;

      return {
        totalCreatorsRegistered:
          totalCreatorsRegisteredInPeriod || totalCreatorsRegisteredAllTime,
        totalCreatorsRegisteredAllTime,
      };
    } catch (error) {
      console.error(
        '❌ Erro ao buscar estatísticas de creators registrados:',
        error,
      );
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsActiveStats({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsActiveStatsParams = {}): Promise<CreatorsActiveStats> {
    try {
      const replacements: any = {};

      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      let producerFilter = '';
      if (producerId) {
        producerFilter = 'AND p.id_user = :producerId';
        replacements.producerId = producerId;
      }

      let productFilter = '';
      if (productId) {
        productFilter = 'AND si.id_product = :productId';
        replacements.productId = productId;
      }

      const start = this.formatDate(
        startDate
          ? new Date(startDate)
          : dateHelperTZ().subtract(30, 'days').format(),
      );

      const end = this.formatDate(
        endDate || dateHelperTZ().endOf('day').format(),
        true,
      );

      replacements.startDate = start;
      replacements.endDate = end;

      const dateFilter = 'AND si.paid_at BETWEEN :startDate AND :endDate';

      const activeCreatorsQuery = `
        SELECT 
          COALESCE(COUNT(
            DISTINCT CASE 
              WHEN c.id_role = :affiliateRole
              THEN c.id_user
            END
          ), 0) AS totalCreatorsActive
        FROM sales_items si
        JOIN commissions c 
          ON c.id_sale_item = si.id 
          AND c.id_role = :affiliateRole
        JOIN users u ON u.id = c.id_user
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        JOIN products p ON p.id = si.id_product
        WHERE si.id_status = :paidStatus
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          ${producerFilter}
          ${productFilter}
          ${dateFilter};
      `;

      const [activeResults] = await SalesItems.sequelize.query<{
        totalCreatorsActive: number;
      }>(activeCreatorsQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements,
      });

      return {
        totalCreatorsActive: parseInt(
          activeResults?.totalCreatorsActive?.toString() || '0',
        ),
      };
    } catch (error) {
      console.error(
        '❌ Erro ao buscar estatísticas de creators ativos:',
        error,
      );
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsAllTimeStats({
    producerId = null,
    productId = null,
  }: GetCreatorsAllTimeStatsParams = {}): Promise<CreatorsAllTimeStats> {
    try {
      const replacements: any = {};

      let producerFilter = '';
      if (producerId) {
        producerFilter = 'AND p.id_user = :producerId';
        replacements.producerId = producerId;
      }

      let productFilter = '';
      if (productId) {
        productFilter = 'AND si.id_product = :productId';
        replacements.productId = productId;
      }

      const start = this.formatDate(
        dateHelperTZ().subtract(30, 'days').format(),
      );

      const end = this.formatDate(dateHelperTZ().endOf('day').format(), true);

      replacements.startDate = start;
      replacements.endDate = end;

      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      // ─── Total de creators registrados ─────────────────────────
      const registeredAllTimeQuery = `
        SELECT 
          COUNT(DISTINCT cl.id_user) AS totalCreatorsRegisteredAllTime
        FROM ${this.creatorsIdentificationSubquery} cl
      `;

      // ─── Total de creators ativos (últimos 30 dias) ─────────────
      const activeLast30DaysQuery = `
        SELECT 
          COALESCE(COUNT(
            DISTINCT CASE 
              WHEN c.id_role = :affiliateRole
              THEN c.id_user
            END
          ), 0) AS totalCreatorsActiveAllTime
        FROM sales_items si
        JOIN commissions c 
          ON c.id_sale_item = si.id 
          AND c.id_role = :affiliateRole
        JOIN users u ON u.id = c.id_user
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        JOIN products p ON p.id = si.id_product
        WHERE si.id_status = :paidStatus
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          AND si.paid_at BETWEEN :startDate AND :endDate
          ${producerFilter}
          ${productFilter};
      `;

      const [registeredAllTimeResults, activeAllTimeResults] =
        await Promise.all([
          SalesItems.sequelize.query<{
            totalCreatorsRegisteredAllTime: number;
          }>(registeredAllTimeQuery, {
            type: QueryTypes.SELECT,
            raw: true,
            replacements,
          }),
          SalesItems.sequelize.query<{ totalCreatorsActiveAllTime: number }>(
            activeLast30DaysQuery,
            { type: QueryTypes.SELECT, raw: true, replacements },
          ),
        ]);

      const totalCreatorsRegisteredAllTime = parseInt(
        registeredAllTimeResults?.[0]?.totalCreatorsRegisteredAllTime?.toString() ||
        '0',
      );

      const totalCreatorsActiveAllTime = parseInt(
        activeAllTimeResults?.[0]?.totalCreatorsActiveAllTime?.toString() || '0',
      );

      const percentageActiveCreatorsAllTime =
        totalCreatorsRegisteredAllTime > 0
          ? Number(
            (
              (totalCreatorsActiveAllTime /
                totalCreatorsRegisteredAllTime) *
              100
            ).toFixed(2),
          )
          : 0;

      return {
        totalCreatorsRegisteredAllTime,
        totalCreatorsActiveAllTime,
        percentageActiveCreatorsAllTime,
      };
    } catch (error) {
      console.error(
        '❌ Erro ao buscar estatísticas all-time dos creators:',
        error,
      );
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsNewStats({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsNewStatsParams = {}): Promise<CreatorsNewStats> {
    try {
      if (!startDate || !endDate) {
        return {
          newCreatorsCount: 0,
          newCreatorsSales: 0,
          newCreatorsRevenue: 0,
          newCreatorsActiveCount: 0,
          newCreatorsMadeSale: 0
        };
      }

      const replacements: any = {};

      let producerFilter = '';
      if (producerId) {
        producerFilter = 'AND p.id_user = :producerId';
        replacements.producerId = producerId;
      }

      let productFilter = '';
      if (productId) {
        productFilter = 'AND si.id_product = :productId';
        replacements.productId = productId;
      }

      const start = this.formatDate(startDate);
      const end = this.formatDate(endDate, true);

      const activeStart = this.formatDate(
        dateHelperTZ().subtract(30, 'days').format(),
      );

      const activeEnd = this.formatDate(
        dateHelperTZ().endOf('day').format(),
        true,
      );

      replacements.startDate = start;
      replacements.endDate = end;
      replacements.activeStart = activeStart;
      replacements.activeEnd = activeEnd;

      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      // 🧮 Contagem de novos creators (sem exigir vendas)
      const newCreatorsCountQuery = `
        SELECT 
          COUNT(DISTINCT cl.id_user) AS newCreatorsCount
        FROM ${this.creatorsOnboardingSubquery} cl
        WHERE 1=1
          AND cl.created_at BETWEEN :startDate AND :endDate;
      `;

      // 💰 Vendas, receita e creators ativos entre os novos
      const newCreatorsPerformanceQuery = `
        SELECT 
          COALESCE(COUNT(
            DISTINCT CASE 
              WHEN c.id_role = :affiliateRole
              THEN si.id
            END
          ), 0) AS newCreatorsSales,
          COALESCE(SUM(
                    CASE 
                      WHEN EXISTS (
                        SELECT 1
                        FROM commissions cx
                        WHERE cx.id_sale_item = si.id
                          AND cx.id_user = u.id
                          AND cx.id_role = :affiliateRole
                      )
                      THEN si.price_total
                      ELSE 0
                    END
                  ), 0) AS newCreatorsRevenue,
          COALESCE(COUNT(DISTINCT CASE 
            WHEN si.id_status = :paidStatus 
            AND si.paid_at BETWEEN :activeStart AND :activeEnd THEN c.id_user
          END), 0) AS newCreatorsActiveCount
        FROM ${this.creatorsOnboardingSubquery} cl
        LEFT JOIN users u ON u.id = cl.id_user
        LEFT JOIN commissions c ON c.id_user = u.id
        JOIN sales_items si ON si.id = c.id_sale_item
          AND si.id_status = :paidStatus
        LEFT JOIN products p ON p.id = si.id_product
        WHERE 1=1
          AND cl.created_at BETWEEN :startDate AND :endDate
          ${producerFilter}
          ${productFilter};
      `;

      const newCreatorsThatSoldQuery = `
          SELECT
            COUNT(DISTINCT cl.id_user) AS newCreatorsThatSoldCount
          FROM ${this.creatorsOnboardingSubquery} cl
          JOIN users u ON u.id = cl.id_user
          JOIN commissions c ON c.id_user = u.id
          JOIN sales_items si ON si.id = c.id_sale_item
          JOIN products p ON p.id = si.id_product
          WHERE si.id_status = :paidStatus
            AND cl.created_at BETWEEN :startDate AND :endDate
            AND EXISTS (
              SELECT 1
              FROM commissions cx
              WHERE cx.id_sale_item = si.id
                AND cx.id_user = u.id
                AND cx.id_role = :affiliateRole
            )
            ${producerFilter}
            ${productFilter};
        `;

      const [countResults, performanceResults, soldResults] = await Promise.all(
        [
          SalesItems.sequelize.query<{ newCreatorsCount: number }>(
            newCreatorsCountQuery,
            { type: QueryTypes.SELECT, raw: true, replacements },
          ),
          SalesItems.sequelize.query<{
            newCreatorsSales: number;
            newCreatorsRevenue: number;
            newCreatorsActiveCount: number;
          }>(newCreatorsPerformanceQuery, {
            type: QueryTypes.SELECT,
            raw: true,
            replacements,
          }),
          SalesItems.sequelize.query<{ newCreatorsThatSoldCount: number }>(
            newCreatorsThatSoldQuery,
            { type: QueryTypes.SELECT, raw: true, replacements },
          ),
        ],
      );

      const newCreatorsCount = parseInt(
        countResults?.[0]?.newCreatorsCount?.toString() || '0',
      );

      const newCreatorsThatSoldCount = parseInt(
        soldResults?.[0]?.newCreatorsThatSoldCount?.toString() || '0',
      );

      const newCreatorsMadeSale =
        newCreatorsCount > 0
          ? (newCreatorsThatSoldCount / newCreatorsCount) * 100
          : 0;

      return {
        newCreatorsCount: parseInt(
          countResults?.[0]?.newCreatorsCount?.toString() || '0',
        ),
        newCreatorsSales: parseInt(
          performanceResults?.[0]?.newCreatorsSales?.toString() || '0',
        ),
        newCreatorsRevenue: parseFloat(
          performanceResults?.[0]?.newCreatorsRevenue?.toString() || '0',
        ),
        newCreatorsActiveCount: parseInt(
          performanceResults?.[0]?.newCreatorsActiveCount?.toString() || '0',
        ),
        newCreatorsMadeSale,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar métricas de creators novos:', error);
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsRevenueStats({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsRevenueStatsParams = {}): Promise<CreatorsRevenueStats> {
    try {
      const replacements: any = {};
      let producerFilter = '';
      let productFilter = '';
      let dateFilter = '';

      if (producerId) {
        producerFilter = 'AND p.id_user = :producerId';
        replacements.producerId = producerId;
      }

      if (productId) {
        productFilter = 'AND si.id_product = :productId';
        replacements.productId = productId;
      }

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);

        replacements.startDate = start;
        replacements.endDate = end;
        dateFilter = 'AND si.paid_at BETWEEN :startDate AND :endDate';
      }

      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      const firstSaleDateCTE = `
        SELECT 
          c.id_user,
          MIN(si.paid_at) AS first_sale_at
        FROM commissions c
        JOIN sales_items si ON si.id = c.id_sale_item
        WHERE c.id_role = :affiliateRole
          AND si.id_status = :paidStatus
        GROUP BY c.id_user
      `;

      // ─── Query principal ────────────────────────────────────────────────
      const revenueQuery = `
        WITH first_sale_per_creator AS (${firstSaleDateCTE})
        SELECT 
          COUNT(DISTINCT fspc.id_user) AS firstSale,
          COALESCE(SUM(
                    CASE 
                      WHEN EXISTS (
                        SELECT 1
                        FROM commissions cx
                        WHERE cx.id_sale_item = si.id
                          AND cx.id_user = u.id
                          AND cx.id_role = :affiliateRole
                      )
                      THEN si.price_total
                      ELSE 0
                    END
                  ), 0) AS totalRevenue,
          COALESCE(COUNT(
            DISTINCT CASE 
              WHEN c.id_role = :affiliateRole
              THEN si.id
            END
          ), 0) AS totalSales,
          SUM(
            CASE 
              WHEN c.id_role = :affiliateRole
                AND c.id_status IN (:waitingStatus, :releasedStatus)
              THEN c.amount
              ELSE 0
            END
          ) AS totalCommission,
          COALESCE(SUM(
            CASE 
              WHEN EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
              THEN si.fee_total
              ELSE 0
            END
          ), 0) AS totalB4youFee
        FROM sales_items si
        JOIN commissions c ON c.id_sale_item = si.id
        JOIN users u ON u.id = c.id_user
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        JOIN first_sale_per_creator fspc ON fspc.id_user = u.id
        JOIN products p ON p.id = si.id_product
        WHERE si.id_status = :paidStatus
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          AND fspc.first_sale_at BETWEEN :startDate AND :endDate
          ${producerFilter}
          ${productFilter};
      `;

      const [revenueResults] = await SalesItems.sequelize.query<{
        totalRevenue: number;
        totalSales: number;
        totalCommission: number;
        totalB4youFee: number;
        firstSale: number;
      }>(revenueQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements,
      });

      const totalRevenue = parseFloat(
        revenueResults?.totalRevenue?.toString() || '0',
      );
      const totalSales = parseInt(
        revenueResults?.totalSales?.toString() || '0',
      );
      const totalCommission = parseFloat(
        revenueResults?.totalCommission?.toString() || '0',
      );
      const totalB4youFee = parseFloat(
        revenueResults?.totalB4youFee?.toString() || '0',
      );
      const firstSale = parseInt(revenueResults?.firstSale?.toString() || '0');
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

      return {
        totalRevenue,
        totalSales,
        totalCommission,
        totalB4youFee,
        averageTicket,
        firstSale,
      };
    } catch (error) {
      console.error(
        '❌ Erro ao buscar métricas de receita dos creators:',
        error,
      );
      throw error;
    }
  }

  /**
   * Regras de negócio (Creators):
   * - Creator é o usuário que possui ao menos 1 comissão como AFILIADO
   *   (status waiting ou released).
   * - Vendas como produtor, coprodutor, gerente ou fornecedor NÃO excluem o creator.
   * - Todas as métricas consideram APENAS vendas onde o usuário atuou como AFILIADO.
   */
  static async getCreatorsConversionStats({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsConversionStatsParams = {}): Promise<CreatorsConversionStats> {
    try {
      const replacements: any = {};
      let producerFilter = '';
      let productFilter = '';
      let dateFilterClicks = '';
      let dateFilterSales = '';

      if (producerId) {
        producerFilter = 'AND p.id_user = :producerId';
        replacements.producerId = producerId;
      }

      if (productId) {
        productFilter = 'AND si.id_product = :productId';
        replacements.productId = productId;
      }

      if (startDate && endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate, true);
        replacements.startDate = start;
        replacements.endDate = end;
        dateFilterClicks = 'AND ac.created_at BETWEEN :startDate AND :endDate';
        dateFilterSales = 'AND si.paid_at BETWEEN :startDate AND :endDate';
      }

      replacements.paidStatus = findSalesStatusByKey('paid').id;
      replacements.affiliateRole = findRoleTypeByKey('affiliate').id;
      replacements.producerRole = findRoleTypeByKey('producer').id;
      replacements.coproducerRole = findRoleTypeByKey('coproducer').id;
      replacements.managerRole = findRoleTypeByKey('manager').id;
      replacements.supplierRole = findRoleTypeByKey('supplier').id;
      replacements.waitingStatus = findCommissionsStatus('waiting').id;
      replacements.releasedStatus = findCommissionsStatus('released').id;

      // ─── Cliques de creators ────────────────────────────────────────────
      const clicksQuery = `
        SELECT 
          COALESCE(SUM(ac.click_amount), 0) AS totalClicks
        FROM affiliate_clicks ac
        JOIN affiliates af ON af.id = ac.id_affiliate
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = af.id_user
        WHERE 1=1
          ${dateFilterClicks};
      `;

      // ─── Vendas de creators ─────────────────────────────────────────────
      const salesQuery = `
        SELECT 
          COALESCE(COUNT(
            DISTINCT CASE 
              WHEN c.id_role = :affiliateRole
              THEN si.id
            END
          ), 0) AS totalSales
        FROM sales_items si
        JOIN commissions c ON c.id_sale_item = si.id
        JOIN users u ON u.id = c.id_user
        JOIN ${this.creatorsIdentificationSubquery} cl ON cl.id_user = u.id
        JOIN products p ON p.id = si.id_product
        WHERE si.id_status = :paidStatus
          AND EXISTS (
                SELECT 1
                FROM commissions cx
                WHERE cx.id_sale_item = si.id
                  AND cx.id_user = u.id
                  AND cx.id_role = :affiliateRole
              )
          ${dateFilterSales}
          ${producerFilter}
          ${productFilter};
      `;

      const [clicksResults, salesResults] = await Promise.all([
        SalesItems.sequelize.query<{ totalClicks: number }>(clicksQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
        SalesItems.sequelize.query<{ totalSales: number }>(salesQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements,
        }),
      ]);

      const totalClicks = parseInt(
        clicksResults?.[0]?.totalClicks?.toString() || '0',
      );
      const totalSales = parseInt(
        salesResults?.[0]?.totalSales?.toString() || '0',
      );

      const averageConversionRate =
        totalClicks > 0
          ? parseFloat(((totalSales / totalClicks) * 100).toFixed(2))
          : 0;

      return {
        totalClicks,
        averageConversionRate: Math.min(averageConversionRate, 100),
      };
    } catch (error) {
      console.error(
        '❌ Erro ao buscar métricas de conversão dos creators:',
        error,
      );
      throw error;
    }
  }
}
