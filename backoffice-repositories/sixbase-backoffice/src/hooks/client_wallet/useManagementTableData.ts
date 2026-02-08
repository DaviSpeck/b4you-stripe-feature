import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  ManagementItem,
  ManagerPhase,
} from '../../views/client_wallet/tabs/management/interfaces/management.interface';

interface UseManagementTableDataProps {
  selectedManager: string;
  selectedPhase: ManagerPhase | null | 'null';
  isCommercial: boolean;
  page: number;
  perPage: number;
  sortField: 'name' | 'current_revenue';
  sortDirection: 'asc' | 'desc';
  searchText: string;
}

export const useManagementTableData = ({
  selectedManager,
  selectedPhase,
  isCommercial,
  page,
  perPage,
  sortField,
  sortDirection,
  searchText,
}: UseManagementTableDataProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<ManagementItem[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [phaseChanges, setPhaseChanges] = useState<
    Record<number, ManagerPhase | null>
  >({});

  const fetchTableData = useCallback(async () => {
    // Validar perPage para evitar valores inválidos que podem travar o backend
    const safePerPage = Math.max(1, Math.min(perPage || 10, 100)); // Limitar entre 1 e 100

    setLoading(true);
    try {
      const params: any = {
        page,
        size: safePerPage,
        sort_field: sortField, // Backend espera sort_field
        sort_direction: sortDirection, // Backend espera sort_direction
      };

      // Manager Filter
      if (selectedManager && selectedManager !== '') {
        params.manager_id = selectedManager;
      }

      // Phase Filter
      if (selectedPhase === 'null') {
        params.phase = 'null';
      } else if (typeof selectedPhase === 'number') {
        params.phase = selectedPhase;
      }
      // quando selectedPhase === null → não enviar params.phase (sem filtro)

      // Search filter
      if (searchText && searchText.trim() !== '') {
        params.search = searchText.trim();
      }

      // Timeout de segurança para evitar travar o frontend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      try {
        const response = await api.get('/client-wallet/management/table', {
          params,
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });

        clearTimeout(timeoutId);

        const data = response.data || {};
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotalRows(Number(data.total) || 0);
      } catch (requestError: any) {
        clearTimeout(timeoutId);
        if (
          requestError.name === 'AbortError' ||
          requestError.code === 'ECONNABORTED'
        ) {
          console.error(
            'Timeout ao buscar dados da tabela - requisição demorou muito',
          );
          throw new Error(
            'A requisição demorou muito para responder. Tente novamente com menos itens por página.',
          );
        }
        throw requestError;
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados da tabela:', error);
      setItems([]);
      setTotalRows(0);
      // Não resetar loading aqui para que o usuário veja que houve um erro
      // O loading será resetado no finally
    } finally {
      setLoading(false);
    }
  }, [
    selectedManager,
    selectedPhase,
    page,
    perPage,
    sortField,
    sortDirection,
    searchText,
  ]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const updatePhase = useCallback(
    async (userId: number, phase: ManagerPhase | null) => {
      // Atualiza localmente
      setPhaseChanges((prev) => ({ ...prev, [userId]: phase }));

      try {
        await api.post('/client-wallet/management/phase', {
          user_id: userId,
          phase,
        });

        // Remove pendente
        setPhaseChanges((prev) => {
          const newChanges = { ...prev };
          delete newChanges[userId];
          return newChanges;
        });

        // Recarrega tabela
        await fetchTableData();
      } catch (error) {
        console.error('Erro ao atualizar fase:', error);

        // Reverter mudança
        setPhaseChanges((prev) => {
          const newChanges = { ...prev };
          delete newChanges[userId];
          return newChanges;
        });

        await fetchTableData();
      }
    },
    [fetchTableData],
  );

  return {
    loading,
    items,
    totalRows,
    phaseChanges,
    updatePhase,
    refetch: fetchTableData,
  };
};
