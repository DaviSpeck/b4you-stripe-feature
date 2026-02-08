export interface Manager {
  id: number;
  email: string;
}

export interface ManagementFiltersProps {
  managers: Manager[];
  selectedManager: string;
  onManagerChange: (manager: string) => void;
}