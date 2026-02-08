import { FC, useMemo } from 'react';
import moment from 'moment';
import { Card, CardBody, Spinner } from 'reactstrap';
import CalendarHeader from '../calendarheader/CalendarHeader';
import CalendarDay from '../calendarday/CalendarDay';
import { CalendarGridProps } from './interfaces/calendar-grid.interface';

const CalendarGrid: FC<CalendarGridProps> = ({
  currentDate,
  eventsByDate,
  loading,
  onPrevMonth,
  onNextMonth,
  onTogglePicker,
  onEventClick,
}) => {
  const startOfMonth = useMemo(
    () => currentDate.clone().startOf('month'),
    [currentDate],
  );
  const endOfMonth = useMemo(
    () => currentDate.clone().endOf('month'),
    [currentDate],
  );
  const startOfGrid = useMemo(
    () => startOfMonth.clone().startOf('week'),
    [startOfMonth],
  );
  const endOfGrid = useMemo(
    () => endOfMonth.clone().endOf('week'),
    [endOfMonth],
  );

  const daysGrid = useMemo(() => {
    const days: moment.Moment[] = [];
    const day = startOfGrid.clone();
    while (day.isSameOrBefore(endOfGrid, 'day')) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    return days;
  }, [startOfGrid, endOfGrid]);

  const isToday = (d: moment.Moment) => d.isSame(moment(), 'day');
  const isCurrentMonth = (d: moment.Moment) => d.isSame(currentDate, 'month');

  return (
    <Card className="mt-2">
      <CardBody style={{ minHeight: 400, position: 'relative' }}>
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: 380 }}
          >
            <Spinner color="primary" />
          </div>
        ) : (
          <>
            <CalendarHeader
              currentDate={currentDate}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
              onTogglePicker={onTogglePicker}
            />

            <div className="d-flex flex-wrap">
              {daysGrid.map((day) => (
                <CalendarDay
                  key={day.format('YYYY-MM-DD')}
                  day={day}
                  eventsByDate={eventsByDate}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                  onEventClick={onEventClick}
                />
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default CalendarGrid;
