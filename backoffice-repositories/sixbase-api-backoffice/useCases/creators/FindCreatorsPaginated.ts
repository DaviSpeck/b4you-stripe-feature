import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  FindCreatorsPaginatedInput,
  FindCreatorsPaginatedResult,
  ProcessedCreator,
} from '../../interfaces/creators.interface';

export default class FindCreatorsPaginated {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({
    page = 0,
    size = 10,
    input = null,
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
    sortBy = 'ranking',
    sortOrder = 'asc',
    newOnly = 'false',
    origin = 'all',
    verified = 'all',
  }: FindCreatorsPaginatedInput): Promise<FindCreatorsPaginatedResult> {
    try {
      const creatorsData = await this.creatorsRepository.findCreatorsWithSales({
        page: parseInt(page.toString()),
        size: parseInt(size.toString()),
        input,
        startDate,
        endDate,
        producerId: producerId?.toString(),
        productId: productId?.toString(),
        sortBy,
        sortOrder,
        newOnly: String(newOnly).toLowerCase() === 'true',
        origin,
        verified
      });

      if (!creatorsData?.rows?.length) {
        console.warn('⚠️ Nenhum creator encontrado.');
        return { total: 0, count: 0, rows: [] };
      }

      const processedCreators: ProcessedCreator[] = creatorsData.rows.map((creator, index) => {
        const ranking = page * size + index + 1;

        const totalSalesValue = parseFloat(creator.totalSalesValue?.toString() || '0');
        const numberOfSales = parseInt(creator.numberOfSales?.toString() || '0');
        const clickAmount = parseInt(creator.totalClicks?.toString() || '0');

        const averageTicket =
          numberOfSales > 0
            ? parseFloat((totalSalesValue / numberOfSales).toFixed(2))
            : 0;

        const conversionRate =
          clickAmount > 0
            ? parseFloat(Math.min((numberOfSales / clickAmount) * 100, 100).toFixed(2))
            : 0;

        return {
          id: creator.id,
          uuid: creator.uuid,
          ranking,
          name: creator.name,
          avatar: creator.avatar || null,
          whatsapp: creator.whatsapp || null,
          totalSalesValue,
          totalCommission: parseFloat(creator.totalCommission?.toString() || '0'),
          b4youFee: parseFloat(creator.b4youFee?.toString() || '0'),
          numberOfSales,
          averageTicket,
          totalClicks: clickAmount,
          conversionRate,
        };
      });

      return {
        total: creatorsData.count,
        count: creatorsData.count,
        rows: processedCreators,
      };
    } catch (error) {
      console.error('❌ [FindCreatorsPaginated] Erro ao buscar creators paginados:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}