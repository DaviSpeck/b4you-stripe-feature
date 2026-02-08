import { FC, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { CardText, Button } from 'reactstrap';
import moment from 'moment';
import { InputActionMeta } from 'react-select';
import { api } from '../../../services/api';
import { FormatBRL, downloadFromResponse } from '../../../utility/Utils';
import {
  DateRange,
  ChartDatum,
  FilterOption,
  Summary,
} from '../../../interfaces/analytics.interface';
import {
  SeparateAnalyticsData,
  SeparateLoadingState,
  CombinedAnalyticsData,
} from '../../../interfaces/analytics.interface';
import FiltersSection from '../../../components/FiltersSection';
import SummaryTables from '../../../components/SummaryTables';
import ChartsSection from '../../../components/ChartsSection';
import { stateToRegion, statusMapping } from '../../../mocks';
import { DeviceLevel } from '../../../interfaces/enums/types-devices.enum';

const DashboardTab: FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = moment();
    const startOfMonth = moment().startOf('month');

    return {
      start: startOfMonth.format('YYYY-MM-DD'),
      end: now.format('YYYY-MM-DD'),
    };
  });

  const [calendar, setCalendar] = useState<Date[]>(() => [
    moment().startOf('month').toDate(),
    moment().toDate(),
  ]);

  const [selectedOptions, setSelectedOptions] = useState<Array<FilterOption>>(
    [],
  );

  const [selectedRegion, setSelectedRegion] = useState<FilterOption | null>(
    null,
  );
  const [selectedState, setSelectedState] = useState<FilterOption | null>(null);
  const [selectedProductFilter, setSelectedProductFilter] =
    useState<FilterOption | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<FilterOption | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);

  const [separateData, setSeparateData] = useState<SeparateAnalyticsData>({
    paymentMethod: null,
    status: null,
    region: null,
    state: null,
    seller: null,
    product: null,
    origin: null,
    calculations: null,
  });

  const [separateLoading, setSeparateLoading] = useState<SeparateLoadingState>({
    paymentMethod: false,
    status: false,
    region: false,
    state: false,
    seller: false,
    product: false,
    origin: false,
    calculations: false,
  });
  const [stateOptions, setStateOptions] = useState<Array<FilterOption>>([]);
  const [productOptions, setProductOptions] = useState<Array<FilterOption>>([]);
  const [productSearchResults, setProductSearchResults] = useState<
    Array<FilterOption>
  >([]);
  const [isProductSearching, setIsProductSearching] = useState<boolean>(false);
  const [sellerOptions, setSellerOptions] = useState<Array<FilterOption>>([]);
  const [sellerSearchTerm, setSellerSearchTerm] = useState<string>('');
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [debouncedSellerTerm, setDebouncedSellerTerm] = useState<string>('');
  const [debouncedProductTerm, setDebouncedProductTerm] = useState<string>('');

  const sellerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const productTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [deviceLevel, setDeviceLevel] = useState<DeviceLevel>(
    DeviceLevel.DEVICE,
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (sellerTimeoutRef.current) {
      clearTimeout(sellerTimeoutRef.current);
    }
    sellerTimeoutRef.current = setTimeout(() => {
      setDebouncedSellerTerm(sellerSearchTerm);
    }, 500);

    return () => {
      if (sellerTimeoutRef.current) {
        clearTimeout(sellerTimeoutRef.current);
      }
    };
  }, [sellerSearchTerm]);

  useEffect(() => {
    if (productTimeoutRef.current) {
      clearTimeout(productTimeoutRef.current);
    }
    productTimeoutRef.current = setTimeout(() => {
      setDebouncedProductTerm(productSearchTerm);
    }, 500);

    return () => {
      if (productTimeoutRef.current) {
        clearTimeout(productTimeoutRef.current);
      }
    };
  }, [productSearchTerm]);

  const normalizeSearch = useCallback((value: string) => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }, []);

  const filteredSellerOptions = useMemo(() => {
    if (!debouncedSellerTerm.trim()) return sellerOptions.slice(0, 10);
    const normalizedSearch = normalizeSearch(debouncedSellerTerm);
    return sellerOptions.filter((option) =>
      normalizeSearch(option.label).includes(normalizedSearch),
    );
  }, [normalizeSearch, sellerOptions, debouncedSellerTerm]);

  const fetchProductSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setProductSearchResults([]);
        setIsProductSearching(false);
        return;
      }

      try {
        setIsProductSearching(true);

        const normalizedSearch = normalizeSearch(searchTerm);
        const localMatches = productOptions.filter((option) =>
          normalizeSearch(option.label).includes(normalizedSearch),
        );

        if (localMatches.length > 0) {
          setProductSearchResults(localMatches);
          setIsProductSearching(false);
          return;
        }

        const requestData = {
          start_date: dateRange.start,
          end_date: dateRange.end,
          payment_method: 'all',
          statuses:
            selectedOptions.length > 0
              ? selectedOptions.map((opt) => opt.value)
              : undefined,
          region: selectedRegion?.value,
          state: selectedState?.value,
          id_user: selectedSeller?.value,
          search_term: searchTerm,
          limit: 20,
        };

        const response = await api.post(
          '/checkout/analytics/product-search',
          requestData,
        );
        const searchData = response.data;

        const searchResults = Object.entries(searchData).map(
          ([id, data]: any) => ({
            value: id,
            label: data.product_name,
            count: data.total_count,
          }),
        );

        setProductSearchResults(searchResults);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setProductSearchResults([]);
      } finally {
        setIsProductSearching(false);
      }
    },
    [
      dateRange.start,
      dateRange.end,
      normalizeSearch,
      productOptions,
      selectedOptions,
      selectedRegion?.value,
      selectedSeller?.value,
      selectedState?.value,
    ],
  );

  const filteredProductOptions = useMemo(() => {
    if (!debouncedProductTerm.trim()) return productOptions.slice(0, 10);

    if (isProductSearching && productSearchResults.length > 0) {
      return productSearchResults;
    }

    const normalizedSearch = normalizeSearch(debouncedProductTerm);
    return productOptions.filter((option) =>
      normalizeSearch(option.label).includes(normalizedSearch),
    );
  }, [
    productOptions,
    debouncedProductTerm,
    isProductSearching,
    productSearchResults,
    normalizeSearch,
  ]);

  useEffect(() => {
    if (debouncedProductTerm.trim()) {
      const normalizedSearch = normalizeSearch(debouncedProductTerm);
      const hasLocalMatches = productOptions.some((option) =>
        normalizeSearch(option.label).includes(normalizedSearch),
      );

      if (hasLocalMatches) {
        fetchProductSearch(debouncedProductTerm);
      } else {
        const timeoutId = setTimeout(() => {
          fetchProductSearch(debouncedProductTerm);
        }, 300); 

        return () => clearTimeout(timeoutId);
      }
    } else {
      setProductSearchResults([]);
      setIsProductSearching(false);
    }
  }, [debouncedProductTerm, fetchProductSearch, normalizeSearch, productOptions]);

  const fetchSeparateAnalyticsData = useCallback(async () => {
    try {
      setError(null);

      const hasBothDates = Boolean(calendar?.[0] && calendar?.[1]);
      if (!hasBothDates) {
        return;
      }

      const requestData = {
        start_date: dateRange.start,
        end_date: dateRange.end,
        payment_method: 'all',
        input: undefined,
        statuses:
          selectedOptions.length > 0
            ? selectedOptions.map((opt) => opt.value)
            : undefined,
        region: selectedRegion?.value,
        state: selectedState?.value,
        id_product: selectedProductFilter?.value,
        id_user: selectedSeller?.value,
      };

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const signal = controller.signal;

      setSeparateLoading({
        paymentMethod: true,
        status: true,
        region: true,
        state: true,
        seller: true,
        product: true,
        origin: true,
        calculations: true,
      });

      // Atualiza cada endpoint conforme termina, sem esperar todos
      const paymentMethodPromise = api.post('/checkout/analytics/payment-method', requestData, { signal })
        .then(response => {
          setSeparateData(prev => ({ ...prev, paymentMethod: response.data }));
          setSeparateLoading(prev => ({ ...prev, paymentMethod: false }));
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
            console.warn('Erro no endpoint payment-method:', err);
          }
          setSeparateLoading(prev => ({ ...prev, paymentMethod: false }));
        });

      const statusPromise = api.post('/checkout/analytics/status', requestData, { signal })
        .then(response => {
          setSeparateData(prev => ({ ...prev, status: response.data }));
          setSeparateLoading(prev => ({ ...prev, status: false }));
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
            console.warn('Erro no endpoint status:', err);
          }
          setSeparateLoading(prev => ({ ...prev, status: false }));
        });

      const regionPromise = api.post('/checkout/analytics/region', requestData, { signal })
        .then(response => {
          setSeparateData(prev => ({ ...prev, region: response.data }));
          setSeparateLoading(prev => ({ ...prev, region: false }));
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
            console.warn('Erro no endpoint region:', err);
          }
          setSeparateLoading(prev => ({ ...prev, region: false }));
        });

      const statePromise = api.post('/checkout/analytics/state', requestData, { signal })
        .then(response => {
          setSeparateData(prev => ({ ...prev, state: response.data }));
          setSeparateLoading(prev => ({ ...prev, state: false }));
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
            console.warn('Erro no endpoint state:', err);
          }
          setSeparateLoading(prev => ({ ...prev, state: false }));
        });

      const sellerPromise = api.post('/checkout/analytics/seller', requestData, { signal })
        .then(response => {
          setSeparateData(prev => ({ ...prev, seller: response.data }));
          setSeparateLoading(prev => ({ ...prev, seller: false }));
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
            console.warn('Erro no endpoint seller:', err);
          }
          setSeparateLoading(prev => ({ ...prev, seller: false }));
        });

      const productPromise = api.post('/checkout/analytics/product', requestData, { signal })
        .then(response => {
          setSeparateData(prev => ({ ...prev, product: response.data }));
          setSeparateLoading(prev => ({ ...prev, product: false }));
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
            console.warn('Erro no endpoint product:', err);
          }
          setSeparateLoading(prev => ({ ...prev, product: false }));
        });

      const originPromise = api.post('/checkout/analytics/origin', requestData, { signal })
        .then(response => {
          setSeparateData(prev => ({ ...prev, origin: response.data }));
          setSeparateLoading(prev => ({ ...prev, origin: false }));
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
            console.warn('Erro no endpoint origin:', err);
          }
          setSeparateLoading(prev => ({ ...prev, origin: false }));
        });

      const calculationsPromise = api.post('/checkout/analytics/calculations', requestData, { signal })
        .then(response => {
          setSeparateData(prev => ({ ...prev, calculations: response.data }));
          setSeparateLoading(prev => ({ ...prev, calculations: false }));
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
            console.warn('Erro no endpoint calculations:', err);
          }
          setSeparateLoading(prev => ({ ...prev, calculations: false }));
        });

      // Espera todas terminarem apenas para o finally
      await Promise.allSettled([
        paymentMethodPromise,
        statusPromise,
        regionPromise,
        statePromise,
        sellerPromise,
        productPromise,
        originPromise,
        calculationsPromise,
      ]);
    } catch (err) {
      if (
        (err as any)?.name === 'CanceledError' ||
        (err as any)?.code === 'ERR_CANCELED'
      ) {
        // Reset all loading states on cancel
        setSeparateLoading({
          paymentMethod: false,
          status: false,
          region: false,
          state: false,
          seller: false,
          product: false,
          origin: false,
          calculations: false,
        });
        return;
      }
      console.error('Erro ao buscar dados de analytics separados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
      // Reset all loading states on error
      setSeparateLoading({
        paymentMethod: false,
        status: false,
        region: false,
        state: false,
        seller: false,
        product: false,
        origin: false,
        calculations: false,
      });
    }
  }, [
    dateRange.start,
    dateRange.end,
    selectedOptions,
    selectedRegion?.value,
    selectedState?.value,
    selectedProductFilter?.value,
    selectedSeller?.value,
  ]);

  const combineSeparateData = useCallback((): CombinedAnalyticsData | null => {
    // Verifica se tem dados relevantes para renderização (ignora product e seller que são só filtros)
    const hasRelevantData = 
      separateData.paymentMethod !== null ||
      separateData.status !== null ||
      separateData.region !== null ||
      separateData.state !== null ||
      separateData.origin !== null ||
      separateData.calculations !== null;

    if (!hasRelevantData) {
      return null;
    }

    const combinedResult: CombinedAnalyticsData = {
      totalItems: separateData.paymentMethod?.totalItems || 0,
      totalSalesPrice: separateData.paymentMethod?.totalSalesPrice || 0,
      salesMethodsCount: separateData.paymentMethod?.salesMethodsCount || {},
      salesMethodsCountSimple:
        separateData.paymentMethod?.salesMethodsCountSimple || {},

      salesByStatus: separateData.status || {},

      regionCounts: separateData.region?.regionCounts || {},

      stateCounts: separateData.state?.stateCounts || {},

      totalFeeB4you: separateData.calculations?.totalFeeB4you || 0,
      commissionsByRole: separateData.calculations?.commissionsByRole || {},
      conversionRates: separateData.calculations?.conversionRates || {
        byMethod: {},
      },
      agentStatus: separateData.calculations?.agentStatus || {
        devices: {},
        browsers: {},
        os: {},
        origins: {},
      },

      totalSalesBySeller: separateData.seller || {},
      totalSalesByProduct: separateData.product || {},
    };

    return combinedResult;
  }, [separateData]);

  const combinedData = combineSeparateData();

  const apiCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastApiCallParamsRef = useRef<string>('');

  useEffect(() => {
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }

    const currentParamsKey = JSON.stringify({
      start_date: dateRange.start,
      end_date: dateRange.end,
      selectedOptions: selectedOptions.map((opt) => opt.value),
      region: selectedRegion?.value,
      state: selectedState?.value,
      product: selectedProductFilter?.value,
      seller: selectedSeller?.value,
    });

    if (currentParamsKey === lastApiCallParamsRef.current) {
      return;
    }

    lastApiCallParamsRef.current = currentParamsKey;

    apiCallTimeoutRef.current = setTimeout(() => {
      fetchSeparateAnalyticsData();
    }, 100);

    return () => {
      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
      }
    };
  }, [
    fetchSeparateAnalyticsData,
    dateRange.start,
    dateRange.end,
    selectedOptions,
    selectedRegion?.value,
    selectedState?.value,
    selectedProductFilter?.value,
    selectedSeller?.value,
  ]);

  useEffect(() => {
    setSelectedState(null);
  }, [selectedRegion]);

  const currentApiData = combinedData;

  // Só considera loading dos dados que afetam a renderização das tabelas e gráficos
  // product e seller são apenas para filtros, não bloqueiam a UI
  const isLoadingVisibleData = 
    separateLoading.paymentMethod ||
    separateLoading.status ||
    separateLoading.region ||
    separateLoading.state ||
    separateLoading.origin ||
    separateLoading.calculations;

  const summary = useMemo((): Summary => {
    if (!currentApiData) {
      return {
        totalVendas: 0,
        totalFaturamento: 0,
        b4youRecebeu: 0,
        taxaConversaoPix: 0,
        taxaConversaoCartao: 0,
        taxaConversaoBoleto: 0,
        commissionsReal: {
          producer: 0,
          coproducer: 0,
          affiliate: 0,
          supplier: 0,
        },
      };
    }

    const totalVendas = currentApiData.totalItems || 0;
    const totalFaturamento = currentApiData.totalSalesPrice || 0;

    const taxaConversaoPix = parseFloat(
      currentApiData.conversionRates?.byMethod?.pix || '0',
    );
    const taxaConversaoCartao = parseFloat(
      currentApiData.conversionRates?.byMethod?.card || '0',
    );
    const taxaConversaoBoleto = parseFloat(
      currentApiData.conversionRates?.byMethod?.billet || '0',
    );

    const b4youRecebeu = currentApiData.totalFeeB4you || 0;
    const commissionsReal = {
      producer: currentApiData.commissionsByRole?.producer?.total || 0,
      coproducer: currentApiData.commissionsByRole?.coproducer?.total || 0,
      affiliate: currentApiData.commissionsByRole?.affiliate?.total || 0,
      supplier: currentApiData.commissionsByRole?.supplier?.total || 0,
    };

    return {
      totalVendas,
      totalFaturamento,
      b4youRecebeu,
      taxaConversaoPix,
      taxaConversaoCartao,
      taxaConversaoBoleto,
      commissionsReal,
    };
  }, [currentApiData]);

  const updateOptionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedDataRef = useRef<string>('');

  const updateOptionsSafely = useCallback(
    (newCurrentApiData: CombinedAnalyticsData | null) => {
      if (updateOptionsTimeoutRef.current) {
        clearTimeout(updateOptionsTimeoutRef.current);
      }

      const currentDataKey = JSON.stringify({
        sellers: newCurrentApiData?.totalSalesBySeller || {},
        products: newCurrentApiData?.totalSalesByProduct || {},
      });

      if (currentDataKey === lastProcessedDataRef.current) {
        return;
      }

      lastProcessedDataRef.current = currentDataKey;

      updateOptionsTimeoutRef.current = setTimeout(() => {
        try {
          if (newCurrentApiData?.totalSalesBySeller) {
            const sellers = Object.entries(
              newCurrentApiData.totalSalesBySeller,
            ).map(([id, data]: any) => ({
              value: id,
              label: data.user_name,
              count: data.total_count,
            }));
            setSellerOptions((prevOptions) => {
              const prevKey = JSON.stringify(prevOptions);
              const newKey = JSON.stringify(sellers);
              return prevKey === newKey ? prevOptions : sellers;
            });
          } else {
            setSellerOptions([]);
          }

          if (newCurrentApiData?.totalSalesByProduct) {
            const products = Object.entries(
              newCurrentApiData.totalSalesByProduct,
            ).map(([id, data]: any) => ({
              value: id,
              label: data.product_name,
              count: data.total_count,
            }));
            setProductOptions((prevOptions) => {
              const prevKey = JSON.stringify(prevOptions);
              const newKey = JSON.stringify(products);
              return prevKey === newKey ? prevOptions : products;
            });
          } else {
            setProductOptions([]);
          }
        } catch (error) {
          console.error('Erro ao atualizar opções:', error);
        } finally {
          updateOptionsTimeoutRef.current = null;
        }
      }, 50);
    },
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateOptionsSafely(currentApiData);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentApiData]);

  useEffect(() => {
    return () => {
      if (updateOptionsTimeoutRef.current) {
        clearTimeout(updateOptionsTimeoutRef.current);
      }

      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const baseStateOptions = useMemo(() => {
    const counts = currentApiData?.stateCounts || {};
    return Object.keys(counts)
      .filter((uf) => uf && uf.toUpperCase() !== 'INDEFINIDO')
      .map((uf) => ({
        value: uf,
        label: `${uf} (${counts[uf]?.total ?? 0})`,
        count: counts[uf]?.total ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [currentApiData?.stateCounts]);

  const filteredStatesByRegion = useMemo(() => {
    if (!selectedRegion?.value) return baseStateOptions;
    const region = selectedRegion.value;
    return baseStateOptions.filter(
      (opt) => stateToRegion[opt.value] === region,
    );
  }, [baseStateOptions, selectedRegion?.value]);

  useEffect(() => {
    setStateOptions(filteredStatesByRegion);
  }, [filteredStatesByRegion]);

  useEffect(() => {
    if (selectedState && selectedRegion?.value) {
      const belongs =
        stateToRegion[selectedState.value] === selectedRegion.value;
      if (!belongs) setSelectedState(null);
    }
  }, [selectedRegion?.value]);

  const byMethod: ChartDatum[] = useMemo(() => {
    if (!currentApiData) {
      return [{ name: 'Nenhum dado disponível', value: 0 }];
    }

    const methodData = [
      {
        name: 'Cartão',
        value: currentApiData.salesMethodsCount?.card?.count || 0,
      },
      {
        name: 'PIX',
        value: currentApiData.salesMethodsCount?.pix?.count || 0,
      },
      {
        name: 'Boleto',
        value: currentApiData.salesMethodsCount?.billet?.count || 0,
      },
    ];

    return methodData.sort((a, b) => b.value - a.value);
  }, [currentApiData?.salesMethodsCount]);

  const byStatus: ChartDatum[] = useMemo(() => {
    if (!currentApiData) {
      return [
        { name: statusMapping['1'], value: 0 },
        { name: statusMapping['2'], value: 0 },
        { name: statusMapping['3'], value: 0 },
        { name: statusMapping['4'], value: 0 },
        { name: statusMapping['5'], value: 0 },
        { name: statusMapping['6'], value: 0 },
        { name: statusMapping['7'], value: 0 },
        { name: statusMapping['8'], value: 0 },
      ];
    }

    const salesByStatus = currentApiData.salesByStatus || {};

    if (Object.keys(salesByStatus).length > 0) {
      const statusData = Object.entries(salesByStatus).map(
        ([statusId, count]) => ({
          name: statusMapping[statusId] || statusId,
          value: Number(count) || 0,
        }),
      );

      return statusData.sort(
        (a, b) => (b.value as number) - (a.value as number),
      );
    }

    return [{ name: 'Nenhum dado disponível', value: 0 }];
  }, [currentApiData?.salesByStatus]);

  const processAgentData = (
    data: Record<string, number> | undefined,
    nameTransform?: (name: string) => string,
  ): ChartDatum[] => {
    if (!data) {
      return [{ name: 'Nenhum dado disponível', value: 0 }];
    }

    const processedData = Object.entries(data)
      .map(([name, count]) => ({
        name:
          name.toLowerCase() === 'unknown'
            ? 'Indefinido'
            : nameTransform
            ? nameTransform(name)
            : name,
        value: Number(count) || 0,
      }))
      .sort((a, b) => b.value - a.value);

    return processedData.length > 0
      ? processedData
      : [{ name: 'Nenhum dado disponível', value: 0 }];
  };

  const byDevice: ChartDatum[] = useMemo(() => {
    return processAgentData(
      currentApiData?.agentStatus?.devices,
      (name) => name.charAt(0).toUpperCase() + name.slice(1),
    );
  }, [currentApiData?.agentStatus?.devices]);

  const byBrowser: ChartDatum[] = useMemo(() => {
    return processAgentData(currentApiData?.agentStatus?.browsers);
  }, [currentApiData?.agentStatus?.browsers]);

  const byOS: ChartDatum[] = useMemo(() => {
    return processAgentData(currentApiData?.agentStatus?.os);
  }, [currentApiData?.agentStatus?.os]);

  const byOrigin: ChartDatum[] = useMemo(() => {
    return processAgentData(currentApiData?.agentStatus?.origins);
  }, [currentApiData?.agentStatus?.origins]);

  const byRegion: ChartDatum[] = useMemo(() => {
    if (!currentApiData) {
      return [{ name: 'Nenhum dado disponível', value: 0 }];
    }

    if (selectedRegion && currentApiData.stateCounts) {
      const items: ChartDatum[] = Object.entries(currentApiData.stateCounts)
        .filter(([uf]) => stateToRegion[uf] === selectedRegion.value)
        .map(([uf, data]) => {
          const val = (data as any).total || 0;
          return { name: uf, value: val };
        })
        .sort((a, b) => b.value - a.value);

      return items.length > 0
        ? items
        : [{ name: 'Nenhum estado encontrado', value: 0 }];
    }

    if (currentApiData.regionCounts) {
      const items: ChartDatum[] = Object.entries(
        currentApiData.regionCounts,
      ).map(([region, data]) => {
        const val = (data as any).total || 0;
        return { name: region, value: val };
      });

      return items.length > 0
        ? items
        : [
            { name: 'Sudeste', value: 0 },
            { name: 'Nordeste', value: 0 },
            { name: 'Sul', value: 0 },
            { name: 'Centro-Oeste', value: 0 },
            { name: 'Norte', value: 0 },
          ];
    }

    return [{ name: 'Nenhum dado disponível', value: 0 }];
  }, [
    currentApiData?.regionCounts,
    currentApiData?.stateCounts,
    selectedRegion?.value,
  ]);

  const getBarColor = useCallback(
    (entry: ChartDatum, data: ChartDatum[], index: number): string => {
      if (entry.name.toLowerCase() === 'indefinido') {
        return '#6c757d';
      }

      const nonIndefinidoData = data.filter(
        (item) => item.name.toLowerCase() !== 'indefinido',
      );
      const nonIndefinidoIndex = nonIndefinidoData.findIndex(
        (item) => item.name === entry.name,
      );

      if (nonIndefinidoIndex === 0) {
        return '#28a745';
      } else if (nonIndefinidoIndex === nonIndefinidoData.length - 1) {
        return '#dc3545';
      } else {
        return '#ffc107';
      }
    },
    [],
  );

  const setQuickRange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    const newCal: Date[] = [start, end];
    setCalendar(newCal);
    setDateRange({
      start: moment(start).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    });
  }, []);

  const handleSellerChange = useCallback((value: FilterOption | null) => {
    setSelectedSeller(value);
    if (!value) setSellerSearchTerm('');
  }, []);

  const handleProductChange = useCallback((value: FilterOption | null) => {
    setSelectedProductFilter(value);
    if (!value) setProductSearchTerm('');
  }, []);

  const handleStatusChange = useCallback((values: Array<FilterOption>) => {
    setSelectedOptions(values || []);
  }, []);

  const handleRegionChange = useCallback((value: FilterOption | null) => {
    setSelectedRegion(value);
  }, []);

  const handleStateChange = useCallback((value: FilterOption | null) => {
    setSelectedState(value);
  }, []);

  const handleSellerInputChange = useCallback(
    (inputValue: string, actionMeta: InputActionMeta) => {
      if (actionMeta.action === 'input-change') {
        setSellerSearchTerm(inputValue);
      }
    },
    [],
  );

  const handleProductInputChange = useCallback(
    (inputValue: string, actionMeta: InputActionMeta) => {
      if (actionMeta.action === 'input-change') {
        setProductSearchTerm(inputValue);
      }
    },
    [],
  );

  const MAX_MONTHS = 3;

  const handleDateChange = useCallback((dates: Date[]) => {
    setCalendar(dates);

    const [startDate, endDate] = dates || [];

    if (!startDate || !endDate) return;

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    if (end.diff(start, 'months', true) > MAX_MONTHS) {
      const cappedEnd = moment(start)
        .add(MAX_MONTHS, 'months')
        .subtract(1, 'day');
      setCalendar([start.toDate(), cappedEnd.toDate()]);
      setDateRange({
        start: start.format('YYYY-MM-DD'),
        end: cappedEnd.format('YYYY-MM-DD'),
      });
      return;
    }

    setDateRange({
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
    });
  }, []);

  const handleDeviceLevelChange = useCallback((level: DeviceLevel) => {
    setDeviceLevel(level);
  }, []);

  // Exportar CSV
  const exportCsv = useCallback(() => {
    const rows: Array<Array<string | number>> = [
      ['Métrica', 'Valor'],
      ['Total de Vendas', summary.totalVendas],
      ['Faturamento', FormatBRL(summary.totalFaturamento)],

      ['B4You Recebeu', FormatBRL(summary.b4youRecebeu)],
    ];

    if (summary.commissionsReal.producer > 0) {
      rows.push([
        'Produtor Recebeu',
        FormatBRL(summary.commissionsReal.producer),
      ]);
    }
    if (summary.commissionsReal.coproducer > 0) {
      rows.push([
        'Coprodutor Recebeu',
        FormatBRL(summary.commissionsReal.coproducer),
      ]);
    }
    if (summary.commissionsReal.affiliate > 0) {
      rows.push([
        'Afiliado Recebeu',
        FormatBRL(summary.commissionsReal.affiliate),
      ]);
    }
    if (summary.commissionsReal.supplier > 0) {
      rows.push([
        'Fornecedor Recebeu',
        FormatBRL(summary.commissionsReal.supplier),
      ]);
    }

    rows.push(['']);
    rows.push(['Taxas de Conversão']);
    rows.push(['Método', 'Taxa (%)']);
    rows.push(['PIX', summary.taxaConversaoPix]);
    rows.push(['Cartão', summary.taxaConversaoCartao]);
    rows.push(['Boleto', summary.taxaConversaoBoleto]);

    rows.push(['']);
    rows.push(['Conversão por Método']);
    rows.push(['Nome', 'Valor']);
    byMethod.forEach((x) => rows.push([x.name, x.value]));

    rows.push(['']);
    rows.push(['Conversão por Status']);
    rows.push(['Nome', 'Valor']);
    byStatus.forEach((x) => rows.push([x.name, x.value]));

    rows.push(['']);
    rows.push(['Conversão por Dispositivo']);
    rows.push(['Nome', 'Valor']);
    byDevice.forEach((x) => rows.push([x.name, x.value]));

    rows.push(['']);
    rows.push(['Conversão por Navegador']);
    rows.push(['Nome', 'Valor']);
    byBrowser.forEach((x) => rows.push([x.name, x.value]));

    rows.push(['']);
    rows.push(['Conversão por Sistema Operacional']);
    rows.push(['Nome', 'Valor']);
    byOS.forEach((x) => rows.push([x.name, x.value]));

    rows.push(['']);
    rows.push(['Conversão por Origem']);
    rows.push(['Nome', 'Valor']);
    byOrigin.forEach((x) => rows.push([x.name, x.value]));
    if (currentApiData) {
      rows.push(['']);
      rows.push(['Resumo dos Dados']);
      rows.push(['Métrica', 'Valor']);
      rows.push(['Total de Itens', currentApiData.totalItems]);
      rows.push([
        'Total de Vendas (R$)',
        FormatBRL(currentApiData.totalSalesPrice),
      ]);
      rows.push([
        'Taxa Conversão PIX (%)',
        currentApiData.conversionRates?.byMethod?.pix || '0',
      ]);
      rows.push([
        'Taxa Conversão Cartão (%)',
        currentApiData.conversionRates?.byMethod?.card || '0',
      ]);
      rows.push([
        'Taxa Conversão Boleto (%)',
        currentApiData.conversionRates?.byMethod?.billet || '0',
      ]);
    }
    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `checkout-analytics_${dateRange.start}_a_${dateRange.end}.csv`;
    downloadFromResponse(blob, filename);
  }, [
    summary,
    byMethod,
    byStatus,
    byDevice,
    byBrowser,
    byOS,
    byOrigin,
    currentApiData,
    dateRange.start,
    dateRange.end,
  ]);

  if (error) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 320 }}
      >
        <div className="text-center">
          <CardText className="text-danger mb-2">{error}</CardText>
          <Button color="primary" onClick={fetchSeparateAnalyticsData}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-analytics container-xxl">
      {/* Seção de Filtros */}
      <FiltersSection
        calendar={calendar}
        selectedSeller={selectedSeller}
        selectedProductFilter={selectedProductFilter}
        selectedOptions={selectedOptions}
        selectedRegion={selectedRegion}
        selectedState={selectedState}
        stateOptions={stateOptions}
        filteredSellerOptions={filteredSellerOptions}
        filteredProductOptions={filteredProductOptions}
        sellerSearchTerm={sellerSearchTerm}
        productSearchTerm={productSearchTerm}
        isProductSearching={isProductSearching}
        isSellerLoading={separateLoading.seller}
        isProductLoading={separateLoading.product}
        onDateChange={handleDateChange}
        onSellerChange={handleSellerChange}
        onProductChange={handleProductChange}
        onStatusChange={handleStatusChange}
        onRegionChange={handleRegionChange}
        onStateChange={handleStateChange}
        onSellerInputChange={handleSellerInputChange}
        onProductInputChange={handleProductInputChange}
        onExportCsv={exportCsv}
        setQuickRange={setQuickRange}
      />

      {/* Seção de Resumo Geral, Comissões e Taxas de Conversão */}
      {(isLoadingVisibleData || currentApiData) && (
        <SummaryTables
          summary={summary}
          apiData={currentApiData}
          loadingState={{
            paymentMethod: separateLoading.paymentMethod,
            calculations: separateLoading.calculations,
          }}
        />
      )}

      {/* Seção de Gráficos */}
      {(isLoadingVisibleData || currentApiData) && (
        <ChartsSection
          byMethod={byMethod}
          byStatus={byStatus}
          byDevice={byDevice}
          byBrowser={byBrowser}
          byOS={byOS}
          byOrigin={byOrigin}
          byRegion={byRegion}
          deviceLevel={deviceLevel}
          selectedRegion={selectedRegion}
          onDeviceLevelChange={handleDeviceLevelChange}
          getBarColor={getBarColor}
          loadingState={{
            paymentMethod: separateLoading.paymentMethod,
            status: separateLoading.status,
            region: separateLoading.region || separateLoading.state,
            origin: separateLoading.origin,
          }}
        />
      )}
    </div>
  );
};

export default DashboardTab;
