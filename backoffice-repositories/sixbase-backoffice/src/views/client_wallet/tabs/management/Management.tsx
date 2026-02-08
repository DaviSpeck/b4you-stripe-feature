import { FC, useCallback, useMemo, useState, useRef } from 'react';
import { UserPlus, Briefcase, Settings, CheckCircle } from 'react-feather';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useSkin } from '../../../../utility/hooks/useSkin';
import { getUserData, FormatBRL } from '../../../../utility/Utils';
import {
  ManagerPhase,
  MANAGER_PHASE_IDS,
} from './interfaces/management.interface';
import ManagementFilters from '../../../../components/client_wallet/tabs/management/managementfilters/ManagementFilters';
import ManagementKanbanColumn from '../../../../components/client_wallet/tabs/management/managementkanbancolumn/ManagementKanbanColumn';
import { useManagementData } from '../../../../hooks/client_wallet/useManagementData';
import ManagementTable from '../../../../components/client_wallet/tabs/management/managementtable/ManagementTable';
import { useManagementTableData } from '../../../../hooks/client_wallet/useManagementTableData';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Card,
  CardBody,
} from 'reactstrap';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

const Management: FC = () => {
  const { skin } = useSkin();
  const userData = useMemo(() => {
    try {
      return getUserData();
    } catch (_) {
      return null;
    }
  }, []);

  const isMaster = useMemo(() => {
    const role = String(userData?.role || '').toUpperCase();
    return role === 'MASTER';
  }, [userData]);

  const isCommercial = useMemo(() => {
    const role = String(userData?.role || '').toUpperCase();
    return role === 'COMERCIAL';
  }, [userData]);

  const canSeeFilters = isMaster;
  const canAddClient = isMaster;
  const canEditPhase = isMaster || isCommercial;

  // Estados para a tabela
  const [tablePage, setTablePage] = useState(0);
  const [tablePerPage, setTablePerPage] = useState(10);
  const [tableSearchText, setTableSearchText] = useState('');
  const [tableSortField, setTableSortField] = useState<
    'name' | 'current_revenue'
  >('name');
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>(
    'desc',
  );
  const [selectedPhase, setSelectedPhase] = useState<
    ManagerPhase | null | 'null'
  >(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [addClientSearch, setAddClientSearch] = useState('');
  const [addClientResults, setAddClientResults] = useState<any[]>([]);
  const [addClientLoading, setAddClientLoading] = useState(false);
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [selectedManagerForClient, setSelectedManagerForClient] = useState<
    string | number
  >('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const {
    selectedManager,
    setSelectedManager,
    managers,
    kanbanPerPage,
    kanbanPageByPhase,
    kanbanLoading,
    kanbanData,
    kanbanSummary,
    updateManagerPhase,
    handlePageChange,
    getTotalPages,
    fetchKanbanAll,
    updateManagerPhaseOptimistic,
  } = useManagementData({ isCommercial, userData });

  const {
    loading: tableLoading,
    items: tableItems,
    totalRows: tableTotalRows,
    phaseChanges,
    updatePhase,
    refetch: refetchTable,
  } = useManagementTableData({
    selectedManager,
    selectedPhase,
    isCommercial,
    page: tablePage,
    perPage: tablePerPage,
    sortField: tableSortField,
    sortDirection: tableSortDirection,
    searchText: tableSearchText,
  });

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(String(active.id));

      // Encontrar o item que está sendo arrastado
      const activeIdStr = String(active.id);
      const activeMatch = activeIdStr.match(/^item-(\d+)-(\d+)$/);
      if (activeMatch) {
        const userId = parseInt(activeMatch[1], 10);
        const phase = parseInt(activeMatch[2], 10);
        const item = kanbanData[phase]?.find((i) => i.id === userId);
        if (item) {
          setDraggedItem({ item, phase });
        }
      }
    },
    [kanbanData],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setDraggedItem(null);

      if (!over) return;

      const activeIdStr = String(active.id);
      const overId = String(over.id);

      // Extrair informações do activeId: "item-{userId}-{currentPhase}"
      const activeMatch = activeIdStr.match(/^item-(\d+)-(\d+)$/);
      if (!activeMatch) return;

      const userId = parseInt(activeMatch[1], 10);
      const currentPhase = parseInt(activeMatch[2], 10) as ManagerPhase;

      // overId pode ser uma coluna (droppable) ou outro item
      let targetPhase: ManagerPhase | null = null;

      if (overId.startsWith('column-')) {
        // Dropped on a column
        const phaseMatch = overId.match(/^column-(\d+)$/);
        if (phaseMatch) {
          targetPhase = parseInt(phaseMatch[1], 10) as ManagerPhase;
        }
      } else {
        // Dropped on another item - pegar a fase do item de destino
        const overMatch = overId.match(/^item-(\d+)-(\d+)$/);
        if (overMatch) {
          targetPhase = parseInt(overMatch[2], 10) as ManagerPhase;
        }
      }

      if (targetPhase !== null && targetPhase !== currentPhase) {
        // Não permitir mover de volta para Novos Clientes (é automático)
        if (targetPhase === MANAGER_PHASE_IDS.NOVOS_CLIENTES) {
          return;
        }

        // Atualização otimista IMEDIATA - atualiza o estado local antes da API
        updateManagerPhaseOptimistic(userId, currentPhase, targetPhase);

        // Atualizar a fase no backend (a atualização otimista já foi feita)
        // Não passar fromPhase aqui para evitar duplicação
        updateManagerPhase(userId, targetPhase);
        refetchTable();
      }
    },
    [updateManagerPhase, updateManagerPhaseOptimistic, refetchTable],
  );

  const handleAddClientSearch = useCallback(async (search: string) => {
    if (!search || search.trim().length < 2) {
      setAddClientResults([]);
      return;
    }

    setAddClientLoading(true);
    try {
      // Usar o endpoint /users com o parâmetro 'input' que busca produtores
      const response = await api.get('/users', {
        params: {
          input: search.trim(),
          page: 0,
          size: 20,
        },
      });

      // O endpoint retorna os dados em response.data.info.rows
      // Os dados são serializados pelo SerializeUsers, que retorna uuid mas não id
      // Precisamos buscar o id usando o uuid ou modificar para usar os dados originais
      const users = Array.isArray(response.data?.info?.rows)
        ? response.data.info.rows
        : Array.isArray(response.data?.users)
        ? response.data.users
        : Array.isArray(response.data)
        ? response.data
        : [];

      // Verificar quais usuários já estão na carteira (têm manager_phase)
      if (users.length > 0) {
        const userIds = users
          .map((u: any) => u.id || u.user_id || u.userId)
          .filter((id: any) => id !== null && id !== undefined);
        const userUuids = users
          .map((u: any) => u.uuid)
          .filter((uuid: any) => uuid !== null && uuid !== undefined);

        if (userIds.length > 0 || userUuids.length > 0) {
          try {
            const checkResponse = await api.post(
              '/client-wallet/management/check-users-in-wallet',
              {
                user_ids: userIds,
                user_uuids: userUuids,
              },
            );

            const usersInWallet = checkResponse.data?.usersInWallet || [];

            // Criar sets separados para IDs e UUIDs
            const usersInWalletIds = new Set(
              usersInWallet
                .map((u: any) => u.id)
                .filter((id: any) => id !== null && id !== undefined)
                .map((id: any) => String(id)),
            );
            const usersInWalletUuids = new Set(
              usersInWallet
                .map((u: any) => u.uuid)
                .filter((uuid: any) => uuid !== null && uuid !== undefined)
                .map((uuid: any) => String(uuid)),
            );

            // Adicionar flag isInWallet aos usuários
            const usersWithWalletStatus = users.map((user: any) => {
              const userId = user.id || user.user_id || user.userId || null;
              const userUuid = user.uuid || null;

              // Verificar se está na carteira comparando ID ou UUID
              let isInWallet = false;
              if (userId !== null && userId !== undefined) {
                const userIdStr = String(userId);
                isInWallet = usersInWalletIds.has(userIdStr);
                if (!isInWallet) {
                  // Tentar também como número
                  const userIdNum = Number(userId);
                  if (!isNaN(userIdNum)) {
                    isInWallet = usersInWalletIds.has(String(userIdNum));
                  }
                }
              }
              if (!isInWallet && userUuid) {
                isInWallet = usersInWalletUuids.has(String(userUuid));
              }

              return {
                ...user,
                isInWallet: Boolean(isInWallet), // Garantir que seja boolean
              };
            });

            setAddClientResults(usersWithWalletStatus);
          } catch (checkError) {
            console.error(
              'Erro ao verificar usuários na carteira:',
              checkError,
            );
            // Se der erro na verificação, usar os usuários sem a flag
            setAddClientResults(users);
          }
        } else {
          setAddClientResults(users);
        }
      } else {
        setAddClientResults(users);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setAddClientResults([]);
    } finally {
      setAddClientLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(handleAddClientSearch, 300),
    [handleAddClientSearch],
  );

  const handleAddClientSearchChange = useCallback(
    (value: string) => {
      setAddClientSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // Função para verificar se um cliente já está na carteira
  const isClientInWallet = useCallback(
    (
      userId: number | string | null,
    ): { isInWallet: boolean; reason?: string } => {
      if (!userId && userId !== 0) {
        return { isInWallet: false };
      }

      // Normalizar ID para comparação (converter para string para evitar problemas de tipo)
      const userIdStr = String(userId);

      // Verificar em todos os kanbans
      const allKanbanItems = [
        ...(kanbanData[MANAGER_PHASE_IDS.NOVOS_CLIENTES] || []),
        ...(kanbanData[MANAGER_PHASE_IDS.NEGOCIACAO] || []),
        ...(kanbanData[MANAGER_PHASE_IDS.IMPLEMENTACAO] || []),
        ...(kanbanData[MANAGER_PHASE_IDS.PRONTO_PARA_VENDER] || []),
      ];

      const isInKanban = allKanbanItems.some((item) => {
        if (!item || (!item.id && item.id !== 0)) return false;
        const itemIdStr = String(item.id);
        return itemIdStr === userIdStr;
      });

      if (isInKanban) {
        return { isInWallet: true, reason: 'Já adicionado' };
      }

      // Verificar na tabela
      const isInTable = tableItems.some((item) => {
        if (!item || (!item.id && item.id !== 0)) return false;
        const itemIdStr = String(item.id);
        return itemIdStr === userIdStr;
      });

      if (isInTable) {
        return { isInWallet: true, reason: 'Já adicionado' };
      }

      return { isInWallet: false };
    },
    [kanbanData, tableItems],
  );

  const fetchManagers = useCallback(async () => {
    try {
      const response = await api.get('/client-wallet/managers');
      setAvailableManagers(
        Array.isArray(response.data?.managers) ? response.data.managers : [],
      );
    } catch (err) {
      console.error('Erro ao buscar gerentes:', err);
      setAvailableManagers([]);
    }
  }, []);

  const handleOpenAddClientModal = useCallback(() => {
    setShowAddClientModal(true);
    fetchManagers();
    // Recarregar dados do kanban e tabela para garantir que a verificação esteja atualizada
    fetchKanbanAll();
    refetchTable();
  }, [fetchManagers, fetchKanbanAll, refetchTable]);

  const handleAddClient = useCallback(
    async (userId: number | string | null, userUuid?: string | null) => {
      // Verificar se um gerente foi selecionado
      if (!selectedManagerForClient || selectedManagerForClient === '') {
        toast.error(
          'Por favor, selecione um gerente antes de adicionar o cliente',
        );
        return;
      }

      // Verificar se já está na carteira antes de tentar adicionar (só se tiver id numérico)
      if (userId && typeof userId === 'number') {
        const checkResult = isClientInWallet(userId);
        if (checkResult.isInWallet) {
          toast.warning(checkResult.reason || 'Cliente já está na carteira');
          return;
        }
      }

      try {
        // Preparar payload: usar user_id se disponível, senão user_uuid, e incluir manager_id
        const payload: any = {
          manager_id: selectedManagerForClient,
        };
        if (userId) {
          payload.user_id = userId;
        } else if (userUuid) {
          payload.user_uuid = userUuid;
        } else {
          toast.error('ID ou UUID do usuário não encontrado');
          return;
        }

        const response = await api.post(
          '/client-wallet/management/add-client',
          payload,
        );

        // Verificar se a resposta indica sucesso
        if (response?.data?.success !== false && response?.status === 200) {
          toast.success(
            'Cliente vinculado ao gerente e adicionado a Novos Clientes com sucesso!',
          );

          // Fechar modal e limpar estados
          setShowAddClientModal(false);
          setAddClientSearch('');
          setAddClientResults([]);
          setSelectedManagerForClient('');

          // Atualizar dados em background sem mostrar erros (não bloquear o fluxo)
          Promise.all([
            fetchKanbanAll().catch((err) => {
              console.error('Erro ao atualizar kanban:', err);
            }),
            refetchTable().catch((err) => {
              console.error('Erro ao atualizar tabela:', err);
            }),
          ]).catch(() => {
            // Ignorar erros de refetch
          });
        } else {
          // Se a resposta indica falha, mostrar mensagem de erro
          const errorMessage =
            response?.data?.message ||
            'Erro ao adicionar cliente a Novos Clientes';
          toast.error(errorMessage);
        }
      } catch (error: any) {
        // Só mostrar erro se realmente houver um erro HTTP (não 2xx)
        const status = error?.response?.status;
        if (status && status >= 400) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            'Erro ao adicionar cliente a Novos Clientes';
          toast.error(errorMessage);
        } else {
          // Se não for um erro HTTP conhecido, pode ser erro de rede ou outro problema
          console.error('Erro ao adicionar cliente:', error);
          toast.error('Erro ao adicionar cliente a Novos Clientes');
        }
      }
    },
    [fetchKanbanAll, refetchTable, isClientInWallet, selectedManagerForClient],
  );

  const handlePhaseChange = useCallback(
    async (userId: number, phase: ManagerPhase | null) => {
      await updatePhase(userId, phase);
      fetchKanbanAll();
    },
    [updatePhase, fetchKanbanAll],
  );

  return (
    <div className="mt-2" style={{ overflowX: 'hidden' }}>
      {canSeeFilters && (
        <ManagementFilters
          managers={managers}
          selectedManager={selectedManager}
          onManagerChange={setSelectedManager}
        />
      )}

      <DndContext
        sensors={canEditPhase ? sensors : undefined}
        collisionDetection={closestCenter}
        onDragStart={canEditPhase ? handleDragStart : undefined}
        onDragEnd={canEditPhase ? handleDragEnd : undefined}
        onDragCancel={() => {
          setActiveId(null);
          setDraggedItem(null);
        }}
        autoScroll={{ threshold: { x: 0, y: 0.2 }, enabled: true }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            width: '100%',
            height: '100%',
            minHeight: '600px',
            padding: '16px',
            background:
              skin === 'dark'
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            boxShadow:
              skin === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <ManagementKanbanColumn
            id={`column-${MANAGER_PHASE_IDS.NOVOS_CLIENTES}`}
            phase={MANAGER_PHASE_IDS.NOVOS_CLIENTES}
            title="Novos Clientes"
            icon={<UserPlus size={16} className="mr-75 text-info" />}
            bgColor="bg-info"
            description="Clientes que se registraram nos últimos 30 dias. Este kanban é automático."
            items={kanbanData[MANAGER_PHASE_IDS.NOVOS_CLIENTES] || []}
            isLoading={kanbanLoading[MANAGER_PHASE_IDS.NOVOS_CLIENTES] || false}
            total={kanbanSummary[MANAGER_PHASE_IDS.NOVOS_CLIENTES] || 0}
            currentPage={
              kanbanPageByPhase[MANAGER_PHASE_IDS.NOVOS_CLIENTES] || 1
            }
            totalPages={getTotalPages(MANAGER_PHASE_IDS.NOVOS_CLIENTES)}
            perPage={kanbanPerPage}
            onPageChange={(page) =>
              handlePageChange(MANAGER_PHASE_IDS.NOVOS_CLIENTES, page)
            }
            onUpdatePhase={updateManagerPhase}
            skin={skin}
            canEdit={canEditPhase}
          />
          <ManagementKanbanColumn
            id={`column-${MANAGER_PHASE_IDS.NEGOCIACAO}`}
            phase={MANAGER_PHASE_IDS.NEGOCIACAO}
            title="Negociação"
            icon={<Briefcase size={16} className="mr-75 text-warning" />}
            bgColor="bg-warning"
            description="Clientes em fase de negociação. Movidos manualmente pelo gerente."
            items={kanbanData[MANAGER_PHASE_IDS.NEGOCIACAO] || []}
            isLoading={kanbanLoading[MANAGER_PHASE_IDS.NEGOCIACAO] || false}
            total={kanbanSummary[MANAGER_PHASE_IDS.NEGOCIACAO] || 0}
            currentPage={kanbanPageByPhase[MANAGER_PHASE_IDS.NEGOCIACAO] || 1}
            totalPages={getTotalPages(MANAGER_PHASE_IDS.NEGOCIACAO)}
            perPage={kanbanPerPage}
            onPageChange={(page) =>
              handlePageChange(MANAGER_PHASE_IDS.NEGOCIACAO, page)
            }
            onUpdatePhase={updateManagerPhase}
            skin={skin}
            canEdit={canEditPhase}
          />
          <ManagementKanbanColumn
            id={`column-${MANAGER_PHASE_IDS.IMPLEMENTACAO}`}
            phase={MANAGER_PHASE_IDS.IMPLEMENTACAO}
            title="Implementação"
            icon={<Settings size={16} className="mr-75 text-primary" />}
            bgColor="bg-primary"
            description="Clientes em fase de implementação. Movidos manualmente pelo gerente."
            items={kanbanData[MANAGER_PHASE_IDS.IMPLEMENTACAO] || []}
            isLoading={kanbanLoading[MANAGER_PHASE_IDS.IMPLEMENTACAO] || false}
            total={kanbanSummary[MANAGER_PHASE_IDS.IMPLEMENTACAO] || 0}
            currentPage={
              kanbanPageByPhase[MANAGER_PHASE_IDS.IMPLEMENTACAO] || 1
            }
            totalPages={getTotalPages(MANAGER_PHASE_IDS.IMPLEMENTACAO)}
            perPage={kanbanPerPage}
            onPageChange={(page) =>
              handlePageChange(MANAGER_PHASE_IDS.IMPLEMENTACAO, page)
            }
            onUpdatePhase={updateManagerPhase}
            skin={skin}
            canEdit={canEditPhase}
          />
          <ManagementKanbanColumn
            id={`column-${MANAGER_PHASE_IDS.PRONTO_PARA_VENDER}`}
            phase={MANAGER_PHASE_IDS.PRONTO_PARA_VENDER}
            title="Pronto para Vender"
            icon={<CheckCircle size={16} className="mr-75 text-success" />}
            bgColor="bg-success"
            description="Clientes prontos para vender. Ao clicar em 'Pronto', a fase é removida."
            items={kanbanData[MANAGER_PHASE_IDS.PRONTO_PARA_VENDER] || []}
            isLoading={
              kanbanLoading[MANAGER_PHASE_IDS.PRONTO_PARA_VENDER] || false
            }
            total={kanbanSummary[MANAGER_PHASE_IDS.PRONTO_PARA_VENDER] || 0}
            currentPage={
              kanbanPageByPhase[MANAGER_PHASE_IDS.PRONTO_PARA_VENDER] || 1
            }
            totalPages={getTotalPages(MANAGER_PHASE_IDS.PRONTO_PARA_VENDER)}
            perPage={kanbanPerPage}
            onPageChange={(page) =>
              handlePageChange(MANAGER_PHASE_IDS.PRONTO_PARA_VENDER, page)
            }
            onUpdatePhase={updateManagerPhase}
            skin={skin}
            canEdit={canEditPhase}
          />
        </div>

        <DragOverlay>
          {activeId && draggedItem ? (
            <div
              style={{
                opacity: 0.95,
                transform: 'rotate(2deg) scale(1.05)',
                boxShadow:
                  skin === 'dark'
                    ? '0 20px 60px rgba(255,255,255,0.25), 0 0 0 2px rgba(255,255,255,0.1)'
                    : '0 20px 60px rgba(0,0,0,0.25), 0 0 0 2px rgba(0,123,255,0.2)',
                cursor: 'grabbing',
              }}
            >
              <Card
                style={{
                  border: `2px solid ${
                    skin === 'dark' ? 'rgba(255,255,255,0.3)' : '#007bff'
                  }`,
                  borderRadius: 8,
                  backgroundColor: skin === 'dark' ? '#1f2a40' : '#ffffff',
                  minWidth: '220px',
                  maxWidth: '280px',
                }}
              >
                <CardBody>
                  <div
                    className="font-weight-bold"
                    style={{ fontSize: '14px' }}
                  >
                    {draggedItem.item.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                  <small className="text-muted" style={{ fontSize: '12px' }}>
                    {draggedItem.item.email}
                  </small>
                  <div
                    className="font-weight-bold mt-1"
                    style={{
                      fontSize: '14px',
                      color: skin === 'dark' ? '#60a5fa' : '#007bff',
                    }}
                  >
                    {FormatBRL(draggedItem.item.current_revenue || 0)}
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ManagementTable
        items={tableItems}
        loading={tableLoading}
        totalRows={tableTotalRows}
        page={tablePage}
        perPage={tablePerPage}
        searchText={tableSearchText}
        onSearchChange={setTableSearchText}
        sortField={tableSortField}
        sortDirection={tableSortDirection}
        onSortFieldChange={setTableSortField}
        onSortDirectionChange={setTableSortDirection}
        onPageChange={(pageIdx) => {
          // DataTable passa página começando em 1, mas nosso estado começa em 0
          setTablePage(pageIdx - 1);
        }}
        onPerPageChange={(newPerPage, pageIdx) => {
          // DataTable passa página começando em 1, mas nosso estado começa em 0
          setTablePerPage(newPerPage);
          setTablePage(pageIdx - 1);
        }}
        phaseChanges={phaseChanges}
        onPhaseChange={canEditPhase ? handlePhaseChange : undefined}
        onAddClientClick={canAddClient ? handleOpenAddClientModal : undefined}
        canEdit={canEditPhase}
        canAddClient={canAddClient}
        selectedPhase={selectedPhase}
        onPhaseChangeFilter={(phase: ManagerPhase | null | 'null') => {
          setSelectedPhase(phase);
          setTablePage(0);
        }}
      />

      {canAddClient && (
        <Modal
          isOpen={showAddClientModal}
          toggle={() => {
            setShowAddClientModal(false);
            setAddClientSearch('');
            setAddClientResults([]);
            setSelectedManagerForClient('');
          }}
          size="lg"
        >
          <ModalHeader toggle={() => setShowAddClientModal(false)}>
            Adicionar Cliente a Novos Clientes
          </ModalHeader>
          <ModalBody>
            <div className="mb-3">
              <Label>Buscar cliente:</Label>
              <Input
                type="text"
                placeholder="Digite o nome ou e-mail do cliente"
                value={addClientSearch}
                onChange={(e) => handleAddClientSearchChange(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <Label>Selecione o gerente:</Label>
              <Input
                type="select"
                value={selectedManagerForClient}
                onChange={(e) => setSelectedManagerForClient(e.target.value)}
              >
                <option value="">Selecione um gerente</option>
                {availableManagers.map((manager: any) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.full_name || manager.email}
                  </option>
                ))}
              </Input>
            </div>
            {addClientLoading && (
              <div className="mt-2 text-center">
                <small>Buscando...</small>
              </div>
            )}
            {addClientResults.length > 0 && (
              <div className="mt-3">
                <Label>Resultados:</Label>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {addClientResults.map((user: any) => {
                    // O SerializeUsers retorna uuid, mas o backend precisa do id numérico
                    // Tentar múltiplos campos possíveis para o ID
                    const userId =
                      user.id || user.user_id || user.userId || null;
                    const userUuid = user.uuid || null;
                    const userName =
                      user.full_name || user.name || user.fullName || '';
                    const userEmail = user.email || '';

                    // Se não temos id mas temos uuid, precisamos buscar o id
                    // Por enquanto, vamos usar uma abordagem diferente:
                    // Se temos uuid mas não id, vamos tentar usar o uuid e modificar o backend
                    // OU fazer uma chamada para buscar o id pelo uuid
                    // Por enquanto, vamos assumir que o id pode estar disponível em algum lugar

                    // Verificar se o cliente já está na carteira
                    // Priorizar a flag isInWallet que vem do backend (mais confiável)
                    const isInWalletFromBackend =
                      user.isInWallet === true ||
                      user.isInWallet === 'true' ||
                      user.isInWallet === 1;
                    // Fallback: verificar localmente se não tiver flag do backend
                    const checkResult =
                      !isInWalletFromBackend &&
                      userId !== null &&
                      userId !== undefined
                        ? isClientInWallet(userId)
                        : { isInWallet: false };
                    const isAlreadyInWallet =
                      Boolean(isInWalletFromBackend) ||
                      Boolean(checkResult.isInWallet);

                    // Verificar se tem gerente (pode não vir na resposta da API)
                    const hasManager = user.id_manager || user.managers;

                    // Desabilitar se: não tem ID válido (nem id nem uuid), já está na carteira, ou não tem gerente selecionado
                    const hasValidIdentifier = userId || userUuid;
                    const hasManagerSelected =
                      selectedManagerForClient &&
                      selectedManagerForClient !== '';
                    const isDisabled =
                      !hasValidIdentifier ||
                      isAlreadyInWallet ||
                      !hasManagerSelected;

                    // Determinar mensagem de status (prioridade: já adicionado > sem gerente > outros)
                    let statusMessage = '';
                    if (isAlreadyInWallet) {
                      statusMessage = 'Já adicionado';
                    } else if (!hasValidIdentifier) {
                      statusMessage = 'ID não encontrado';
                    } else if (!hasManagerSelected) {
                      statusMessage = 'Selecione um gerente';
                    } else if (hasManager === false) {
                      // Só mostrar aviso se tiver certeza que não tem gerente (quando o campo existe mas é false/null)
                      statusMessage =
                        '⚠️ Cliente pode precisar ter um gerente atribuído';
                    }

                    return (
                      <div
                        key={userId || user.uuid}
                        className="d-flex justify-content-between align-items-center p-2 border-bottom"
                      >
                        <div style={{ flex: 1 }}>
                          <div className="font-weight-bold">{userName}</div>
                          <small className="text-muted">{userEmail}</small>
                          {statusMessage && (
                            <div className="mt-1">
                              <small
                                className={
                                  isAlreadyInWallet
                                    ? 'text-warning font-weight-bold'
                                    : !hasManager
                                    ? 'text-info'
                                    : 'text-muted'
                                }
                              >
                                {statusMessage}
                              </small>
                            </div>
                          )}
                        </div>
                        <Button
                          color={isDisabled ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => {
                            if (!isDisabled) {
                              handleAddClient(userId || null, userUuid || null);
                            }
                          }}
                          disabled={isDisabled}
                          style={{
                            marginLeft: '12px',
                            minWidth: '100px',
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            pointerEvents: isDisabled ? 'none' : 'auto',
                          }}
                          title={
                            isDisabled
                              ? statusMessage ||
                                'Não é possível adicionar este cliente'
                              : 'Adicionar cliente a Novos Clientes'
                          }
                        >
                          {isAlreadyInWallet ? 'Já adicionado' : 'Adicionar'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {addClientSearch.length >= 2 &&
              !addClientLoading &&
              addClientResults.length === 0 && (
                <div className="mt-2 text-muted">
                  <small>Nenhum cliente encontrado</small>
                </div>
              )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                setShowAddClientModal(false);
                setAddClientSearch('');
                setAddClientResults([]);
                setSelectedManagerForClient('');
              }}
            >
              Fechar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default Management;
