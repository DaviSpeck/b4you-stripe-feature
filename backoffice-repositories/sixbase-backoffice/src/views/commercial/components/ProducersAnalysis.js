import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, Row, Col, Input, Spinner, Alert } from 'reactstrap';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import { useSkin } from '../../../utility/hooks/useSkin';
import {
  useGetProducerIntervalsQuery,
  useLazyGetProducersPausedQuery,
  useLazyGetProducersComparativeQuery,
  useLazyGetProducersPerformanceDropQuery,
} from '../../../redux/api/metricsApi';
import { useDateRange } from '../../../hooks/useDateRange';
import Flatpickr from 'react-flatpickr';
import { Calendar } from 'react-feather';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import './ProducersAnalysis.responsive.css';

const TABS = {
  PAUSED: 'paused',
  COMP: 'comparative',
  DROP: 'performance-drop',
};
const TAB_OPTIONS = [
  { key: TABS.PAUSED, label: 'PRM – Pausados' },
  { key: TABS.COMP, label: 'PD10K – Comparativo' },
  { key: TABS.DROP, label: 'PP5D – Queda' },
];

const fmtBRL = (v) =>
  typeof v === 'number' && !isNaN(v)
    ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—';

const fmtNum = (v) =>
  typeof v === 'number' && !isNaN(v) ? v.toLocaleString('pt-BR') : '—';

const fmtDate = (v) => (v ? moment(v).format('DD/MM/YYYY HH:mm') : '—');

const fmtPct = (v) =>
  typeof v === 'number' && !isNaN(v) ? `${v.toFixed(1)} %` : '—';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

