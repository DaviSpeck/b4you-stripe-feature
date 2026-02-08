import { Producer } from '../../../../../../views/client_wallet/tabs/dashboard/interfaces/dashboard.interface';

export interface DashboardModalsProps {
  // Churn Modal
  showModalChurn: boolean;
  onToggleChurn: () => void;
  clientsChurn: any[];
  churnLoading: boolean;
  churnTotal: number;
  churnPage: number;
  churnPerPage: number;
  onChurnPageChange: (page: number) => void;
  onChurnRowsPerPageChange: (perPage: number, page: number) => void;

  // Revenue Modal
  showModalRevenue: boolean;
  onToggleRevenue: () => void;
  revenueProducers: Producer[];
  revenueLoading: boolean;

  // Goals Modal
  showModalGoals: boolean;
  onToggleGoals: () => void;
  goalsProducers: Producer[];
  goalsLoading: boolean;

  // Birthdays Modal
  showModalBirthdays: boolean;
  onToggleBirthdays: () => void;
  birthdayProducers: Producer[];
  birthdaysLoading: boolean;

  // Active Clients Modal
  showModalActiveClients: boolean;
  onToggleActiveClients: () => void;
  activeClients: any[];
  activeClientsLoading: boolean;
  activeClientsTotal: number;
  activeClientsPage: number;
  activeClientsPerPage: number;
  onActiveClientsPageChange: (page: number) => void;
  onActiveClientsRowsPerPageChange: (size: number, page: number) => void;

  // New Clients Modal
  showModalNewClients: boolean;
  onToggleNewClients: () => void;
  newClients: any[];
  newClientsLoading: boolean;
  newClientsTotal: number;
  newClientsPage: number;
  newClientsPerPage: number;
  onNewClientsPageChange: (page: number) => void;
  onNewClientsRowsPerPageChange: (size: number, page: number) => void;

  // Producers Without Manager Modal
  showModalProducersWithoutManager: boolean;
  onToggleProducersWithoutManager: () => void;
  producersWithoutManager: any[];
  producersWithoutManagerLoading: boolean;
  producersWithoutManagerTotal: number;
  producersWithoutManagerPage: number;
  producersWithoutManagerPerPage: number;
  onProducersWithoutManagerPageChange: (page: number) => void;
  onProducersWithoutManagerRowsPerPageChange: (
    size: number,
    page: number,
  ) => void;
  managersForModal: any[];
  assignManager: (
    userId: number,
    managerId: string | number | null,
  ) => Promise<{ success: boolean; message?: string }>;

  // Clients With Manager Modal
  showModalClientsWithManager: boolean;
  onToggleClientsWithManager: () => void;
  clientsWithManager: any[];
  clientsWithManagerLoading: boolean;
  clientsWithManagerTotal: number;
  clientsWithManagerPage: number;
  clientsWithManagerPerPage: number;
  onClientsWithManagerPageChange: (page: number) => void;
  onClientsWithManagerRowsPerPageChange: (size: number, page: number) => void;

  // Retention Modal
  showModalRetention: boolean;
  onToggleRetention: () => void;
  retentionClients: any[];
  retentionLoading: boolean;
  retentionTotal: number;
  retentionPage: number;
  retentionPerPage: number;
  onRetentionPageChange: (page: number) => void;
  onRetentionRowsPerPageChange: (size: number, page: number) => void;
}
