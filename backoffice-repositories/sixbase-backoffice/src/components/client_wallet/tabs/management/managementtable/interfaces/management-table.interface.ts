import { ManagerPhase } from '../../../../../../views/client_wallet/tabs/management/interfaces/management.interface';

export interface ManagementTableProps {
  items: any[];
  loading: boolean;
  totalRows: number;
  page: number;
  perPage: number;
  searchText: string;
  onSearchChange: (value: string) => void;
  sortField: 'name' | 'current_revenue';
  sortDirection: 'asc' | 'desc';
  onSortFieldChange: (value: 'name' | 'current_revenue') => void;
  onSortDirectionChange: (value: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number, page: number) => void;
  phaseChanges: Record<number, ManagerPhase | null>;
  onPhaseChange: (userId: number, phase: ManagerPhase | null) => void;
  canEdit: boolean;
  canAddClient: boolean;
  selectedPhase: ManagerPhase | null | 'null';
  onPhaseChangeFilter: (phase: ManagerPhase | null | 'null') => void;
  onAddClientClick: () => void;
}
