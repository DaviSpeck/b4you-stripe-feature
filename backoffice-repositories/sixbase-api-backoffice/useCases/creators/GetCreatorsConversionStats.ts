import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetCreatorsConversionStatsInput,
  CreatorsConversionStats,
} from '../../interfaces/creators.interface';

export default class GetCreatorsConversionStats {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsConversionStatsInput): Promise<CreatorsConversionStats> {
    try {
      const conversionStats = await this.creatorsRepository.getCreatorsConversionStats({
        startDate,
        endDate,
        producerId: producerId?.toString(),
        productId: productId?.toString(),
      });

      return conversionStats;
    } catch (error) {
      console.error(
        'Erro ao buscar métricas de conversão dos creators:',
        error,
      );
      throw error;
    }
  }
}
