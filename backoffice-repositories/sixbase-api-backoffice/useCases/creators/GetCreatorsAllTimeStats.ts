import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetCreatorsAllTimeStatsInput,
  CreatorsAllTimeStats,
} from '../../interfaces/creators.interface';

export default class GetCreatorsAllTimeStats {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({ 
    producerId = null, 
    productId = null 
  }: GetCreatorsAllTimeStatsInput): Promise<CreatorsAllTimeStats> {
    try {
      const allTimeStats = await this.creatorsRepository.getCreatorsAllTimeStats({
        producerId: producerId?.toString(),
        productId: productId?.toString(),
      });

      return allTimeStats;
    } catch (error) {
      console.error(
        'Erro ao buscar estatísticas all-time dos creators:',
        error,
      );
      throw error;
    }
  }
}
