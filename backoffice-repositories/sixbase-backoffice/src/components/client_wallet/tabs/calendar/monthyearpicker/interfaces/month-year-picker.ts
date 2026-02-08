import moment from "moment";

export interface MonthYearPickerProps {
  isOpen: boolean;
  currentDate: moment.Moment;
  onToggle: () => void;
  onSelectMonth: (monthIndex: number) => void;
  onSelectYear: (year: number) => void;
}