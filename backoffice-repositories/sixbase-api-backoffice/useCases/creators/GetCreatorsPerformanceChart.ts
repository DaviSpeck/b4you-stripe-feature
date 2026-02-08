import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetCreatorsPerformanceChartInput,
  CreatorsChartData,
} from '../../interfaces/creators.interface';

export default class GetCreatorsPerformanceChart {
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
  }: GetCreatorsPerformanceChartInput): Promise<CreatorsChartData[]> {
    try {
      const chartData = await this.creatorsRepository.getCreatorsPerformanceChart({
        startDate,
        endDate,
        period,
        producerId: producerId?.toString(),
        productId: productId?.toString(),
      });

      return chartData;
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico de performance:', error);
      throw error;
    }
  }
}
