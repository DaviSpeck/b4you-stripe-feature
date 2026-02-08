import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetCreatorsNewStatsInput,
  CreatorsNewStats,
} from '../../interfaces/creators.interface';

export default class GetCreatorsNewStats {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsNewStatsInput): Promise<CreatorsNewStats> {
    try {
      const newStats = await this.creatorsRepository.getCreatorsNewStats({
        startDate,
        endDate,
        producerId: producerId?.toString(),
        productId: productId?.toString(),
      });

      return newStats;
    } catch (error) {
      console.error('Erro ao buscar métricas de creators novos:', error);
      throw error;
    }
  }
}
