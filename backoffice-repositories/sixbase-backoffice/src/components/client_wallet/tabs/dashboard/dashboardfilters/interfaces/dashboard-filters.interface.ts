import { Manager } from '../../../../../../views/client_wallet/tabs/dashboard/interfaces/dashboard.interface';

export interface DashboardFiltersProps {
  isMaster: boolean;
  managers: Manager[];
  selectedManager: string | number;
  onManagerChange: (manager: string | number) => void;
  dateRange: Date[];
  onDateChange: (dates: Date[]) => void;
}
