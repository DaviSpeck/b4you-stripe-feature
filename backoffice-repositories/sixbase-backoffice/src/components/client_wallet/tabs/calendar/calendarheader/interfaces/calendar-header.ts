import moment from "moment";

export interface CalendarHeaderProps {
  currentDate: moment.Moment;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTogglePicker: () => void;
}