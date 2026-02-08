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

export interface Manager {
  id: number;
  email: string;
}