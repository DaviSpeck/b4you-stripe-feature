export interface Creator {
  id: number;
  uuid: string;
  name: string;
  avatar?: string;
  whatsapp?: string;
  totalSalesValue: number;
  totalCommission: number;
  b4youFee: number;
  numberOfSales: number;
  conversionRate: number;
  averageTicket: number;
  totalClicks: number;
  ranking: number;
}

export interface CreatorChartData {
  name: string;
  faturamento: number;
  vendas: number;
  conversao: number;
}

export interface CreatorFilters {
  calendar: Date[];
  searchTerm: string;
  producerId: string;
  productId: string;
  sortBy:
    | 'totalSalesValue'
    | 'numberOfSales'
    | 'totalCommission'
    | 'conversionRate'
    | 'averageTicket';
  sortOrder: 'asc' | 'desc';
  origin: string;
  verified: string;
}

export interface CreatorSummary {
  totalCreatorsRegistered: number;
  totalCreatorsRegisteredAllTime: number;
  totalCreatorsActive: number;
  totalCreatorsActiveAllTime: number;
  percentageActiveCreatorsAllTime: number;
  newCreatorsCount: number;
  newCreatorsSales: number;
  newCreatorsRevenue: number;
  newCreatorsActiveCount: number;
  newCreatorsMadeSale: number;
  totalRevenue: number;
  totalSales: number;
  totalB4youFee: number;
  averageConversionRate: number;
  averageTicket: number;
  firstSale: number;
}

export interface PerformanceChartData {
  period: string;
  totalSales: number;
  totalRevenue: number;
  totalClicks: number;
  averageTicket: number;
}

export interface RegisteredStats {
  totalCreatorsRegistered: number;
  totalCreatorsRegisteredAllTime: number;
}

export interface ActiveStats {
  totalCreatorsActive: number;
}

export interface AllTimeStats {
  totalCreatorsRegisteredAllTime: number;
  totalCreatorsActiveAllTime: number;
  percentageActiveCreatorsAllTime: number;
}

export interface NewStats {
  newCreatorsCount: number;
  newCreatorsSales: number;
  newCreatorsRevenue: number;
  newCreatorsActiveCount: number;
  newCreatorsMadeSale: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalSales: number;
  totalB4youFee: number;
  averageTicket: number;
  firstSale: number;
}

export interface ConversionStats {
  totalClicks: number;
  averageConversionRate: number;
}

export interface ProducerOption {
  value: string;
  label: string;
}

export interface ProductOption {
  value: string;
  label: string;
}

export interface ApiProducer {
  id: string;
  full_name: string;
}

export interface ApiProduct {
  id: string;
  name: string;
}

export interface ApiResponse<T> {
  rows: T[];
}

export interface SeparateCreatorsData {
  registeredStats: RegisteredStats | null;
  activeStats: ActiveStats | null;
  allTimeStats: AllTimeStats | null;
  newStats: NewStats | null;
  revenueStats: RevenueStats | null;
  conversionStats: ConversionStats | null;
  performanceChart: PerformanceChartData[] | null;
  producers: ProducerOption[] | null;
  products: ProductOption[] | null;
}

export interface SeparateLoadingState {
  registeredStats: boolean;
  activeStats: boolean;
  allTimeStats: boolean;
  newStats: boolean;
  revenueStats: boolean;
  conversionStats: boolean;
  performanceChart: boolean;
  producers: boolean;
  products: boolean;
}

export interface CombinedCreatorsData {
  totalCreatorsRegistered: number;
  totalCreatorsRegisteredAllTime: number;
  totalCreatorsActive: number;
  totalCreatorsActiveAllTime: number;
  percentageActiveCreatorsAllTime: number;

  newCreatorsCount: number;
  newCreatorsSales: number;
  newCreatorsRevenue: number;
  newCreatorsActiveCount: number;
  newCreatorsMadeSale: number;

  totalRevenue: number;
  totalSales: number;
  totalB4youFee: number;
  averageTicket: number;
  firstSale: number;

  totalClicks: number;
  averageConversionRate: number;

  performanceChartData: PerformanceChartData[];

  producers: ProducerOption[];
  products: ProductOption[];
}
