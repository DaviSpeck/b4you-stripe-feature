import {
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'react-feather';
import Flatpickr from 'react-flatpickr';
import {
  Card,
  CardHeader,
  CardTitle,
  Row,
  Col,
  CardBody,
} from 'reactstrap';
import LoadingSpinner from '../components/LoadingSpinner';

import '@styles/react/libs/flatpickr/flatpickr.scss';
import '@styles/react/libs/charts/recharts.scss';
import { useEffect, useState, FC, useRef, useCallback } from 'react';
import { api } from '../services/api';
import moment from 'moment';
import { FormatBRL } from '../utility/Utils';
import memoizeOne from 'memoize-one';
import DataTable from 'react-data-table-component';
import { useSkin } from '../utility/hooks/useSkin';
import { Link } from 'react-router-dom';
import Avatar from '../assets/images/avatars/avatar-blank.png';
import LineChartComponent from '../components/LineChart';
import {
  ProductRecord,
  ProducerRecord,
  RewardRecord,
  FeesData,
  FilterState,
  ApiResponse,
  Column,
} from '../interfaces/home.interface';
import { fetchTpvMetrics } from 'services/metrics.service';
import { KpiCard } from 'components/KpiCard';

const columnsProduct = memoizeOne(
  (recordsProduct: ProductRecord[], page: number, limit: number): Column[] => [
    {
      name: 'Rank',
      cell: (row: ProductRecord) =>
        (page - 1) * limit + recordsProduct.indexOf(row) + 1,
      width: '70px',
      center: true,
    },
    {
      name: 'Nome',
      cell: (row: ProductRecord) => (
        <div className="d-flex align-items-center">
          <img
            className="mr-3"
            src={row.product.cover ? row.product.cover : Avatar}
            alt="Avatar"
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              width: 38,
              height: 38,
            }}
          />
          <Link
            to={`/producer/${row?.product?.producer?.uuid}/product/${row?.product?.uuid}`}
          >
            {row?.product?.name}
          </Link>
        </div>
      ),
    },
    {
      name: 'Total',
      minWidth: '150px',
      right: true,
      cell: (row: ProductRecord) => FormatBRL(row?.total),
    },
  ],
);

const columnsProducer = memoizeOne(
  (recordsProducer: ProducerRecord[], page: number, limit: number): Column[] => [
    {
      name: 'Rank',
      cell: (row: ProducerRecord) =>
        (page - 1) * limit + recordsProducer.indexOf(row) + 1,
      width: '70px',
      center: true,
    },
    {
      name: 'Nome',
      cell: (row: ProducerRecord) => (
        <div className="d-flex align-items-center">
          <img
            className="mr-3"
            src={row.profile_picture ? row.profile_picture : Avatar}
            alt="Avatar"
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              width: 38,
              height: 38,
            }}
          />
          <Link to={`/producer/${row.uuid}`}>{row?.full_name}</Link>
        </div>
      ),
    },
    {
      name: 'Total',
      right: true,
      cell: (row: ProductRecord) => FormatBRL(row?.total),
    },
  ],
);

const columnsGeneralProducers = memoizeOne(
  (recordsGeneralProducers: ProducerRecord[], page: number, limit: number): Column[] => [
    {
      name: 'Rank',
      cell: (row: ProducerRecord) =>
        (page - 1) * limit + recordsGeneralProducers.indexOf(row) + 1,
      width: '70px',
      center: true,
    },
    {
      name: 'Nome',
      cell: (row: ProducerRecord) => (
        <div className="d-flex align-items-center">
          <img
            className="mr-3"
            src={row.profile_picture ? row.profile_picture : Avatar}
            alt="Avatar"
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              width: 38,
              height: 38,
            }}
          />
          <Link to={`/producer/${row.uuid}`}>{row?.full_name}</Link>
        </div>
      ),
    },
    {
      name: 'Total',
      right: true,
      cell: (row: ProducerRecord) => FormatBRL(row?.total),
    },
  ],
);

