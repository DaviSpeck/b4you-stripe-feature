import '@styles/react/libs/flatpickr/flatpickr.scss';
import { FC, useMemo, useState } from 'react';
import { TrendingUp, UserMinus, UserPlus, Users, UserX } from 'react-feather';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { getUserData } from '../../../../utility/Utils';
import DashboardFilters from '../../../../components/client_wallet/tabs/dashboard/dashboardfilters/DashboardFilters';
import KPICard from '../../../../components/client_wallet/tabs/dashboard/kpicard/KPICard';
import HealthKanbanSection from '../../../../components/client_wallet/tabs/dashboard/healthkanbansection/HealthKanbanSection';
import ManagementKanbanSection from '../../../../components/client_wallet/tabs/dashboard/managementkanbansection/ManagementKanbanSection';
import ContactStatusSection from '../../../../components/client_wallet/tabs/dashboard/contactstatussection/ContactStatusSection';
import RevenueChart from '../../../../components/client_wallet/tabs/dashboard/revenuechart/RevenueChart';
import DashboardModals from '../../../../components/client_wallet/tabs/dashboard/dashboardmodals/DashboardModals';
import { useDashboardData } from '../../../../hooks/client_wallet/useDashboardData';
import { useDashboardModals } from '../../../../hooks/client_wallet/useDashboardModals';
import './dashboard.scss';

