import { FC, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import DataTableModal from '../../../../common/DataTableModal';
import { maskPhone, FormatBRL } from '../../../../../utility/Utils';
import { DashboardModalsProps } from './interfaces/dashboard-modals.interface';
import { Producer } from '../../../../../views/client_wallet/tabs/dashboard/interfaces/dashboard.interface';
import { Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';

const formatCompactCurrency = (value: number): string => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)} mi`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)} mil`;
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  return currencyFormatter.format(value);
};

const DashboardModals: FC<DashboardModalsProps> = ({
  showModalChurn,
  onToggleChurn,
  clientsChurn,
  churnLoading,
  churnTotal,
  churnPage,
  churnPerPage,
  onChurnPageChange,
  onChurnRowsPerPageChange,
  showModalRevenue,
  onToggleRevenue,
  revenueProducers,
  revenueLoading,
  showModalGoals,
  onToggleGoals,
  goalsProducers,
  goalsLoading,
  showModalBirthdays,
  onToggleBirthdays,
  birthdayProducers,
  birthdaysLoading,
  showModalActiveClients,
  onToggleActiveClients,
  activeClients,
  activeClientsLoading,
  activeClientsTotal,
  activeClientsPage,
  activeClientsPerPage,
  onActiveClientsPageChange,
  onActiveClientsRowsPerPageChange,
  showModalNewClients,
  onToggleNewClients,
  newClients,
  newClientsLoading,
  newClientsTotal,
  newClientsPage,
  newClientsPerPage,
  onNewClientsPageChange,
  onNewClientsRowsPerPageChange,
  showModalProducersWithoutManager,
  onToggleProducersWithoutManager,
  producersWithoutManager,
  producersWithoutManagerLoading,
  producersWithoutManagerTotal,
  producersWithoutManagerPage,
  producersWithoutManagerPerPage,
  onProducersWithoutManagerPageChange,
  onProducersWithoutManagerRowsPerPageChange,
  managersForModal,
  assignManager,
  showModalClientsWithManager,
  onToggleClientsWithManager,
  clientsWithManager,
  clientsWithManagerLoading,
  clientsWithManagerTotal,
  clientsWithManagerPage,
  clientsWithManagerPerPage,
  onClientsWithManagerPageChange,
  onClientsWithManagerRowsPerPageChange,
  showModalRetention,
  onToggleRetention,
  retentionClients,
  retentionLoading,
  retentionTotal,
  retentionPage,
  retentionPerPage,
  onRetentionPageChange,
  onRetentionRowsPerPageChange,
}) => {
  const [managerAssignments, setManagerAssignments] = useState<
    Record<number, string | number | null>
  >({});
  const [assigningIds, setAssigningIds] = useState<Record<number, boolean>>({});

  const handleManagerChange = useCallback(
    (userId: number, managerId: string) => {
      setManagerAssignments((prev) => ({
        ...prev,
        [userId]: managerId === '' ? null : managerId,
      }));
    },
    [],
  );

  const handleAssignManager = useCallback(
    async (userId: number) => {
      const managerId = managerAssignments[userId] ?? null;
      setAssigningIds((prev) => ({ ...prev, [userId]: true }));

      try {
        const result = await assignManager(userId, managerId);
        if (result.success) {
          toast.success('Gerente vinculado com sucesso!');
          setManagerAssignments((prev) => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
          });
        } else {
          toast.error(result.message || 'Erro ao vincular gerente');
        }
      } catch (error: any) {
        toast.error(error?.message || 'Erro ao vincular gerente');
      } finally {
        setAssigningIds((prev) => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      }
    },
    [assignManager, managerAssignments],
  );

  const columnsProducers = useMemo(
    () => [
      {
        name: 'Nome',
        selector: (row: Producer) => row.name || '-',
        cell: (row: Producer) => (
          <Link
            to={`/producer/${row.user_uuid || row.id}`}
            className="font-weight-bold text-truncate d-block"
            style={{ maxWidth: 200 }}
          >
            {row.name || '-'}
          </Link>
        ),
        grow: 1.2,
      },
      {
        name: 'Email',
        selector: (row: Producer) => row.email,
        sortable: true,
        cell: (row: Producer) => (
          <span
            className="px-1 text-truncate d-block"
            style={{ maxWidth: 200 }}
            title={row.email}
          >
            {row.email}
          </span>
        ),
        grow: 1,
      },
      {
        name: 'Telefone',
        cell: (row: Producer) => (
          <span className="px-1 text-nowrap">{maskPhone(row.phone)}</span>
        ),
        grow: 0.6,
      },
      {
        name: 'Aniversário',
        selector: (row: Producer) => row.birth_date,
        sortable: true,
        center: true,
        grow: 0.4,
      },
      {
        name: 'Faturamento',
        right: true,
        cell: (row: Producer) => (
          <div className="px-1 text-nowrap">
            <strong>{formatCompactCurrency(row.period_revenue)}</strong>
          </div>
        ),
        grow: 0.8,
      },
      {
        name: 'Status de Meta',
        cell: (row: Producer) => {
          const { next_goal, percentage_achieved, goal_achieved } =
            row.goal_status;
          const achieved = goal_achieved;
          const goal = formatCompactCurrency(next_goal);
          const total = formatCompactCurrency(row.total_revenue || 0);

          return (
            <div className="meta-status">
              <div className="meta-header">
                <small
                  className={`${achieved ? 'text-success' : 'text-muted'}`}
                >
                  {percentage_achieved.toFixed(0)}% até {goal}
                </small>
                <small className="text-light">{total}</small>
              </div>
              <div className="meta-progress">
                <div
                  className="meta-bar"
                  style={{
                    width: `${Math.min(percentage_achieved, 100)}%`,
                    background: achieved
                      ? 'linear-gradient(90deg, #28c76f 0%, #a0ffcc 100%)'
                      : 'linear-gradient(90deg, #7367f0 0%, #a099ff 100%)',
                  }}
                />
              </div>
            </div>
          );
        },
        grow: 1.2,
      },
    ],
    [],
  );

  const columnsChurn = useMemo(
    () => [
      {
        name: 'Nome',
        cell: (row: any) => (
          <div
            className="px-1 d-flex flex-column justify-content-center"
            style={{ minWidth: 180, lineHeight: 1.3 }}
          >
            <Link
              to={`/producer/${row.user_uuid || row.id || row.uuid}`}
              className="font-weight-bold text-truncate d-block"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
              }}
              title={row.name || ''}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
                e.currentTarget.style.color = 'inherit';
              }}
            >
              {row.name || '-'}
            </Link>
          </div>
        ),
        grow: 1,
      },
      {
        name: 'Email',
        selector: (row: any) => row.email || '',
        sortable: true,
        cell: (row: any) => (
          <span
            className="px-1 text-truncate d-block"
            style={{ maxWidth: 200 }}
            title={row.email || ''}
          >
            {row.email || '-'}
          </span>
        ),
        grow: 1,
      },
      {
        name: 'Telefone',
        cell: (row: any) => (
          <span className="px-1 text-nowrap">
            {row.phone ? maskPhone(row.phone) : '-'}
          </span>
        ),
        grow: 1,
      },
      {
        name: 'Faturamento Atual',
        right: true,
        cell: (row: any) => (
          <span className="px-1 text-nowrap">
            {formatCompactCurrency(row.current_revenue || 0)}
          </span>
        ),
        grow: 1,
      },
      {
        name: 'Faturamento Anterior',
        right: true,
        cell: (row: any) => (
          <span className="px-1 text-nowrap">
            {formatCompactCurrency(row.prev_revenue || 0)}
          </span>
        ),
        grow: 1,
      },
      {
        name: 'Queda %',
        right: true,
        cell: (row: any) => {
          const prevRev = row.prev_revenue || 0;
          const currentRev = row.current_revenue || 0;
          const percentage =
            prevRev > 0
              ? (((currentRev - prevRev) / prevRev) * 100).toFixed(1)
              : '0.0';
          const isNegative = Number(percentage) < 0;
          return (
            <span
              className={`px-1 text-nowrap ${isNegative ? 'text-danger' : 'text-success'
                }`}
            >
              {percentage}%
            </span>
          );
        },
        grow: 0.8,
      },
    ],
    [],
  );

  const columnsActiveClients = [
    {
      name: 'Nome',
      selector: (row) => row.name,
      cell: (row) => (
        <Link
          to={`/producer/${row.user_uuid || row.id}`}
          className="font-weight-bold"
        >
          {row.name}
        </Link>
      ),
      grow: 1.2,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      grow: 1,
    },
    {
      name: 'Telefone',
      cell: (row) => maskPhone(row.phone),
      grow: 0.6,
    },
    {
      name: 'Última Venda',
      cell: (row) => moment(row.last_sale_date).format('DD/MM/YYYY'),
      grow: 0.6,
      right: true,
    },
    {
      name: 'Total de Vendas',
      selector: (row) => row.total_sales,
      right: true,
      grow: 0.5,
    },
  ];

  const columnsNewClients = [
    {
      name: 'Nome',
      selector: (row) => row.name,
      cell: (row) => (
        <Link
          to={`/producer/${row.user_uuid || row.id}`}
          className="font-weight-bold"
        >
          {row.name}
        </Link>
      ),
      grow: 1.2,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      grow: 1,
    },
    {
      name: 'Telefone',
      cell: (row) => maskPhone(row.phone),
      grow: 0.6,
    },
    {
      name: 'Criado em',
      cell: (row) => moment(row.created_at).format('DD/MM/YYYY'),
      grow: 0.6,
      right: true,
    },
    {
      name: 'Faturamento',
      cell: (row) => formatCompactCurrency(row.new_client_revenue || 0),
      grow: 0.6,
      right: true,
    },
  ];

  const columnsClientsWithManager = useMemo(
    () => [
      {
        name: 'Nome',
        selector: (row: any) => row.name,
        cell: (row: any) => (
          <Link
            to={`/producer/${row.uuid || row.id}`}
            className="font-weight-bold"
            style={{ textDecoration: 'none' }}
          >
            {row.name}
          </Link>
        ),
        grow: 1.2,
      },
      {
        name: 'Email',
        selector: (row: any) => row.email,
        grow: 1,
      },
      {
        name: 'Telefone',
        cell: (row: any) => (
          <span>{row.phone ? maskPhone(row.phone) : '-'}</span>
        ),
        grow: 0.6,
      },
      {
        name: 'Gerente',
        cell: (row: any) => (
          <span>{row.manager_name || row.manager_email || '-'}</span>
        ),
        grow: 1,
      },
      {
        name: 'Criado em',
        cell: (row: any) => moment(row.created_at).format('DD/MM/YYYY'),
        grow: 0.6,
        right: true,
      },
    ],
    [],
  );

  const columnsRetention = useMemo(
    () => [
      {
        name: 'Nome',
        selector: (row: any) => row.name,
        cell: (row: any) => (
          <Link
            to={`/producer/${row.user_uuid || row.uuid || row.id}`}
            className="font-weight-bold"
            style={{ textDecoration: 'none' }}
          >
            {row.name}
          </Link>
        ),
        grow: 1.2,
      },
      {
        name: 'Email',
        selector: (row: any) => row.email,
        grow: 1,
      },
      {
        name: 'Telefone',
        cell: (row: any) => (
          <span>{row.phone ? maskPhone(row.phone) : '-'}</span>
        ),
        grow: 0.6,
      },
      {
        name: 'Faturamento Retenção',
        right: true,
        cell: (row: any) => (
          <span className="text-nowrap">
            {formatCompactCurrency(row.retention_revenue || 0)}
          </span>
        ),
        grow: 1,
      },
      {
        name: 'Criado em',
        cell: (row: any) => moment(row.created_at).format('DD/MM/YYYY'),
        grow: 0.6,
        right: true,
      },
    ],
    [],
  );

  return (
    <>
      {/* Modal Churn */}
      <DataTableModal
        isOpen={showModalChurn}
        onToggle={onToggleChurn}
        title="Churn"
        description="Clientes em churn - Clientes que já tiveram vendas mas nos últimos 30 dias o saldo de vendas é zero:"
        columns={columnsChurn}
        data={clientsChurn}
        loading={churnLoading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={churnTotal}
        paginationDefaultPage={churnPage + 1}
        paginationPerPage={churnPerPage}
        onChangePage={(page) => onChurnPageChange(page - 1)}
        onChangeRowsPerPage={(perPage, page) =>
          onChurnRowsPerPageChange(perPage, page - 1)
        }
        noDataComponent="Nenhum cliente em churn encontrado"
        size="lg"
      />

      {/* Modal Faturamento (MoM) */}
      <DataTableModal
        isOpen={showModalRevenue}
        onToggle={onToggleRevenue}
        title="Aumento de Faturamento (MoM)"
        description="Lista de produtores ordenados por faturamento no período:"
        columns={columnsProducers}
        data={revenueProducers}
        loading={revenueLoading}
        pagination={true}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        noDataComponent="Nenhum produtor encontrado"
        size="xl"
      />

      {/* Modal Metas Batidas */}
      <DataTableModal
        isOpen={showModalGoals}
        onToggle={onToggleGoals}
        title="Metas Batidas no Período"
        description="Produtores que bateram alguma meta no período selecionado:"
        columns={columnsProducers}
        data={goalsProducers}
        loading={goalsLoading}
        pagination={true}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        noDataComponent="Nenhum produtor encontrado"
        size="xl"
      />

      {/* Modal Aniversariantes */}
      <DataTableModal
        isOpen={showModalBirthdays}
        onToggle={onToggleBirthdays}
        title="Aniversariantes no Período"
        description="Produtores que fazem aniversário no período selecionado:"
        columns={columnsProducers}
        data={birthdayProducers}
        loading={birthdaysLoading}
        pagination={true}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        noDataComponent="Nenhum aniversariante encontrado"
        size="xl"
      />

      {/* Modal Clientes Ativos */}
      <DataTableModal
        isOpen={showModalActiveClients}
        onToggle={onToggleActiveClients}
        title="Clientes Ativos"
        description="Clientes que venderam nos últimos 30 dias:"
        columns={columnsActiveClients}
        data={activeClients}
        loading={activeClientsLoading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={activeClientsTotal}
        paginationDefaultPage={activeClientsPage + 1}
        paginationPerPage={activeClientsPerPage}
        onChangePage={(page) => onActiveClientsPageChange(page - 1)}
        onChangeRowsPerPage={(size, page) =>
          onActiveClientsRowsPerPageChange(size, page - 1)
        }
        noDataComponent="Nenhum cliente ativo encontrado"
        size="xl"
      />

      {/* Modal Novos Clientes */}
      <DataTableModal
        isOpen={showModalNewClients}
        onToggle={onToggleNewClients}
        title="Novos Clientes"
        description="Clientes criados nos últimos 30 dias:"
        columns={columnsNewClients}
        data={newClients}
        loading={newClientsLoading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={newClientsTotal}
        paginationDefaultPage={newClientsPage + 1}
        paginationPerPage={newClientsPerPage}
        onChangePage={(page) => onNewClientsPageChange(page - 1)}
        onChangeRowsPerPage={(size, page) =>
          onNewClientsRowsPerPageChange(size, page - 1)
        }
        noDataComponent="Nenhum novo cliente encontrado"
        size="xl"
      />

      {/* Modal Produtores sem Gerente */}
      <DataTableModal
        isOpen={showModalProducersWithoutManager}
        onToggle={onToggleProducersWithoutManager}
        title="Produtores sem Gerente"
        description="Lista de produtores que não possuem gerente vinculado. Você pode vincular um gerente usando o select abaixo:"
        columns={useMemo(
          () => [
            {
              name: 'Nome',
              selector: (row: any) => row.name,
              cell: (row: any) => (
                <Link
                  to={`/producer/${row.uuid || row.id}`}
                  className="font-weight-bold"
                  style={{ textDecoration: 'none' }}
                >
                  {row.name}
                </Link>
              ),
              grow: 1.2,
            },
            {
              name: 'Email',
              selector: (row: any) => row.email,
              grow: 1,
            },
            {
              name: 'Telefone',
              cell: (row: any) => (
                <span>{row.phone ? maskPhone(row.phone) : '-'}</span>
              ),
              grow: 0.6,
            },
            {
              name: 'Faturamento Total',
              right: true,
              cell: (row: any) => (
                <span className="text-nowrap">
                  {FormatBRL(row.total_revenue || 0)}
                </span>
              ),
              grow: 0.8,
            },
            {
              name: 'Produtos',
              right: true,
              cell: (row: any) => <span>{row.total_products || 0}</span>,
              grow: 0.4,
            },
            {
              name: (
                <div
                  style={{
                    textAlign: 'right',
                    paddingRight: '20px',
                    width: '100%',
                  }}
                >
                  Vendas
                </div>
              ),
              right: true,
              cell: (row: any) => (
                <div style={{ textAlign: 'right', paddingRight: '20px' }}>
                  {row.total_sales || 0}
                </div>
              ),
              grow: 0.6,
            },
            {
              name: 'Vincular Gerente',
              cell: (row: any) => {
                const currentManager = managerAssignments[row.id] ?? null;
                const isAssigning = assigningIds[row.id] || false;

                return (
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ paddingLeft: '20px' }}
                  >
                    <Input
                      type="select"
                      value={currentManager || ''}
                      onChange={(e) =>
                        handleManagerChange(row.id, e.target.value)
                      }
                      disabled={isAssigning}
                      style={{ minWidth: 200 }}
                    >
                      <option value="">Selecione um gerente</option>
                      {Array.isArray(managersForModal) &&
                        managersForModal.map((manager: any) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.full_name || manager.email}
                          </option>
                        ))}
                    </Input>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => handleAssignManager(row.id)}
                      disabled={isAssigning || currentManager === null}
                    >
                      {isAssigning ? 'Vinculando...' : 'Vincular'}
                    </Button>
                  </div>
                );
              },
              grow: 1.8,
            },
          ],
          [
            managerAssignments,
            assigningIds,
            managersForModal,
            handleManagerChange,
            handleAssignManager,
          ],
        )}
        data={producersWithoutManager}
        loading={producersWithoutManagerLoading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={producersWithoutManagerTotal}
        paginationDefaultPage={producersWithoutManagerPage + 1}
        paginationPerPage={producersWithoutManagerPerPage}
        onChangePage={(page) => onProducersWithoutManagerPageChange(page - 1)}
        onChangeRowsPerPage={(size, page) =>
          onProducersWithoutManagerRowsPerPageChange(size, page - 1)
        }
        noDataComponent="Nenhum produtor sem gerente encontrado"
        size="xl"
      />

      {/* Modal Clientes com Gerente */}
      <DataTableModal
        isOpen={showModalClientsWithManager}
        onToggle={onToggleClientsWithManager}
        title="Clientes na Base"
        description="Lista de clientes com gerente vinculado:"
        columns={columnsClientsWithManager}
        data={clientsWithManager}
        loading={clientsWithManagerLoading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={clientsWithManagerTotal}
        paginationDefaultPage={clientsWithManagerPage + 1}
        paginationPerPage={clientsWithManagerPerPage}
        onChangePage={(page) => onClientsWithManagerPageChange(page - 1)}
        onChangeRowsPerPage={(size, page) =>
          onClientsWithManagerRowsPerPageChange(size, page - 1)
        }
        noDataComponent="Nenhum cliente com gerente encontrado"
        size="xl"
      />

      {/* Modal Retenção */}
      <DataTableModal
        isOpen={showModalRetention}
        onToggle={onToggleRetention}
        title="Clientes em Retenção"
        description="Lista de clientes que eram churn e voltaram a vender:"
        columns={columnsRetention}
        data={retentionClients}
        loading={retentionLoading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={retentionTotal}
        paginationDefaultPage={retentionPage + 1}
        paginationPerPage={retentionPerPage}
        onChangePage={(page) => onRetentionPageChange(page - 1)}
        onChangeRowsPerPage={(size, page) =>
          onRetentionRowsPerPageChange(size, page - 1)
        }
        noDataComponent="Nenhum cliente em retenção encontrado"
        size="xl"
      />
    </>
  );
};

export default DashboardModals;
