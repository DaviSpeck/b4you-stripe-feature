import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../../services/api';
import {
  ProducerPerformanceItem,
  Stage,
  ContactStatusKey,
} from '../../views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';
import {
  buildDateRangePayload,
  calculateStage,
} from '../../components/client_wallet/tabs/monitoring/utils/monitoring.utils';

interface UseMonitoringDataProps {
  debouncedRange: Date[];
  searchText: string;
  selectedManager: string;
  selectedStage: Stage | '';
  isCommercial: boolean;
  page: number;
  perPage: number;
  sortField: 'variation_percentage' | 'current_revenue';
  sortDirection: 'asc' | 'desc';
  kanbanPerPage: number;
}

interface Manager {
  id: number;
  email: string;
}

export const useMonitoringData = ({
  debouncedRange,
  searchText,
  selectedManager,
  selectedStage,
  isCommercial,
  page,
  perPage,
  sortField,
  sortDirection,
  kanbanPerPage,
}: UseMonitoringDataProps) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [kanbanLoading, setKanbanLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [items, setItems] = useState<ProducerPerformanceItem[]>([]);
  const [summaryData, setSummaryData] = useState({});
  const [kanbanSummary, setKanbanSummary] = useState({
    HEALTHY: 0,
    ATTENTION: 0,
    DROP: 0,
    CHURN: 0,
  });
  const [kanbanData, setKanbanData] = useState<
    Record<string, ProducerPerformanceItem[]>
  >({});
  const [totalRows, setTotalRows] = useState(0);
  const [metaNote, setMetaNote] = useState<string | null>(null);
  const [noCompleteDays, setNoCompleteDays] = useState(false);
  const [contactStatusChanges, setContactStatusChanges] = useState<
    Record<number, ContactStatusKey>
  >({});

  // Ref para rastrear se fetchPerformance foi chamado manualmente (para evitar duplicação)
  const manualFetchRef = useRef(false);

  const rangePayload = useMemo(
    () => buildDateRangePayload(debouncedRange),
    [debouncedRange],
  );

  const dateParams = useMemo(() => {
    if (!rangePayload) return null;
    return {
      start_date: rangePayload.start.format('YYYY-MM-DD'),
      end_date: rangePayload.end.format('YYYY-MM-DD'),
      prev_start_date: rangePayload.prevStart.format('YYYY-MM-DD'),
      prev_end_date: rangePayload.prevEnd.format('YYYY-MM-DD'),
    };
  }, [rangePayload]);

  useEffect(() => {
    if (isCommercial) return;

    const fetchManagers = async () => {
      try {
        const response = await api.get('/client-wallet/managers', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        setManagers(
          Array.isArray(response.data?.managers) ? response.data.managers : [],
        );
      } catch {
        setManagers([]);
      }
    };

    fetchManagers();
  }, [isCommercial]);

  const fetchSummary = useCallback(async () => {
    if (!dateParams) {
      setSummaryData({});
      return;
    }

    setSummaryLoading(true);

    try {
      const params: any = { ...dateParams };
      if (searchText) params.search = searchText;
      // Sempre passar manager_id se selecionado (não passar string vazia)
      if (
        selectedManager &&
        selectedManager !== '' &&
        selectedManager !== 'null'
      ) {
        params.manager_id = selectedManager;
      }

      const response = await api.get('/client-wallet/producers/summary', {
        params,
      });
      const data = response.data || {};

      if (data.meta?.note) setMetaNote(data.meta.note);
      if (data.meta?.no_complete_days) setNoCompleteDays(true);

      setSummaryData(data || {});
    } catch (e) {
      console.error('Erro ao buscar resumo:', e);
    } finally {
      setSummaryLoading(false);
    }
  }, [dateParams, searchText, selectedManager]);

  const fetchPerformance = useCallback(
    async (pageParam = page, perPageParam = perPage) => {
      if (!dateParams) {
        setItems([]);
        setTotalRows(0);
        return;
      }

      // Validar perPage para evitar valores inválidos que podem travar o backend
      const safePerPage = Math.max(1, Math.min(perPageParam || 10, 50));

      // Marcar que foi chamado manualmente para evitar que o useEffect dispare
      manualFetchRef.current = true;

      setLoading(true);

      try {
        const params: any = {
          ...dateParams,
          page: pageParam - 1,
          size: safePerPage,
          sort_field: sortField,
          sort_direction: sortDirection,
        };

        if (searchText) params.search = searchText;
        // Sempre passar manager_id se selecionado (não passar string vazia)
        if (
          selectedManager &&
          selectedManager !== '' &&
          selectedManager !== 'null'
        ) {
          params.manager_id = selectedManager;
        }
        if (selectedStage) params.stage = selectedStage;

        // Timeout de segurança para evitar travar o frontend
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

        try {
          const response = await api.get(
            '/client-wallet/producers/performance',
            {
              params,
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);

          const raw = response.data || {};
          const producers = raw.producers || raw.items || [];

          const computed = producers.map((it: ProducerPerformanceItem) => ({
            ...it,
            stage: it.stage || calculateStage(it, new Date()),
            contact_status: it.contact_status || 'NAO_CONTATADO',
          }));

          setItems(computed);
          setTotalRows(Number(raw.total) || computed.length);

          if (raw.meta?.no_complete_days) setNoCompleteDays(true);
          if (raw.meta?.note) setMetaNote(raw.meta.note);
        } catch (requestError: any) {
          clearTimeout(timeoutId);
          if (
            requestError.name === 'AbortError' ||
            requestError.code === 'ECONNABORTED'
          ) {
            console.error(
              'Timeout ao buscar performance - requisição demorou muito',
            );
            throw new Error(
              'A requisição demorou muito para responder. Tente novamente com menos itens por página.',
            );
          }
          throw requestError;
        }
      } catch (e: any) {
        console.error('Erro ao buscar performance:', e);
        setItems([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
        // Resetar flag após a requisição completar
        // Usar um pequeno delay para garantir que o useEffect não dispare imediatamente após
        setTimeout(() => {
          manualFetchRef.current = false;
        }, 200);
      }
    },
    [
      dateParams,
      searchText,
      sortField,
      sortDirection,
      selectedManager,
      selectedStage,
      // NÃO incluir page e perPage aqui - eles são passados como parâmetros
    ],
  );

  const fetchKanbanStage = useCallback(
    async (stage: Stage, pageParam = 1) => {
      if (!dateParams) {
        setKanbanData((prev) => ({ ...prev, [stage]: [] }));
        return;
      }

      setKanbanLoading((prev) => ({ ...prev, [stage]: true }));

      try {
        const params: any = {
          ...dateParams,
          stage,
          page: pageParam - 1, // Backend espera página começando em 0
          size: kanbanPerPage,
        };

        if (searchText) params.search = searchText;
        // Sempre passar manager_id se selecionado (não passar string vazia)
        if (
          selectedManager &&
          selectedManager !== '' &&
          selectedManager !== 'null'
        ) {
          params.manager_id = selectedManager;
        }

        const response = await api.get('/client-wallet/producers/kanban', {
          params,
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });

        const data = response.data || {};
        const items: ProducerPerformanceItem[] = Array.isArray(data.items)
          ? data.items
          : [];

        // Substituir os items do estágio com os dados da página solicitada
        // Não fazer merge, substituir completamente para evitar problemas de paginação
        setKanbanData((prev) => ({
          ...prev,
          [stage]: items,
        }));
      } catch (e) {
        console.error(`Erro ao buscar kanban (${stage}):`, e);
        setKanbanData((prev) => ({ ...prev, [stage]: [] }));
      } finally {
        setKanbanLoading((prev) => ({ ...prev, [stage]: false }));
      }
    },
    [dateParams, searchText, selectedManager, kanbanPerPage],
  );

  const fetchKanbanAll = useCallback(async () => {
    if (!dateParams) {
      setKanbanData({
        HEALTHY: [],
        ATTENTION: [],
        DROP: [],
        CHURN: [],
      });
      setKanbanSummary({
        HEALTHY: 0,
        ATTENTION: 0,
        DROP: 0,
        CHURN: 0,
      });
      return;
    }

    const stages: Stage[] = ['HEALTHY', 'ATTENTION', 'DROP', 'CHURN'];
    setKanbanLoading(Object.fromEntries(stages.map((s) => [s, true])));

    try {
      // Buscar apenas a primeira página (5 itens) de cada estágio
      // Usar Promise.all para buscar todos os estágios em paralelo
      const fetchPromises = stages.map(async (stage) => {
        try {
          const params: any = {
            ...dateParams,
            stage,
            page: 0, // Primeira página
            size: kanbanPerPage, // 5 itens por página
          };

          if (searchText) params.search = searchText;
          if (
            selectedManager &&
            selectedManager !== '' &&
            selectedManager !== 'null'
          ) {
            params.manager_id = selectedManager;
          }

          const response = await api.get('/client-wallet/producers/kanban', {
            params,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Expires: '0',
            },
          });

          const data = response.data || {};
          return {
            stage,
            items: Array.isArray(data.items) ? data.items : [],
            total: Number(data.total) || 0,
          };
        } catch (error) {
          console.error(`Erro ao buscar kanban (${stage}):`, error);
          return {
            stage,
            items: [],
            total: 0,
          };
        }
      });

      const results = await Promise.all(fetchPromises);

      // Organizar resultados por estágio
      const itemsByStage: Record<string, ProducerPerformanceItem[]> = {};
      const totals: Record<string, number> = {};

      results.forEach((result) => {
        itemsByStage[result.stage] = result.items;
        totals[result.stage] = result.total;
      });

      setKanbanData({
        HEALTHY: itemsByStage.HEALTHY || [],
        ATTENTION: itemsByStage.ATTENTION || [],
        DROP: itemsByStage.DROP || [],
        CHURN: itemsByStage.CHURN || [],
      });

      setKanbanSummary({
        HEALTHY: totals.HEALTHY || 0,
        ATTENTION: totals.ATTENTION || 0,
        DROP: totals.DROP || 0,
        CHURN: totals.CHURN || 0,
      });
    } catch (e) {
      console.error('Erro ao buscar kanban:', e);
    } finally {
      setKanbanLoading(Object.fromEntries(stages.map((s) => [s, false])));
    }
  }, [dateParams, searchText, selectedManager, kanbanPerPage]);

  const updateContactStatus = useCallback(
    async (userId: number, newStatus: ContactStatusKey) => {
      try {
        await api.post('/client-wallet/producers/contact-status', {
          user_id: userId,
          contact_status: newStatus,
        });

        setContactStatusChanges((prev) => ({ ...prev, [userId]: newStatus }));
        setItems((prev) =>
          prev.map((it) =>
            it.id === userId ? { ...it, contact_status: newStatus } : it,
          ),
        );
      } catch (e) {
        console.error('Erro ao atualizar status:', e);
      }
    },
    [],
  );

  // useEffect para mudanças de filtros/busca (com debounce)
  // Este effect reseta para página 1 quando filtros mudam
  // NÃO incluir page e perPage nas dependências para evitar loop infinito
  // Mudanças de página devem ser tratadas manualmente via fetchPerformance
  useEffect(() => {
    // Não fazer requisição se ainda não temos dateParams
    if (!dateParams) {
      setItems([]);
      setTotalRows(0);
      return;
    }

    // Se fetchPerformance foi chamado manualmente (mudança de página/perPage), não fazer requisição aqui
    if (manualFetchRef.current) {
      return;
    }

    // Quando filtros mudarem, fazer requisição com debounce
    // Sempre usar página 1 quando filtros mudam (o componente já reseta page para 1)
    const handler = setTimeout(async () => {
      // Verificar novamente se não foi chamado manualmente durante o debounce
      if (manualFetchRef.current) {
        return;
      }
      await fetchPerformance(1, perPage);
      fetchSummary();
    }, 350);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedRange,
    searchText,
    selectedManager,
    selectedStage,
    sortField,
    sortDirection,
    dateParams,
    // NÃO incluir page e perPage aqui para evitar loop infinito
    // Mudanças de página são tratadas manualmente no componente
  ]);

  // -----------------------
  // KANBAN EFFECT
  // -----------------------
  useEffect(() => {
    fetchKanbanAll();
  }, [debouncedRange, searchText, selectedManager, fetchKanbanAll]);

  return {
    managers,
    loading,
    summaryLoading,
    kanbanLoading,
    items,
    summaryData,
    kanbanSummary,
    kanbanData,
    totalRows,
    metaNote,
    noCompleteDays,
    contactStatusChanges,
    rangePayload,
    updateContactStatus,
    fetchPerformance,
    fetchKanbanStage,
  };
};
