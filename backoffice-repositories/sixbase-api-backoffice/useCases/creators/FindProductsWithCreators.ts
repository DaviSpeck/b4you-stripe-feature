import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  FindProductsWithCreatorsInput,
  FindProductsWithCreatorsResult,
} from '../../interfaces/creators.interface';

export default class FindProductsWithCreators {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({ 
    producerId = null, 
    startDate = null, 
    endDate = null 
  }: FindProductsWithCreatorsInput): Promise<FindProductsWithCreatorsResult> {
    try {
      const products = await this.creatorsRepository.findProductsWithCreators({
        producerId: producerId?.toString(),
        startDate,
        endDate,
      });

      return {
        rows: products,
        count: products.length,
      };
    } catch (error) {
      console.error('Erro ao buscar produtos com creators:', error);
      throw error;
    }
  }
}
