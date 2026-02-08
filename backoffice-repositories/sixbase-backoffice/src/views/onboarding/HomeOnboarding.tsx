import '@styles/react/libs/charts/recharts.scss';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import React, {
  useEffect,
  useState,
  FC,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import DataTable from 'react-data-table-component';
import { useSkin } from '../../utility/hooks/useSkin';
import { Calendar, Eye, ChevronDown } from 'react-feather';
import Flatpickr from 'react-flatpickr';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
  Spinner,
  Row,
  Col,
} from 'reactstrap';

import { api } from '../../services/api';
import { useModalDetails } from './modal-details';

import {
  Column,
  OnboardingRecord,
  FilterState,
  ApiResponse,
  FieldsState,
  ModalDetailsState,
} from '../../interfaces/onboarding.interface';

import LineChartComponent from '../../components/LineChart';
import { KpiCard } from 'components/KpiCard';

moment.locale('pt-br');

const configNotify = {
  position: 'top-right' as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const columns = memoizeOne(
  (setModalDetails: (details: ModalDetailsState) => void): Column[] => [
    {
      name: 'Data',
      cell: (row: OnboardingRecord) => row?.onboarding.created_at,
    },
    {
      name: 'Email',
      cell: (row: OnboardingRecord) => row.email,
    },
    {
      name: 'Nome',
      cell: (row: OnboardingRecord) => (
        <Link to={`/producer/${row.uuid}`}>{row.full_name}</Link>
      ),
    },
    {
      name: 'Tipo de usuário',
      cell: (row: OnboardingRecord) => <b>{row?.onboarding.user_type}</b>,
    },
    {
      name: 'Instagram',
      cell: (row: OnboardingRecord) => {
        if (!row.instagram) return '-';
        const instagramUser = row.instagram.replace(/^@/, '');

        return (
          <a
            href={`https://www.instagram.com/${instagramUser}`}
            target="_blank"
            rel="noreferrer"
          >
            {row.instagram}
          </a>
        );
      },
    },
    {
      name: 'TikTok',
      cell: (row: OnboardingRecord) => {
        if (!row.tiktok) return '-';

        let tiktokUser = row.tiktok.replace(/^@/, '');
        if (!tiktokUser.startsWith('https://')) {
          tiktokUser = `https://www.tiktok.com/@${tiktokUser}`;
        }

        return (
          <a href={tiktokUser} target="_blank" rel="noreferrer">
            {row.tiktok}
          </a>
        );
      },
    },
    {
      name: 'Documento',
      cell: (row: OnboardingRecord) => row.document_number,
    },
    {
      name: 'Ver detalhes',
      cell: (row: OnboardingRecord) => (
        <Badge
          color="primary"
          className="view-details cursor-pointer"
          onClick={() =>
            setModalDetails({
              showModalDetails: true,
              row,
            })
          }
        >
          <Eye size={40} />
        </Badge>
      ),
      center: true,
    },
  ],
);
const HomeOnboarding: FC = () => {
  const { skin } = useSkin();

  const [inputFilter, setInputFilter] = useState<string>('');
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [recordsCount, setRecordsCount] = useState<number>(0);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [requesting, setRequesting] = useState<boolean>(false);

  const [chartData, setChartData] = useState<
    Array<{
      date: string;
      total?: number;
      creator?: number;
      marca?: number;
    }>
  >([]);

  const [currentPeriodStats, setCurrentPeriodStats] = useState<{
    total: number;
    creator: number;
    marca: number;
    avg: number;
  }>({
    total: 0,
    creator: 0,
    marca: 0,
    avg: 0,
  });

  const useDebounce = <T,>(value: T, delay: number): T => {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
  };

  const { ModalDetails, setModalDetails } = useModalDetails();

  const [filter, setFilter] = useState<FilterState>({
    calendar: [
      moment().startOf('month').toDate(),
      moment().endOf('month').toDate(),
    ],
  });

  const [fields, setFields] = useState<FieldsState>({
    signup_reason: '',
    has_sold: '',
    revenue: '',
    user_type: '',
  });

  const [versionCombinations, setVersionCombinations] = useState<
    Array<{
      creator_version: number | null;
      marca_version: number | null;
      label: string;
      count: number;
    }>
  >([]);

  const [selectedVersionCombination, setSelectedVersionCombination] = useState<{
    creator_version: number | null;
    marca_version: number | null;
  } | null>(null);

  const [showOnboardingKpis, setShowOnboardingKpis] = useState<boolean>(false);
  const [onboardingKpisDataLoaded, setOnboardingKpisDataLoaded] = useState({
    card1: false,
    card2: false,
    card3: false,
    card4: false,
  });

  const [comparisonCount, setComparisonCount] = useState<number>(2);

  const [onboardingCard1Range, setOnboardingCard1Range] = useState<Date[]>([]);
  const [onboardingCard1Stats, setOnboardingCard1Stats] = useState({
    total: 0,
    creator: 0,
    marca: 0,
    avg: 0,
  });
  const [onboardingCard1Loading, setOnboardingCard1Loading] =
    useState<boolean>(false);

  const [onboardingCard2Range, setOnboardingCard2Range] = useState<Date[]>([]);
  const [onboardingCard2Stats, setOnboardingCard2Stats] = useState({
    total: 0,
    creator: 0,
    marca: 0,
    avg: 0,
  });
  const [onboardingCard2Loading, setOnboardingCard2Loading] =
    useState<boolean>(false);

  const [onboardingCard3Range, setOnboardingCard3Range] = useState<Date[]>([]);
  const [onboardingCard3Stats, setOnboardingCard3Stats] = useState({
    total: 0,
    creator: 0,
    marca: 0,
    avg: 0,
  });
  const [onboardingCard3Loading, setOnboardingCard3Loading] =
    useState<boolean>(false);

  const [onboardingCard4Range, setOnboardingCard4Range] = useState<Date[]>([]);
  const [onboardingCard4Stats, setOnboardingCard4Stats] = useState({
    total: 0,
    creator: 0,
    marca: 0,
    avg: 0,
  });
  const [onboardingCard4Loading, setOnboardingCard4Loading] =
    useState<boolean>(false);

  const [globalLoading, setGlobalLoading] = useState<boolean>(true);

  const kpisBodyRef = useRef<HTMLDivElement>(null);

  const computeOnboardingStatsForRange = async (
    startDate: Date,
    endDate: Date,
    userType?: string,
  ): Promise<{
    total: number;
    creator: number;
    marca: number;
    avg: number;
  }> => {
    const startM = moment(startDate).startOf('day');
    const endM = moment(endDate).endOf('day');
    const daysDiff = endM.diff(startM, 'days') + 1;

    try {
      const start = startM.format('YYYY-MM-DD HH:mm:ss');
      const end = endM.format('YYYY-MM-DD HH:mm:ss');

      const params: any = {
        start_date: start,
        end_date: end,
        user_type: userType || undefined,
      };

      const { data } = await api.get('onboarding/daily', { params });

      const byDate = new Map<
        string,
        { creator: number; marca: number; total: number }
      >();

      (data || []).forEach((d: any) => {
        byDate.set(d.date, {
          creator: Number(d.creator ?? 0),
          marca: Number(d.marca ?? 0),
          total: Number(d.total ?? 0),
        });
      });

      const normalized: Array<{
        date: string;
        creator: number;
        marca: number;
        total: number;
      }> = [];

      const cursor = startM.clone();
      while (cursor.isSameOrBefore(endM, 'day')) {
        const key = cursor.format('YYYY-MM-DD');
        const val = byDate.get(key) || { creator: 0, marca: 0, total: 0 };
        normalized.push({ date: key, ...val });
        cursor.add(1, 'day');
      }

      const totals = normalized.reduce(
        (acc, curr) => ({
          total: acc.total + curr.total,
          creator: acc.creator + curr.creator,
          marca: acc.marca + curr.marca,
        }),
        { total: 0, creator: 0, marca: 0 },
      );

      const avg = daysDiff > 0 ? totals.total / daysDiff : 0;

      return {
        total: totals.total,
        creator: totals.creator,
        marca: totals.marca,
        avg,
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas de onboarding:', error);
      return { total: 0, creator: 0, marca: 0, avg: 0 };
    }
  };

  const loadOnboardingCard1Data = useCallback(async () => {
    if (!onboardingCard1Range?.length || onboardingCard1Range.length !== 2) return;

    setOnboardingCard1Loading(true);
    try {
      const stats = await computeOnboardingStatsForRange(
        onboardingCard1Range[0],
        onboardingCard1Range[1],
        fields.user_type,
      );
      setOnboardingCard1Stats(stats);
      setOnboardingKpisDataLoaded(prev => ({ ...prev, card1: true }));
    } catch (error) {
      console.error('Erro ao carregar dados do Card 1:', error);
      setOnboardingCard1Stats({ total: 0, creator: 0, marca: 0, avg: 0 });
    }
    setOnboardingCard1Loading(false);
  }, [onboardingCard1Range, fields.user_type]);

  const loadOnboardingCard2Data = useCallback(async () => {
    if (!onboardingCard2Range?.length || onboardingCard2Range.length !== 2) return;
    setOnboardingCard2Loading(true);
    try {
      const stats = await computeOnboardingStatsForRange(
        onboardingCard2Range[0],
        onboardingCard2Range[1],
        fields.user_type,
      );
      setOnboardingCard2Stats(stats);
      setOnboardingKpisDataLoaded(prev => ({ ...prev, card2: true }));
    } catch (error) {
      console.error('Erro ao carregar dados do Card 2:', error);
      setOnboardingCard2Stats({ total: 0, creator: 0, marca: 0, avg: 0 });
    }
    setOnboardingCard2Loading(false);
  }, [onboardingCard2Range, fields.user_type]);

  const loadOnboardingCard3Data = useCallback(async () => {
    if (!onboardingCard3Range?.length || onboardingCard3Range.length !== 2) return;
    setOnboardingCard3Loading(true);

    try {
      const stats = await computeOnboardingStatsForRange(
        onboardingCard3Range[0],
        onboardingCard3Range[1],
        fields.user_type,
      );
      setOnboardingCard3Stats(stats);
      setOnboardingKpisDataLoaded(prev => ({ ...prev, card3: true }));
    } catch (error) {
      console.error('Erro ao carregar dados do Card 3:', error);
      setOnboardingCard3Stats({ total: 0, creator: 0, marca: 0, avg: 0 });
    }

    setOnboardingCard3Loading(false);
  }, [onboardingCard3Range, fields.user_type]);

  const loadOnboardingCard4Data = useCallback(async () => {
    if (!onboardingCard4Range?.length || onboardingCard4Range.length !== 2) return;
    setOnboardingCard4Loading(true);

    try {
      const stats = await computeOnboardingStatsForRange(
        onboardingCard4Range[0],
        onboardingCard4Range[1],
        fields.user_type,
      );
      setOnboardingCard4Stats(stats);
      setOnboardingKpisDataLoaded(prev => ({ ...prev, card4: true }));
    } catch (error) {
      console.error('Erro ao carregar dados do Card 4:', error);
      setOnboardingCard4Stats({ total: 0, creator: 0, marca: 0, avg: 0 });
    }

    setOnboardingCard4Loading(false);
  }, [onboardingCard4Range, fields.user_type]);

  const setQuickRange = (days: number): void => {
    const end = moment().endOf('day');
    const start = end.clone().subtract(days - 1, 'days').startOf('day');

    setMonthRange([start.toDate(), end.toDate()]);
    setFilter(prev => ({
      ...prev,
      calendar: [start.toDate(), end.toDate()],
    }));
  };

  const debouncedCalendar = useDebounce(filter.calendar, 350);
  const debouncedUserType = useDebounce(fields.user_type, 250);

  const memoSeries = useMemo<Array<'total' | 'creator' | 'marca'>>(() => {
    if (debouncedUserType === 'creator') return ['creator'];
    if (debouncedUserType === 'marca') return ['marca'];
    return ['creator', 'marca', 'total'];
  }, [debouncedUserType]);

  const fetchVersionCombinations = useCallback(async () => {
    try {
      const response = await api.get('/onboarding/version-combinations', {
        params: {
          start_date: moment(filter.calendar[0]).format('YYYY-MM-DD'),
          end_date: moment(filter.calendar[1]).format('YYYY-MM-DD'),
        },
      });

      setVersionCombinations(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar combinações de versões:', error);
    }
  }, [filter.calendar]);

  const fetchData = useCallback(
    async (page: number = 0, newPerPage: number | null = null): Promise<void> => {
      setLoading(true);

      try {
        const params: any = {
          page,
          size: newPerPage ?? recordsPerPage,
          input: inputFilter,
          start_date: moment(filter.calendar[0]).format('YYYY-MM-DD'),
          end_date: moment(filter.calendar[1]).format('YYYY-MM-DD'),
          has_sold: fields.has_sold,
          revenue: fields.revenue,
          signup_reason: fields.signup_reason,
          user_type: fields.user_type,
        };

        if (selectedVersionCombination) {
          if (selectedVersionCombination.creator_version !== null) {
            params.creator_version = selectedVersionCombination.creator_version;
          }
          if (selectedVersionCombination.marca_version !== null) {
            params.marca_version = selectedVersionCombination.marca_version;
          }
        }

        const response = await api.get<ApiResponse>('onboarding', { params });
        setRecords(response.data.rows);
        setRecordsCount(response.data.count);
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    },
    [
      inputFilter,
      filter.calendar,
      fields,
      recordsPerPage,
      selectedVersionCombination,
    ],
  );

  const [monthRange, setMonthRange] = useState<Date[]>([
    filter.calendar[0],
    filter.calendar[1],
  ]);

  useEffect(() => {
    setMonthRange([filter.calendar[0], filter.calendar[1]]);
  }, [filter.calendar]);

  useEffect(() => {
    const load = async () => {
      setGlobalLoading(true);

      try {
        const start = moment(debouncedCalendar[0])
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss');

        const end = moment(debouncedCalendar[1])
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss');

        const params: any = {
          start_date: start,
          end_date: end,
          user_type: debouncedUserType || undefined,
        };

        const { data } = await api.get('onboarding/daily', { params });

        const byDate = new Map<
          string,
          { creator: number; marca: number; total: number }
        >();

        (data || []).forEach((d: any) => {
          byDate.set(d.date, {
            creator: Number(d.creator ?? 0),
            marca: Number(d.marca ?? 0),
            total: Number(d.total ?? 0),
          });
        });

        const startM = moment(debouncedCalendar[0]).startOf('day');
        const endM = moment(debouncedCalendar[1]).endOf('day');

        const normalized: Array<{
          date: string;
          creator: number;
          marca: number;
          total: number;
        }> = [];

        const cursor = startM.clone();
        while (cursor.isSameOrBefore(endM, 'day')) {
          const key = cursor.format('YYYY-MM-DD');
          const val = byDate.get(key) || { creator: 0, marca: 0, total: 0 };
          normalized.push({ date: key, ...val });
          cursor.add(1, 'day');
        }

        setChartData(normalized);

        const totals = normalized.reduce(
          (acc, curr) => ({
            total: acc.total + (curr.total || 0),
            creator: acc.creator + (curr.creator || 0),
            marca: acc.marca + (curr.marca || 0),
          }),
          { total: 0, creator: 0, marca: 0 },
        );

        const today = moment().endOf('day');
        const effectiveEnd = endM.isAfter(today) ? today : endM;

        let daysDiff = effectiveEnd.diff(startM, 'days') + 1;
        if (daysDiff <= 0) daysDiff = 1;

        const avg = totals.total / daysDiff;

        setCurrentPeriodStats({
          total: totals.total,
          creator: totals.creator,
          marca: totals.marca,
          avg,
        });
      } catch (error) {
        console.error('[onboarding/daily] erro: ', error);
      } finally {
        setGlobalLoading(false);
      }
    };

    load();
  }, [debouncedCalendar, debouncedUserType]);

  useEffect(() => {
    if (inputFilter.length === 0 || inputFilter.trim().length > 0) {
      fetchData(0);
    }
  }, [inputFilter, fetchData]);

  useEffect(() => {
    fetchVersionCombinations();
  }, [fetchVersionCombinations]);

  const filteredVersionCombinations = useMemo(() => {
    if (!fields.user_type) return versionCombinations;

    if (fields.user_type === 'creator') {
      return versionCombinations.filter(v => v.creator_version !== null);
    }

    if (fields.user_type === 'marca') {
      return versionCombinations.filter(v => v.marca_version !== null);
    }

    return versionCombinations;
  }, [versionCombinations, fields.user_type]);

  useEffect(() => {
    fetchData(0);
  }, [selectedVersionCombination]);

  useEffect(() => {
    setOnboardingKpisDataLoaded({
      card1: false,
      card2: false,
      card3: false,
      card4: false,
    });
  }, [
    onboardingCard1Range,
    onboardingCard2Range,
    onboardingCard3Range,
    onboardingCard4Range,
    fields.user_type,
  ]);

  useEffect(() => {
    if (showOnboardingKpis && !onboardingKpisDataLoaded.card1) {
      loadOnboardingCard1Data();
    }
  }, [showOnboardingKpis, onboardingKpisDataLoaded.card1, loadOnboardingCard1Data]);

  useEffect(() => {
    if (showOnboardingKpis && !onboardingKpisDataLoaded.card2) {
      loadOnboardingCard2Data();
    }
  }, [showOnboardingKpis, onboardingKpisDataLoaded.card2, loadOnboardingCard2Data]);

  useEffect(() => {
    if (showOnboardingKpis && !onboardingKpisDataLoaded.card3) {
      loadOnboardingCard3Data();
    }
  }, [showOnboardingKpis, onboardingKpisDataLoaded.card3, loadOnboardingCard3Data]);

  useEffect(() => {
    if (showOnboardingKpis && comparisonCount >= 4 && !onboardingKpisDataLoaded.card4) {
      loadOnboardingCard4Data();
    }
  }, [
    showOnboardingKpis,
    comparisonCount,
    onboardingKpisDataLoaded.card4,
    loadOnboardingCard4Data,
  ]);

  const handleRecordsPerPageChange = async (newPerPage: number, page: number) => {
    await fetchData(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page: number) => {
    fetchData(page - 1);
  };

  const changeFilter = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.currentTarget;
    setFields(prev => ({ ...prev, [name]: value }));

    if (name === 'user_type') {
      setSelectedVersionCombination(null);
    }
  };

  const submitExport = (): void => {
    toast.success('Exportando... Essa operação pode demorar', configNotify);
    setRequesting(true);

    api
      .get('onboarding/export', {
        responseType: 'blob',
        params: {
          format: 'xlsx',
          has_sold: fields.has_sold,
          revenue: fields.revenue,
          signup_reason: fields.signup_reason,
          user_type: fields.user_type,
          input: inputFilter,
          start_date: moment(filter.calendar[0]).format('YYYY-MM-DD'),
          end_date: moment(filter.calendar[1]).format('YYYY-MM-DD'),
        },
      })
      .then(r => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `onboarding.xlsx`);
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => toast.error('Erro ao baixar arquivo', configNotify))
      .finally(() => setRequesting(false));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="mb-1">Onboarding</h3>
      </div>
      <ModalDetails />
      <Card>
        <CardBody>
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 gap-2">

            <div className="d-flex align-items-center">
              <Calendar size={15} className="ml-1 mr-1" />

              <Flatpickr
                className="form-control flat-picker bg-transparent border-0 shadow-none"
                style={{ width: '100%', minWidth: 200, maxWidth: 215 }}
                value={monthRange}
                onChange={(dates: Date[]) => {
                  setMonthRange(dates);

                  if (dates && dates.length === 2) {
                    const [first, second] = dates;

                    let start = moment(first).startOf('day');
                    let end = moment(second).endOf('day');

                    setFilter(prev => ({
                      ...prev,
                      calendar: [start.toDate(), end.toDate()],
                    }));
                  }
                }}
                options={{
                  mode: 'range',
                  dateFormat: 'd/m/Y',
                  locale: Portuguese,
                }}
              />
            </div>

            <div className="d-flex align-items-center">
              <Label className="mb-0 mr-2" style={{ whiteSpace: 'nowrap' }}>
                Tipo de usuário
              </Label>

              <Input
                type="select"
                name="user_type"
                value={fields.user_type}
                onChange={changeFilter}
                style={{ width: '100%', minWidth: 150, maxWidth: 200 }}
              >
                <option value="">Todos</option>
                <option value="creator">Creator</option>
                <option value="marca">Produtor</option>
              </Input>
            </div>

          </div>

          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between flex-wrap mb-2 gap-2">

            <div className="d-flex flex-wrap gap-1">
              <Button size="sm" color="primary" onClick={() => setQuickRange(1)}>
                Hoje
              </Button>
              <Button size="sm" color="primary" onClick={() => setQuickRange(7)}>
                7 dias
              </Button>
              <Button size="sm" color="primary" onClick={() => setQuickRange(15)}>
                15 dias
              </Button>
              <Button size="sm" color="primary" onClick={() => setQuickRange(30)}>
                30 dias
              </Button>
              <Button size="sm" color="primary" onClick={() => setQuickRange(60)}>
                60 dias
              </Button>
              <Button size="sm" color="primary" onClick={() => setQuickRange(90)}>
                90 dias
              </Button>
            </div>

            <div className="d-flex flex-wrap gap-3 align-items-center">

              <div className="text-center">
                <div className="text-muted small">Total</div>
                <div className="h6 mb-0 font-weight-bold text-primary">
                  {currentPeriodStats.total.toLocaleString()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-muted small">Creators</div>
                <div className="h6 mb-0 font-weight-bold text-danger">
                  {currentPeriodStats.creator.toLocaleString()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-muted small">Marcas</div>
                <div className="h6 mb-0 font-weight-bold text-warning">
                  {currentPeriodStats.marca.toLocaleString()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-muted small">Média Diária</div>
                <div className="h6 mb-0 font-weight-bold text-success">
                  {currentPeriodStats.avg.toFixed(1)}
                </div>
              </div>

            </div>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', minHeight: 250 }}>
            <LineChartComponent
              data={chartData}
              series={memoSeries}
              height={
                typeof window !== 'undefined' && window.innerWidth < 768
                  ? 250
                  : 300
              }
              valueFormat="integer"
              loading={globalLoading}
            />
          </div>

        </CardBody>
      </Card>

      <Card className="mt-1 mb-2" style={{ willChange: 'auto' }}>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 d-flex align-items-center" style={{ gap: 8 }}>
            KPIs Personalizados - Onboarding
          </h6>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
            onClick={() => setShowOnboardingKpis(v => !v)}
            style={{ gap: 6 }}
          >
            {showOnboardingKpis ? 'Ocultar' : 'Exibir'}

            <ChevronDown
              size={16}
              style={{
                transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                transform: showOnboardingKpis ? 'rotate(180deg)' : 'rotate(0deg)',
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
            maxHeight: showOnboardingKpis ? 9999 : 0,
            opacity: showOnboardingKpis ? 1 : 0,
          }}
        >
          <CardBody>
            {showOnboardingKpis && (
              <>
                <Row
                  className="align-items-start justify-content-between g-2"
                  style={{ rowGap: '1.5rem' }}
                >
                  <Col
                    xl={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 6}
                    lg={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 6}
                    md={comparisonCount === 2 ? 6 : comparisonCount === 3 ? 4 : 12}
                    sm={12}
                  >
                    <KpiCard
                      title="Período 1"
                      range={onboardingCard1Range}
                      setRange={setOnboardingCard1Range}
                      stats={[
                        { label: 'Total Onboarding', value: onboardingCard1Stats.total, color: '#4dd0bc' },
                        { label: 'Creators', value: onboardingCard1Stats.creator, color: '#d04d62' },
                        { label: 'Marcas', value: onboardingCard1Stats.marca, color: '#F59E0B' },
                        { label: 'Média Diária', value: onboardingCard1Stats.avg },
                      ]}
                      loading={onboardingCard1Loading}
                      valueFormat="integer"
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
                        range={onboardingCard2Range}
                        setRange={setOnboardingCard2Range}
                        stats={[
                          { label: 'Total Onboarding', value: onboardingCard2Stats.total, color: '#4dd0bc' },
                          { label: 'Creators', value: onboardingCard2Stats.creator, color: '#d04d62' },
                          { label: 'Marcas', value: onboardingCard2Stats.marca, color: '#F59E0B' },
                          { label: 'Média Diária', value: onboardingCard2Stats.avg },
                        ]}
                        loading={onboardingCard2Loading}
                        valueFormat="integer"
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
                        range={onboardingCard3Range}
                        setRange={setOnboardingCard3Range}
                        stats={[
                          { label: 'Total Onboarding', value: onboardingCard3Stats.total, color: '#4dd0bc' },
                          { label: 'Creators', value: onboardingCard3Stats.creator, color: '#d04d62' },
                          { label: 'Marcas', value: onboardingCard3Stats.marca, color: '#F59E0B' },
                          { label: 'Média Diária', value: onboardingCard3Stats.avg },
                        ]}
                        loading={onboardingCard3Loading}
                        valueFormat="integer"
                      />
                    </Col>
                  )}

                  {comparisonCount >= 4 && (
                    <Col xl={6} lg={6} md={12} sm={12}>
                      <KpiCard
                        title="Período 4"
                        range={onboardingCard4Range}
                        setRange={setOnboardingCard4Range}
                        stats={[
                          { label: 'Total Onboarding', value: onboardingCard4Stats.total, color: '#4dd0bc' },
                          { label: 'Creators', value: onboardingCard4Stats.creator, color: '#d04d62' },
                          { label: 'Marcas', value: onboardingCard4Stats.marca, color: '#F59E0B' },
                          { label: 'Média Diária', value: onboardingCard4Stats.avg },
                        ]}
                        loading={onboardingCard4Loading}
                        valueFormat="integer"
                      />
                    </Col>
                  )}
                </Row>
              </>
            )}
          </CardBody>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="d-flex flex-column gap-2 w-100">
            <div className="d-flex flex-column w-100">
              <Label className="mb-1">Filtrar por: Nome e E-mail</Label>
              <Input
                onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => {
                  setTimeout(() => {
                    setInputFilter(target.value);
                  }, 300); // debounce reduzido para melhor UX
                }}
                style={{ borderRadius: '8px' }}
                placeholder="Digite para filtrar…"
              />
            </div>

            <div className="d-flex flex-column w-100">
              <div className="d-flex gap-2 w-100 align-items-end">

                <div className="d-flex flex-column" style={{ flex: 1 }}>
                  <Label className="mb-1">Tipo de usuário</Label>
                  <Input
                    type="select"
                    name="user_type"
                    value={fields.user_type}
                    onChange={changeFilter}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="">Todos</option>
                    <option value="creator">Creator</option>
                    <option value="marca">Marca</option>
                  </Input>
                </div>

                <div className="d-flex flex-column" style={{ flex: 1 }}>
                  <Label className="mb-1">Versão do formulário</Label>
                  <Input
                    type="select"
                    value={
                      selectedVersionCombination
                        ? JSON.stringify(selectedVersionCombination)
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedVersionCombination(JSON.parse(e.target.value));
                      } else {
                        setSelectedVersionCombination(null);
                      }
                    }}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="">Todas as versões (apenas ativas)</option>
                    {filteredVersionCombinations.map((combination, index) => (
                      <option
                        key={index}
                        value={JSON.stringify({
                          creator_version: combination.creator_version,
                          marca_version: combination.marca_version,
                        })}
                      >
                        {combination.label} ({combination.count} resposta
                        {combination.count !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </Input>
                </div>

                <Button
                  color="primary"
                  style={{ borderRadius: '8px', flexShrink: 0 }}
                  onClick={submitExport}
                >
                  {requesting ? 'Baixando...' : 'Exportar'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <DataTable
            columns={columns(setModalDetails)}
            data={records}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={recordsCount}
            onChangeRowsPerPage={handleRecordsPerPageChange}
            onChangePage={handleRecordsPageChange}
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página:',
              rangeSeparatorText: 'de',
              noRowsPerPage: false,
            }}
            progressComponent={<Spinner />}
            noDataComponent={<>Nenhum registro encontrado</>}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
            className="react-dataTable"
          />
        </CardBody>
      </Card>

    </div>
  );
};

export default HomeOnboarding;