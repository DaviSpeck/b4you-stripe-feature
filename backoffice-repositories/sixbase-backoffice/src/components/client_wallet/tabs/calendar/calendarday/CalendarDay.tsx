import { FC } from 'react';
import { CalendarDayProps } from './interfaces/calendarday.interface';

const CalendarDay: FC<CalendarDayProps> = ({
  day,
  eventsByDate,
  isCurrentMonth,
  isToday,
  onEventClick,
}) => {
  const dateKey = day.format('YYYY-MM-DD');
  const data = eventsByDate[dateKey] || { birthdays: [], goals: [] };
  const muted = !isCurrentMonth(day);
  const today = isToday(day);

  const eventGroups = [
    { type: 'birthday' as const, events: data.birthdays },
    { type: 'goal' as const, events: data.goals },
  ].filter((group) => group.events.length > 0);

  return (
    <div
      className={`border rounded ${
        today ? 'border-primary shadow-sm' : 'border-light'
      }`}
      style={{ width: '14.2857%', minHeight: 95, padding: 8 }}
    >
      <div
        className={`d-flex justify-content-end ${muted ? 'text-muted' : ''}`}
      >
        <small className={today ? 'text-primary font-weight-bold' : ''}>
          {day.date()}
        </small>
      </div>

      {eventGroups.map((group) => {
        const tagKey = `${dateKey}-${group.type}`;
        const isBirthday = group.type === 'birthday';
        const color = isBirthday ? 'warning' : 'success';

        const events = group.events.slice(0, 2);
        const extra = group.events.length - events.length;

        let label = isBirthday
          ? events.map((e) => e.name.split(' ')[0]).join(', ')
          : events
              .map((e) => e.milestone_achieved || e.name.split(' ')[0])
              .join(', ');

        if (extra > 0) label += ` +${extra}`;

        return (
          <div
            key={tagKey}
            className={`badge badge-light-${color} d-block text-truncate mb-25 px-1`}
            style={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            title={group.events.map((e) => e.name).join(', ')}
            onClick={() => onEventClick(group.events, group.type, dateKey)}
          >
            <small>
              {isBirthday ? '🎂 ' : '🏆 '}
              {label}
            </small>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarDay;
