import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { api } from '../../../services/api';
import {
  CheckoutMode,
  CheckoutPaymentMethod,
  CheckoutType,
} from '../types/checkoutJourneyTypes';

interface DateRange {
  start: string;
  end: string;
}

interface UseCheckoutJourneyFilters {
  offerId?: string;
  productId?: string;
  producerId?: string;
  checkoutType?: CheckoutType;
  checkoutMode?: CheckoutMode;
  paymentMethod?: CheckoutPaymentMethod;
  executionEnvironment?: 'production' | 'sandbox' | 'development';
  rootDomain?: string;
  hasSuccess?: boolean;
  hasError?: boolean;
}

interface PaginationParams {
  page: number;
  pageSize: number;
}

interface UseCheckoutJourneyDataParams {
  dateRange?: DateRange;
  filters?: UseCheckoutJourneyFilters;
  productsPagination: PaginationParams;
  producersPagination: PaginationParams;
  sessionsPagination: PaginationParams;
  domainsPagination: PaginationParams;
}

interface SummaryResponse {
  total_sessions: number;
  total_events: number;
  success_sessions: number;
  conversion_success_sessions: number;
  payment_success_sessions: number;
  error_sessions: number;
}

interface FunnelResponse {
  steps: Array<{ event_name: string; label: string; sessions: number }>;
}

interface StepsResponse {
  steps: Array<{
    step: 'identification' | 'address' | 'payment';
    started: number;
    completed: number;
    errors: number;
  }>;
}

interface PaymentMethodsResponse {
  items: Array<{
    payment_method: string;
    sessions: number;
    success_sessions: number;
  }>;
}

interface DistributionResponse {
  checkout_type: Array<{ value: string; sessions: number }>;
  checkout_mode: Array<{ value: string; sessions: number }>;
}

