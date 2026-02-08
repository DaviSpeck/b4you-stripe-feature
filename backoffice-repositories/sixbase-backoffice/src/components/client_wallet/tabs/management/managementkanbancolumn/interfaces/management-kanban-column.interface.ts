import { ManagementItem, ManagerPhase } from "views/client_wallet/tabs/management/interfaces/management.interface";

export interface ManagementKanbanColumnProps {
  id: string;
  phase: ManagerPhase;
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  description?: string;
  items: ManagementItem[];
  isLoading: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onUpdatePhase: (userId: number, phase: ManagerPhase | null) => void;
  skin: string;
  canEdit: boolean;
}