export interface Manager {
  id: number;
  email: string;
}

export interface CalendarFiltersProps {
  isMaster: boolean;
  managers: Manager[];
  selectedManager: string | number;
  onManagerChange: (manager: string | number) => void;
  milestones: string[];
  selectedMilestones: string[];
  onToggleMilestone: (milestone: string) => void;
  birthdayRevenueFilters: string[];
  selectedBirthdayRevenueFilters: string[];
  onToggleBirthdayRevenueFilter: (filter: string) => void;
}