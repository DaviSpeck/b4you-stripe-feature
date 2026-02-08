import {
  ContactStatusKey,
  ProducerPerformanceItem,
  Stage,
} from '../../../../../../views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';

export interface MonitoringTableProps {
  items: ProducerPerformanceItem[];
  loading: boolean;
  totalRows: number;
  page: number;
  perPage: number;
  searchText: string;
  onSearchChange: (text: string) => void;
  sortField: 'variation_percentage' | 'current_revenue';
  sortDirection: 'asc' | 'desc';
  onSortFieldChange: (
    field: 'variation_percentage' | 'current_revenue',
  ) => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number, page: number) => void;
  contactStatusChanges: Record<number, ContactStatusKey>;
  onContactStatusChange: (userId: number, status: ContactStatusKey) => void;
  selectedStage: Stage | '';
  onStageChange: (stage: Stage | '') => void;
  canEditContactStatus: boolean;
}
