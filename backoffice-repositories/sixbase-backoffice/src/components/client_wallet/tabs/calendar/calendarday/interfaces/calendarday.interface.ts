export type CalendarEvent = {
  producer_id: number;
  name: string;
  email: string;
  phone: string;
  revenue: number;
  revenue_total: number;
  milestone_achieved?: string;
  manager_email?: string;
};

export type EventsByDate = Record<
  string,
  { birthdays: CalendarEvent[]; goals: CalendarEvent[] }
>;

export interface CalendarDayProps {
  day: moment.Moment;
  eventsByDate: EventsByDate;
  isCurrentMonth: (d: moment.Moment) => boolean;
  isToday: (d: moment.Moment) => boolean;
  onEventClick: (
    events: CalendarEvent[],
    type: 'birthday' | 'goal',
    date: string,
  ) => void;
}