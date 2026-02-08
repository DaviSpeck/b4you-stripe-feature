import CreatorsRepository from '../../repositories/sequelize/CreatorsRepository';
import {
  GetCreatorsKpiStatsInput,
  CreatorsKpiStats,
} from '../../interfaces/creators.interface';

export default class GetCreatorsKpiStats {
  private creatorsRepository: typeof CreatorsRepository;

  constructor() {
    this.creatorsRepository = CreatorsRepository;
  }

  async execute({ 
    startDate = null, 
    endDate = null 
  }: GetCreatorsKpiStatsInput): Promise<CreatorsKpiStats> {
    try {
      const kpiStats = await this.creatorsRepository.getCreatorsKpiStats({
        startDate,
        endDate,
      });

      return kpiStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de KPI dos creators:', error);
      throw error;
    }
  }
}
