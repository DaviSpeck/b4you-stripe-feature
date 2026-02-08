import { FC, useMemo, useState, useCallback, useEffect } from 'react';
import { Row } from 'reactstrap';
import { TrendingDown, TrendingUp, AlertTriangle } from 'react-feather';
import moment from 'moment';
import { getUserData } from '../../../../utility/Utils';
import MonitoringFilters from '../../../../components/client_wallet/tabs/monitoring/monitoringfilters/MonitoringFilters';
import MonitoringAlerts from '../../../../components/client_wallet/tabs/monitoring/monitoringalerts/MonitoringAlerts';
import MonitoringKanbanColumn from '../../../../components/client_wallet/tabs/monitoring/monitoringkanbancolumn/MonitoringKanbanColumn';
import MonitoringTable from '../../../../components/client_wallet/tabs/monitoring/monitoringtable/MonitoringTable';
import { useMonitoringData } from '../../../../hooks/client_wallet/useMonitoringData';
import { Stage } from './interfaces/monitoring.interface';
import {
  buildInitialRange,
  buildDateRangePayload,
} from '../../../../components/client_wallet/tabs/monitoring/utils/monitoring.utils';

const Monitoring: FC = () => {
  const userData = useMemo(() => {
    try {
      return getUserData();
    } catch (_) {
      return null;
    }
  }, []);

  const role = useMemo(
    () => String(userData?.role || '').toUpperCase(),
    [userData],
  );
  const isMaster = role === 'MASTER';
  const isCommercial = role === 'COMERCIAL';

  const [dateRange, setDateRange] = useState<Date[]>(() => buildInitialRange());
  const [debouncedRange, setDebouncedRange] = useState<Date[]>(() =>
    buildInitialRange(),
  );
  // Para COMERCIAL, sempre usar o próprio ID como selectedManager
  // Para MASTER, começar vazio (pode selecionar qualquer gerente)
  const [selectedManager, setSelectedManager] = useState<string>(
    userData && isCommercial ? String(userData.id) : '',
  );

  // Normalizar selectedManager: se for COMERCIAL e estiver vazio, usar o próprio ID
  const normalizedSelectedManager = useMemo(() => {
    if (isCommercial && (!selectedManager || selectedManager === '')) {
      return userData?.id ? String(userData.id) : '';
    }
    return selectedManager;
  }, [isCommercial, selectedManager, userData?.id]);
  const [selectedStage, setSelectedStage] = useState<Stage | ''>('');
  const [searchText, setSearchText] = useState<string>('');
  const [sortField, setSortField] = useState<
    'variation_percentage' | 'current_revenue'
  >('variation_percentage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [kanbanPerPage] = useState<number>(5);
  const [kanbanPageByStage, setKanbanPageByStage] = useState<
    Record<Stage, number>
  >({
    HEALTHY: 1,
    ATTENTION: 1,
    DROP: 1,
    CHURN: 1,
  });

  const handleRangeChange = useCallback((dates: Date[]) => {
    if (!dates || dates.length < 2 || !dates[0] || !dates[1]) return;

    const [rawStart, rawEnd] = dates;
    const startMoment = moment(rawStart).startOf('day');
    const endMoment = moment(rawEnd).startOf('day');

    const startDate =
      startMoment.isBefore(endMoment) || startMoment.isSame(endMoment)
        ? startMoment
        : endMoment;
    const endDate =
      startMoment.isBefore(endMoment) || startMoment.isSame(endMoment)
        ? endMoment
        : startMoment;

    setDateRange([startDate.toDate(), endDate.toDate()]);
  }, []);

  const setQuickRange = useCallback((days: number) => {
    const end = moment();
    const start = end
      .clone()
      .subtract(days - 1, 'day')
      .startOf('day');
    setDateRange([start.toDate(), end.toDate()]);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedRange(dateRange), 400);
    return () => clearTimeout(handler);
  }, [dateRange]);

  useEffect(() => {
    setPage(1);
  }, [debouncedRange, searchText, selectedManager, selectedStage]);

  const rangePayload = useMemo(
    () => buildDateRangePayload(debouncedRange),
    [debouncedRange],
  );

  const selectedRangeLabel = useMemo(() => {
    if (!dateRange || dateRange.length < 2 || !dateRange[0] || !dateRange[1]) {
      return '--';
    }
    return `${moment(dateRange[0]).format('DD/MM')} — ${moment(
      dateRange[1],
    ).format('DD/MM')}`;
  }, [dateRange]);

  const {
    managers,
    loading,
    summaryLoading,
    kanbanLoading,
    items,
    summaryData,
    kanbanSummary,
    kanbanData,
    totalRows,
    noCompleteDays,
    contactStatusChanges,
    updateContactStatus,
    fetchPerformance,
    fetchKanbanStage,
  } = useMonitoringData({
    debouncedRange,
    searchText,
    selectedManager: normalizedSelectedManager,
    selectedStage,
    isCommercial,
    page,
    perPage,
    sortField,
    sortDirection,
    kanbanPerPage,
  });

  const handleKanbanPageChange = useCallback(
    (stage: Stage, newPage: number) => {
      setKanbanPageByStage((prev) => ({
        ...prev,
        [stage]: newPage,
      }));
    },
    [],
  );

  const kanbanColumns = useMemo(() => kanbanData, [kanbanData]);

  return (
    <div className="mt-2">
      <MonitoringAlerts noCompleteDays={noCompleteDays} />

      <MonitoringFilters
        isMaster={isMaster}
        dateRange={dateRange}
        onRangeChange={handleRangeChange}
        onQuickRange={setQuickRange}
        selectedRangeLabel={selectedRangeLabel}
        rangePayload={rangePayload}
        managers={managers}
        selectedManager={selectedManager}
        onManagerChange={(value) => {
          // Para COMERCIAL, não permitir mudar o gerente (sempre o próprio)
          if (!isCommercial) {
            setSelectedManager(value);
          }
        }}
      />

      <Row>
        <MonitoringKanbanColumn
          title="Saudável"
          stage="HEALTHY"
          icon={<TrendingUp size={16} className="mr-75 text-success" />}
          count={kanbanSummary.HEALTHY || 0}
          loadingCount={summaryLoading}
          allItems={kanbanColumns.HEALTHY || []}
          loadingItems={kanbanLoading.HEALTHY || false}
          currentPage={kanbanPageByStage.HEALTHY || 1}
          perPage={kanbanPerPage}
          onPageChange={handleKanbanPageChange}
          onFetchPage={fetchKanbanStage}
        />
        <MonitoringKanbanColumn
          title="Atenção"
          stage="ATTENTION"
          icon={<AlertTriangle size={16} className="mr-75 text-warning" />}
          count={kanbanSummary.ATTENTION || 0}
          loadingCount={summaryLoading}
          allItems={kanbanColumns.ATTENTION || []}
          loadingItems={kanbanLoading.ATTENTION || false}
          currentPage={kanbanPageByStage.ATTENTION || 1}
          perPage={kanbanPerPage}
          onPageChange={handleKanbanPageChange}
          onFetchPage={fetchKanbanStage}
        />
        <MonitoringKanbanColumn
          title="Queda"
          stage="DROP"
          icon={<TrendingDown size={16} className="mr-75 text-danger" />}
          count={kanbanSummary.DROP || 0}
          loadingCount={summaryLoading}
          allItems={kanbanColumns.DROP || []}
          loadingItems={kanbanLoading.DROP || false}
          currentPage={kanbanPageByStage.DROP || 1}
          perPage={kanbanPerPage}
          onPageChange={handleKanbanPageChange}
          onFetchPage={fetchKanbanStage}
        />
        <MonitoringKanbanColumn
          title="Churn"
          stage="CHURN"
          icon={<AlertTriangle size={16} className="mr-75 text-dark" />}
          count={kanbanSummary.CHURN || 0}
          loadingCount={summaryLoading}
          allItems={kanbanColumns.CHURN || []}
          loadingItems={kanbanLoading.CHURN || false}
          currentPage={kanbanPageByStage.CHURN || 1}
          perPage={kanbanPerPage}
          onPageChange={handleKanbanPageChange}
          onFetchPage={fetchKanbanStage}
        />
      </Row>

      <MonitoringTable
        items={items}
        loading={loading}
        totalRows={totalRows}
        page={page}
        perPage={perPage}
        searchText={searchText}
        onSearchChange={setSearchText}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        onPageChange={(newPage) => {
          // DataTable passa página começando em 1, nosso estado também começa em 1
          // Fazer requisição diretamente com os parâmetros corretos
          // O manualFetchRef no hook vai evitar que o useEffect dispare novamente
          fetchPerformance(newPage, perPage);
          setPage(newPage);
        }}
        onPerPageChange={(newPerPage, newPage) => {
          // DataTable passa página começando em 1
          // Fazer requisição diretamente com os parâmetros corretos
          // O manualFetchRef no hook vai evitar que o useEffect dispare novamente
          fetchPerformance(newPage, newPerPage);
          setPerPage(newPerPage);
          setPage(newPage);
        }}
        contactStatusChanges={contactStatusChanges}
        onContactStatusChange={updateContactStatus}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        canEditContactStatus={isMaster || isCommercial}
      />
    </div>
  );
};

export default Monitoring;
