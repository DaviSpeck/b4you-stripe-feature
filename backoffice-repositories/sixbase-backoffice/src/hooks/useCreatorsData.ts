import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import moment from 'moment';
import axios from 'axios';
import { api } from '../services/api';
import {
  Creator,
  CreatorFilters,
  CreatorSummary,
  RegisteredStats,
  ActiveStats,
  AllTimeStats,
  NewStats,
  RevenueStats,
  ConversionStats,
  ProducerOption,
  ProductOption,
  ApiProducer,
  ApiProduct,
  ApiResponse,
  SeparateCreatorsData,
  SeparateLoadingState,
  CombinedCreatorsData,
} from '../interfaces/creators.interface';

export const useCreatorsData = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
  });
  const [creatorsScope, setCreatorsScope] = useState<'all' | 'new'>('all');
  const [chartScope, setChartScope] = useState<'all' | 'new'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [separateData, setSeparateData] = useState<SeparateCreatorsData>({
    registeredStats: null,
    activeStats: null,
    allTimeStats: null,
    newStats: null,
    revenueStats: null,
    conversionStats: null,
    performanceChart: null,
    producers: null,
    products: null,
  });

  const [separateLoading, setSeparateLoading] = useState<SeparateLoadingState>({
    registeredStats: false,
    activeStats: false,
    allTimeStats: false,
    newStats: false,
    revenueStats: false,
    conversionStats: false,
    performanceChart: false,
    producers: false,
    products: false,
  });

  const [filters, setFilters] = useState<CreatorFilters>({
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
    searchTerm: '',
    producerId: '',
    productId: '',
    sortBy: 'totalSalesValue',
    sortOrder: 'desc',
    origin: 'all',
    verified: 'all',
  });

  const [showCreatorsKpis, setShowCreatorsKpis] = useState(false);
  const [seriesVisible, setSeriesVisible] = useState({
    faturamento: true,
    vendas: true,
    cliques: true,
    ticketMedio: true,
  });

  const creatorsAbortRef = useRef<AbortController | null>(null);
  const separateAbortRef = useRef<AbortController | null>(null);

  const fetchCreators = useCallback(
    async (showLoading = true, page = 0, size = 10) => {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        creatorsAbortRef.current?.abort();
        const controller = new AbortController();
        creatorsAbortRef.current = controller;

        const params = new URLSearchParams({
          page: String(page),
          size: String(size),
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          origin: filters.origin,
          verified: filters.verified,
        });

        const [startDate, endDate] = filters.calendar;
        if (startDate) params.append('startDate', moment(startDate).startOf('day').format('YYYY-MM-DD'));
        if (endDate) params.append('endDate', moment(endDate).endOf('day').format('YYYY-MM-DD'));
        if (filters.producerId) params.append('producerId', filters.producerId);
        if (filters.productId) params.append('productId', filters.productId);
        if (filters.searchTerm.trim()) params.append('input', filters.searchTerm.trim());
        if (creatorsScope === 'new') params.append('newOnly', 'true');

        const response = await api.get(`/creators?${params.toString()}`, { signal: controller.signal });
        const { rows = [], count = 0 } = response?.data || {};

        if (!rows?.length) {
          setCreators([]);
          setPagination(prev => ({
            ...prev,
            total: 0,
            page: page + 1,
            size,
          }));
          return;
        };

        setCreators(rows);
        setPagination(prev => ({
          ...prev,
          total: count,
          page: page + 1,
          size,
        }));
      } catch (err: any) {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
        console.error('❌ Erro ao buscar creators:', err);
        setError(err.response?.data?.message || 'Erro ao conectar com a API');
      } finally {
        if (showLoading) setLoading(false);
        creatorsAbortRef.current = null;
      }
    },
    [filters, creatorsScope],
  );

  const fetchSeparateCreatorsData = useCallback(async () => {
    try {
      setError(null);
      const [startDate, endDate] = filters.calendar;
      if (!startDate || !endDate) return;

      separateAbortRef.current?.abort();
      const controller = new AbortController();
      separateAbortRef.current = controller;

      const requestParams: Record<string, any> = {
        startDate: moment(startDate).startOf('day').format('YYYY-MM-DD'),
        endDate: moment(endDate).endOf('day').format('YYYY-MM-DD'),
      };
      if (filters.producerId) requestParams.producerId = filters.producerId;
      if (filters.productId) requestParams.productId = filters.productId;

      setSeparateLoading(prev => ({
        ...prev,
        registeredStats: true,
        activeStats: true,
        allTimeStats: true,
        newStats: true,
        revenueStats: true,
        conversionStats: true,
        performanceChart: true,
      }));

      const endpoints = {
        registeredStats: '/creators/summary/registered',
        activeStats: '/creators/summary/active',
        allTimeStats: '/creators/summary/all-time',
        newStats: '/creators/summary/new-creators',
        revenueStats: '/creators/summary/revenue',
        conversionStats: '/creators/summary/conversion',
      };

      await Promise.allSettled([
        ...Object.entries(endpoints).map(([key, url]) =>
          api
            .get(url, { params: requestParams, signal: controller.signal })
            .then(r => setSeparateData(p => ({ ...p, [key]: r.data })))
            .catch(() => null)
            .finally(() => setSeparateLoading(p => ({ ...p, [key]: false }))),
        ),

        api
          .get(
            chartScope === 'new'
              ? '/creators/performance-chart-new'
              : '/creators/performance-chart',
            { params: { ...requestParams, period: 'day' }, signal: controller.signal },
          )
          .then(r => setSeparateData(p => ({ ...p, performanceChart: r.data })))
          .catch(() => null)
          .finally(() => setSeparateLoading(p => ({ ...p, performanceChart: false }))),

        !separateData.producers?.length &&
        api
          .get<ApiResponse<ApiProducer>>('/creators/producers', {
            params: requestParams,
            signal: controller.signal,
          })
          .then(r =>
            setSeparateData(p => ({
              ...p,
              producers: [
                { value: '', label: 'Todos' },
                ...r.data.rows.map(x => ({ value: x.id, label: x.full_name })),
              ],
            })),
          )
          .catch(() => null)
          .finally(() => setSeparateLoading(p => ({ ...p, producers: false }))),

        !separateData.products?.length &&
        api
          .get<ApiResponse<ApiProduct>>('/creators/products', {
            params: requestParams,
            signal: controller.signal,
          })
          .then(r =>
            setSeparateData(p => ({
              ...p,
              products: [
                { value: '', label: 'Todos' },
                ...r.data.rows.map(x => ({ value: x.id, label: x.name })),
              ],
            })),
          )
          .catch(() => null)
          .finally(() => setSeparateLoading(p => ({ ...p, products: false }))),
      ].filter(Boolean));
    } catch (err: any) {
      if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
      console.error('Erro ao buscar dados de creators separados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    }
  }, [filters.calendar, filters.producerId, filters.productId, chartScope]);

  useEffect(() => {
    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      if (controller.signal.aborted) return;

      creatorsAbortRef.current?.abort();
      separateAbortRef.current?.abort();

      setPagination(p => ({ ...p, page: 1 }));

      try {
        await Promise.all([
          fetchCreators(true, 0, pagination.size),
          fetchSeparateCreatorsData(),
        ]);
      } catch (err) {
        console.error('❌ Erro ao atualizar dados de creators:', err);
      }
    }, 800);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
      creatorsAbortRef.current?.abort();
      separateAbortRef.current?.abort();
    };
  }, [filters, creatorsScope, pagination.size, chartScope]);

  useEffect(() => {
    return () => {
      creatorsAbortRef.current?.abort();
      separateAbortRef.current?.abort();
    };
  }, []);

  const combinedData = useMemo<CombinedCreatorsData | null>(() => {
    const {
      registeredStats,
      activeStats,
      allTimeStats,
      newStats,
      revenueStats,
      conversionStats,
      performanceChart,
      producers,
      products,
    } = separateData;

    if (
      !registeredStats &&
      !activeStats &&
      !revenueStats &&
      !conversionStats &&
      !allTimeStats &&
      !newStats
    )
      return null;

    return {
      totalCreatorsRegistered: registeredStats?.totalCreatorsRegistered ?? 0,
      totalCreatorsRegisteredAllTime:
        allTimeStats?.totalCreatorsRegisteredAllTime ?? 0,
      totalCreatorsActive: activeStats?.totalCreatorsActive ?? 0,
      totalCreatorsActiveAllTime: allTimeStats?.totalCreatorsActiveAllTime ?? 0,
      percentageActiveCreatorsAllTime: allTimeStats?.percentageActiveCreatorsAllTime ?? 0,
      newCreatorsCount: newStats?.newCreatorsCount ?? 0,
      newCreatorsSales: newStats?.newCreatorsSales ?? 0,
      newCreatorsRevenue: newStats?.newCreatorsRevenue ?? 0,
      newCreatorsActiveCount: newStats?.newCreatorsActiveCount ?? 0,
      newCreatorsMadeSale: newStats?.newCreatorsMadeSale ?? 0,
      totalRevenue: revenueStats?.totalRevenue ?? 0,
      totalSales: revenueStats?.totalSales ?? 0,
      firstSale: revenueStats?.firstSale ?? 0,
      totalB4youFee: revenueStats?.totalB4youFee ?? 0,
      averageTicket: revenueStats?.averageTicket ?? 0,
      totalClicks: conversionStats?.totalClicks ?? 0,
      averageConversionRate: conversionStats?.averageConversionRate ?? 0,
      performanceChartData: performanceChart ?? [],
      producers: producers ?? [],
      products: products ?? [],
    };
  }, [
    separateData.registeredStats,
    separateData.activeStats,
    separateData.allTimeStats,
    separateData.newStats,
    separateData.revenueStats,
    separateData.conversionStats,
    separateData.performanceChart,
    separateData.producers,
    separateData.products,
  ]);

  const summary: CreatorSummary = useMemo(
    () =>
      combinedData
        ? {
            totalCreatorsRegistered: combinedData.totalCreatorsRegistered,
            totalCreatorsRegisteredAllTime:
              combinedData.totalCreatorsRegisteredAllTime,
            totalCreatorsActive: combinedData.totalCreatorsActive,
            totalCreatorsActiveAllTime: combinedData.totalCreatorsActiveAllTime,
            percentageActiveCreatorsAllTime: combinedData.percentageActiveCreatorsAllTime ?? 0,
            newCreatorsCount: combinedData.newCreatorsCount,
            newCreatorsSales: combinedData.newCreatorsSales,
            newCreatorsRevenue: combinedData.newCreatorsRevenue,
            newCreatorsActiveCount: combinedData.newCreatorsActiveCount,
            newCreatorsMadeSale: combinedData.newCreatorsMadeSale,
            totalRevenue: combinedData.totalRevenue,
            totalSales: combinedData.totalSales,
            totalB4youFee: combinedData.totalB4youFee,
            averageConversionRate: combinedData.averageConversionRate,
            averageTicket: combinedData.averageTicket,
            firstSale: combinedData.firstSale,
          }
        : {
            totalCreatorsRegistered: 0,
            totalCreatorsRegisteredAllTime: 0,
            totalCreatorsActive: 0,
            totalCreatorsActiveAllTime: 0,
            percentageActiveCreatorsAllTime: 0,
            newCreatorsCount: 0,
            newCreatorsSales: 0,
            newCreatorsRevenue: 0,
            newCreatorsActiveCount: 0,
            newCreatorsMadeSale: 0,
            totalRevenue: 0,
            totalSales: 0,
            totalB4youFee: 0,
            averageConversionRate: 0,
            averageTicket: 0,
            firstSale: 0,
          },
    [combinedData],
  );

  return {
    creators,
    pagination,
    creatorsScope,
    setCreatorsScope,
    summary,
    performanceChartData: combinedData?.performanceChartData || [],
    chartScope,
    setChartScope,
    loading,
    loadingPerformanceChart: separateLoading.performanceChart,
    summaryLoading:
      separateLoading.registeredStats ||
      separateLoading.activeStats ||
      separateLoading.allTimeStats ||
      separateLoading.newStats ||
      separateLoading.revenueStats ||
      separateLoading.conversionStats,
    error,
    setError,
    filters,
    producers: combinedData?.producers || [],
    products: combinedData?.products || [],
    showCreatorsKpis,
    setShowCreatorsKpis,
    seriesVisible,
    // ✅ Retornos adicionados para compatibilidade com <Creators.tsx>
    basicStats: {
      totalCreatorsRegistered: combinedData?.totalCreatorsRegistered || 0,
      totalCreatorsRegisteredAllTime: combinedData?.totalCreatorsRegisteredAllTime || 0,
      totalCreatorsActive: combinedData?.totalCreatorsActive || 0,
      totalCreatorsActiveAllTime: combinedData?.totalCreatorsActiveAllTime || 0,
      percentageActiveCreatorsAllTime: combinedData?.percentageActiveCreatorsAllTime ?? 0,
      loading:
        separateLoading.registeredStats ||
        separateLoading.activeStats ||
        separateLoading.allTimeStats,
    },
    newCreatorsStats: {
      newCreatorsCount: combinedData?.newCreatorsCount || 0,
      newCreatorsSales: combinedData?.newCreatorsSales || 0,
      newCreatorsRevenue: combinedData?.newCreatorsRevenue || 0,
      newCreatorsActiveCount: combinedData?.newCreatorsActiveCount || 0,
      loading: separateLoading.newStats,
    },
    revenueStats: {
      totalRevenue: combinedData?.totalRevenue || 0,
      totalSales: combinedData?.totalSales || 0,
      totalB4youFee: combinedData?.totalB4youFee || 0,
      averageTicket: combinedData?.averageTicket || 0,
      loading: separateLoading.revenueStats,
    },
    conversionStats: {
      totalClicks: combinedData?.totalClicks || 0,
      averageConversionRate: combinedData?.averageConversionRate || 0,
      loading: separateLoading.conversionStats,
    },
    handleFiltersChange: (f: Partial<CreatorFilters>) => setFilters(p => ({ ...p, ...f })),
    handleDateChange: (dates: Date[]) => setFilters(p => ({ ...p, calendar: dates })),
    handleSearchChange: (s: string) => setFilters(p => ({ ...p, searchTerm: s })),
    handleOriginChange: (o: string) => setFilters(p => ({ ...p, origin: o })),
    handleVerifiedChange: (v: string) => {
      setFilters(p => ({ ...p, verified: v }));
    },
    handleSortChange: (s: CreatorFilters['sortBy'], o: CreatorFilters['sortOrder']) =>
      setFilters(p => ({ ...p, sortBy: s, sortOrder: o })),
    handleExportCSV: () => {
      const headers = [
        'Ranking',
        'Nome',
        'Renda Gerada (R$)',
        'Comissão (R$)',
        'B4You Recebeu (R$)',
        'Número de Vendas',
        'Conversão (%)',
        'Ticket Médio (R$)',
        'Cliques',
        'WhatsApp',
      ];
      const rows = creators.map(c => [
        c.ranking,
        c.name,
        c.totalSalesValue.toFixed(2),
        c.totalCommission.toFixed(2),
        (c.b4youFee || 0).toFixed(2),
        c.numberOfSales,
        c.conversionRate.toFixed(2),
        c.averageTicket.toFixed(2),
        c.totalClicks || 0,
        c.whatsapp || '',
      ]);
      const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `creators_${moment().format('YYYY-MM-DD')}.csv`;
      link.click();
    },
    toggleSeriesVisible: (key: keyof typeof seriesVisible) =>
      setSeriesVisible(p => ({ ...p, [key]: !p[key] })),
    fetchCreators,
    fetchSeparateCreatorsData,
  };
};