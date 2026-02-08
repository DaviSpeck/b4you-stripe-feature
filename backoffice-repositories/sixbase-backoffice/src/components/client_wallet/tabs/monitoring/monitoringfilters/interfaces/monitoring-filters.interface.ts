import moment from 'moment';

export interface Manager {
  id: number;
  email: string;
}

export interface MonitoringFiltersProps {
  isMaster: boolean;
  dateRange: Date[];
  onRangeChange: (dates: Date[]) => void;
  onQuickRange: (days: number) => void;
  selectedRangeLabel: string;
  rangePayload: {
    prevStart: moment.Moment;
    prevEnd: moment.Moment;
  } | null;
  managers: Manager[];
  selectedManager: string;
  onManagerChange: (manager: string) => void;
}
