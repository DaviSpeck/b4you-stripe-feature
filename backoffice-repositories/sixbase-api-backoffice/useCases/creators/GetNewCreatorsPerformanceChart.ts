import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetNewCreatorsPerformanceChartInput,
  CreatorsChartData,
} from '../../interfaces/creators.interface';

export default class GetNewCreatorsPerformanceChart {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({
    startDate = null,
    endDate = null,
    period = 'day',
    producerId = null,
    productId = null,
  }: GetNewCreatorsPerformanceChartInput): Promise<CreatorsChartData[]> {
    try {
      const chartData = await this.creatorsRepository.getNewCreatorsPerformanceChart({
        startDate,
        endDate,
        period,
        producerId: producerId?.toString(),
        productId: productId?.toString(),
      });

      return chartData;
    } catch (error) {
      console.error(
        'Erro ao buscar dados do gráfico de performance (novos):',
        error,
      );
      throw error;
    }
  }
}
