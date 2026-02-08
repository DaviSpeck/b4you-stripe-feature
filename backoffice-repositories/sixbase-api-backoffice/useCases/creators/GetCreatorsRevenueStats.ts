import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetCreatorsRevenueStatsInput,
  CreatorsRevenueStats,
} from '../../interfaces/creators.interface';

export default class GetCreatorsRevenueStats {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsRevenueStatsInput): Promise<CreatorsRevenueStats> {
    try {
      const revenueStats = await this.creatorsRepository.getCreatorsRevenueStats({
        startDate,
        endDate,
        producerId: producerId?.toString(),
        productId: productId?.toString(),
      });

      return revenueStats;
    } catch (error) {
      console.error('Erro ao buscar métricas de receita dos creators:', error);
      throw error;
    }
  }
}
