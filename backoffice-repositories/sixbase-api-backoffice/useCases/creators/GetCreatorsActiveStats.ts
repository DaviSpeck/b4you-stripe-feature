import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetCreatorsActiveStatsInput,
  CreatorsActiveStats,
} from '../../interfaces/creators.interface';

export default class GetCreatorsActiveStats {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsActiveStatsInput): Promise<CreatorsActiveStats> {
    try {
      const activeStats = await this.creatorsRepository.getCreatorsActiveStats({
        startDate,
        endDate,
        producerId: producerId?.toString(),
        productId: productId?.toString(),
      });

      return activeStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de creators ativos:', error);
      throw error;
    }
  }
}
