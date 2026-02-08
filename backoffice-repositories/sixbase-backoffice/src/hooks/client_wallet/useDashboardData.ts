import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { TrendingDown, TrendingUp } from 'react-feather';
import { api } from '../../services/api';
import { DashboardData } from '../../views/client_wallet/tabs/dashboard/interfaces/dashboard.interface';
import { Manager } from '../../views/client_wallet/tabs/calendar/interfaces/calendar.interface';
import { RevenueData } from '../../views/client_wallet/tabs/dashboard/interfaces/dashboard.interface';
import { Stage } from '../../views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';
import { ManagerPhase } from '../../views/client_wallet/tabs/management/interfaces/management.interface';

interface UseDashboardDataProps {
  dateRange: Date[];
  selectedManager: string | number;
  isMaster: boolean;
  isCommercial?: boolean;
}

export const useDashboardData = ({
  dateRange,
  selectedManager,
  isMaster,
  isCommercial = false,
}: UseDashboardDataProps) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [data, setData] = useState<DashboardData>({
    totalClientes: 0,
    variacaoFaturamento: { valor: 0, percentual: 0 },
    novosClientes: 0,
    churn: 0,
    churnRevenueLoss: 0,
    churnCount: 0,
  });

  const [clientsCard, setClientsCard] = useState({
    active_clients: 0,
    new_clients_revenue: 0,
    new_clients: 0,
    retention_clients: 0,
    retention_revenue: 0,
    churn_clients: 0,
    base_clients: 0,
    base_revenue: 0,
  });

  const [loading, setLoading] = useState({
    revenue: false,
    clients: false,
    churn: false,
    chart: false,
    retention: false,
  });

  const [chartData, setChartData] = useState<
    Array<{
      date: string;
      faturamento_total?: number;
      faturamento_novos_clientes?: number;
      faturamento_retencao?: number;
      total_churn?: number;
    }>
  >([]);

  const [kanbanSummaryDashboard, setKanbanSummaryDashboard] = useState<
    Record<Stage, number>
  >({
    HEALTHY: 0,
    ATTENTION: 0,
    DROP: 0,
    CHURN: 0,
  });
  const [kanbanLoadingDashboard, setKanbanLoadingDashboard] = useState(false);

  const [managementKanbanSummary, setManagementKanbanSummary] = useState<
    Record<ManagerPhase, number>
  >({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });
  const [managementKanbanLoading, setManagementKanbanLoading] = useState(false);

  const [contactStatusSummary, setContactStatusSummary] = useState({
    NAO_CONTATADO: 0,
    EM_ANDAMENTO: 0,
    SEM_RETORNO: 0,
    FINALIZADO: 0,
  });
  const [contactStatusLoading, setContactStatusLoading] = useState(false);

  const [producersWithoutManagerCount, setProducersWithoutManagerCount] =
    useState(0);
  const [producersWithoutManagerLoading, setProducersWithoutManagerLoading] =
    useState(false);

  const [clientsWithManagerCount, setClientsWithManagerCount] = useState(0);
  const [clientsWithManagerLoading, setClientsWithManagerLoading] =
    useState(false);

  const rangePayload = useMemo(() => {
    if (!dateRange || dateRange.length < 2) return null;
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) return null;

    const originalStart = moment(startDate).startOf('day');
    const originalEnd = moment(endDate).endOf('day');
    const requestedDiff = Math.max(
      1,
      originalEnd
        .clone()
        .startOf('day')
        .diff(originalStart.clone().startOf('day'), 'days') + 1,
    );

    let start = originalStart.clone();
    let end = originalEnd.clone();
    const today = moment().startOf('day');

    if (end.isSameOrAfter(today)) {
      end = today.clone().subtract(1, 'day').endOf('day');
    }

    if (start.isAfter(end)) {
      start = end
        .clone()
        .subtract(requestedDiff - 1, 'days')
        .startOf('day');
    }

    const diffDays = Math.max(
      1,
      end.clone().startOf('day').diff(start.clone().startOf('day'), 'days') + 1,
    );

    const startDay = start.date();
    const endDay = end.date();
    const startMonth = start.month();
    const startYear = start.year();

    const prevMonthMoment = moment([startYear, startMonth, 1]).subtract(
      1,
      'month',
    );

    const prevMonthLastDay = prevMonthMoment.clone().endOf('month').date();
    const actualStartDay = Math.min(startDay, prevMonthLastDay);
    let prevStart = prevMonthMoment.clone().date(actualStartDay).startOf('day');

    const actualEndDay = Math.min(endDay, prevMonthLastDay);
    let prevEnd = prevMonthMoment.clone().date(actualEndDay).endOf('day');

    if (prevStart.isAfter(prevEnd)) {
      prevStart = prevEnd.clone().startOf('day');
    }

    return {
      start,
      end,
      prevStart,
      prevEnd,
      diffDays,
    };
  }, [dateRange]);

  const lastParamsRef = useRef<{
    startDate: string;
    endDate: string;
    managerId: string | number;
  } | null>(null);

  const hasLoadedRef = useRef(false);

  const dateRangeString = useMemo(() => {
    return {
      start: dateRange[0]?.toISOString().slice(0, 10) || '',
      end: dateRange[1]?.toISOString().slice(0, 10) || '',
    };
  }, [dateRange]);

  const revenueInfo = useMemo(() => {
    const isPositive = data.variacaoFaturamento.percentual >= 0;
    return {
      isPositive,
      title: isPositive
        ? 'Aumento de Faturamento (MoM)'
        : 'Queda de Faturamento (MoM)',
      value: Math.abs(data.variacaoFaturamento.valor),
      icon: isPositive ? TrendingUp : TrendingDown,
      tooltip: `Total faturado da carteira - Crescimento em faturamento vs período anterior (${isPositive ? 'Aumento' : 'Queda'
        }) - ${data.variacaoFaturamento.percentual.toFixed(2)}%`,
      color: isPositive ? '#22c55e' : undefined,
    };
  }, [data.variacaoFaturamento.percentual, data.variacaoFaturamento.valor]);

  const churnTooltip = useMemo(
    () =>
      `Clientes que já tiveram vendas mas nos últimos 30 dias não venderam (${data.churnCount})`,
    [data.churnCount],
  );

  const fetchRevenue = useCallback(async () => {
    setLoading((l) => ({ ...l, revenue: true }));
    try {
      const params: any = {
        start_date: dateRange[0].toISOString().slice(0, 10),
        end_date: dateRange[1].toISOString().slice(0, 10),
      };
      if (selectedManager !== null && selectedManager !== undefined) params.manager_id = selectedManager;

      const { data: r }: { data: RevenueData } = await api.get(
        '/client-wallet/revenue',
        { params },
      );

      setData((prev) => ({
        ...prev,
        variacaoFaturamento: {
          valor: r.total_revenue ?? 0,
          percentual: r.mom_percentage ?? 0,
        },
      }));
    } catch (err) {
      console.error('Erro ao buscar faturamento:', err);
    } finally {
      setLoading((l) => ({ ...l, revenue: false }));
    }
  }, [dateRange, selectedManager]);

  const fetchClientsCards = useCallback(async () => {
    setLoading((l) => ({ ...l, clients: true }));

    try {
      const params: any = {};
      if (selectedManager !== null && selectedManager !== undefined) params.manager_id = selectedManager;

      const { data } = await api.get('/client-wallet/clients/cards', {
        params,
      });

      setClientsCard((prev) => ({
        ...prev,
        active_clients: data.active_clients ?? 0,
        new_clients_revenue: data.new_clients_revenue ?? 0,
        new_clients: data.new_clients ?? 0,
      }));
    } catch (err) {
      console.error('Erro ao buscar cards de clientes:', err);
    } finally {
      setLoading((l) => ({ ...l, clients: false }));
    }
  }, [selectedManager]);

  const fetchRetentionCard = useCallback(async () => {
    setLoading((l) => ({ ...l, retention: true }));
    try {
      const params: any = {
        start_date: dateRange[0].toISOString().slice(0, 10),
        end_date: dateRange[1].toISOString().slice(0, 10),
      };
      if (selectedManager !== null && selectedManager !== undefined) params.manager_id = selectedManager;

      const { data } = await api.get('/client-wallet/retention/card', {
        params,
      });

      setClientsCard((prev) => ({
        ...prev,
        retention_clients: data.retention_count ?? 0,
        retention_revenue: data.retention_revenue ?? 0,
      }));
    } catch (err) {
      console.error('Erro ao buscar card de retenção:', err);
    } finally {
      setLoading((l) => ({ ...l, retention: false }));
    }
  }, [dateRange, selectedManager]);

  const fetchChurnCard = useCallback(async () => {
    try {
      setLoading((l) => ({ ...l, churn: true }));

      const startRaw = moment(dateRange[0]).startOf('day');
      const endRaw = moment(dateRange[1]).startOf('day');
      const today = moment().startOf('day');

      const endDate = endRaw.isAfter(today) ? today : endRaw;

      const totalDays = endDate.diff(startRaw, 'days') + 1;

      const prev_end = startRaw.clone().subtract(1, 'day').endOf('day');
      const prev_start = prev_end
        .clone()
        .subtract(totalDays - 1, 'days')
        .startOf('day');

      const params: any = {
        start_date: startRaw.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        prev_start_date: prev_start.format('YYYY-MM-DD'),
        prev_end_date: prev_end.format('YYYY-MM-DD'),
      };

      if (selectedManager !== null && selectedManager !== undefined) params.manager_id = selectedManager;

      const { data } = await api.get('/client-wallet/churn/card', { params });

      setData((prev) => ({
        ...prev,
        churn: data.churnRevenueLoss ?? 0,
        churnRevenueLoss: data.churnRevenueLoss ?? 0,
        churnCount: data.churnCount ?? 0,
      }));
    } catch (err) {
      console.error('Erro ao buscar churn card:', err);
    } finally {
      setLoading((l) => ({ ...l, churn: false }));
    }
  }, [dateRange, selectedManager]);

  const buildDateParams = useCallback(() => {
    if (!rangePayload) return null;

    return {
      start_date: rangePayload.start.format('YYYY-MM-DD'),
      end_date: rangePayload.end.format('YYYY-MM-DD'),
      prev_start_date: rangePayload.prevStart.format('YYYY-MM-DD'),
      prev_end_date: rangePayload.prevEnd.format('YYYY-MM-DD'),
    };
  }, [rangePayload]);

  const fetchKanbanSummary = useCallback(async () => {
    setKanbanLoadingDashboard(true);

    try {
      const dateParams = buildDateParams();
      if (!dateParams) {
        setKanbanSummaryDashboard({
          HEALTHY: 0,
          ATTENTION: 0,
          DROP: 0,
          CHURN: 0,
        });
        return;
      }

      const params: any = {
        ...dateParams,
      };

      if (selectedManager !== null && selectedManager !== undefined)
        params.manager_id = selectedManager;

      const { data } = await api.get('/client-wallet/producers/kanban/all', {
        params,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      const totalsByStage = data?.total_by_stage || {};

      setKanbanSummaryDashboard({
        HEALTHY: totalsByStage.HEALTHY || 0,
        ATTENTION: totalsByStage.ATTENTION || 0,
        DROP: totalsByStage.DROP || 0,
        CHURN: totalsByStage.CHURN || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar resumo dos kanbans:', error);
      setKanbanSummaryDashboard({
        HEALTHY: 0,
        ATTENTION: 0,
        DROP: 0,
        CHURN: 0,
      });
    } finally {
      setKanbanLoadingDashboard(false);
    }
  }, [buildDateParams, selectedManager]);

  const fetchManagementKanbanSummary = useCallback(async () => {
    setManagementKanbanLoading(true);

    try {
      const params: any = {};
      if (selectedManager !== null && selectedManager !== undefined)
        params.manager_id = selectedManager;

      const { data } = await api.get('/client-wallet/management/kanban/all', {
        params,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      const response = data || {
        novos_clientes: { total: 0 },
        negociacao: { total: 0 },
        implementacao: { total: 0 },
        pronto_para_vender: { total: 0 },
      };

      setManagementKanbanSummary({
        1: response.novos_clientes?.total || 0,
        2: response.negociacao?.total || 0,
        3: response.implementacao?.total || 0,
        4: response.pronto_para_vender?.total || 0,
      });
    } catch (error) {
      console.error(
        'Erro ao buscar resumo dos kanbans de gerenciamento:',
        error,
      );
      setManagementKanbanSummary({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
      });
    } finally {
      setManagementKanbanLoading(false);
    }
  }, [selectedManager]);

  const fetchContactStatusSummary = useCallback(async () => {
    setContactStatusLoading(true);
    try {
      const params: any = {};
      if (selectedManager !== null && selectedManager !== undefined) params.manager_id = selectedManager;

      const { data } = await api.get('/client-wallet/contact-status/summary', {
        params,
      });

      setContactStatusSummary({
        NAO_CONTATADO: data.NAO_CONTATADO || 0,
        EM_ANDAMENTO: data.EM_ANDAMENTO || 0,
        SEM_RETORNO: data.SEM_RETORNO || 0,
        FINALIZADO: data.FINALIZADO || 0,
      });
    } catch (err) {
      console.error('Erro ao buscar resumo de status de contato:', err);
      setContactStatusSummary({
        NAO_CONTATADO: 0,
        EM_ANDAMENTO: 0,
        SEM_RETORNO: 0,
        FINALIZADO: 0,
      });
    } finally {
      setContactStatusLoading(false);
    }
  }, [selectedManager]);

  const fetchChartData = useCallback(async () => {
    setLoading((l) => ({ ...l, chart: true }));
    try {
      const params: any = {
        start_date: dateRange[0].toISOString().slice(0, 10),
        end_date: dateRange[1].toISOString().slice(0, 10),
      };
      if (selectedManager !== null && selectedManager !== undefined) params.manager_id = selectedManager;

      const { data } = await api.get('/client-wallet/revenue/chart', {
        params,
      });

      if (Array.isArray(data?.data)) {
        const chartItems = data.data;

        // Criar um mapa de todos os dias do período
        const start = moment(dateRange[0]);
        const end = moment(dateRange[1]);
        const daysMap: Record<
          string,
          {
            date: string;
            faturamento_total: number;
            faturamento_novos_clientes: number;
            faturamento_retencao: number;
            total_churn: number;
          }
        > = {};

        // Preencher todos os dias com zero
        let current = start.clone();
        while (current.isSameOrBefore(end, 'day')) {
          const dateStr = current.format('YYYY-MM-DD');
          daysMap[dateStr] = {
            date: dateStr,
            faturamento_total: 0,
            faturamento_novos_clientes: 0,
            faturamento_retencao: 0,
            total_churn: 0,
          };
          current.add(1, 'day');
        }

        // Preencher com os dados do backend
        chartItems.forEach((item: any) => {
          const dateStr = moment(
            item.date || item.day || item.created_at,
          ).format('YYYY-MM-DD');
          if (daysMap[dateStr]) {
            daysMap[dateStr].faturamento_total = Number(
              item.faturamento_total || 0,
            );
            daysMap[dateStr].faturamento_novos_clientes = Number(
              item.faturamento_novos_clientes || 0,
            );
            daysMap[dateStr].faturamento_retencao = Number(
              item.faturamento_retencao || 0,
            );
            daysMap[dateStr].total_churn = Number(item.total_churn || 0);
          }
        });

        // Converter para array ordenado e garantir que todos os valores sejam números
        const chartDataArray = Object.values(daysMap)
          .sort((a, b) => moment(a.date).diff(moment(b.date)))
          .map((item) => {
            // Garantir que todos os valores sejam números válidos (não undefined/null)
            const result = {
              date: item.date,
              faturamento_total: Number(item.faturamento_total ?? 0),
              faturamento_novos_clientes: Number(
                item.faturamento_novos_clientes ?? 0,
              ),
              faturamento_retencao: Number(item.faturamento_retencao ?? 0),
              total_churn: Number(item.total_churn ?? 0),
            };
            // Garantir que valores NaN sejam convertidos para 0
            Object.keys(result).forEach((key) => {
              if (
                key !== 'date' &&
                (isNaN(result[key as keyof typeof result] as number) ||
                  result[key as keyof typeof result] === null ||
                  result[key as keyof typeof result] === undefined)
              ) {
                (result as any)[key] = 0;
              }
            });
            return result;
          });

        setChartData(chartDataArray);
        return;
      }

      const start = moment(dateRange[0]);
      const end = moment(dateRange[1]);
      const daysMap: Record<
        string,
        {
          date: string;
          faturamento_total: number;
          faturamento_novos_clientes: number;
          faturamento_retencao: number;
          total_churn: number;
        }
      > = {};

      let current = start.clone();
      while (current.isSameOrBefore(end, 'day')) {
        const dateStr = current.format('YYYY-MM-DD');
        daysMap[dateStr] = {
          date: dateStr,
          faturamento_total: 0,
          faturamento_novos_clientes: 0,
          faturamento_retencao: 0,
          total_churn: 0,
        };
        current.add(1, 'day');
      }

      try {
        const revenueResponse = await api.get('/client-wallet/revenue', {
          params,
        });
        const revenueData = revenueResponse.data;

        if (Array.isArray(revenueData?.daily_data)) {
          revenueData.daily_data.forEach((item: any) => {
            const dateStr = item.date || item.day;
            if (dateStr && daysMap[dateStr]) {
              daysMap[dateStr].faturamento_total =
                item.revenue || item.total_revenue || 0;
            }
          });
        } else if (revenueData?.total_revenue) {
          const totalDays = Object.keys(daysMap).length;
          const dailyAverage = revenueData.total_revenue / totalDays;
          Object.keys(daysMap).forEach((dateStr) => {
            daysMap[dateStr].faturamento_total = dailyAverage;
          });
        }
      } catch (err) {
        console.error('Erro ao buscar dados de revenue:', err);
      }

      try {
        const clientsResponse = await api.get('/client-wallet/clients/cards', {
          params: selectedManager ? { manager_id: selectedManager } : {},
        });
        const clientsData = clientsResponse.data;

        if (Array.isArray(clientsData?.daily_new_clients_revenue)) {
          clientsData.daily_new_clients_revenue.forEach((item: any) => {
            const dateStr = item.date || item.day;
            if (dateStr && daysMap[dateStr]) {
              daysMap[dateStr].faturamento_novos_clientes =
                item.revenue || item.new_clients_revenue || 0;
            }
          });
        } else if (clientsData?.new_clients_revenue) {
          const totalDays = Object.keys(daysMap).length;
          const dailyAverage = clientsData.new_clients_revenue / totalDays;
          Object.keys(daysMap).forEach((dateStr) => {
            daysMap[dateStr].faturamento_novos_clientes = dailyAverage;
          });
        }
      } catch (err) {
        console.error('Erro ao buscar dados de novos clientes:', err);
      }

      try {
        const retentionResponse = await api.get(
          '/client-wallet/retention/card',
          {
            params: selectedManager ? { manager_id: selectedManager } : {},
          },
        );
        const retentionData = retentionResponse.data;

        if (Array.isArray(retentionData?.daily_retention_revenue)) {
          retentionData.daily_retention_revenue.forEach((item: any) => {
            const dateStr = item.date || item.day;
            if (dateStr && daysMap[dateStr]) {
              daysMap[dateStr].faturamento_retencao =
                item.revenue || item.retention_revenue || 0;
            }
          });
        } else if (retentionData?.retention_revenue) {
          const totalDays = Object.keys(daysMap).length;
          const dailyAverage = retentionData.retention_revenue / totalDays;
          Object.keys(daysMap).forEach((dateStr) => {
            daysMap[dateStr].faturamento_retencao = dailyAverage;
          });
        }
      } catch (err) {
        console.error('Erro ao buscar dados de retenção:', err);
      }

      try {
        const churnParams: any = {
          start_date: dateRange[0].toISOString().slice(0, 10),
          end_date: dateRange[1].toISOString().slice(0, 10),
        };
        const startRaw = moment(dateRange[0]).startOf('day');
        const endRaw = moment(dateRange[1]).startOf('day');
        const today = moment().startOf('day');
        const endDate = endRaw.isAfter(today) ? today : endRaw;
        const totalDays = endDate.diff(startRaw, 'days') + 1;
        const prev_end = startRaw.clone().subtract(1, 'day').endOf('day');
        const prev_start = prev_end
          .clone()
          .subtract(totalDays - 1, 'days')
          .startOf('day');

        churnParams.prev_start_date = prev_start.format('YYYY-MM-DD');
        churnParams.prev_end_date = prev_end.format('YYYY-MM-DD');
        if (selectedManager !== null && selectedManager !== undefined) churnParams.manager_id = selectedManager;

        const churnResponse = await api.get('/client-wallet/churn/card', {
          params: churnParams,
        });
        const churnData = churnResponse.data;

        if (Array.isArray(churnData?.daily_churn_revenue)) {
          churnData.daily_churn_revenue.forEach((item: any) => {
            const dateStr = item.date || item.day;
            if (dateStr && daysMap[dateStr]) {
              daysMap[dateStr].total_churn =
                item.revenue_loss || item.churn_revenue || 0;
            }
          });
        } else if (churnData?.churn_revenue_loss) {
          const totalDays = Object.keys(daysMap).length;
          const dailyAverage = churnData.churn_revenue_loss / totalDays;
          Object.keys(daysMap).forEach((dateStr) => {
            daysMap[dateStr].total_churn = dailyAverage;
          });
        }
      } catch (err) {
        console.error('Erro ao buscar dados de churn:', err);
      }

      const chartDataArray = Object.values(daysMap).sort((a, b) =>
        moment(a.date).diff(moment(b.date)),
      );

      setChartData(chartDataArray);
    } catch (err) {
      console.error('Erro ao buscar dados do gráfico:', err);
      const start = moment(dateRange[0]);
      const end = moment(dateRange[1]);
      const days: Array<{
        date: string;
        faturamento_total: number;
        faturamento_novos_clientes: number;
        faturamento_retencao: number;
        total_churn: number;
      }> = [];
      let current = start.clone();

      while (current.isSameOrBefore(end, 'day')) {
        days.push({
          date: current.format('YYYY-MM-DD'),
          faturamento_total: 0,
          faturamento_novos_clientes: 0,
          faturamento_retencao: 0,
          total_churn: 0,
        });
        current.add(1, 'day');
      }
      setChartData(days);
    } finally {
      setLoading((l) => ({ ...l, chart: false }));
    }
  }, [dateRange, selectedManager]);

  useEffect(() => {
    if (!isMaster) return;

    const fetchManagers = async () => {
      try {
        const response = await api.get('/client-wallet/managers', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });

        const list = Array.isArray(response.data?.managers)
          ? response.data.managers
          : [];

        setManagers(list);
      } catch (err) {
        console.error('Erro ao buscar gerentes:', err);
        setManagers([]);
      }
    };

    fetchManagers();
  }, [isMaster]);

  useEffect(() => {
    fetchKanbanSummary();
  }, [rangePayload, selectedManager, fetchKanbanSummary]);

  useEffect(() => {
    fetchManagementKanbanSummary();
  }, [selectedManager, fetchManagementKanbanSummary]);

  useEffect(() => {
    fetchContactStatusSummary();
  }, [selectedManager, fetchContactStatusSummary]);

  const fetchProducersWithoutManagerCard = useCallback(async () => {
    setProducersWithoutManagerLoading(true);
    try {
      const { data } = await api.get(
        '/client-wallet/producers-without-manager/card',
      );
      setProducersWithoutManagerCount(data.total || 0);
    } catch (err) {
      console.error('Erro ao buscar contagem de produtores sem gerente:', err);
      setProducersWithoutManagerCount(0);
    } finally {
      setProducersWithoutManagerLoading(false);
    }
  }, []);

  const fetchClientsWithManagerCard = useCallback(async () => {
    setClientsWithManagerLoading(true);
    try {
      const params: any = {};
      if (selectedManager !== null && selectedManager !== undefined) params.manager_id = selectedManager;

      const { data } = await api.get(
        '/client-wallet/clients-with-manager/card',
        {
          params,
        },
      );
      setClientsWithManagerCount(data.total_clients || 0);
    } catch (err) {
      console.error('Erro ao buscar contagem de clientes com gerente:', err);
      setClientsWithManagerCount(0);
    } finally {
      setClientsWithManagerLoading(false);
    }
  }, [selectedManager]);

  useEffect(() => {
    if (!isCommercial) {
      fetchProducersWithoutManagerCard();
    }
  }, [fetchProducersWithoutManagerCard, isCommercial]);

  useEffect(() => {
    fetchClientsWithManagerCard();
  }, [selectedManager, fetchClientsWithManagerCard]);

  useEffect(() => {
    const currentParams = {
      startDate: dateRangeString.start,
      endDate: dateRangeString.end,
      managerId: selectedManager,
    };

    const paramsChanged =
      !lastParamsRef.current ||
      lastParamsRef.current.startDate !== currentParams.startDate ||
      lastParamsRef.current.endDate !== currentParams.endDate ||
      lastParamsRef.current.managerId !== currentParams.managerId;

    if (paramsChanged || !hasLoadedRef.current) {
      const loadMainStats = async () => {
        await Promise.all([
          fetchRevenue(),
          fetchClientsCards(),
          fetchChurnCard(),
          fetchChartData(),
          fetchRetentionCard(),
        ]);
        lastParamsRef.current = currentParams;
        hasLoadedRef.current = true;
      };
      loadMainStats();
    }
  }, [dateRangeString.start, dateRangeString.end, selectedManager]);

  return {
    managers,
    data,
    clientsCard,
    loading,
    chartData,
    kanbanSummaryDashboard,
    kanbanLoadingDashboard,
    managementKanbanSummary,
    managementKanbanLoading,
    contactStatusSummary,
    contactStatusLoading,
    producersWithoutManagerCount,
    producersWithoutManagerLoading,
    clientsWithManagerCount,
    clientsWithManagerLoading,
    revenueInfo,
    churnTooltip,
  };
};
