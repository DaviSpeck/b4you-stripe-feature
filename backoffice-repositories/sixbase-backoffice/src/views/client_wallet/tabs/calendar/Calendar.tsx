import { FC, useMemo, useState, useCallback } from 'react';
import moment from 'moment';
import 'moment/dist/locale/pt-br';
import { getUserData } from '../../../../utility/Utils';
import CalendarFilters from '../../../../components/client_wallet/tabs/calendar/calendarfilters/CalendarFilters';
import CalendarKPIs from '../../../../components/client_wallet/tabs/calendar/calendarkpis/CalendarKPIs';
import CalendarGrid from '../../../../components/client_wallet/tabs/calendar/calendargrid/CalendarGrid';
import MonthYearPicker from '../../../../components/client_wallet/tabs/calendar/monthyearpicker/MonthYearPicker';
import EventsModal from '../../../../components/client_wallet/tabs/calendar/eventsmodal/EventsModal';
import { useCalendarData } from '../../../../hooks/client_wallet/useCalendarData';
import './calendar.scss';
import { CalendarEvent } from './interfaces/calendar.interface';

moment.locale('pt-br');

export const MILESTONES = [
  'R$ 10.000',
  'R$ 50.000',
  'R$ 500.000',
  'R$ 1.000.000',
  'R$ 5.000.000',
  'R$ 10.000.000',
];

export const BIRTHDAY_REVENUE_FILTERS = [
  'BELOW_10K',
  '10K',
  '50K',
  '500K',
  '1M',
  '5M',
  '10M',
];

const Calendar: FC = () => {
  const userData = getUserData();
  const role = useMemo(() => String(userData?.role || '').toUpperCase(), [userData]);
  const isMaster = role === 'MASTER';
  const isCommercial = role === 'COMERCIAL';

  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedManager, setSelectedManager] = useState<string | number>(() => {
    if (isCommercial) return userData?.id ?? '';
    return '';
  });
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [selectedBirthdayRevenueFilters, setSelectedBirthdayRevenueFilters] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<
    'birthday' | 'goal' | null
  >(null);
  const [selectedDate, setSelectedDate] = useState('');

  const {
    managers,
    monthlyBirthdayCount,
    monthlyGoalsAchievedCount,
    eventsByDate,
    loading,
  } = useCalendarData({
    currentDate,
    selectedManager,
    selectedMilestones,
    selectedBirthdayRevenueFilters,
    isCommercial,
  });

  const toggleMilestone = useCallback((milestone: string) => {
    setSelectedMilestones((prev) =>
      prev.includes(milestone)
        ? prev.filter((m) => m !== milestone)
        : [...prev, milestone],
    );
  }, []);

  const toggleBirthdayRevenueFilter = useCallback((filter: string) => {
    setSelectedBirthdayRevenueFilters((prev) => {
      // Se for BELOW_10K, não pode selecionar outros filtros ao mesmo tempo
      if (filter === 'BELOW_10K') {
        return prev.includes(filter) ? [] : [filter];
      }
      // Se selecionar outro filtro, remove BELOW_10K
      const filtered = prev.filter((f) => f !== 'BELOW_10K');
      return filtered.includes(filter)
        ? filtered.filter((f) => f !== filter)
        : [...filtered, filter];
    });
  }, []);

  const onPrevMonth = useCallback(
    () => setCurrentDate((prev) => prev.clone().subtract(1, 'month')),
    [],
  );
  const onNextMonth = useCallback(
    () => setCurrentDate((prev) => prev.clone().add(1, 'month')),
    [],
  );
  const togglePicker = useCallback(() => setPickerOpen((v) => !v), []);
  const handleSelectMonth = useCallback((idx: number) => {
    setCurrentDate((prev) => prev.clone().month(idx));
    setPickerOpen(false);
  }, []);
  const handleSelectYear = useCallback((year: number) => {
    setCurrentDate((prev) => prev.clone().year(year));
  }, []);

  const handleEventClick = useCallback(
    (events: CalendarEvent[], type: 'birthday' | 'goal', date: string) => {
      setSelectedEventType(type);
      setSelectedDate(date);
      setSelectedEvents(events);
      setEventModalOpen(true);
    },
    [],
  );

  return (
    <>
      <CalendarFilters
        isMaster={isMaster}
        managers={managers}
        selectedManager={selectedManager}
        onManagerChange={isMaster ? setSelectedManager : undefined}
        milestones={MILESTONES}
        selectedMilestones={selectedMilestones}
        onToggleMilestone={toggleMilestone}
        birthdayRevenueFilters={BIRTHDAY_REVENUE_FILTERS}
        selectedBirthdayRevenueFilters={selectedBirthdayRevenueFilters}
        onToggleBirthdayRevenueFilter={toggleBirthdayRevenueFilter}
      />

      <CalendarKPIs
        monthlyBirthdayCount={monthlyBirthdayCount}
        monthlyGoalsAchievedCount={monthlyGoalsAchievedCount}
      />

      <CalendarGrid
        currentDate={currentDate}
        eventsByDate={eventsByDate}
        loading={loading}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onTogglePicker={togglePicker}
        onEventClick={handleEventClick}
      />

      <MonthYearPicker
        isOpen={pickerOpen}
        currentDate={currentDate}
        onToggle={togglePicker}
        onSelectMonth={handleSelectMonth}
        onSelectYear={handleSelectYear}
      />

      <EventsModal
        isOpen={eventModalOpen}
        onToggle={() => setEventModalOpen(false)}
        selectedEvents={selectedEvents}
        selectedEventType={selectedEventType}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default Calendar;
