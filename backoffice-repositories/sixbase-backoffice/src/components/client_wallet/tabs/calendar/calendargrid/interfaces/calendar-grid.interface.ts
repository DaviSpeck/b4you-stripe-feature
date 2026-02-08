import moment from "moment";
import { CalendarEvent } from "../../eventsmodal/interfaces/events-modal";

export type EventsByDate = Record<
  string,
  { birthdays: CalendarEvent[]; goals: CalendarEvent[] }
>;

export interface CalendarGridProps {
  currentDate: moment.Moment;
  eventsByDate: EventsByDate;
  loading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTogglePicker: () => void;
  onEventClick: (
    events: any[],
    type: 'birthday' | 'goal',
    date: string,
  ) => void;
}