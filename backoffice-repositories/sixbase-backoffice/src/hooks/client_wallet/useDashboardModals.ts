import { useCallback, useState } from 'react';
import moment from 'moment';
import { api } from '../../services/api';
import {
  Producer,
  ProducersResponse,
} from '../../views/client_wallet/tabs/dashboard/interfaces/dashboard.interface';

interface UseDashboardModalsProps {
  dateRange: Date[];
  selectedManager: string | number;
}

export const useDashboardModals = ({
  dateRange,
  selectedManager,
}: UseDashboardModalsProps) => {
  const [showModalChurn, setShowModalChurn] = useState(false);
  const [clientsChurn, setClientsChurn] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    perPage: 10,
    totalChurn: 0,
  });

  const [showModalRevenue, setShowModalRevenue] = useState(false);
  const [showModalGoals, setShowModalGoals] = useState(false);
  const [showModalBirthdays, setShowModalBirthdays] = useState(false);
  const [showModalActiveClients, setShowModalActiveClients] = useState(false);
  const [showModalNewClients, setShowModalNewClients] = useState(false);
  const [
    showModalProducersWithoutManager,
    setShowModalProducersWithoutManager,
  ] = useState(false);
  const [showModalClientsWithManager, setShowModalClientsWithManager] =
    useState(false);
  const [showModalRetention, setShowModalRetention] = useState(false);

  const [modalData, setModalData] = useState({
    revenue: [] as Producer[],
    goals: [] as Producer[],
    birthdays: [] as Producer[],
  });

  const [modalLoading, setModalLoading] = useState({
    revenue: false,
    goals: false,
    birthdays: false,
    activeClients: false,
    newClients: false,
    churn: false,
    producersWithoutManager: false,
    clientsWithManager: false,
    retention: false,
  });

  const [activeClients, setActiveClients] = useState<any[]>([]);
  const [activeClientsTotal, setActiveClientsTotal] = useState(0);
  const [paginationActive, setPaginationActive] = useState({
    page: 0,
    perPage: 10,
    total: 0,
  });

  const [newClients, setNewClients] = useState<any[]>([]);
  const [newClientsTotal, setNewClientsTotal] = useState(0);
  const [paginationNew, setPaginationNew] = useState({
    page: 0,
    perPage: 10,
    total: 0,
  });

  const [producersWithoutManager, setProducersWithoutManager] = useState<any[]>(
    [],
  );
  const [producersWithoutManagerTotal, setProducersWithoutManagerTotal] =
    useState(0);
  const [
    paginationProducersWithoutManager,
    setPaginationProducersWithoutManager,
  ] = useState({
    page: 0,
    perPage: 10,
    total: 0,
  });
  const [clientsWithManager, setClientsWithManager] = useState<any[]>([]);
  const [clientsWithManagerTotal, setClientsWithManagerTotal] = useState(0);
  const [paginationClientsWithManager, setPaginationClientsWithManager] =
    useState({
      page: 0,
      perPage: 10,
      total: 0,
    });
  const [retentionClients, setRetentionClients] = useState<any[]>([]);
  const [retentionClientsTotal, setRetentionClientsTotal] = useState(0);
  const [paginationRetention, setPaginationRetention] = useState({
    page: 0,
    perPage: 10,
    total: 0,
  });
  const [managers, setManagers] = useState<any[]>([]);

  const fetchChurnList = useCallback(
    async (page = 0, size = 10) => {
      try {
        setModalLoading((l) => ({ ...l, churn: true }));

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
          page,
          size,
          start_date: startRaw.format('YYYY-MM-DD'),
          end_date: endDate.format('YYYY-MM-DD'),
          prev_start_date: prev_start.format('YYYY-MM-DD'),
          prev_end_date: prev_end.format('YYYY-MM-DD'),
        };

        if (selectedManager) params.manager_id = selectedManager;

        const { data } = await api.get('/client-wallet/churn/list', { params });

        setClientsChurn(data.items);
        setPagination((prev) => ({
          ...prev,
          page: data.page,
          perPage: data.size,
          totalChurn: data.totalItems,
        }));
      } catch (err) {
        console.error('Erro ao buscar lista paginada de churn:', err);
        setClientsChurn([]);
      } finally {
        setModalLoading((l) => ({ ...l, churn: false }));
      }
    },
    [dateRange, selectedManager],
  );

  const fetchRevenueProducers = useCallback(async () => {
    setModalLoading((l) => ({ ...l, revenue: true }));
    try {
      const params: any = {
        start_date: dateRange[0].toISOString().slice(0, 10),
        end_date: dateRange[1].toISOString().slice(0, 10),
        page: 0,
        size: 1000,
      };
      if (selectedManager) params.manager_id = selectedManager;

      const { data }: { data: ProducersResponse } = await api.get(
        '/client-wallet/producers/list',
        { params },
      );
      setModalData((prev) => ({
        ...prev,
        revenue: (data.producers || []).sort(
          (a, b) => b.period_revenue - a.period_revenue,
        ),
      }));
    } catch (err) {
      console.error('Erro ao buscar produtores do faturamento:', err);
      setModalData((prev) => ({ ...prev, revenue: [] }));
    } finally {
      setModalLoading((l) => ({ ...l, revenue: false }));
    }
  }, [dateRange, selectedManager]);

  const fetchGoalsProducers = useCallback(async () => {
    setModalLoading((l) => ({ ...l, goals: true }));
    try {
      const params: any = {
        start_date: dateRange[0].toISOString().slice(0, 10),
        end_date: dateRange[1].toISOString().slice(0, 10),
        page: 0,
        size: 1000,
        award_achieved: 'true',
      };
      if (selectedManager) params.manager_id = selectedManager;

      const { data }: { data: ProducersResponse } = await api.get(
        '/client-wallet/producers/list',
        { params },
      );
      setModalData((prev) => ({
        ...prev,
        goals: data.producers || [],
      }));
    } catch (err) {
      console.error('Erro ao buscar produtores que bateram meta:', err);
      setModalData((prev) => ({ ...prev, goals: [] }));
    } finally {
      setModalLoading((l) => ({ ...l, goals: false }));
    }
  }, [dateRange, selectedManager]);

  const fetchBirthdayProducers = useCallback(async () => {
    setModalLoading((l) => ({ ...l, birthdays: true }));
    try {
      const params: any = {
        start_date: dateRange[0].toISOString().slice(0, 10),
        end_date: dateRange[1].toISOString().slice(0, 10),
        page: 0,
        size: 1000,
        birthday_in_period: 'true',
      };
      if (selectedManager) params.manager_id = selectedManager;

      const { data }: { data: ProducersResponse } = await api.get(
        '/client-wallet/producers/list',
        { params },
      );
      setModalData((prev) => ({
        ...prev,
        birthdays: data.producers || [],
      }));
    } catch (err) {
      console.error('Erro ao buscar aniversariantes:', err);
      setModalData((prev) => ({ ...prev, birthdays: [] }));
    } finally {
      setModalLoading((l) => ({ ...l, birthdays: false }));
    }
  }, [dateRange, selectedManager]);

  const fetchActiveClientsList = useCallback(
    async (page = 0, size = 10) => {
      setModalLoading((l) => ({ ...l, activeClients: true }));

      try {
        const params: any = { page, size };
        if (selectedManager) params.manager_id = selectedManager;

        const { data } = await api.get('/client-wallet/clients/active', {
          params,
        });

        setActiveClients(data.items ?? []);
        setActiveClientsTotal(data.totalItems ?? 0);
      } catch (err) {
        console.error('Erro ao buscar clientes ativos:', err);
        setActiveClients([]);
      } finally {
        setModalLoading((l) => ({ ...l, activeClients: false }));
      }
    },
    [selectedManager],
  );

  const fetchNewClientsList = useCallback(
    async (page = 0, size = 10) => {
      setModalLoading((l) => ({ ...l, newClients: true }));

      try {
        const params: any = { page, size };
        if (selectedManager) params.manager_id = selectedManager;

        const { data } = await api.get('/client-wallet/clients/new', {
          params,
        });

        setNewClients(data.items ?? []);
        setNewClientsTotal(data.totalItems ?? 0);
      } catch (err) {
        console.error('Erro ao buscar novos clientes:', err);
        setNewClients([]);
      } finally {
        setModalLoading((l) => ({ ...l, newClients: false }));
      }
    },
    [selectedManager],
  );

  const handleOpenRevenueModal = useCallback(() => {
    setShowModalRevenue(true);
    fetchRevenueProducers();
  }, [fetchRevenueProducers]);

  const handleOpenGoalsModal = useCallback(() => {
    setShowModalGoals(true);
    fetchGoalsProducers();
  }, [fetchGoalsProducers]);

  const handleOpenBirthdaysModal = useCallback(() => {
    setShowModalBirthdays(true);
    fetchBirthdayProducers();
  }, [fetchBirthdayProducers]);

  const handleOpenActiveClientsModal = useCallback(() => {
    setShowModalActiveClients(true);
    fetchActiveClientsList();
  }, [fetchActiveClientsList]);

  const handleOpenNewClientsModal = useCallback(() => {
    setShowModalNewClients(true);
    fetchNewClientsList();
  }, [fetchNewClientsList]);

  const fetchManagers = useCallback(async () => {
    try {
      const response = await api.get('/client-wallet/managers');
      setManagers(
        Array.isArray(response.data?.managers) ? response.data.managers : [],
      );
    } catch (err) {
      console.error('Erro ao buscar gerentes:', err);
      setManagers([]);
    }
  }, []);

  const fetchProducersWithoutManagerList = useCallback(
    async (page = 0, size = 10, searchText = '') => {
      setModalLoading((l) => ({ ...l, producersWithoutManager: true }));

      try {
        const params: any = { page, size };
        if (searchText && searchText.trim() !== '') {
          params.search = searchText.trim();
        }

        const { data } = await api.get(
          '/client-wallet/producers-without-manager/list',
          {
            params,
          },
        );

        setProducersWithoutManager(data.items ?? []);
        setProducersWithoutManagerTotal(data.totalItems ?? 0);
        setPaginationProducersWithoutManager((prev) => ({
          ...prev,
          page: data.page ?? page,
          perPage: data.size ?? size,
          total: data.totalItems ?? 0,
        }));
      } catch (err) {
        console.error('Erro ao buscar produtores sem gerente:', err);
        setProducersWithoutManager([]);
        setProducersWithoutManagerTotal(0);
      } finally {
        setModalLoading((l) => ({ ...l, producersWithoutManager: false }));
      }
    },
    [],
  );

  const handleOpenProducersWithoutManagerModal = useCallback(() => {
    setShowModalProducersWithoutManager(true);
    fetchManagers();
    fetchProducersWithoutManagerList();
  }, [fetchManagers, fetchProducersWithoutManagerList]);

  const fetchClientsWithManagerList = useCallback(
    async (page = 0, size = 10, searchText = '') => {
      setModalLoading((l) => ({ ...l, clientsWithManager: true }));

      try {
        const params: any = { page, size };
        if (selectedManager) params.manager_id = selectedManager;
        if (searchText && searchText.trim() !== '') {
          params.search = searchText.trim();
        }

        const { data } = await api.get(
          '/client-wallet/clients-with-manager/list',
          {
            params,
          },
        );

        setClientsWithManager(data.items ?? []);
        setClientsWithManagerTotal(data.totalItems ?? 0);
        setPaginationClientsWithManager((prev) => ({
          ...prev,
          page: data.page ?? page,
          perPage: data.size ?? size,
          total: data.totalItems ?? 0,
        }));
      } catch (err) {
        console.error('Erro ao buscar clientes com gerente:', err);
        setClientsWithManager([]);
        setClientsWithManagerTotal(0);
      } finally {
        setModalLoading((l) => ({ ...l, clientsWithManager: false }));
      }
    },
    [selectedManager],
  );

  const handleOpenClientsWithManagerModal = useCallback(() => {
    setShowModalClientsWithManager(true);
    fetchClientsWithManagerList();
  }, [fetchClientsWithManagerList]);

  const fetchRetentionList = useCallback(
    async (page = 0, size = 10, searchText = '') => {
      setModalLoading((l) => ({ ...l, retention: true }));

      try {
        const params: any = {
          page,
          size,
          start_date: dateRange[0].toISOString().slice(0, 10),
          end_date: dateRange[1].toISOString().slice(0, 10),
        };
        if (selectedManager) params.manager_id = selectedManager;
        if (searchText && searchText.trim() !== '') {
          params.search = searchText.trim();
        }

        const { data } = await api.get('/client-wallet/retention/list', {
          params,
        });

        setRetentionClients(data.items ?? []);
        setRetentionClientsTotal(data.totalItems ?? 0);
        setPaginationRetention((prev) => ({
          ...prev,
          page: data.page ?? page,
          perPage: data.size ?? size,
          total: data.totalItems ?? 0,
        }));
      } catch (err) {
        console.error('Erro ao buscar clientes em retenção:', err);
        setRetentionClients([]);
        setRetentionClientsTotal(0);
      } finally {
        setModalLoading((l) => ({ ...l, retention: false }));
      }
    },
    [dateRange, selectedManager],
  );

  const handleOpenRetentionModal = useCallback(() => {
    setShowModalRetention(true);
    fetchRetentionList();
  }, [fetchRetentionList]);

  const assignManager = useCallback(
    async (userId: number, managerId: string | number | null) => {
      try {
        await api.post('/client-wallet/producers-without-manager/assign', {
          user_id: userId,
          manager_id: managerId || null,
        });
        // Recarregar a lista após vincular
        await fetchProducersWithoutManagerList(
          paginationProducersWithoutManager.page,
          paginationProducersWithoutManager.perPage,
        );
        return { success: true };
      } catch (error: any) {
        console.error('Erro ao vincular gerente:', error);
        return {
          success: false,
          message: error?.response?.data?.message || 'Erro ao vincular gerente',
        };
      }
    },
    [fetchProducersWithoutManagerList, paginationProducersWithoutManager],
  );

  return {
    // Churn
    showModalChurn,
    setShowModalChurn,
    clientsChurn,
    churnLoading: modalLoading.churn,
    churnTotal: pagination.totalChurn,
    churnPage: pagination.page,
    churnPerPage: pagination.perPage,
    fetchChurnList,

    // Revenue
    showModalRevenue,
    setShowModalRevenue,
    revenueProducers: modalData.revenue,
    revenueLoading: modalLoading.revenue,
    handleOpenRevenueModal,

    // Goals
    showModalGoals,
    setShowModalGoals,
    goalsProducers: modalData.goals,
    goalsLoading: modalLoading.goals,
    handleOpenGoalsModal,

    // Birthdays
    showModalBirthdays,
    setShowModalBirthdays,
    birthdayProducers: modalData.birthdays,
    birthdaysLoading: modalLoading.birthdays,
    handleOpenBirthdaysModal,

    // Active Clients
    showModalActiveClients,
    setShowModalActiveClients,
    activeClients,
    activeClientsLoading: modalLoading.activeClients,
    activeClientsTotal,
    activeClientsPage: paginationActive.page,
    activeClientsPerPage: paginationActive.perPage,
    fetchActiveClientsList,
    handleOpenActiveClientsModal,

    // New Clients
    showModalNewClients,
    setShowModalNewClients,
    newClients,
    newClientsLoading: modalLoading.newClients,
    newClientsTotal,
    newClientsPage: paginationNew.page,
    newClientsPerPage: paginationNew.perPage,
    fetchNewClientsList,
    handleOpenNewClientsModal,

    // Producers Without Manager
    showModalProducersWithoutManager,
    setShowModalProducersWithoutManager,
    producersWithoutManager,
    producersWithoutManagerLoading: modalLoading.producersWithoutManager,
    producersWithoutManagerTotal,
    producersWithoutManagerPage: paginationProducersWithoutManager.page,
    producersWithoutManagerPerPage: paginationProducersWithoutManager.perPage,
    fetchProducersWithoutManagerList,
    handleOpenProducersWithoutManagerModal,
    managers,
    assignManager,

    // Clients With Manager
    showModalClientsWithManager,
    setShowModalClientsWithManager,
    clientsWithManager,
    clientsWithManagerLoading: modalLoading.clientsWithManager,
    clientsWithManagerTotal,
    clientsWithManagerPage: paginationClientsWithManager.page,
    clientsWithManagerPerPage: paginationClientsWithManager.perPage,
    fetchClientsWithManagerList,
    handleOpenClientsWithManagerModal,

    // Retention
    showModalRetention,
    setShowModalRetention,
    retentionClients,
    retentionLoading: modalLoading.retention,
    retentionTotal: retentionClientsTotal,
    retentionPage: paginationRetention.page,
    retentionPerPage: paginationRetention.perPage,
    fetchRetentionList,
    handleOpenRetentionModal,
  };
};