const Dashboard: FC = () => {
  const userData = getUserData();
  const role = String(userData?.role || '').toUpperCase();
  const isCommercial = role === 'COMERCIAL';
  const isMaster = role === 'MASTER' || role === 'ADMIN';
  const isViewer = !isCommercial && !isMaster;

  const [dateRange, setDateRange] = useState<Date[]>([
    new Date(Date.now() - 30 * 86400000),
    new Date(),
  ]);

  const [selectedManager, setSelectedManager] = useState(
    isCommercial ? userData?.id : isMaster ? null : null,
  );
  const normalizedManagerId = useMemo(() => {
    if (isCommercial) return selectedManager; // Comercial sempre filtra pelo próprio ID
    if (isMaster) return selectedManager || null; // Master só filtra se escolher explicitamente
    return null; // Viewer nunca filtra
  }, [selectedManager, isCommercial, isMaster]);

  const {
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
    producersWithoutManagerLoading: producersWithoutManagerCardLoading,
    clientsWithManagerCount,
    clientsWithManagerLoading: clientsWithManagerCardLoading,
    revenueInfo,
    churnTooltip,
  } = useDashboardData({
    dateRange,
    selectedManager: normalizedManagerId,
    isMaster,
    isCommercial,
  });

  const {
    showModalChurn,
    setShowModalChurn,
    clientsChurn,
    churnLoading,
    churnTotal,
    churnPage,
    churnPerPage,
    fetchChurnList,
    showModalRevenue,
    setShowModalRevenue,
    revenueProducers,
    revenueLoading,
    handleOpenRevenueModal,
    showModalGoals,
    setShowModalGoals,
    goalsProducers,
    goalsLoading,
    handleOpenGoalsModal,
    showModalBirthdays,
    setShowModalBirthdays,
    birthdayProducers,
    birthdaysLoading,
    handleOpenBirthdaysModal,
    showModalActiveClients,
    setShowModalActiveClients,
    activeClients,
    activeClientsLoading,
    activeClientsTotal,
    activeClientsPage,
    activeClientsPerPage,
    fetchActiveClientsList,
    handleOpenActiveClientsModal,
    showModalNewClients,
    setShowModalNewClients,
    newClients,
    newClientsLoading,
    newClientsTotal,
    newClientsPage,
    newClientsPerPage,
    fetchNewClientsList,
    handleOpenNewClientsModal,
    showModalProducersWithoutManager,
    setShowModalProducersWithoutManager,
    producersWithoutManager,
    producersWithoutManagerLoading,
    producersWithoutManagerTotal,
    producersWithoutManagerPage,
    producersWithoutManagerPerPage,
    fetchProducersWithoutManagerList,
    handleOpenProducersWithoutManagerModal,
    managers: managersForModal,
    assignManager,
    showModalClientsWithManager,
    setShowModalClientsWithManager,
    clientsWithManager,
    clientsWithManagerLoading,
    clientsWithManagerTotal,
    clientsWithManagerPage,
    clientsWithManagerPerPage,
    fetchClientsWithManagerList,
    handleOpenClientsWithManagerModal,
    showModalRetention,
    setShowModalRetention,
    retentionClients,
    retentionLoading,
    retentionTotal,
    retentionPage,
    retentionPerPage,
    fetchRetentionList,
    handleOpenRetentionModal,
  } = useDashboardModals({
    dateRange,
    selectedManager,
  });

  const handleDateChange = (dates: Date[]) => {
    if (dates.length === 2) setDateRange(dates);
  };

  const handleOpenChurnModal = () => {
    setShowModalChurn(true);
    fetchChurnList(0, 10);
  };

  // ---------- GRID DINÂMICO ----------
  const chunkCards = (cards: any[], size: number) => {
    const rows = [];
    for (let i = 0; i < cards.length; i += size) {
      rows.push(cards.slice(i, i + size));
    }
    return rows;
  };

  const getColForRow = (rowLength: number) => {
    if (rowLength === 1) return 12;
    if (rowLength === 2) return 6;
    if (rowLength === 3) return 4;
    return 3;
  };

  // ---------- LISTA DE CARDS (TOP) ----------
  const cardsTop = [
    {
      title: 'Faturamento (Total)',
      value: revenueInfo.value,
      icon: revenueInfo.icon,
      isMonetary: true,
      tooltip: revenueInfo.tooltip,
      loading: loading.revenue,
      valueColor: revenueInfo.color,
      onClick: handleOpenRevenueModal,
    },
    {
      title: 'Faturamento Novos Clientes',
      value: clientsCard.new_clients_revenue,
      icon: UserPlus,
      isMonetary: true,
      tooltip: 'Faturamento de novos clientes',
      loading: loading.clients,
      valueColor: '#3b82f6',
      onClick: handleOpenNewClientsModal,
    },
    {
      title: 'Faturamento Retenção',
      value: clientsCard.retention_revenue,
      icon: TrendingUp,
      isMonetary: true,
      tooltip: 'Faturamento de clientes em retenção',
      loading: loading.retention,
      valueColor: '#ec4899',
      onClick: handleOpenRetentionModal,
    },
    {
      title: 'Churn (R$)',
      value: data.churnRevenueLoss,
      icon: UserMinus,
      isMonetary: true,
      tooltip: churnTooltip,
      loading: loading.churn,
      valueColor: '#ef4444',
      onClick: handleOpenChurnModal,
    },
  ];

  // ---------- LISTA DE CARDS (BOTTOM) ----------
  const cardsBottom = [
    {
      title: 'Clientes Ativos',
      value: clientsCard.active_clients,
      icon: Users,
      tooltip: 'Clientes ativos',
      loading: loading.clients,
      valueColor: '#22c55e',
      onClick: handleOpenActiveClientsModal,
    },
    {
      title: 'Novos Clientes',
      value: clientsCard.new_clients,
      icon: UserPlus,
      tooltip: 'Quantidade de novos clientes',
      loading: loading.clients,
      valueColor: '#3b82f6',
      onClick: handleOpenNewClientsModal,
    },
    {
      title: 'Retenção',
      value: clientsCard.retention_clients,
      icon: Users,
      tooltip: 'Clientes recuperados',
      loading: loading.retention,
      valueColor: '#ec4899',
      onClick: handleOpenRetentionModal,
    },
    {
      title: 'Churn (Clientes)',
      value: data.churnCount,
      icon: UserMinus,
      tooltip: 'Clientes perdidos',
      loading: loading.churn,
      valueColor: '#ef4444',
      onClick: handleOpenChurnModal,
    },
    {
      title: 'Clientes na Base',
      value: clientsWithManagerCount,
      icon: Users,
      tooltip: 'Clientes com gerente',
      loading: clientsWithManagerCardLoading,
      valueColor: '#6366f1',
      onClick: handleOpenClientsWithManagerModal,
    },
  ];

  if (isMaster || isViewer) {
    cardsBottom.push({
      title: 'Produtores sem Gerente',
      value: producersWithoutManagerCount,
      icon: UserX,
      tooltip: 'Produtores sem gerente vinculado',
      loading: producersWithoutManagerCardLoading,
      valueColor: '#f59e0b',
      onClick: handleOpenProducersWithoutManagerModal,
    });
  }

  const disableIfViewer = (card: any) =>
    isViewer ? { ...card, onClick: undefined } : card;

  return (
    <div className="mt-2">
      <DashboardFilters
        isMaster={isMaster}
        managers={managers}
        selectedManager={selectedManager}
        onManagerChange={setSelectedManager}
        dateRange={dateRange}
        onDateChange={handleDateChange}
      />

      {/* TOP CARDS – sempre 4 colunas */}
      <Row>
        {cardsTop.map((c, index) => {
          const card = disableIfViewer(c);
          return (
            <Col key={index} xs={12} md={3}>
              <KPICard {...card} />
            </Col>
          );
        })}
      </Row>

      {/* BOTTOM CARDS – grid totalmente dinâmico */}
      {chunkCards(cardsBottom, 4).map((row, rowIndex) => (
        <Row key={rowIndex} className="mt-1">
          {row.map((c, index) => {
            const card = disableIfViewer(c);
            return (
              <Col key={index} xs={12} md={getColForRow(row.length)}>
                <KPICard {...card} />
              </Col>
            );
          })}
        </Row>
      ))}

      <ContactStatusSection
        contactStatusSummary={contactStatusSummary}
        loading={contactStatusLoading}
      />

      {/* KANBANS */}
      <HealthKanbanSection
        kanbanSummary={kanbanSummaryDashboard}
        loading={kanbanLoadingDashboard}
      />

      <ManagementKanbanSection
        managementSummary={managementKanbanSummary}
        loading={managementKanbanLoading}
      />

      <RevenueChart chartData={chartData} loading={loading.chart} />

      <DashboardModals
        showModalChurn={showModalChurn}
        onToggleChurn={() => setShowModalChurn(!showModalChurn)}
        clientsChurn={clientsChurn}
        churnLoading={churnLoading}
        churnTotal={churnTotal}
        churnPage={churnPage}
        churnPerPage={churnPerPage}
        onChurnPageChange={(page) => fetchChurnList(page, churnPerPage)}
        onChurnRowsPerPageChange={(perPage, page) =>
          fetchChurnList(page, perPage)
        }
        showModalRevenue={showModalRevenue}
        onToggleRevenue={() => setShowModalRevenue(false)}
        revenueProducers={revenueProducers}
        revenueLoading={revenueLoading}
        showModalGoals={showModalGoals}
        onToggleGoals={() => setShowModalGoals(false)}
        goalsProducers={goalsProducers}
        goalsLoading={goalsLoading}
        showModalBirthdays={showModalBirthdays}
        onToggleBirthdays={() => setShowModalBirthdays(false)}
        birthdayProducers={birthdayProducers}
        birthdaysLoading={birthdaysLoading}
        showModalActiveClients={showModalActiveClients}
        onToggleActiveClients={() => setShowModalActiveClients(false)}
        activeClients={activeClients}
        activeClientsLoading={activeClientsLoading}
        activeClientsTotal={activeClientsTotal}
        activeClientsPage={activeClientsPage}
        activeClientsPerPage={activeClientsPerPage}
        onActiveClientsPageChange={(page) =>
          fetchActiveClientsList(page, activeClientsPerPage)
        }
        onActiveClientsRowsPerPageChange={(size, page) =>
          fetchActiveClientsList(page, size)
        }
        showModalNewClients={showModalNewClients}
        onToggleNewClients={() => setShowModalNewClients(false)}
        newClients={newClients}
        newClientsLoading={newClientsLoading}
        newClientsTotal={newClientsTotal}
        newClientsPage={newClientsPage}
        newClientsPerPage={newClientsPerPage}
        onNewClientsPageChange={(page) =>
          fetchNewClientsList(page, newClientsPerPage)
        }
        onNewClientsRowsPerPageChange={(size, page) =>
          fetchNewClientsList(page, size)
        }
        showModalProducersWithoutManager={showModalProducersWithoutManager}
        onToggleProducersWithoutManager={() =>
          setShowModalProducersWithoutManager(!showModalProducersWithoutManager)
        }
        producersWithoutManager={producersWithoutManager}
        producersWithoutManagerLoading={producersWithoutManagerLoading}
        producersWithoutManagerTotal={producersWithoutManagerTotal}
        producersWithoutManagerPage={producersWithoutManagerPage}
        producersWithoutManagerPerPage={producersWithoutManagerPerPage}
        onProducersWithoutManagerPageChange={(page) =>
          fetchProducersWithoutManagerList(page, producersWithoutManagerPerPage)
        }
        onProducersWithoutManagerRowsPerPageChange={(size, page) =>
          fetchProducersWithoutManagerList(page, size)
        }
        managersForModal={managersForModal}
        assignManager={assignManager}
        showModalClientsWithManager={showModalClientsWithManager}
        onToggleClientsWithManager={() =>
          setShowModalClientsWithManager(!showModalClientsWithManager)
        }
        clientsWithManager={clientsWithManager}
        clientsWithManagerLoading={clientsWithManagerLoading}
        clientsWithManagerTotal={clientsWithManagerTotal}
        clientsWithManagerPage={clientsWithManagerPage}
        clientsWithManagerPerPage={clientsWithManagerPerPage}
        onClientsWithManagerPageChange={(page) =>
          fetchClientsWithManagerList(page, clientsWithManagerPerPage)
        }
        onClientsWithManagerRowsPerPageChange={(size, page) =>
          fetchClientsWithManagerList(page, size)
        }
        showModalRetention={showModalRetention}
        onToggleRetention={() => setShowModalRetention(!showModalRetention)}
        retentionClients={retentionClients}
        retentionLoading={retentionLoading}
        retentionTotal={retentionTotal}
        retentionPage={retentionPage}
        retentionPerPage={retentionPerPage}
        onRetentionPageChange={(page) =>
          fetchRetentionList(page, retentionPerPage)
        }
        onRetentionRowsPerPageChange={(size, page) =>
          fetchRetentionList(page, size)
        }
      />
    </div>
  );
};

export default Dashboard;
