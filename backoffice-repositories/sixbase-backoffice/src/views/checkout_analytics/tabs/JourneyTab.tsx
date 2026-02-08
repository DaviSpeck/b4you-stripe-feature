import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import '@styles/react/libs/charts/recharts.scss';
import moment from 'moment';
import Select, { InputActionMeta } from 'react-select';
import { Button, Col, Label, Row } from 'reactstrap';
import { api } from '../../../services/api';
import FiltersSection from '../../../components/FiltersSection';
import JourneyBreakdownTables from '../components/JourneyBreakdownTables';
import JourneyCharts from '../components/JourneyCharts';
import JourneyDomainsTable from '../components/JourneyDomainsTable';
import JourneyFunnel from '../components/JourneyFunnel';
import JourneySessionTimeline from '../components/JourneySessionTimeline';
import JourneyStepMatrix from '../components/JourneyStepMatrix';
import JourneyStepErrorSummary from '../components/JourneyStepErrorSummary';
import JourneySummaryCards from '../components/JourneySummaryCards';
import { useCheckoutJourneyData } from '../hooks/useCheckoutJourneyData';
import { DateRange, FilterOption } from '../../../interfaces/analytics.interface';
import { CheckoutEventName } from '../types/checkoutJourneyTypes';

const funnelSequence: Array<{ label: string; eventName: CheckoutEventName }> = [
  { label: 'Visualização do checkout', eventName: 'checkout_page_view' },
  { label: 'Sessão iniciada', eventName: 'checkout_session_started' },
  {
    label: 'Identificação concluída',
    eventName: 'checkout_identification_completed',
  },
  { label: 'Endereço concluído', eventName: 'checkout_address_completed' },
  { label: 'Pagamento enviado', eventName: 'checkout_submit_clicked' },
  { label: 'Checkout concluído', eventName: 'checkout_conversion_success' },
];

const stepConfig = [
  { step: 'Identificação', value: 'identification' },
  { step: 'Endereço', value: 'address' },
  { step: 'Pagamento', value: 'payment' },
] as const;

type JourneyTabMode = 'overview' | 'breakdown' | 'sessions' | 'domains';

interface JourneyTabProps {
  mode: JourneyTabMode;
}

