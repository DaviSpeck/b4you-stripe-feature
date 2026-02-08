import { FC, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, Row, Col } from 'reactstrap';
import { ChevronDown } from 'react-feather';
import { KpiCard } from '../KpiCard';
import { api } from '../../services/api';
import moment from 'moment';
import InfoTooltip from 'components/common/InfoTooltip';

interface CreatorsKPIsProps {
  showCreatorsKpis: boolean;
  setShowCreatorsKpis: (show: boolean) => void;
}

const CreatorsKPIs: FC<CreatorsKPIsProps> = ({
  showCreatorsKpis,
  setShowCreatorsKpis,
}) => {
  const kpisBodyRef = useRef<HTMLDivElement>(null);

  const [creatorsCard1Range, setCreatorsCard1Range] = useState<Date[]>([
    moment().startOf('month').toDate(),
    moment().toDate(),
  ]);
  const [creatorsCard1Stats, setCreatorsCard1Stats] = useState({
    totalRegistered: 0,
    totalActive: 0,
  });
  const [creatorsCard1Loading, setCreatorsCard1Loading] =
    useState<boolean>(false);

  const [creatorsCard2Range, setCreatorsCard2Range] = useState<Date[]>([
    moment().subtract(1, 'month').startOf('month').toDate(),
    moment().subtract(1, 'month').endOf('month').toDate(),
  ]);
  const [creatorsCard2Stats, setCreatorsCard2Stats] = useState({
    totalRegistered: 0,
    totalActive: 0,
  });
  const [creatorsCard2Loading, setCreatorsCard2Loading] =
    useState<boolean>(false);

  const [creatorsKpisDataLoaded, setCreatorsKpisDataLoaded] = useState<{
    card1: boolean;
    card2: boolean;
  }>({ card1: false, card2: false });

  const loadCreatorsCard1Data = useCallback(async () => {
    if (!creatorsCard1Range || creatorsCard1Range.length !== 2) return;
    setCreatorsCard1Loading(true);
    try {
      const startDate = moment(creatorsCard1Range[0]).format('YYYY-MM-DD');
      const endDate = moment(creatorsCard1Range[1]).format('YYYY-MM-DD');

      const response = await api.get('/creators/kpi-stats', {
        params: { startDate, endDate },
      });

      setCreatorsCard1Stats({
        totalRegistered: response.data.totalRegistered || 0,
        totalActive: response.data.totalActive || 0,
      });
      setCreatorsKpisDataLoaded((prev) => ({ ...prev, card1: true }));
    } catch (error) {
      console.error('Erro ao carregar dados do Card 1:', error);
      setCreatorsKpisDataLoaded((prev) => ({ ...prev, card1: true }));
    } finally {
      setCreatorsCard1Loading(false);
    }
  }, [creatorsCard1Range]);

  const loadCreatorsCard2Data = useCallback(async () => {
    if (!creatorsCard2Range || creatorsCard2Range.length !== 2) return;
    setCreatorsCard2Loading(true);
    try {
      const startDate = moment(creatorsCard2Range[0]).format('YYYY-MM-DD');
      const endDate = moment(creatorsCard2Range[1]).format('YYYY-MM-DD');

      const response = await api.get('/creators/kpi-stats', {
        params: { startDate, endDate },
      });

      setCreatorsCard2Stats({
        totalRegistered: response.data.totalRegistered || 0,
        totalActive: response.data.totalActive || 0,
      });
      setCreatorsKpisDataLoaded((prev) => ({ ...prev, card2: true }));
    } catch (error) {
      console.error('Erro ao carregar dados do Card 2:', error);
      setCreatorsKpisDataLoaded((prev) => ({ ...prev, card2: true }));
    } finally {
      setCreatorsCard2Loading(false);
    }
  }, [creatorsCard2Range]);

  const card1StatsArray = useMemo(
    () => [
      {
        label: 'Creators (Afiliados)',
        value: creatorsCard1Stats.totalRegistered,
        color: '#6366f1',
      },
      {
        label: 'Creators Ativos (Afiliados)',
        value: creatorsCard1Stats.totalActive,
        color: '#10b981',
      },
    ],
    [creatorsCard1Stats.totalRegistered, creatorsCard1Stats.totalActive],
  );

  const card2StatsArray = useMemo(
    () => [
      {
        label: 'Creators Cadastrados',
        value: creatorsCard2Stats.totalRegistered,
        color: '#6366f1',
      },
      {
        label: 'Creators Ativos',
        value: creatorsCard2Stats.totalActive,
        color: '#10b981',
      },
    ],
    [creatorsCard2Stats.totalRegistered, creatorsCard2Stats.totalActive],
  );

  useEffect(() => {
    if (
      showCreatorsKpis &&
      !creatorsKpisDataLoaded.card1 &&
      creatorsCard1Range.length === 2
    ) {
      loadCreatorsCard1Data();
    }
  }, [
    showCreatorsKpis,
    creatorsKpisDataLoaded.card1,
    creatorsCard1Range,
    loadCreatorsCard1Data,
  ]);

  useEffect(() => {
    if (
      showCreatorsKpis &&
      !creatorsKpisDataLoaded.card2 &&
      creatorsCard2Range.length === 2
    ) {
      loadCreatorsCard2Data();
    }
  }, [
    showCreatorsKpis,
    creatorsKpisDataLoaded.card2,
    creatorsCard2Range,
    loadCreatorsCard2Data,
  ]);

  const prevCard1Range = useRef(creatorsCard1Range);
  const prevCard2Range = useRef(creatorsCard2Range);

  useEffect(() => {
    if (
      showCreatorsKpis &&
      creatorsKpisDataLoaded.card1 &&
      JSON.stringify(prevCard1Range.current) !==
      JSON.stringify(creatorsCard1Range)
    ) {
      prevCard1Range.current = creatorsCard1Range;
      loadCreatorsCard1Data();
    }
  }, [
    showCreatorsKpis,
    creatorsKpisDataLoaded.card1,
    creatorsCard1Range,
    loadCreatorsCard1Data,
  ]);

  useEffect(() => {
    if (
      showCreatorsKpis &&
      creatorsKpisDataLoaded.card2 &&
      JSON.stringify(prevCard2Range.current) !==
      JSON.stringify(creatorsCard2Range)
    ) {
      prevCard2Range.current = creatorsCard2Range;
      loadCreatorsCard2Data();
    }
  }, [
    showCreatorsKpis,
    creatorsKpisDataLoaded.card2,
    creatorsCard2Range,
    loadCreatorsCard2Data,
  ]);

  return (
    <Card className="mt-1 mb-2" style={{ willChange: 'auto' }}>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 d-flex align-items-center" style={{ gap: 8 }}>
          KPIs Personalizados - Creators
          <InfoTooltip
            size={14}
            content={`Estes KPIs consideram apenas usuários que já realizaram ao menos uma venda como afiliado.
Creators que apenas se cadastraram, mas ainda não venderam como afiliados, não entram nos cálculos.`}
          />
        </h6>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-flex align-items-center"
          onClick={() => setShowCreatorsKpis(!showCreatorsKpis)}
          style={{ gap: 6 }}
        >
          {showCreatorsKpis ? 'Ocultar' : 'Exibir'}
          <ChevronDown
            size={16}
            style={{
              transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
              transform: showCreatorsKpis ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </CardHeader>

      <div
        ref={kpisBodyRef}
        style={{
          overflow: 'hidden',
          willChange: 'max-height, opacity',
          transition:
            'max-height 480ms cubic-bezier(0.22, 1, 0.36, 1), opacity 360ms ease-out',
          maxHeight: showCreatorsKpis ? 9999 : 0,
          opacity: showCreatorsKpis ? 1 : 0,
        }}
      >
        <CardBody>
          {showCreatorsKpis && (
            <Row
              className="align-items-start justify-content-between g-2"
              style={{ rowGap: '1.5rem' }}
            >
              {/* Card 1 - Período 1 */}
              <Col xl={6} lg={6} md={12} sm={12}>
                <KpiCard
                  title="Período 1"
                  range={creatorsCard1Range}
                  setRange={setCreatorsCard1Range}
                  stats={card1StatsArray}
                  loading={creatorsCard1Loading}
                  valueFormat="integer"
                />
              </Col>

              {/* Card 2 - Período 2 */}
              <Col xl={6} lg={6} md={12} sm={12}>
                <KpiCard
                  title="Período 2"
                  range={creatorsCard2Range}
                  setRange={setCreatorsCard2Range}
                  stats={card2StatsArray}
                  loading={creatorsCard2Loading}
                  valueFormat="integer"
                />
              </Col>
            </Row>
          )}
        </CardBody>
      </div>
    </Card>
  );
};

export default CreatorsKPIs;
