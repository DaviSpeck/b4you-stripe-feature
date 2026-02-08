import { Stage } from 'views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';

export interface HealthKanbanSectionProps {
  kanbanSummary: Record<Stage, number>;
  loading: boolean;
}