export default function ProducersAnalysis() {
  const { skin } = useSkin();
  const firstOfLast = moment().subtract(1, 'month').startOf('month').toDate();
  const lastOfLast = moment().subtract(1, 'month').endOf('month').toDate();
  const firstOfNow = moment().startOf('month').toDate();
  const today = moment().toDate();

  const { prevRange, currRange, setPrevRange, setCurrRange, applyRanges } =
    useDateRange([firstOfLast, lastOfLast], [firstOfNow, today]);

  const [threshold, setThreshold] = useState(10000);
  const [dropPct, setDropPct] = useState(50);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [activeTab, setActiveTab] = useState(TABS.PAUSED);
  const isMobile = useIsMobile();

  const [loadPaused, pausedQ] = useLazyGetProducersPausedQuery();
  const [loadComp, compQ] = useLazyGetProducersComparativeQuery();
  const [loadDrop, dropQ] = useLazyGetProducersPerformanceDropQuery();
  const { data: pin = {}, isLoading: pinLoading } =
    useGetProducerIntervalsQuery();

  const fetchData = useCallback(() => {
    const common = { page, size, ...applyRanges() };
    if (activeTab === TABS.PAUSED) {
      loadPaused(common);
    } else if (activeTab === TABS.COMP) {
      loadComp({ threshold, ...common });
    } else {
      loadDrop({ dropPct, ...common });
    }
  }, [
    activeTab,
    page,
    size,
    threshold,
    dropPct,
    applyRanges,
    loadPaused,
    loadComp,
    loadDrop,
  ]);

  useEffect(() => {
    setPage(0);
  }, [activeTab, threshold, dropPct, prevRange, currRange]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loading = pausedQ.isFetching || compQ.isFetching || dropQ.isFetching;
  const { rows: dataRows = [], count: total = 0 } =
    activeTab === TABS.PAUSED
      ? pausedQ.data ?? {}
      : activeTab === TABS.COMP
      ? compQ.data ?? {}
      : dropQ.data ?? {};

  const rankingCols = useMemo(
    () => ({
      [TABS.PAUSED]: [
        { name: '#', width: '60px', cell: (_r, i) => page * size + i + 1 },
        { 
          name: 'Produtor',
          sortable: true,
          cell: (row) => {
            const pid = row?.uuid ?? row?.id ?? row?.producerId;
            return pid ? <a href={`/producer/${pid}`}>{row.name}</a> : row.name;
          }
        },
        { name: 'Último produto', selector: (r) => r.lastProduct, wrap: true },
        {
          name: 'Vendas ant.',
          selector: (r) => r.lastMonthSales,
          right: true,
          format: (r) => fmtNum(r.lastMonthSales),
        },
        {
          name: 'Última venda',
          selector: (r) => r.lastSaleDate,
          sortable: true,
          format: (r) => fmtDate(r.lastSaleDate),
        },
        {
          name: 'WhatsApp',
          cell: (row) => {
            const d = row.whatsapp?.replace(/\D/g, '');
            return d ? (
              <a href={`https://wa.me/55${d}`} target="_blank" rel="noreferrer">
                {d}
              </a>
            ) : (
              '—'
            );
          },
        },
      ],
      [TABS.COMP]: [
        { name: '#', width: '60px', cell: (_r, i) => page * size + i + 1 },
        { 
          name: 'Produtor',
          sortable: true,
          cell: (row) => {
            const pid = row?.uuid ?? row?.id ?? row?.producerId;
            return pid ? <a href={`/producer/${pid}`}>{row.name}</a> : row.name;
          }
        },
        {
          name: 'Período Anterior',
          selector: (r) => r.prevSales,
          right: true,
          format: (r) => fmtBRL(r.prevSales),
        },
        {
          name: 'Período Atual',
          selector: (r) => r.currSales,
          right: true,
          format: (r) => fmtBRL(r.currSales),
        },
        {
          name: 'Δ%',
          selector: (r) => r.diffPct,
          right: true,
          sortable: true,
          format: (r) => fmtPct(r.diffPct),
        },
        {
          name: 'WhatsApp',
          cell: (row) => {
            const d = row.whatsapp?.replace(/\D/g, '');
            return d ? (
              <a href={`https://wa.me/55${d}`} target="_blank" rel="noreferrer">
                {d}
              </a>
            ) : (
              '—'
            );
          },
        },
      ],
      [TABS.DROP]: [
        { name: '#', width: '60px', cell: (_r, i) => page * size + i + 1 },
        { 
          name: 'Produtor',
          sortable: true,
          cell: (row) => {
            const pid = row?.uuid ?? row?.id ?? row?.producerId;
            return pid ? <a href={`/producer/${pid}`}>{row.name}</a> : row.name;
          }
        },
        {
          name: 'Período Anterior',
          selector: (r) => r.older,
          right: true,
          format: (r) => fmtBRL(r.older),
        },
        {
          name: 'Período Atual',
          selector: (r) => r.recent,
          right: true,
          format: (r) => fmtBRL(r.recent),
        },
        {
          name: 'Queda %',
          selector: (r) => r.dropPct,
          right: true,
          sortable: true,
          format: (r) => fmtPct(r.dropPct),
        },
        {
          name: 'WhatsApp',
          cell: (row) => {
            const d = row.whatsapp?.replace(/\D/g, '');
            return d ? (
              <a href={`https://wa.me/55${d}`} target="_blank" rel="noreferrer">
                {d}
              </a>
            ) : (
              '—'
            );
          },
        },
      ],
    }),
    [page, size],
  );

  return (
    <>
      <Row className="mt-2">
        {[30, 60, 90].map((d) => (
          <Col key={`pin-${d}`} xs="12" md="4" className="mb-2">
            <Card className="text-center px-3 pt-3 pb-1 h-100">
              {pinLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <div>
                    <strong>
                      {typeof pin[`pin${d}`] === 'number'
                        ? fmtNum(pin[`pin${d}`])
                        : '–'}
                    </strong>
                  </div>
                  <small>ativos últimos {d} dias</small>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <CardBody>
          <div className={`${isMobile ? 'mb-2' : 'mb-0'}`}>
            {isMobile ? (
              <Input
                type="select"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                {TAB_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </Input>
            ) : (
              <div className="btn-group mb-2 w-100 tabs-scroll-mobile">
                {TAB_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    className={`btn btn-sm ${
                      activeTab === o.key ? 'btn-primary' : 'btn-secondary'
                    }`}
                    onClick={() => setActiveTab(o.key)}
                    style={{ minWidth: 120 }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Alert color="info" className="p-2 mb-2">
            <small>
              {activeTab === TABS.PAUSED &&
                'Produtores com ≥1 venda no período anterior e 0 no atual.'}
              {activeTab === TABS.COMP &&
                `Comparativo livre de dois períodos. Produtores ≥ ${fmtBRL(
                  threshold,
                )}; Δ% = variação.`}
              {activeTab === TABS.DROP &&
                `Produtores com queda ≥ ${dropPct}% no período selecionado.`}
            </small>
          </Alert>

          <Row form className="align-items-end mb-2">
            <Col xs="12" sm="6" md="3" className="mb-2 mb-md-0">
              <label>Período Anterior</label>
              <div className="d-flex align-items-center">
                <Calendar size={16} className="mr-1" />
                <Flatpickr
                  value={prevRange}
                  options={{ mode: 'range', dateFormat: 'd/m/Y' }}
                  onChange={setPrevRange}
                  className="form-control flat-picker bg-transparent border-0 shadow-none"
                  style={{ minWidth: 0, flex: 1 }}
                />
              </div>
            </Col>
            <Col xs="12" sm="6" md="3" className="mb-2 mb-md-0">
              <label>Período Atual</label>
              <div className="d-flex align-items-center">
                <Calendar size={16} className="mr-1" />
                <Flatpickr
                  value={currRange}
                  options={{ mode: 'range', dateFormat: 'd/m/Y' }}
                  onChange={setCurrRange}
                  className="form-control flat-picker bg-transparent border-0 shadow-none"
                  style={{ minWidth: 0, flex: 1 }}
                />
              </div>
            </Col>
            {activeTab === TABS.COMP && (
              <Col xs="12" sm="6" md="2" className="mb-2 mb-md-0">
                <label>Faturamento (min)</label>
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value) || 0)}
                />
              </Col>
            )}
            {activeTab === TABS.DROP && (
              <Col xs="12" sm="6" md="2" className="mb-2 mb-md-0">
                <label>Queda mínima (%)</label>
                <Input
                  type="number"
                  value={dropPct}
                  onChange={(e) => setDropPct(Number(e.target.value) || 0)}
                />
              </Col>
            )}
          </Row>

          <div className="datatable-responsive-wrapper">
            <DataTable
              columns={rankingCols[activeTab]}
              data={Array.isArray(dataRows) ? dataRows : []}
              progressPending={loading}
              pagination
              paginationServer
              paginationPerPage={size}
              paginationTotalRows={total}
              paginationRowsPerPageOptions={[10, 30, 50]}
              paginationDefaultPage={page + 1}
              onChangeRowsPerPage={(per) => {
                setSize(per);
                setPage(0);
              }}
              onChangePage={(p) => setPage(p - 1)}
              noHeader
              noDataComponent="Nenhum registro encontrado"
              theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              className="datatable-mobile"
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
}
