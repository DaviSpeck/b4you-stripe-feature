import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetCreatorsRegisteredStatsInput,
  CreatorsRegisteredStats,
} from '../../interfaces/creators.interface';

export default class GetCreatorsRegisteredStats {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({
    startDate = null,
    endDate = null,
    producerId = null,
    productId = null,
  }: GetCreatorsRegisteredStatsInput): Promise<CreatorsRegisteredStats> {
    try {
      const registeredStats = await this.creatorsRepository.getCreatorsRegisteredStats({
        startDate,
        endDate,
        producerId: producerId?.toString(),
        productId: productId?.toString(),
      });

      return registeredStats;
    } catch (error) {
      console.error(
        'Erro ao buscar estatísticas de creators registrados:',
        error,
      );
      throw error;
    }
  }
}