const columnsRewards = memoizeOne(
  (recordsRewards: RewardRecord[], page: number, limit: number): Column[] => [
    {
      name: 'Rank',
      cell: (row: RewardRecord) =>
        (page - 1) * limit + recordsRewards.indexOf(row) + 1,
      width: '70px',
      center: true,
    },
    {
      name: 'Nome',
      cell: (row: RewardRecord) => (
        <div className="d-flex align-items-center">
          <img
            className="mr-3"
            src={row.user.profile_picture ? row.user.profile_picture : Avatar}
            alt="Avatar"
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              width: 38,
              height: 38,
            }}
          />
          <Link to={`/producer/${row.user.uuid}`}>{row?.user.full_name}</Link>
        </div>
      ),
    },
    {
      name: 'Comissão',
      right: true,
      cell: (row: RewardRecord) => FormatBRL(row?.total),
    },
  ],
);

const tableRowStyles = {
  rows: {
    style: {
      fontSize: '1.05rem',
      fontWeight: 600,
    },
  },
};

const Home: FC = () => {
  const { skin } = useSkin();

  // Estado inicial de filtros e dados principais
  const [filter, setFilter] = useState<FilterState>({
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
  });
  const [data, setData] = useState(0);
  const [ticket, setTicket] = useState(0);
  const [fees, setFees] = useState<FeesData>({ variable: 0, fixed: 0 });

  // TPV e projeções
  const [tpvDaily, setTpvDaily] = useState<{ date: string; total: number }[]>([]);
  const [tpvDailyAvg, setTpvDailyAvg] = useState(0);
  const [tpvPrevAvg, setTpvPrevAvg] = useState(0);
  const [tpvMarkers, setTpvMarkers] = useState<any[]>([]);
  const [tpvMonthProjection, setTpvMonthProjection] = useState(0);
  const [tpvMonthProjectionLoading, setTpvMonthProjectionLoading] = useState(false);

  // Controle de exibição e comparação
  const [showTpvKpis, setShowTpvKpis] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(2);
  const kpisBodyRef = useRef<HTMLDivElement | null>(null);

  // Faixas de data para KPIs
  const [tpvCardTotalRange, setTpvCardTotalRange] = useState<Date[]>([]);
  const [tpvCardAvgRange, setTpvCardAvgRange] = useState<Date[]>([]);
  const [tpvCardMa7Range, setTpvCardMa7Range] = useState<Date[]>([]);
  const [tpvCardP4Range, setTpvCardP4Range] = useState<Date[]>([]);

  // Hook genérico para métricas (Total / Média / MA7 / P4)
  const useTpvCardData = (range: Date[]) => {
    const [stats, setStats] = useState({ total: 0, avg: 0, ma7: 0 });
    const [prevAvg, setPrevAvg] = useState(0);
    const [ticket, setTicket] = useState(0);
    const [fees, setFees] = useState({ variable: 0, fixed: 0 });
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const fetchTicketAndFees = async (start: Date, end: Date) => {
      const [t, f] = await Promise.all([
        api.get('/metrics/ticket', {
          params: {
            start_date: moment(start).format('YYYY-MM-DD'),
            end_date: moment(end).format('YYYY-MM-DD'),
          },
        }),
        api.get('/metrics/fees', {
          params: {
            start_date: moment(start).format('YYYY-MM-DD'),
            end_date: moment(end).format('YYYY-MM-DD'),
          },
        }),
      ]);
      return {
        ticket: Number(t.data?.ticket || 0),
        fees: {
          variable: Number(f.data?.variable || 0),
          fixed: Number(f.data?.fixed || 0),
        },
      };
    };

    const load = useCallback(async () => {
      if (!range?.length || range.length !== 2) return;
      setLoading(true);
      try {
        const [metrics, tf] = await Promise.all([
          fetchTpvMetrics(range[0], range[1]),
          fetchTicketAndFees(range[0], range[1]),
        ]);

        setStats({
          total: metrics.total,
          avg: metrics.avg,
          ma7: metrics.ma7,
        });
        setPrevAvg(metrics.prevAvg);
        setTicket(tf.ticket);
        setFees(tf.fees);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
        setStats({ total: 0, avg: 0, ma7: 0 });
        setPrevAvg(0);
        setTicket(0);
        setFees({ variable: 0, fixed: 0 });
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    }, [range]);

    useEffect(() => {
      if (range?.length === 2) load();
    }, [range, load]);

    return { stats, prevAvg, ticket, fees, loading, loaded, load };
  };

  const total = useTpvCardData(tpvCardTotalRange);
  const avg = useTpvCardData(tpvCardAvgRange);
  const ma7 = useTpvCardData(tpvCardMa7Range);
  const p4 = useTpvCardData(tpvCardP4Range);

  // Debounce no filtro
  const [debouncedFilter, setDebouncedFilter] = useState(filter);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilter(filter), 500);
    return () => clearTimeout(handler);
  }, [filter]);

  // Quick range
  const setQuickRange = (days: number): void => {
    const end = moment().endOf('day');
    const start = end.clone().subtract(days - 1, 'days').startOf('day');
    setFilter((prev) => ({
      ...prev,
      calendar: [start.toDate(), end.toDate()],
    }));
  };

  // ==========================
  // Tabelas de métricas
  // ==========================
  const [recordsProduct, setRecordsProduct] = useState<ProductRecord[]>([]);
  const [recordsProducer, setRecordsProducer] = useState<ProducerRecord[]>([]);
  const [recordsGeneralProducers, setRecordsGeneralProducers] = useState<ProducerRecord[]>([]);
  const [recordsRewards, setRecordsRewards] = useState<RewardRecord[]>([]);

  const [recordsCountProduct, setRecordsCountProduct] = useState(0);
  const [recordsCountProducer, setRecordsCountProducer] = useState(0);
  const [recordsCountGeneralProducers, setRecordsCountGeneralProducers] = useState(0);
  const [recordsCountRewards, setRecordsCountRewards] = useState(0);

  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingProducer, setLoadingProducer] = useState(false);
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingMainMetrics, setLoadingMainMetrics] = useState(false);

  // ==========================
  // Páginação
  // ==========================
  const [pageProduct, setPageProduct] = useState(1);
  const [limitProduct, setLimitProduct] = useState(10);

  const [pageProducer, setPageProducer] = useState(1);
  const [limitProducer, setLimitProducer] = useState(10);

  const [pageGeneral, setPageGeneral] = useState(1);
  const [limitGeneral, setLimitGeneral] = useState(10);

  const [pageRewards, setPageRewards] = useState(1);
  const [limitRewards, setLimitRewards] = useState(10);

  const handleRecordsPerPageChangeProduct = (newPerPage: number) => {
    setLimitProduct(newPerPage);
    setPageProduct(1);
  };
  const handleRecordsPageChangeProduct = (page: number) => setPageProduct(page);

  const handleRecordsPerPageChangeProducer = (newPerPage: number) => {
    setLimitProducer(newPerPage);
    setPageProducer(1);
  };
  const handleRecordsPageChangeProducer = (page: number) => setPageProducer(page);

  const handleRecordsPerPageChangeGeneral = (newPerPage: number) => {
    setLimitGeneral(newPerPage);
    setPageGeneral(1);
  };
  const handleRecordsPageChangeGeneral = (page: number) => setPageGeneral(page);

  const handleRecordsPerPageChangeRewards = (newPerPage: number) => {
    setLimitRewards(newPerPage);
    setPageRewards(1);
  };
  const handleRecordsPageChangeRewards = (page: number) => setPageRewards(page);

  // =======================
  // Função genérica para tabelas
  // =======================
  const fetchTable = useCallback(
    async (
      endpoint: string,
      setRows: Function,
      setCount: Function,
      setLoading: Function,
      page: number,
      limit: number,
      includeDates: boolean = true
    ) => {
      try {
        setLoading(true);

        const params: any = { page: page - 1, size: limit };
        if (includeDates) {
          params.start_date = moment(debouncedFilter.calendar[0]).format('YYYY-MM-DD');
          params.end_date = moment(debouncedFilter.calendar[1]).format('YYYY-MM-DD');
        }

        const { data } = await api.get<ApiResponse<any>>(endpoint, { params });
        setRows(data.rows || []);
        setCount(data.count || 0);
      } catch (error) {
        console.error(`Erro ao carregar dados de ${endpoint}:`, error);
        setRows([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    },
    [debouncedFilter]
  );

  // =======================
  // Gráfico e Métricas
  // =======================
  useEffect(() => {
    const loadGraphAndMetrics = async () => {
      setTpvMonthProjectionLoading(true);
      setLoadingMainMetrics(true);

      try {
        const [metrics, ticketRes, feesRes] = await Promise.all([
          fetchTpvMetrics(debouncedFilter.calendar[0], debouncedFilter.calendar[1]),
          api.get('/metrics/ticket', {
            params: {
              start_date: moment(debouncedFilter.calendar[0]).format('YYYY-MM-DD'),
              end_date: moment(debouncedFilter.calendar[1]).format('YYYY-MM-DD'),
            },
          }),
          api.get('/metrics/fees', {
            params: {
              start_date: moment(debouncedFilter.calendar[0]).format('YYYY-MM-DD'),
              end_date: moment(debouncedFilter.calendar[1]).format('YYYY-MM-DD'),
            },
          }),
        ]);

        setData(metrics.total);
        setTpvDaily(metrics.series);
        setTpvDailyAvg(metrics.avg);
        setTpvPrevAvg(metrics.prevAvg);
        setTpvMarkers(metrics.markers);
        setTpvMonthProjection(metrics.projection);
        setTicket(ticketRes.data?.ticket || 0);
        setFees({
          variable: feesRes.data?.variable || 0,
          fixed: feesRes.data?.fixed || 0,
        });
      } catch (err) {
        console.error('Erro ao carregar gráfico/métricas:', err);
        setData(0);
        setTicket(0);
        setFees({ variable: 0, fixed: 0 });
        setTpvDaily([]);
        setTpvDailyAvg(0);
        setTpvPrevAvg(0);
        setTpvMarkers([]);
        setTpvMonthProjection(0);
      } finally {
        setTpvMonthProjectionLoading(false);
        setLoadingMainMetrics(false);
      }
    };

    loadGraphAndMetrics();
  }, [debouncedFilter]);

  // =======================
  // Tabelas individuais
  // =======================

  // Produtos
  useEffect(() => {
    fetchTable(
      '/metrics/average-product',
      setRecordsProduct,
      setRecordsCountProduct,
      setLoadingProduct,
      pageProduct,
      limitProduct
    );
  }, [debouncedFilter, pageProduct, limitProduct]);

  // Produtores
  useEffect(() => {
    fetchTable(
      '/metrics/average-producer',
      setRecordsProducer,
      setRecordsCountProducer,
      setLoadingProducer,
      pageProducer,
      limitProducer
    );
  }, [debouncedFilter, pageProducer, limitProducer]);

  // Usuários gerais
  useEffect(() => {
    fetchTable(
      '/metrics/average-general-producer',
      setRecordsGeneralProducers,
      setRecordsCountGeneralProducers,
      setLoadingGeneral,
      pageGeneral,
      limitGeneral
    );
  }, [debouncedFilter, pageGeneral, limitGeneral]);

  // Premiações
  useEffect(() => {
    fetchTable(
      '/metrics/rewards',
      setRecordsRewards,
      setRecordsCountRewards,
      setLoadingRewards,
      pageRewards,
      limitRewards,
      false
    );
  }, [debouncedFilter, pageRewards, limitRewards]);

  // KPIs automáticos
  useEffect(() => {
    if (showTpvKpis && !total.loaded) total.load();
  }, [showTpvKpis, total.loaded, total.load]);

  useEffect(() => {
    if (showTpvKpis && !avg.loaded) avg.load();
  }, [showTpvKpis, avg.loaded, avg.load]);

  useEffect(() => {
    if (showTpvKpis && !ma7.loaded) ma7.load();
  }, [showTpvKpis, ma7.loaded, ma7.load]);

  useEffect(() => {
    if (showTpvKpis && comparisonCount >= 4 && !p4.loaded) p4.load();
  }, [showTpvKpis, comparisonCount, p4.loaded, p4.load]);

  return (
    <section id="pageHome">
      <Card className="gap-3">
        <CardHeader className="flex-sm-row flex-column justify-content-sm-between justify-content-center align-items-sm-center align-items-start">
          <CardTitle tag="h4">
            <h5 className="mb-0">Total</h5>
            <div className="h3 pt-0 pb-0 text-primary">
              {data >= 0 ? FormatBRL(data) : <LoadingSpinner />}
            </div>
          </CardTitle>
          <CardTitle tag="h4">
            <h5 className="mb-0">Média TPV</h5>
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <div className="h3 pt-0 pb-0 text-primary mb-0">
                {tpvDailyAvg >= 0 ? FormatBRL(tpvDailyAvg) : <LoadingSpinner />}
              </div>
              <div className="small d-flex align-items-center" style={{ gap: 4 }}>
                {tpvPrevAvg > 0 ? (
                  tpvDailyAvg >= tpvPrevAvg ? (
                    <ArrowUpRight size={14} color="#28C76F" />
                  ) : (
                    <ArrowDownRight size={14} color="#EA5455" />
                  )
                ) : null}
                <span
                  className={
                    tpvPrevAvg > 0
                      ? tpvDailyAvg >= tpvPrevAvg
                        ? "text-success"
                        : "text-danger"
                      : "text-muted"
                  }
                >
                  {tpvPrevAvg > 0
                    ? `${(((tpvDailyAvg - tpvPrevAvg) / tpvPrevAvg) * 100).toFixed(
                      1
                    )}% vs período anterior`
                    : "s/ base anterior"}
                </span>
              </div>
            </div>
          </CardTitle>
          <CardTitle tag="h4">
            <h5 className="mb-0">Ticket Médio</h5>
            <div className="h3 pt-0 pb-0 text-primary">
              {data >= 0 ? FormatBRL(ticket) : <LoadingSpinner />}
            </div>
          </CardTitle>
          <CardTitle tag="h4">
            <h5 className="mb-0">Tarifa Variável Média</h5>
            <div className="h3 pt-0 pb-0 text-primary">
              {fees && fees.variable >= 0 ? (
                FormatBRL(fees.variable)
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </CardTitle>
          <CardTitle tag="h4">
            <h5 className="mb-0">Tarifa Fixa Média</h5>
            <div className="h3 pt-0 pb-0 text-primary">
              {fees && fees.fixed >= 0 ? (
                FormatBRL(fees.fixed)
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </CardTitle>
          <div className="d-flex align-items-center">
            <Calendar size={15} />
            <Flatpickr
              className="form-control flat-picker bg-transparent border-0 shadow-none"
              style={{ width: "210px" }}
              value={filter.calendar}
              onChange={(date: Date[]) =>
                setFilter((prev) => ({ ...prev, calendar: date }))
              }
              options={{
                mode: "range",
                dateFormat: "d/m/Y",
              }}
            />
          </div>
        </CardHeader>
      </Card>

      <Card className="mt-3">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <div className="d-flex align-items-center gap-2">
              <h5 className="mb-0">TPV Diário</h5>
            </div>
            <div className="d-flex align-items-center gap-1">
              {[1, 7, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setQuickRange(d)}
                >
                  {d === 1 ? "Hoje" : `${d} dias`}
                </button>
              ))}
            </div>
            <h5 className="mb-1">
              Projeção Mensal:{" "}
              {tpvMonthProjectionLoading ? (
                <LoadingSpinner />
              ) : (
                FormatBRL(tpvMonthProjection)
              )}
            </h5>
          </div>
          <LineChartComponent
            data={tpvDaily}
            series={["total", "ma7"]}
            height={300}
            markers={tpvMarkers}
            loading={loadingMainMetrics}
          />
        </CardBody>
      </Card>

      <Card className="mt-1 mb-2" style={{ willChange: "auto" }}>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 d-flex align-items-center" style={{ gap: 8 }}>
            KPIs Personalizados
          </h6>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
            onClick={() => setShowTpvKpis((v) => !v)}
            style={{ gap: 6 }}
          >
            {showTpvKpis ? "Ocultar" : "Exibir"}
            <ChevronDown
              size={16}
              style={{
                transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
                transform: showTpvKpis ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
        </CardHeader>

        <div
          ref={kpisBodyRef}
          style={{
            overflow: "hidden",
            willChange: "max-height, opacity",
            transition:
              "max-height 480ms cubic-bezier(0.22, 1, 0.36, 1), opacity 360ms ease-out",
            maxHeight: showTpvKpis ? 9999 : 0,
            opacity: showTpvKpis ? 1 : 0,
          }}
        >
          <CardBody>
            {showTpvKpis && (
              <>
                {/* Cabeçalho de controle (manter somente 2 por enquanto) */}
                {/* <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                  <span className="small text-muted">Comparar períodos:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 90 }}
                    value={comparisonCount}
                    onChange={(e) => setComparisonCount(Number(e.target.value))}
                  >
                    {[2, 3, 4].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div> */}

                <Row
                  className="align-items-start justify-content-between g-2"
                  style={{ rowGap: "1.5rem" }}
                >
                  <Col
                    xl={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 6}
                    lg={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 6}
                    md={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 12}
                    sm={12}
                  >
                    <KpiCard
                      title="Período 1"
                      range={tpvCardTotalRange}
                      setRange={setTpvCardTotalRange}
                      stats={[
                        { label: "Total", value: total.stats.total, color: "#4dd0bc" },
                        { label: "Média", value: total.stats.avg },
                        { label: "MA7", value: total.stats.ma7 },
                        { label: "Ticket Médio", value: total.ticket },
                        { label: "Tarifa Variável", value: total.fees.variable },
                        { label: "Tarifa Fixa", value: total.fees.fixed },
                      ]}
                      loading={total.loading}
                      valueFormat="currency"
                    />
                  </Col>

                  {comparisonCount >= 2 && (
                    <Col
                      xl={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 6}
                      lg={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 6}
                      md={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 12}
                      sm={12}
                    >
                      <KpiCard
                        title="Período 2"
                        range={tpvCardAvgRange}
                        setRange={setTpvCardAvgRange}
                        stats={[
                          { label: "Total", value: avg.stats.total, color: "#4dd0bc" },
                          { label: "Média", value: avg.stats.avg },
                          { label: "MA7", value: avg.stats.ma7 },
                          { label: "Ticket Médio", value: avg.ticket },
                          { label: "Tarifa Variável", value: avg.fees.variable },
                          { label: "Tarifa Fixa", value: avg.fees.fixed },
                        ]}
                        loading={avg.loading}
                        valueFormat="currency"
                      />
                    </Col>
                  )}

                  {comparisonCount >= 3 && (
                    <Col
                      xl={comparisonCount === 3 ? 4 : 6}
                      lg={comparisonCount === 3 ? 4 : 6}
                      md={comparisonCount === 3 ? 4 : 12}
                      sm={12}
                    >
                      <KpiCard
                        title="Período 3"
                        range={tpvCardMa7Range}
                        setRange={setTpvCardMa7Range}
                        stats={[
                          { label: "Total", value: ma7.stats.total, color: "#4dd0bc" },
                          { label: "Média", value: ma7.stats.avg },
                          { label: "MA7", value: ma7.stats.ma7 },
                          { label: "Ticket Médio", value: ma7.ticket },
                          { label: "Tarifa Variável", value: ma7.fees.variable },
                          { label: "Tarifa Fixa", value: ma7.fees.fixed },
                        ]}
                        loading={ma7.loading}
                        valueFormat="currency"
                      />
                    </Col>
                  )}

                  {comparisonCount >= 4 && (
                    <Col xl={6} lg={6} md={12} sm={12}>
                      <KpiCard
                        title="Período 4"
                        range={tpvCardP4Range}
                        setRange={setTpvCardP4Range}
                        stats={[
                          { label: "Total", value: p4.stats.total, color: "#4dd0bc" },
                          { label: "Média", value: p4.stats.avg },
                          { label: "MA7", value: p4.stats.ma7 },
                          { label: "Ticket Médio", value: p4.ticket },
                          { label: "Tarifa Variável", value: p4.fees.variable },
                          { label: "Tarifa Fixa", value: p4.fees.fixed },
                        ]}
                        loading={p4.loading}
                        valueFormat="currency"
                      />
                    </Col>
                  )}
                </Row>
              </>
            )}
          </CardBody>
        </div>
      </Card>

      <Row className="align-items-stretch mt-3">
        <Col className="d-flex flex-column">
          <h3 className="mb-1">Produtos</h3>
          <Card className="flex-fill">
            <CardBody className="p-0">
              <DataTable
                columns={columnsProduct(recordsProduct, pageProduct, limitProduct)}
                data={recordsProduct}
                progressPending={loadingProduct}
                customStyles={tableRowStyles}
                pagination
                paginationServer
                paginationTotalRows={recordsCountProduct}
                onChangeRowsPerPage={handleRecordsPerPageChangeProduct}
                onChangePage={handleRecordsPageChangeProduct}
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página:',
                  rangeSeparatorText: 'de',
                }}
                progressComponent={<LoadingSpinner />}
                noDataComponent={<>Não há resultado</>}
                theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              />
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex flex-column">
          <h3 className="mb-1">Produtores</h3>
          <Card className="flex-fill">
            <CardBody className="p-0">
              <DataTable
                columns={columnsProducer(recordsProducer, pageProducer, limitProducer)}
                data={recordsProducer}
                progressPending={loadingProducer}
                customStyles={tableRowStyles}
                pagination
                paginationServer
                paginationTotalRows={recordsCountProducer}
                onChangeRowsPerPage={handleRecordsPerPageChangeProducer}
                onChangePage={handleRecordsPageChangeProducer}
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página:',
                  rangeSeparatorText: 'de',
                }}
                progressComponent={<LoadingSpinner />}
                noDataComponent={<>Não há resultado</>}
                theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="align-items-stretch mt-1">
        <Col className="d-flex flex-column">
          <h3 className="mb-1">Usuários Gerais</h3>
          <Card className="flex-fill">
            <CardBody className="p-0">
              <DataTable
                columns={columnsGeneralProducers(recordsGeneralProducers, pageGeneral, limitGeneral)}
                data={recordsGeneralProducers}
                progressPending={loadingGeneral}
                customStyles={tableRowStyles}
                pagination
                paginationServer
                paginationTotalRows={recordsCountGeneralProducers}
                onChangeRowsPerPage={handleRecordsPerPageChangeGeneral}
                onChangePage={handleRecordsPageChangeGeneral}
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página:',
                  rangeSeparatorText: 'de',
                }}
                progressComponent={<LoadingSpinner />}
                noDataComponent={<>Não há resultado</>}
                theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              />
            </CardBody>
          </Card>
        </Col>

        <Col md={6} sm={12} className="d-flex flex-column">
          <h3 className="mb-1">Premiações Totais</h3>
          <Card className="flex-fill">
            <CardBody className="p-0">
              <DataTable
                columns={columnsRewards(recordsRewards, pageRewards, limitRewards)}
                data={recordsRewards}
                progressPending={loadingRewards}
                customStyles={tableRowStyles}
                pagination
                paginationServer
                paginationTotalRows={recordsCountRewards}
                onChangeRowsPerPage={handleRecordsPerPageChangeRewards}
                onChangePage={handleRecordsPageChangeRewards}
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página:',
                  rangeSeparatorText: 'de',
                }}
                progressComponent={<LoadingSpinner />}
                noDataComponent={<>Não há resultado</>}
                theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default Home;