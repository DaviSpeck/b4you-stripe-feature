import { ManagerPhase } from '../../../../../../views/client_wallet/tabs/management/interfaces/management.interface';

export interface ManagementKanbanSectionProps {
  managementSummary: Record<ManagerPhase, number>;
  loading: boolean;
}