interface BreakdownsResponse {
  by_checkout_type: Array<{
    label: string;
    sessions: number;
    success_sessions: number;
  }>;
  by_checkout_mode: Array<{
    label: string;
    sessions: number;
    success_sessions: number;
  }>;
  by_payment_method: Array<{
    label: string;
    sessions: number;
    success_sessions: number;
  }>;
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

interface ProductItem {
  product_id: string;
  product_name: string | null;
  sessions: number;
  success_sessions: number;
}

interface ProducerItem {
  producer_id: string;
  producer_name: string | null;
  sessions: number;
  success_sessions: number;
}

interface SessionItem {
  session_id: string;
  offer_id: string;
  checkout_type: CheckoutType;
  checkout_mode: CheckoutMode;
  payment_method?: CheckoutPaymentMethod | null;
  events: Array<{
    event_name: string;
    event_description: string;
    event_timestamp: number;
  }>;
  offer_context?: {
    product_id: string;
    product_name: string;
    producer_id: string;
    producer_name: string;
  } | null;
}

interface DomainItem {
  root_domain: string | null;
  sessions: number;
  success_sessions: number;
}

interface JourneyData {
  summary: SummaryResponse;
  funnel: FunnelResponse;
  steps: StepsResponse;
  paymentMethods: PaymentMethodsResponse;
  distribution: DistributionResponse;
  breakdowns: BreakdownsResponse;
  products: PaginatedResponse<ProductItem>;
  producers: PaginatedResponse<ProducerItem>;
  sessions: PaginatedResponse<SessionItem>;
  domains: PaginatedResponse<DomainItem>;
}

interface UseCheckoutJourneyDataResult {
  data: JourneyData;
  isLoading: boolean;
  error: string | null;
}

const emptyJourneyData: JourneyData = {
  summary: {
    total_sessions: 0,
    total_events: 0,
    success_sessions: 0,
    conversion_success_sessions: 0,
    payment_success_sessions: 0,
    error_sessions: 0,
  },
  funnel: { steps: [] },
  steps: { steps: [] },
  paymentMethods: { items: [] },
  distribution: { checkout_type: [], checkout_mode: [] },
  breakdowns: {
    by_checkout_type: [],
    by_checkout_mode: [],
    by_payment_method: [],
  },
  products: { items: [], page: 1, page_size: 10, total: 0 },
  producers: { items: [], page: 1, page_size: 10, total: 0 },
  sessions: { items: [], page: 1, page_size: 5, total: 0 },
  domains: { items: [], page: 1, page_size: 10, total: 0 },
};

export const useCheckoutJourneyData = (
  params: UseCheckoutJourneyDataParams,
): UseCheckoutJourneyDataResult => {
  const [data, setData] = useState<JourneyData>(emptyJourneyData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo<DateRange>(() => {
    if (params.dateRange) {
      return params.dateRange;
    }
    const now = moment();
    return {
      start: moment().startOf('month').format('YYYY-MM-DD'),
      end: now.format('YYYY-MM-DD'),
    };
  }, [params.dateRange]);

  const requestBase = useMemo(() => {
    return {
      start_date: dateRange.start,
      end_date: dateRange.end,
      offer_id: params.filters?.offerId,
      product_id: params.filters?.productId,
      producer_id: params.filters?.producerId,
      checkout_type: params.filters?.checkoutType,
      checkout_mode: params.filters?.checkoutMode,
      payment_method: params.filters?.paymentMethod,
      execution_environment: params.filters?.executionEnvironment,
      root_domain: params.filters?.rootDomain,
      has_success: params.filters?.hasSuccess,
      has_error: params.filters?.hasError,
    };
  }, [
    dateRange.end,
    dateRange.start,
    params.filters?.checkoutMode,
    params.filters?.checkoutType,
    params.filters?.executionEnvironment,
    params.filters?.hasError,
    params.filters?.hasSuccess,
    params.filters?.offerId,
    params.filters?.paymentMethod,
    params.filters?.producerId,
    params.filters?.productId,
    params.filters?.rootDomain,
  ]);

  const fetchJourneyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        summaryResponse,
        funnelResponse,
        stepsResponse,
        paymentMethodsResponse,
        distributionResponse,
        breakdownsResponse,
        productsResponse,
        producersResponse,
        sessionsResponse,
        domainsResponse,
      ] = await Promise.all([
        api.post('/checkout/analytics/journey/summary', requestBase),
        api.post('/checkout/analytics/journey/funnel', requestBase),
        api.post('/checkout/analytics/journey/steps', requestBase),
        api.post('/checkout/analytics/journey/payment-methods', requestBase),
        api.post('/checkout/analytics/journey/distribution', requestBase),
        api.post('/checkout/analytics/journey/breakdowns', requestBase),
        api.post('/checkout/analytics/journey/products', {
          ...requestBase,
          page: params.productsPagination.page,
          page_size: params.productsPagination.pageSize,
        }),
        api.post('/checkout/analytics/journey/producers', {
          ...requestBase,
          page: params.producersPagination.page,
          page_size: params.producersPagination.pageSize,
        }),
        api.post('/checkout/analytics/journey/sessions', {
          ...requestBase,
          page: params.sessionsPagination.page,
          page_size: params.sessionsPagination.pageSize,
        }),
        api.post('/checkout/analytics/journey/domains', {
          ...requestBase,
          page: params.domainsPagination.page,
          page_size: params.domainsPagination.pageSize,
        }),
      ]);

      setData({
        summary: summaryResponse.data ?? emptyJourneyData.summary,
        funnel: funnelResponse.data ?? emptyJourneyData.funnel,
        steps: stepsResponse.data ?? emptyJourneyData.steps,
        paymentMethods:
          paymentMethodsResponse.data ?? emptyJourneyData.paymentMethods,
        distribution:
          distributionResponse.data ?? emptyJourneyData.distribution,
        breakdowns: breakdownsResponse.data ?? emptyJourneyData.breakdowns,
        products: productsResponse.data ?? emptyJourneyData.products,
        producers: producersResponse.data ?? emptyJourneyData.producers,
        sessions: sessionsResponse.data ?? emptyJourneyData.sessions,
        domains: domainsResponse.data ?? emptyJourneyData.domains,
      });
    } catch (fetchError) {
      console.error('Erro ao buscar dados da jornada:', fetchError);
      setData(emptyJourneyData);
      setError('Erro ao carregar dados da jornada.');
    } finally {
      setIsLoading(false);
    }
  }, [
    params.productsPagination.page,
    params.productsPagination.pageSize,
    params.producersPagination.page,
    params.producersPagination.pageSize,
    params.sessionsPagination.page,
    params.sessionsPagination.pageSize,
    params.domainsPagination.page,
    params.domainsPagination.pageSize,
    requestBase,
  ]);

  useEffect(() => {
    fetchJourneyData();
  }, [fetchJourneyData]);

  return {
    data,
    isLoading,
    error,
  };
};
