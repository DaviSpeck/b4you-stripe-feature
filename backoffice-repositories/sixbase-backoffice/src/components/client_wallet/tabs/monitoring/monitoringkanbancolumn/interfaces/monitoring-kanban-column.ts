import { ProducerPerformanceItem, Stage } from "views/client_wallet/tabs/monitoring/interfaces/monitoring.interface";

export interface MonitoringKanbanColumnProps {
  title: string;
  stage: Stage;
  icon: React.ReactNode;
  count: number;
  loadingCount: boolean;
  allItems: ProducerPerformanceItem[];
  loadingItems: boolean;
  currentPage: number;
  perPage: number;
  onPageChange: (stage: Stage, page: number) => void;
  onFetchPage: (stage: Stage, page: number) => void;
}