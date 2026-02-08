import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  FindProducersWithCreatorsInput,
  FindProducersWithCreatorsResult,
} from '../../interfaces/creators.interface';

export default class FindProducersWithCreators {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({ 
    startDate = null, 
    endDate = null 
  }: FindProducersWithCreatorsInput): Promise<FindProducersWithCreatorsResult> {
    try {
      const producers = await this.creatorsRepository.findProducersWithCreators({
        startDate,
        endDate,
      });

      return {
        rows: producers,
        count: producers.length,
      };
    } catch (error) {
      console.error('Erro ao buscar produtores com creators:', error);
      throw error;
    }
  }
}
