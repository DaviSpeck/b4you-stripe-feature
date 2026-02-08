import { Request } from 'express';

export interface CreatorsQueryParams {
  page?: number;
  size?: number;
  input?: string;
  startDate?: string;
  endDate?: string;
  producerId?: number;
  productId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  newOnly?: string;
  [key: string]: any;
}

export interface CreatorsStatsQueryParams {
  startDate?: string;
  endDate?: string;
  producerId?: number;
  productId?: number;
  [key: string]: any;
}

export interface CreatorsChartQueryParams {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
  producerId?: number;
  productId?: number;
  [key: string]: any;
}

export interface ProducersWithCreatorsQueryParams {
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface ProductsWithCreatorsQueryParams {
  producerId?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface CreatorsRequest extends Request {
  query: CreatorsQueryParams;
}

export interface CreatorsStatsRequest extends Request {
  query: CreatorsStatsQueryParams;
}

export interface CreatorsChartRequest extends Request {
  query: CreatorsChartQueryParams;
}

export interface ProducersWithCreatorsRequest extends Request {
  query: ProducersWithCreatorsQueryParams;
}

export interface ProductsWithCreatorsRequest extends Request {
  query: ProductsWithCreatorsQueryParams;
}

export interface CreatorData {
  id: number;
  name: string;
  email: string;
  ranking?: number;
  revenue?: number;
  sales?: number;
  conversion?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatorsPaginatedResponse {
  data: CreatorData[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CreatorsChartResponse {
  data: ChartDataPoint[];
  period: string;
  total?: number;
}

export interface ProducerData {
  id: number;
  name: string;
  creatorsCount: number;
  totalRevenue?: number;
}

export interface ProductData {
  id: number;
  name: string;
  creatorsCount: number;
  totalRevenue?: number;
}

export interface KpiStats {
  totalCreators: number;
  activeCreators: number;
  newCreators: number;
  totalRevenue: number;
  averageRevenue: number;
  conversionRate: number;
}

export interface StatsResponse {
  value: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  period?: string;
}

export interface FindCreatorsPaginatedInput {
  page: number;
  size: number;
  input?: string;
  startDate?: string;
  endDate?: string;
  producerId?: number;
  productId?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  newOnly: string;
  origin: string;
  verified: string;
}

export interface GetCreatorsPerformanceChartInput {
  startDate?: string;
  endDate?: string;
  period: string;
  producerId?: number;
  productId?: number;
}

export interface GetNewCreatorsPerformanceChartInput {
  startDate?: string;
  endDate?: string;
  period: string;
  producerId?: number;
  productId?: number;
}

export interface FindProducersWithCreatorsInput {
  startDate?: string;
  endDate?: string;
}

export interface FindProductsWithCreatorsInput {
  producerId?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetCreatorsKpiStatsInput {
  startDate?: string;
  endDate?: string;
}

export interface GetCreatorsRegisteredStatsInput {
  startDate?: string;
  endDate?: string;
  producerId?: number;
  productId?: number;
}

export interface GetCreatorsActiveStatsInput {
  startDate?: string;
  endDate?: string;
  producerId?: number;
  productId?: number;
}

export interface GetCreatorsAllTimeStatsInput {
  producerId?: number;
  productId?: number;
}

export interface GetCreatorsNewStatsInput {
  startDate?: string;
  endDate?: string;
  producerId?: number;
  productId?: number;
}

export interface GetCreatorsRevenueStatsInput {
  startDate?: string;
  endDate?: string;
  producerId?: number;
  productId?: number;
}

export interface GetCreatorsConversionStatsInput {
  startDate?: string;
  endDate?: string;
  producerId?: number;
  productId?: number;
}

export interface ProducerWithCreators {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
}

export interface ProductWithCreators {
  id: number;
  uuid: string;
  name: string;
  producer_name: string;
}

export interface CreatorWithSales {
  id: number;
  uuid: string;
  name: string;
  avatar?: string;
  whatsapp?: string;
  numberOfSales: number;
  totalSalesValue: number;
  totalCommission: number;
  b4youFee: number;
  totalClicks: number;
  averageTicket: number;
  conversionRate: number;
}

export interface CreatorsWithSalesResult {
  rows: CreatorWithSales[];
  count: number;
}

export interface CreatorsSummary {
  totalCreatorsRegistered: number;
  totalCreatorsRegisteredAllTime: number;
  totalCreatorsActive: number;
  totalCreatorsActiveAllTime: number;
  newCreatorsCount: number;
  newCreatorsSales: number;
  newCreatorsRevenue: number;
  newCreatorsActiveCount: number;
  totalRevenue: number;
  totalSales: number;
  totalB4youFee: number;
  totalClicks: number;
  totalCommission: number;
  averageTicket: number;
  averageConversionRate: number;
}

export interface CreatorsKpiStats {
  totalRegistered: number;
  totalActive: number;
}

export interface CreatorsChartData {
  period: string;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  totalClicks: number;
  averageTicket: number;
}

export interface CreatorsRegisteredStats {
  totalCreatorsRegistered: number;
  totalCreatorsRegisteredAllTime: number;
}

export interface CreatorsActiveStats {
  totalCreatorsActive: number;
}

export interface CreatorsAllTimeStats {
  totalCreatorsRegisteredAllTime: number;
  totalCreatorsActiveAllTime: number;
  percentageActiveCreatorsAllTime: number;
}

export interface CreatorsNewStats {
  newCreatorsCount: number;
  newCreatorsSales: number;
  newCreatorsRevenue: number;
  newCreatorsActiveCount: number;
  newCreatorsMadeSale: number;
}

export interface CreatorsRevenueStats {
  totalRevenue: number;
  totalSales: number;
  totalB4youFee: number;
  totalCommission: number;
  averageTicket: number;
  firstSale: number;
}

export interface CreatorsConversionStats {
  totalClicks: number;
  averageConversionRate: number;
}

export interface FindProducersWithCreatorsParams {
  startDate?: string;
  endDate?: string;
}

export interface FindProductsWithCreatorsParams {
  producerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface FindCreatorsWithSalesParams {
  page?: number;
  size?: number;
  input?: string;
  startDate?: string;
  endDate?: string;
  producerId?: string;
  productId?: string;
  sortBy?: string;
  sortOrder?: string;
  newOnly?: boolean;
  origin?: string;
  verified?: string;
}

export interface GetCreatorsSummaryParams {
  startDate?: string;
  endDate?: string;
  producerId?: string;
  productId?: string;
}

export interface GetCreatorsKpiStatsParams {
  startDate?: string;
  endDate?: string;
}

export interface GetCreatorsPerformanceChartParams {
  startDate?: string;
  endDate?: string;
  period?: string;
  producerId?: string;
  productId?: string;
}

export interface GetNewCreatorsPerformanceChartParams {
  startDate?: string;
  endDate?: string;
  period?: string;
  producerId?: string;
  productId?: string;
}

export interface GetCreatorsRegisteredStatsParams {
  startDate?: string;
  endDate?: string;
  producerId?: string;
  productId?: string;
}

export interface GetCreatorsActiveStatsParams {
  startDate?: string;
  endDate?: string;
  producerId?: string;
  productId?: string;
}

export interface GetCreatorsAllTimeStatsParams {
  producerId?: string;
  productId?: string;
}

export interface GetCreatorsNewStatsParams {
  startDate?: string;
  endDate?: string;
  producerId?: string;
  productId?: string;
}

export interface GetCreatorsRevenueStatsParams {
  startDate?: string;
  endDate?: string;
  producerId?: string;
  productId?: string;
}

export interface GetCreatorsConversionStatsParams {
  startDate?: string;
  endDate?: string;
  producerId?: string;
  productId?: string;
}

export interface ProcessedCreator {
  id: number;
  uuid: string;
  ranking: number;
  name: string;
  avatar: string | null;
  whatsapp: string | null;
  totalSalesValue: number;
  totalCommission: number;
  b4youFee: number;
  numberOfSales: number;
  averageTicket: number;
  totalClicks: number;
  conversionRate: number;
}

export interface FindCreatorsPaginatedResult {
  total: number;
  count: number;
  rows: ProcessedCreator[];
}

export interface FindProducersWithCreatorsResult {
  rows: ProducerWithCreators[];
  count: number;
}

export interface FindProductsWithCreatorsResult {
  rows: ProductWithCreators[];
  count: number;
}
