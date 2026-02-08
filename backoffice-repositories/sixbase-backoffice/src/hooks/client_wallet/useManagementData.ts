import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  ManagerPhase,
  ManagementItem,
} from '../../views/client_wallet/tabs/management/interfaces/management.interface';

interface Manager {
  id: number;
  email: string;
}

interface UseManagementDataProps {
  isCommercial: boolean;
  userData: any;
}

export const useManagementData = ({
  isCommercial,
  userData,
}: UseManagementDataProps) => {
  const [selectedManager, setSelectedManager] = useState<string>(
    userData && isCommercial ? String(userData.id) : '',
  );
  const [managers, setManagers] = useState<Manager[]>([]);

  const [kanbanPerPage] = useState<number>(5);
  const [kanbanPageByPhase, setKanbanPageByPhase] = useState<
    Record<ManagerPhase | 1, number>
  >({
    1: 1,
    2: 1,
    3: 1,
    4: 1,
  });

  const [kanbanLoading, setKanbanLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [kanbanData, setKanbanData] = useState<
    Record<number, ManagementItem[]>
  >({});
  const [kanbanSummary, setKanbanSummary] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  useEffect(() => {
    if (isCommercial) return;
    const fetchManagers = async () => {
      try {
        const response = await api.get('/client-wallet/managers', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });
        setManagers(
          Array.isArray(response.data?.managers) ? response.data.managers : [],
        );
      } catch (e) {
        setManagers([]);
      }
    };
    fetchManagers();
  }, [isCommercial]);

  const fetchKanbanPhase = useCallback(
    async (phase: ManagerPhase | 1, pageParam = 1) => {
      setKanbanLoading((prev) => ({ ...prev, [phase]: true }));
      try {
        const params: any = {
          phase: phase === 1 ? 'NOVOS_CLIENTES' : phase,
          page: pageParam - 1,
          size: kanbanPerPage,
        };
        if (selectedManager && selectedManager !== '')
          params.manager_id = selectedManager;

        const response = await api.get('/client-wallet/management/kanban', {
          params,
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });
        const data: any = response.data || {};
        const items: ManagementItem[] = Array.isArray(data.items)
          ? data.items
          : [];

        setKanbanData((prev) => ({ ...prev, [phase]: items }));
        setKanbanSummary((prev) => ({
          ...prev,
          [phase]: data.total || 0,
        }));
      } catch (e) {
        console.error(`Erro ao buscar kanban ${phase}:`, e);
        setKanbanData((prev) => ({ ...prev, [phase]: [] }));
        setKanbanSummary((prev) => ({ ...prev, [phase]: 0 }));
      } finally {
        setKanbanLoading((prev) => ({ ...prev, [phase]: false }));
      }
    },
    [selectedManager, kanbanPerPage],
  );

  const fetchKanbanAll = useCallback(async () => {
    const phases: ManagerPhase[] = [1, 2, 3, 4];
    setKanbanLoading(Object.fromEntries(phases.map((p) => [p, true])));

    try {
      // Buscar apenas a primeira página (5 itens) de cada fase
      // Usar Promise.all para buscar todas as fases em paralelo
      const fetchPromises = phases.map(async (phase) => {
        try {
          const params: any = {
            phase: phase === 1 ? 'NOVOS_CLIENTES' : phase,
            page: 0, // Primeira página
            size: kanbanPerPage, // 5 itens por página
          };

          if (selectedManager && selectedManager !== '')
            params.manager_id = selectedManager;

          const response = await api.get('/client-wallet/management/kanban', {
            params,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Expires: '0',
            },
          });

          const data: any = response.data || {};
          return {
            phase,
            items: Array.isArray(data.items) ? data.items : [],
            total: Number(data.total) || 0,
          };
        } catch (error) {
          console.error(`Erro ao buscar kanban ${phase}:`, error);
          return {
            phase,
            items: [],
            total: 0,
          };
        }
      });

      const results = await Promise.all(fetchPromises);

      // Organizar resultados por fase
      const itemsByPhase: Record<number, ManagementItem[]> = {};
      const totals: Record<number, number> = {};

      results.forEach((result) => {
        itemsByPhase[result.phase] = result.items;
        totals[result.phase] = result.total;
      });

      setKanbanData({
        1: itemsByPhase[1] || [],
        2: itemsByPhase[2] || [],
        3: itemsByPhase[3] || [],
        4: itemsByPhase[4] || [],
      });

      setKanbanSummary({
        1: totals[1] || 0,
        2: totals[2] || 0,
        3: totals[3] || 0,
        4: totals[4] || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar Kanban All:', error);
      setKanbanData({
        1: [],
        2: [],
        3: [],
        4: [],
      });
      setKanbanSummary({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
      });
    } finally {
      setKanbanLoading(Object.fromEntries(phases.map((p) => [p, false])));
    }
  }, [selectedManager, kanbanPerPage]);

  useEffect(() => {
    fetchKanbanAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManager]);

  const updateManagerPhaseOptimistic = useCallback(
    (userId: number, fromPhase: ManagerPhase, toPhase: ManagerPhase | null) => {
      // Atualização otimista - atualiza o estado local imediatamente
      setKanbanData((prev) => {
        const newData = { ...prev };

        // Remover o item da fase origem
        if (newData[fromPhase]) {
          newData[fromPhase] = newData[fromPhase].filter(
            (item) => item.id !== userId,
          );
        }

        // Adicionar o item na fase destino (se não for null)
        if (toPhase !== null) {
          const item = prev[fromPhase]?.find((i) => i.id === userId);
          if (item) {
            const updatedItem = {
              ...item,
              manager_phase: toPhase,
              manager_phase_updated_at: new Date().toISOString(),
            };
            newData[toPhase] = [...(newData[toPhase] || []), updatedItem];
          }
        }

        // Atualizar os totais
        setKanbanSummary((prevSummary) => {
          const newSummary = { ...prevSummary };
          if (newSummary[fromPhase] !== undefined) {
            newSummary[fromPhase] = Math.max(
              0,
              (newSummary[fromPhase] || 0) - 1,
            );
          }
          if (toPhase !== null && newSummary[toPhase] !== undefined) {
            newSummary[toPhase] = (newSummary[toPhase] || 0) + 1;
          }
          return newSummary;
        });

        return newData;
      });
    },
    [],
  );

  const updateManagerPhase = useCallback(
    async (userId: number, phase: ManagerPhase | null) => {
      try {
        await api.post('/client-wallet/management/phase', {
          user_id: userId,
          phase: phase,
        });

        // Não recarregar imediatamente - a atualização otimista já foi feita
        // Isso evita o "reload" visual desnecessário
        // A sincronização com o backend já foi feita pela atualização otimista
      } catch (error) {
        console.error('Erro ao atualizar fase do manager:', error);
        // Se der erro, recarregar para reverter o estado otimista
        await fetchKanbanAll();
      }
    },
    [fetchKanbanAll],
  );

  const handlePageChange = useCallback(
    (phase: ManagerPhase | 1, page: number) => {
      setKanbanPageByPhase((prev) => ({
        ...prev,
        [phase]: page,
      }));
      fetchKanbanPhase(phase, page);
    },
    [fetchKanbanPhase],
  );

  const getTotalPages = useCallback(
    (phase: ManagerPhase | 1) => {
      return Math.max(
        1,
        Math.ceil((kanbanSummary[phase] || 0) / kanbanPerPage),
      );
    },
    [kanbanSummary, kanbanPerPage],
  );

  return {
    selectedManager,
    setSelectedManager,
    managers,
    kanbanPerPage,
    kanbanPageByPhase,
    kanbanLoading,
    kanbanData,
    kanbanSummary,
    fetchKanbanPhase,
    fetchKanbanAll,
    updateManagerPhase,
    updateManagerPhaseOptimistic,
    handlePageChange,
    getTotalPages,
  };
};
