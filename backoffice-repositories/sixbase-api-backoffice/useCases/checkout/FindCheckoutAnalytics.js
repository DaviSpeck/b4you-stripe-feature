const ApiError = require('../../error/ApiError');
const SalesItemsRepository = require('../../repositories/sequelize/SalesItemsRepository');
const GetAgentStats = require('./GetAgentStats');
const CalculateSalesByPaymentMethod = require('./CalculateSalesByPaymentMethod');
const CalculateConversionRates = require('./CalculateConversionRates');
const CalculateCommissionsByRole = require('./CalculateCommissionsByRole');
const CalculateSalesByStatus = require('./CalculateSalesByStatus');
const CalculateSalesBySeller = require('./CalculateSalesBySeller');
const CalculateSalesByProduct = require('./CalculateSalesByProduct');
const CalculateTotalFeeB4you = require('./CalculateTotalFeeB4you');
const CheckoutFilters = require('../../utils/checkoutFilters');

module.exports = class FindCheckoutAnalytics {
  constructor(SalesItemsRepository) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute({
    start_date,
    end_date,
    payment_method = 'all',
    input,
    statuses,
    region,
    state,
    id_product,
    id_user,
  }) {
    try {
      const statusFilter =
        Array.isArray(statuses) && statuses.length > 0
          ? statuses.map(Number)
          : [1, 2, 3, 4, 5, 6, 7, 8];

      const normalizedProductId = id_product ? Number(id_product) : input ? Number(input) : undefined;
      const normalizedUserId = id_user ? Number(id_user) : undefined;

      const {
        totalItems,
        totalSalesPrice,
        stateCounts,
        regionCounts,
      } = await this.SalesItemsRepository.findAllSalesItemsForStats({
        start_date,
        end_date,
        id_status: statusFilter,
        payment_method,
        input,
        region,
        state,
        id_product: normalizedProductId,
        id_user: normalizedUserId,
      });

      const getAgentStats = new GetAgentStats(this.SalesItemsRepository);
      const calculateSalesByPaymentMethod = new CalculateSalesByPaymentMethod(this.SalesItemsRepository);
      const calculateConversionRates = new CalculateConversionRates(this.SalesItemsRepository);
      const calculateCommissionsByRole = new CalculateCommissionsByRole(this.SalesItemsRepository);
      const calculateSalesByStatus = new CalculateSalesByStatus(this.SalesItemsRepository);
      const calculateSalesBySeller = new CalculateSalesBySeller(this.SalesItemsRepository);
      const calculateSalesByProduct = new CalculateSalesByProduct(this.SalesItemsRepository);
      const calculateTotalFeeB4you = new CalculateTotalFeeB4you(this.SalesItemsRepository);

      const baseWhere = {
        ...(payment_method !== 'all' ? { payment_method } : {}),
        ...(normalizedProductId ? { id_product: normalizedProductId } : {}),
        ...(statusFilter?.length ? { id_status: statusFilter } : {}),
        start_date,
        end_date,
      };

      const baseSaleWhere = {
        ...(normalizedUserId ? { id_user: normalizedUserId } : {}),
        ...(state ? { state_generated: state } : {}),
        ...(region ? { region } : {}),
      };

      const [
        commissionsByRole,
        salesByStatus,
        totalSalesBySeller,
        totalSalesByProduct,
        agentStatus,
        salesByPayment,
        totalFeeB4you,
      ] = await Promise.all([
        calculateCommissionsByRole.execute({ where: baseWhere, saleWhere: baseSaleWhere }),
        calculateSalesByStatus.execute({ where: baseWhere, saleWhere: baseSaleWhere }),
        calculateSalesBySeller.execute({ where: baseWhere, saleWhere: baseSaleWhere }),
        calculateSalesByProduct.execute({ where: baseWhere, saleWhere: baseSaleWhere }),
        getAgentStats.execute({ where: baseWhere, saleWhere: baseSaleWhere }),
        calculateSalesByPaymentMethod.execute({ where: baseWhere, saleWhere: baseSaleWhere }),
        calculateTotalFeeB4you.execute({ where: baseWhere, saleWhere: baseSaleWhere }),
      ]);

      const conversionRates = await calculateConversionRates.execute({
        where: {
          ...baseWhere,
          id_status: undefined,
        },
        saleWhere: baseSaleWhere,
      });

      return {
        totalItems,
        totalSalesPrice: Number(totalSalesPrice.toFixed(2)),
        totalFeeB4you: Number(totalFeeB4you.total.toFixed(2)),
        commissionsByRole,
        ...salesByPayment,
        conversionRates,
        stateCounts,
        regionCounts,
        salesByStatus,
        agentStatus,
        totalSalesBySeller,
        totalSalesByProduct,
      };
    } catch (error) {
      throw ApiError.internalservererror(
        'Erro ao buscar dados de checkout analytics',
        error,
      );
    }
  }
};