const JourneyTab: FC<JourneyTabProps> = ({ mode }) => {
  const [productPage, setProductPage] = useState<number>(1);
  const [producerPage, setProducerPage] = useState<number>(1);
  const [timelinePage, setTimelinePage] = useState<number>(1);
  const [domainsPage, setDomainsPage] = useState<number>(1);
  const [productPageSize, setProductPageSize] = useState<number>(10);
  const [producerPageSize, setProducerPageSize] = useState<number>(10);
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
  const [selectedSeller, setSelectedSeller] = useState<FilterOption | null>(
    null,
  );
  const [selectedProductFilter, setSelectedProductFilter] =
    useState<FilterOption | null>(null);
  const [selectedCheckoutType, setSelectedCheckoutType] =
    useState<FilterOption | null>(null);
  const [selectedCheckoutMode, setSelectedCheckoutMode] =
    useState<FilterOption | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<FilterOption | null>(null);
  const [selectedDomainFilter, setSelectedDomainFilter] =
    useState<FilterOption | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<FilterOption | null>(null);
  const [selectedHasSuccess, setSelectedHasSuccess] =
    useState<FilterOption | null>(null);
  const [selectedHasError, setSelectedHasError] =
    useState<FilterOption | null>(null);
  const [sellerOptions, setSellerOptions] = useState<Array<FilterOption>>([]);
  const [productOptions, setProductOptions] = useState<Array<FilterOption>>([]);
  const [domainOptions, setDomainOptions] = useState<Array<FilterOption>>([]);
  const [sellerSearchTerm, setSellerSearchTerm] = useState<string>('');
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [isSellerLoading, setIsSellerLoading] = useState<boolean>(false);
  const [isProductLoading, setIsProductLoading] = useState<boolean>(false);
  const [isDomainLoading, setIsDomainLoading] = useState<boolean>(false);

  const TIMELINE_PAGE_SIZE = 3;
  const DOMAINS_PAGE_SIZE = 10;

  const { data, isLoading, error } = useCheckoutJourneyData({
    dateRange,
    filters: {
      productId: selectedProductFilter?.value,
      producerId: selectedSeller?.value,
      checkoutType: selectedCheckoutType?.value as
        | 'standard'
        | '3steps'
        | undefined,
      checkoutMode: selectedCheckoutMode?.value as
        | 'embedded'
        | 'transparent'
        | undefined,
      paymentMethod: selectedPaymentMethod?.value as
        | 'credit_card'
        | 'pix'
        | 'boleto'
        | undefined,
      executionEnvironment: selectedEnvironment?.value as
        | 'production'
        | 'sandbox'
        | 'development'
        | undefined,
      hasSuccess:
        selectedHasSuccess?.value === 'true'
          ? true
          : selectedHasSuccess?.value === 'false'
            ? false
            : undefined,
      hasError:
        selectedHasError?.value === 'true'
          ? true
          : selectedHasError?.value === 'false'
            ? false
            : undefined,
      rootDomain: selectedDomainFilter?.value,
    },
    productsPagination: {
      page: productPage,
      pageSize: productPageSize,
    },
    producersPagination: {
      page: producerPage,
      pageSize: producerPageSize,
    },
    sessionsPagination: {
      page: timelinePage,
      pageSize: TIMELINE_PAGE_SIZE,
    },
    domainsPagination: {
      page: domainsPage,
      pageSize: DOMAINS_PAGE_SIZE,
    },
  });

  const checkoutTypeOptions = useMemo<Array<FilterOption>>(
    () => [
      { value: 'standard', label: 'Checkout padrão' },
      { value: '3steps', label: 'Checkout 3 etapas' },
    ],
    [],
  );
  const checkoutModeOptions = [
    {
      value: 'embedded',
      label: 'Embutido (b4you.com.br)',
    },
    {
      value: 'transparent',
      label: 'Transparente (domínio do produtor)',
    },
    { value: 'sandbox', label: 'Sandbox' },
    { value: 'development', label: 'Desenvolvimento' },
  ];
  const paymentMethodOptions = useMemo<Array<FilterOption>>(
    () => [
      { value: 'credit_card', label: 'Cartão' },
      { value: 'pix', label: 'PIX' },
      { value: 'boleto', label: 'Boleto' },
    ],
    [],
  );
  const environmentOptions = useMemo<Array<FilterOption>>(
    () => [
      { value: 'production', label: 'Produção' },
      { value: 'sandbox', label: 'Sandbox' },
      { value: 'development', label: 'Desenvolvimento' },
    ],
    [],
  );
  const sessionFlagOptions = useMemo<Array<FilterOption>>(
    () => [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    [],
  );

  const formatCheckoutType = useCallback((value?: string | null) => {
    if (!value) return 'Não identificado';
    return value === '3steps' ? 'Checkout 3 etapas' : 'Checkout padrão';
  }, []);

  const formatCheckoutMode = useCallback((value?: string | null) => {
    if (!value) return 'Não identificado';

    const map: Record<string, string> = {
      embedded: 'Embutido (b4you.com.br)',
      transparent: 'Transparente (domínio do produtor)',
      sandbox: 'Sandbox',
      development: 'Desenvolvimento',
    };

    return map[value] ?? value;
  }, []);

  const formatPaymentMethod = useCallback((value?: string | null) => {
    if (!value) return 'Não identificado';
    const map: Record<string, string> = {
      credit_card: 'Cartão de crédito',
      pix: 'PIX',
      boleto: 'Boleto',
    };
    return map[value] ?? value;
  }, []);

  const formatEventLabel = useCallback((value?: string | null) => {
    if (!value) return 'Evento registrado';
    const map: Record<string, string> = {
      checkout_page_view: 'Página do checkout visualizada',
      checkout_session_started: 'Sessão iniciada',
      checkout_identification_started: 'Identificação iniciada',
      checkout_identification_filled: 'Identificação preenchida',
      checkout_identification_error: 'Erro na identificação',
      checkout_identification_completed: 'Identificação concluída',
      checkout_address_started: 'Endereço iniciado',
      checkout_address_filled: 'Endereço preenchido',
      checkout_address_error: 'Erro no endereço',
      checkout_shipping_method_selected: 'Frete selecionado',
      checkout_address_completed: 'Endereço concluído',
      checkout_step_viewed: 'Etapa visualizada',
      checkout_step_advanced: 'Etapa avançada',
      checkout_step_back: 'Voltar etapa',
      checkout_payment_method_selected: 'Método de pagamento selecionado',
      checkout_payment_data_started: 'Pagamento iniciado',
      checkout_payment_data_error: 'Erro no pagamento',
      checkout_submit_clicked: 'Pagamento enviado (clique no botão final)',
      checkout_coupon_applied: 'Cupom aplicado',
      checkout_coupon_error: 'Erro no cupom',
      checkout_order_bump_viewed: 'Order bump visualizado',
      checkout_order_bump_accepted: 'Order bump aceito',
      checkout_order_bump_declined: 'Order bump recusado',
      checkout_conversion_success:
        'Checkout concluído (PIX/boleto gerado ou cartão aprovado)',
      checkout_payment_success: 'Cartão aprovado',
      checkout_payment_error: 'Erro no pagamento',
    };
    return map[value] ?? value;
  }, []);

  const normalizeSearch = useCallback((value: string) => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }, []);

  const filteredSellerOptions = useMemo(() => {
    if (!sellerSearchTerm.trim()) return sellerOptions.slice(0, 10);
    const normalizedSearch = normalizeSearch(sellerSearchTerm);
    return sellerOptions.filter((option) =>
      normalizeSearch(option.label).includes(normalizedSearch),
    );
  }, [normalizeSearch, sellerOptions, sellerSearchTerm]);

  const filteredProductOptions = useMemo(() => {
    if (!productSearchTerm.trim()) return productOptions.slice(0, 10);
    const normalizedSearch = normalizeSearch(productSearchTerm);
    return productOptions.filter((option) =>
      normalizeSearch(option.label).includes(normalizedSearch),
    );
  }, [normalizeSearch, productOptions, productSearchTerm]);

  const setQuickRange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setCalendar([start, end]);
    setDateRange({
      start: moment(start).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    });
  }, []);

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

  const handleSellerChange = useCallback((value: FilterOption | null) => {
    setSelectedSeller(value);
    if (!value) setSellerSearchTerm('');
  }, []);

  const handleProductChange = useCallback((value: FilterOption | null) => {
    setSelectedProductFilter(value);
    if (!value) setProductSearchTerm('');
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

  const handleCheckoutTypeChange = useCallback((value: FilterOption | null) => {
    setSelectedCheckoutType(value);
  }, []);

  const handleCheckoutModeChange = useCallback((value: FilterOption | null) => {
    setSelectedCheckoutMode(value);
  }, []);

  const handlePaymentMethodChange = useCallback((value: FilterOption | null) => {
    setSelectedPaymentMethod(value);
  }, []);

  const handleDomainChange = useCallback((value: FilterOption | null) => {
    setSelectedDomainFilter(value);
  }, []);

  const handleEnvironmentChange = useCallback((value: FilterOption | null) => {
    setSelectedEnvironment(value);
  }, []);

  const handleHasSuccessChange = useCallback((value: FilterOption | null) => {
    setSelectedHasSuccess(value);
  }, []);

  const handleHasErrorChange = useCallback((value: FilterOption | null) => {
    setSelectedHasError(value);
  }, []);

  const extraFilters = useMemo(
    () => (
      <>
        <Row className="g-2 align-items-end">
          <Col xs={12} md={4}>
            <Label className="mb-1">Tipo de checkout</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione"
              options={checkoutTypeOptions}
              value={selectedCheckoutType}
              onChange={handleCheckoutTypeChange}
              isClearable
            />
          </Col>
          <Col xs={12} md={4}>
            <Label className="mb-1">Modo</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione"
              options={checkoutModeOptions}
              value={selectedCheckoutMode}
              onChange={handleCheckoutModeChange}
              isClearable
            />
          </Col>
          <Col xs={12} md={4}>
            <Label className="mb-1">Método de pagamento</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione"
              options={paymentMethodOptions}
              value={selectedPaymentMethod}
              onChange={handlePaymentMethodChange}
              isClearable
            />
          </Col>
        </Row>
        <Row className="g-2 mt-1 align-items-end">
          <Col xs={12} md={4}>
            <Label className="mb-1">Ambiente</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione"
              options={environmentOptions}
              value={selectedEnvironment}
              onChange={handleEnvironmentChange}
              isClearable
            />
          </Col>
          <Col xs={12} md={4}>
            <Label className="mb-1">Sessões com checkout concluído</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione"
              options={sessionFlagOptions}
              value={selectedHasSuccess}
              onChange={handleHasSuccessChange}
              isClearable
            />
          </Col>
          <Col xs={12} md={4}>
            <Label className="mb-1">Sessões com erro</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione"
              options={sessionFlagOptions}
              value={selectedHasError}
              onChange={handleHasErrorChange}
              isClearable
            />
          </Col>
        </Row>
        <Row className="g-2 mt-1 align-items-end">
          <Col xs={12}>
            <Label className="mb-1">Domínio</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder={
                isDomainLoading ? 'Carregando domínios...' : 'Selecione'
              }
              options={domainOptions}
              value={selectedDomainFilter}
              onChange={handleDomainChange}
              isClearable
              isLoading={isDomainLoading}
            />
          </Col>
        </Row>
      </>
    ),
    [
      checkoutModeOptions,
      checkoutTypeOptions,
      domainOptions,
      environmentOptions,
      handleCheckoutModeChange,
      handleCheckoutTypeChange,
      handleDomainChange,
      handleEnvironmentChange,
      handleHasErrorChange,
      handleHasSuccessChange,
      handlePaymentMethodChange,
      isDomainLoading,
      paymentMethodOptions,
      selectedCheckoutMode,
      selectedCheckoutType,
      selectedDomainFilter,
      selectedEnvironment,
      selectedHasError,
      selectedHasSuccess,
      selectedPaymentMethod,
      sessionFlagOptions,
    ],
  );

  const handleProductPageSizeChange = useCallback((pageSize: number) => {
    setProductPageSize(pageSize);
    setProductPage(1);
  }, []);

  const handleProducerPageSizeChange = useCallback((pageSize: number) => {
    setProducerPageSize(pageSize);
    setProducerPage(1);
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsSellerLoading(true);
      setIsProductLoading(true);
      setIsDomainLoading(true);

      try {
        const [sellerResponse, productResponse, domainsResponse] =
          await Promise.all([
            api.post('/checkout/analytics/journey/producers', {
              start_date: dateRange.start,
              end_date: dateRange.end,
              page: 1,
              page_size: 50,
            }),
            api.post('/checkout/analytics/journey/products', {
              start_date: dateRange.start,
              end_date: dateRange.end,
              page: 1,
              page_size: 50,
            }),
            api.post('/checkout/analytics/journey/domains', {
              start_date: dateRange.start,
              end_date: dateRange.end,
              page: 1,
              page_size: 50,
            }),
          ]);

        const sellerOptionsResponse = (sellerResponse.data?.items ?? []).map(
          (item: any) => ({
            value: item.producer_id,
            label: item.producer_name ?? 'Produtor não identificado',
            count: item.sessions,
          }),
        );
        const productOptionsResponse = (productResponse.data?.items ?? []).map(
          (item: any) => ({
            value: item.product_id,
            label: item.product_name ?? 'Produto não identificado',
            count: item.sessions,
          }),
        );
        const domainsOptionsResponse = (
          domainsResponse.data?.items ?? []
        ).map((item: any) => ({
          value: item.root_domain ?? 'unknown',
          label: item.root_domain ?? 'Domínio não identificado',
          count: item.sessions,
        }));

        setSellerOptions(sellerOptionsResponse);
        setProductOptions(productOptionsResponse);
        setDomainOptions(domainsOptionsResponse);
      } catch (fetchError) {
        console.error('Erro ao buscar filtros da jornada:', fetchError);
        setSellerOptions([]);
        setProductOptions([]);
        setDomainOptions([]);
      } finally {
        setIsSellerLoading(false);
        setIsProductLoading(false);
        setIsDomainLoading(false);
      }
    };

    fetchFilterOptions();
  }, [dateRange.end, dateRange.start]);

  useEffect(() => {
    setProductPage(1);
    setProducerPage(1);
    setTimelinePage(1);
    setDomainsPage(1);
  }, [
    dateRange.end,
    dateRange.start,
    selectedCheckoutMode,
    selectedCheckoutType,
    selectedDomainFilter,
    selectedEnvironment,
    selectedHasError,
    selectedHasSuccess,
    selectedPaymentMethod,
    selectedProductFilter,
    selectedSeller,
  ]);

  const summary = useMemo(() => {
    const totalSessions = data.summary.total_sessions || 0;
    const totalEvents = data.summary.total_events || 0;
    const conversionSuccessSessions =
      data.summary.conversion_success_sessions || 0;
    const paymentSuccessSessions =
      data.summary.payment_success_sessions || 0;

    return {
      totalSessions,
      totalEvents,
      conversionSuccessSessions,
      paymentSuccessSessions,
      errorSessions: data.summary.error_sessions || 0,
      conversionRate: totalSessions
        ? (conversionSuccessSessions / totalSessions) * 100
        : 0,
    };
  }, [data.summary]);

  const funnelSteps = useMemo(() => {
    const steps = data.funnel.steps ?? [];
    return funnelSequence.map((step, index) => {
      const currentStep = steps.find(
        (item) => item.event_name === step.eventName,
      );
      const count = currentStep?.sessions ?? 0;
      const previousStep =
        index === 0
          ? null
          : steps.find(
            (item) =>
              item.event_name === funnelSequence[index - 1].eventName,
          );
      const previousCount = previousStep?.sessions ?? 0;

      return {
        eventName: step.eventName,
        label: step.label,
        count,
        rateFromPrevious:
          index === 0
            ? null
            : previousCount > 0
              ? (count / previousCount) * 100
              : 0,
      };
    });
  }, [data.funnel.steps]);

  const funnelChartData = useMemo(() => {
    return funnelSteps.map((step) => ({
      step: step.label,
      sessions: step.count,
      conversion: step.rateFromPrevious,
    }));
  }, [funnelSteps]);

  const stepMatrix = useMemo(() => {
    const mapped = data.steps.steps ?? [];
    return stepConfig.map((config) => {
      const stepData = mapped.find((item) => item.step === config.value);
      const started = stepData?.started ?? 0;
      const completed = stepData?.completed ?? 0;
      const errors = stepData?.errors ?? 0;

      return {
        step: config.step,
        stepKey: config.value,
        started,
        completed,
        errorRate: started ? (errors / started) * 100 : 0,
        errors,
      };
    });
  }, [data.steps.steps]);

  const byCheckoutType = useMemo(() => {
    return (data.breakdowns.by_checkout_type ?? []).map((item) => ({
      label: formatCheckoutType(item.label),
      sessions: item.sessions,
      successSessions: item.success_sessions,
      successRate: item.sessions
        ? (item.success_sessions / item.sessions) * 100
        : 0,
    }));
  }, [data.breakdowns.by_checkout_type, formatCheckoutType]);

  const byCheckoutMode = useMemo(() => {
    return (data.breakdowns.by_checkout_mode ?? []).map((item) => ({
      label: formatCheckoutMode(item.label),
      sessions: item.sessions,
      successSessions: item.success_sessions,
      successRate: item.sessions
        ? (item.success_sessions / item.sessions) * 100
        : 0,
    }));
  }, [data.breakdowns.by_checkout_mode, formatCheckoutMode]);

  const byPaymentMethod = useMemo(() => {
    return (data.breakdowns.by_payment_method ?? []).map((item) => ({
      label: formatPaymentMethod(item.label),
      sessions: item.sessions,
      successSessions: item.success_sessions,
      successRate: item.sessions
        ? (item.success_sessions / item.sessions) * 100
        : 0,
    }));
  }, [data.breakdowns.by_payment_method, formatPaymentMethod]);

  const paymentChartData = useMemo(() => {
    return (data.paymentMethods.items ?? []).map((item) => ({
      method: formatPaymentMethod(item.payment_method),
      sessions: item.sessions,
      successRate: item.sessions > 0
        ? (item.success_sessions / item.sessions) * 100
        : 0,
    }));
  }, [data.paymentMethods.items, formatPaymentMethod]);

  const checkoutTypeChartData = useMemo(() => {
    return (data.distribution.checkout_type ?? []).map((item) => ({
      name: formatCheckoutType(item.value),
      value: item.sessions,
    }));
  }, [data.distribution.checkout_type, formatCheckoutType]);

  const checkoutModeChartData = useMemo(() => {
    return (data.distribution.checkout_mode ?? []).map((item) => ({
      name: formatCheckoutMode(item.value),
      value: item.sessions,
    }));
  }, [data.distribution.checkout_mode, formatCheckoutMode]);

  const totalProductPages = Math.max(
    1,
    Math.ceil(data.products.total / productPageSize),
  );
  const totalProducerPages = Math.max(
    1,
    Math.ceil(data.producers.total / producerPageSize),
  );
  const totalTimelinePages = Math.max(
    1,
    Math.ceil(data.sessions.total / TIMELINE_PAGE_SIZE),
  );
  const totalDomainsPages = Math.max(
    1,
    Math.ceil(data.domains.total / DOMAINS_PAGE_SIZE),
  );

  useEffect(() => {
    if (productPage > totalProductPages) {
      setProductPage(totalProductPages);
    }
  }, [productPage, totalProductPages]);

  useEffect(() => {
    if (producerPage > totalProducerPages) {
      setProducerPage(totalProducerPages);
    }
  }, [producerPage, totalProducerPages]);

  useEffect(() => {
    if (timelinePage > totalTimelinePages) {
      setTimelinePage(totalTimelinePages);
    }
  }, [timelinePage, totalTimelinePages]);

  useEffect(() => {
    if (domainsPage > totalDomainsPages) {
      setDomainsPage(totalDomainsPages);
    }
  }, [domainsPage, totalDomainsPages]);

  const paginatedProducts = useMemo(() => {
    return (data.products.items ?? []).map((item) => ({
      label: item.product_name ?? 'Produto não identificado',
      sessions: item.sessions,
      successSessions: item.success_sessions,
      successRate: item.sessions
        ? (item.success_sessions / item.sessions) * 100
        : 0,
    }));
  }, [data.products.items]);

  const paginatedProducers = useMemo(() => {
    return (data.producers.items ?? []).map((item) => ({
      label: item.producer_name ?? 'Produtor não identificado',
      sessions: item.sessions,
      successSessions: item.success_sessions,
      successRate: item.sessions
        ? (item.success_sessions / item.sessions) * 100
        : 0,
    }));
  }, [data.producers.items]);

  const paginatedDomains = useMemo(() => {
    return (data.domains.items ?? []).map((item) => ({
      domain: item.root_domain ?? 'Domínio não identificado',
      sessions: item.sessions,
      successSessions: item.success_sessions,
      conversionRate: item.sessions
        ? (item.success_sessions / item.sessions) * 100
        : 0,
    }));
  }, [data.domains.items]);

  const timelineSessions = useMemo(() => {
    return (data.sessions.items ?? []).map((session) => {
      const offerContext = session.offer_context;
      const offerLabel = offerContext
        ? `${offerContext.product_name} • ${offerContext.producer_name}`
        : `Oferta ${session.offer_id}`;

      return {
        sessionId: session.session_id,
        offerLabel,
        checkoutType: formatCheckoutType(session.checkout_type),
        checkoutMode: formatCheckoutMode(session.checkout_mode),
        paymentMethod: session.payment_method
          ? formatPaymentMethod(session.payment_method)
          : null,
        events: [...session.events]
          .sort((a, b) => a.event_timestamp - b.event_timestamp)
          .map((event) => ({
            name: event.event_name,
            label: formatEventLabel(event.event_name),
            description: event.event_description,
            timestamp: event.event_timestamp,
            isError: event.event_name.includes('error'),
          })),
      };
    });
  }, [
    data.sessions.items,
    formatCheckoutMode,
    formatCheckoutType,
    formatEventLabel,
    formatPaymentMethod,
  ]);

  return (
    <div className="container-xxl">
      <FiltersSection
        calendar={calendar}
        selectedSeller={selectedSeller}
        selectedProductFilter={selectedProductFilter}
        selectedOptions={[]}
        selectedRegion={null}
        selectedState={null}
        stateOptions={[]}
        filteredSellerOptions={filteredSellerOptions}
        filteredProductOptions={filteredProductOptions}
        sellerSearchTerm={sellerSearchTerm}
        productSearchTerm={productSearchTerm}
        isProductSearching={false}
        isSellerLoading={isSellerLoading}
        isProductLoading={isProductLoading}
        onDateChange={handleDateChange}
        onSellerChange={handleSellerChange}
        onProductChange={handleProductChange}
        onStatusChange={() => undefined}
        onRegionChange={() => undefined}
        onStateChange={() => undefined}
        onSellerInputChange={handleSellerInputChange}
        onProductInputChange={handleProductInputChange}
        onExportCsv={() => undefined}
        setQuickRange={setQuickRange}
        showStatusFilters={false}
        showRegionFilters={false}
        extraFilters={extraFilters}
      />

      {error && <div className="text-danger mb-2">{error}</div>}

      {isLoading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <span className="spinner-border text-primary" />
          <span className="ms-1">Atualizando dados da jornada...</span>
        </div>
      )}

      {!isLoading && mode === 'overview' && (
        <>
          <JourneySummaryCards
            totalSessions={summary.totalSessions}
            totalEvents={summary.totalEvents}
            conversionRate={summary.conversionRate}
            conversionSuccessSessions={summary.conversionSuccessSessions}
            paymentSuccessSessions={summary.paymentSuccessSessions}
            errorSessions={summary.errorSessions}
          />

          <JourneyFunnel steps={funnelSteps} />

          <JourneyCharts
            funnelData={funnelChartData}
            paymentData={paymentChartData}
            checkoutTypeData={checkoutTypeChartData}
            checkoutModeData={checkoutModeChartData}
          />

          <JourneyStepMatrix steps={stepMatrix} />

          <JourneyStepErrorSummary steps={stepMatrix} />
        </>
      )}

      {!isLoading && mode === 'breakdown' && (
        <JourneyBreakdownTables
          byCheckoutType={byCheckoutType}
          byCheckoutMode={byCheckoutMode}
          byPaymentMethod={byPaymentMethod}
          byProduct={paginatedProducts}
          byProducer={paginatedProducers}
          productPagination={{
            page: productPage,
            totalPages: totalProductPages,
            onPageChange: setProductPage,
            pageSize: productPageSize,
            onPageSizeChange: handleProductPageSizeChange,
          }}
          producerPagination={{
            page: producerPage,
            totalPages: totalProducerPages,
            onPageChange: setProducerPage,
            pageSize: producerPageSize,
            onPageSizeChange: handleProducerPageSizeChange,
          }}
        />
      )}

      {!isLoading && mode === 'sessions' && (
        <>
          <JourneySessionTimeline sessions={timelineSessions} />

          <div className="d-flex justify-content-center align-items-center gap-2">
            <Button
              color="outline-secondary"
              size="sm"
              disabled={timelinePage <= 1}
              onClick={() => setTimelinePage((prev) => prev - 1)}
            >
              Página anterior
            </Button>
            <span className="text-muted small">
              Página {timelinePage} de {totalTimelinePages}
            </span>
            <Button
              color="outline-secondary"
              size="sm"
              disabled={timelinePage >= totalTimelinePages}
              onClick={() => setTimelinePage((prev) => prev + 1)}
            >
              Próxima página
            </Button>
          </div>
        </>
      )}

      {!isLoading && mode === 'domains' && (
        <JourneyDomainsTable
          items={paginatedDomains}
          page={domainsPage}
          totalPages={totalDomainsPages}
          onPageChange={setDomainsPage}
        />
      )}
    </div>
  );
};

export default JourneyTab;
