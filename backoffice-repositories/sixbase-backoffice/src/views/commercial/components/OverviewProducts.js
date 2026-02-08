import { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Card, CardBody, Button, Spinner, Input } from 'reactstrap';
import Chart from 'react-apexcharts';
import DataTable from 'react-data-table-component';
import StatisticsCards from '../../../@core/components/statistics-card';
import TooltipItem from '../../reports/components/ToolTipItem';
import { Box } from 'react-feather';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import { Calendar } from 'react-feather';
import { useSkin } from '../../../utility/hooks/useSkin';

import {
  useGetOverviewQuery,
  useGetNewProductsQuery,
  useLazyGetRankingQuery,
} from '../../../redux/api/metricsApi';

import '@styles/react/libs/flatpickr/flatpickr.scss';

export default function OverviewProducts() {
  const { skin } = useSkin();
  const DATE_FMT = 'YYYY-MM-DD HH:mm:ss';

  const [days, setDays] = useState(30);

  const [dateRange, setDateRange] = useState([null, null]);
  const [appliedStart, setAppliedStart] = useState(null);
  const [appliedEnd, setAppliedEnd] = useState(null);

  const [threshold, setThreshold] = useState(10000);
  const [inputThreshold, setInputThreshold] = useState(10000);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );

  const { data: ov = {}, isLoading: loadingOv } = useGetOverviewQuery(days);
  const { data: np30 = [], isLoading: loadingNew } =
    useGetNewProductsQuery(days);
  const [
    trigger,
    {
      data: rk = { rows: [], count: 0 },
      isLoading: loadingRk,
      isFetching: fetchingRk,
    },
  ] = useLazyGetRankingQuery();

  const loadingOverview = loadingOv || loadingNew;
  const loadingRanking = loadingRk || fetchingRk;
  const isMobile = windowWidth < 576;

  useEffect(() => {
    const params = { threshold, page, size };
    if (appliedStart && appliedEnd) {
      params.startDate = appliedStart;
      params.endDate = appliedEnd;
    }
    trigger(params);
  }, [threshold, page, size, appliedStart, appliedEnd, trigger]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: 'area',
        toolbar: { show: false },
        background: 'transparent',
      },
      theme: {
        mode: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      markers: { size: isMobile ? 0 : 4 },
      grid: {
        borderColor: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? '#2a2e3b'
          : '#e0e0e0',
        strokeDashArray: 4,
      },
      xaxis: {
        type: 'datetime',
        labels: {
          formatter: (v) => moment(Number(v)).format('DD/MM'),
          rotate: isMobile ? 0 : -45,
          style: {
            colors: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? '#aaa'
              : '#666',
            fontSize: '10px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? '#aaa'
              : '#666',
            fontSize: '10px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      tooltip: {
        theme: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
        x: { format: 'DD/MM/YYYY' },
        y: { formatter: (v) => `${v} produto${v > 1 ? 's' : ''}` },
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: { height: 120 },
            markers: { size: 0 },
            xaxis: { labels: { show: false } },
            dataLabels: { enabled: false },
          },
        },
      ],
    }),
    [isMobile],
  );

  const chartSeries = useMemo(
    () => [
      {
        name: 'Novos Produtos',
        data: np30.map((p) => [new Date(p.date).getTime(), p.count]),
      },
    ],
    [np30],
  );

  const baseColumns = [
    {
      name: '#',
      width: '50px',
      cell: (_r, i) => page * size + i + 1,
    },
    {
      name: 'Produto',
      selector: (r) => r.name,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: 'Vendas',
      selector: (r) => r.totalSales,
      sortable: true,
      right: true,
    },
    {
      name: 'Faturamento',
      selector: (r) => r.totalRevenue,
      sortable: true,
      right: true,
      cell: (r) =>
        r.totalRevenue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
    },
  ];

  const handlePageChange = useCallback((newPage) => setPage(newPage - 1), []);
  const handlePerRowsChange = useCallback((newSize, p) => {
    setSize(newSize);
    setPage(p - 1);
  }, []);
  const handleApply = () => {
    const [d0, d1] = dateRange;
    if (!d0 || !d1) return;

    const startDate = moment(d0).startOf('day').utc().format(DATE_FMT);
    const endDate = moment(d1).endOf('day').utc().format(DATE_FMT);

    setAppliedStart(startDate);
    setAppliedEnd(endDate);

    setThreshold(inputThreshold);
    setPage(0);

    trigger({
      threshold: inputThreshold,
      page: 0,
      size,
      startDate,
      endDate,
    });
  };

  return (
    <>
      <Row className="mt-2">
        <Col xs={12} md={2} className="d-flex justify-content-center">
          <TooltipItem
            id="tooltip-total"
            item={{
              placement: 'right',
              text: `Produtos com ao menos 1 venda nos últimos ${days} dias.`,
            }}
          >
            <StatisticsCards
              icon={<Box />}
              iconBg="light"
              stat={
                loadingOverview ? (
                  <Spinner size="sm" />
                ) : (
                  String(ov.totalActive ?? '—')
                )
              }
              statTitle="Total produtos ativos"
              hideChart
            />
          </TooltipItem>
        </Col>
        <Col xs={12} md={10}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>
                  NP{days} – Novos Produtos ({days} dias)
                </h5>
                <Input
                  type="select"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  style={{ width: '100px' }}
                >
                  {[7, 15, 30, 60, 90].map((d) => (
                    <option key={d} value={d}>
                      {d}d
                    </option>
                  ))}
                </Input>
              </div>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                width="100%"
                height={isMobile ? 120 : 200}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-2 align-items-end">
        <Col xs="12" sm="6" md="3">
          <label>Período</label>
          <div className="d-flex align-items-center">
            <Calendar size={16} className="mr-1" />
            <Flatpickr
              placeholder="DD/MM/AAAA – DD/MM/AAAA"
              value={dateRange}
              options={{ mode: 'range', dateFormat: 'd/m/Y' }}
              onChange={(dates) => setDateRange(dates)}
              className="form-control flat-picker bg-transparent border-0 shadow-none"
            />
          </div>
        </Col>
        <Col xs="12" md="6" className="d-flex align-items-center">
          <span className="mr-2">Mínimo de vendas:</span>
          <Input
            type="text"
            value={inputThreshold}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '');
              v = v.replace(/^0+(?=\d)/, '');
              setInputThreshold(v === '' ? 0 : Number(v));
            }}
            placeholder="10000"
            style={{ maxWidth: '100px' }}
            className="mr-2"
          />
          <Button color="primary" onClick={handleApply} disabled={loadingRk}>
            {loadingRk ? <Spinner size="sm" /> : 'Aplicar'}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <div className="table-responsive">
            <DataTable
              columns={baseColumns}
              data={rk.rows}
              progressPending={loadingRanking}
              pagination
              paginationServer
              paginationTotalRows={rk.count}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página:',
                rangeSeparatorText: 'de',
              }}
              noHeader
              noDataComponent="Nenhum produto encontrado"
              theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
            />
          </div>
        </Col>
      </Row>
    </>
  );
}
