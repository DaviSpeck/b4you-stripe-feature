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

export interface EventsModalProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedEvents: CalendarEvent[];
  selectedEventType: 'birthday' | 'goal' | null;
  selectedDate: string;
}