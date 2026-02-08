import moment from 'moment';
import {
  ProducerPerformanceItem,
  Stage,
} from '../../../../../views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';

export const getFirstAndLastName = (fullName: string): string => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

export const calculateStage = (
  producer: ProducerPerformanceItem,
  now: Date,
): Stage => {
  const variation = producer.variation_percentage;
  if (variation <= -30) return 'DROP';
  if (variation >= -10) return 'HEALTHY';
  return 'ATTENTION';
};

export const buildInitialRange = () => {
  const today = moment();
  const startOfMonth = today.clone().startOf('month');
  return [startOfMonth.toDate(), today.toDate()];
};

export const buildDateRangePayload = (debouncedRange: Date[]) => {
  if (!debouncedRange || debouncedRange.length < 2) return null;
  const [startDate, endDate] = debouncedRange;
  if (!startDate || !endDate) return null;

  const originalStart = moment(startDate).startOf('day');
  const originalEnd = moment(endDate).endOf('day');
  const requestedDiff = Math.max(
    1,
    originalEnd
      .clone()
      .startOf('day')
      .diff(originalStart.clone().startOf('day'), 'days') + 1,
  );

  let start = originalStart.clone();
  let end = originalEnd.clone();
  const today = moment().startOf('day');

  if (end.isSameOrAfter(today)) {
    end = today.clone().subtract(1, 'day').endOf('day');
  }

  if (start.isAfter(end)) {
    start = end
      .clone()
      .subtract(requestedDiff - 1, 'days')
      .startOf('day');
  }

  const diffDays = Math.max(
    1,
    end.clone().startOf('day').diff(start.clone().startOf('day'), 'days') + 1,
  );

  const startDay = start.date();
  const endDay = end.date();
  const startMonth = start.month();
  const startYear = start.year();

  const prevMonthMoment = moment([startYear, startMonth, 1]).subtract(
    1,
    'month',
  );

  const prevMonthLastDay = prevMonthMoment.clone().endOf('month').date();
  const actualStartDay = Math.min(startDay, prevMonthLastDay);
  let prevStart = prevMonthMoment.clone().date(actualStartDay).startOf('day');

  const actualEndDay = Math.min(endDay, prevMonthLastDay);
  let prevEnd = prevMonthMoment.clone().date(actualEndDay).endOf('day');

  if (prevStart.isAfter(prevEnd)) {
    prevStart = prevEnd.clone().startOf('day');
  }

  return {
    start,
    end,
    prevStart,
    prevEnd,
    diffDays,
  };
};
