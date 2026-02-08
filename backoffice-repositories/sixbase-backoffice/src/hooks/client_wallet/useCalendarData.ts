import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { api } from '../../services/api';
import { Manager, EventsByDate } from '../../views/client_wallet/tabs/calendar/interfaces/calendar.interface';

interface UseCalendarDataProps {
  currentDate: moment.Moment;
  selectedManager: string | number;
  selectedMilestones: string[];
  selectedBirthdayRevenueFilters: string[];
  isCommercial: boolean;
}

export const MILESTONE_MAP: Record<string, string> = {
  'R$ 10.000': '10K',
  'R$ 50.000': '50K',
  'R$ 500.000': '500K',
  'R$ 1.000.000': '1M',
  'R$ 5.000.000': '5M',
  'R$ 10.000.000': '10M',
};

export const useCalendarData = ({
  currentDate,
  selectedManager,
  selectedMilestones,
  selectedBirthdayRevenueFilters,
  isCommercial,
}: UseCalendarDataProps) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [monthlyBirthdayCount, setMonthlyBirthdayCount] = useState(0);
  const [monthlyGoalsAchievedCount, setMonthlyGoalsAchievedCount] = useState(0);
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isCommercial) return;

    const fetchManagers = async () => {
      try {
        const response = await api.get('/client-wallet/managers', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });

        const list = Array.isArray(response.data?.managers)
          ? response.data.managers
          : [];

        setManagers(list);
      } catch (error) {
        console.error('Erro ao buscar gerentes:', error);
        setManagers([]);
      }
    };

    fetchManagers();
  }, [isCommercial]);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const milestonesParam = selectedMilestones
        .map((m) => MILESTONE_MAP[m])
        .filter(Boolean);
      
      const birthdayRevenueFiltersParam = selectedBirthdayRevenueFilters.length > 0
        ? selectedBirthdayRevenueFilters
        : undefined;

      const params: Record<string, any> = {
        start_date: currentDate.clone().startOf('month').format('YYYY-MM-DD'),
        end_date: currentDate.clone().endOf('month').format('YYYY-MM-DD'),
        ...(milestonesParam.length ? { milestones: milestonesParam } : {}),
        ...(birthdayRevenueFiltersParam ? { birthday_revenue_filters: birthdayRevenueFiltersParam } : {}),
      };
      if (selectedManager) params.manager_id = selectedManager;

      const { data } = await api.get('/client-wallet/calendar', { params });
      setMonthlyBirthdayCount(data.monthly_birthday_count || 0);
      setMonthlyGoalsAchievedCount(data.monthly_goals_achieved_count || 0);
      setEventsByDate(data.events_by_date || {});
    } catch (error) {
      console.error('Erro ao buscar dados do calendário:', error);
      setMonthlyBirthdayCount(0);
      setMonthlyGoalsAchievedCount(0);
      setEventsByDate({});
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [currentDate, selectedMilestones, selectedBirthdayRevenueFilters, selectedManager]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  return {
    managers,
    monthlyBirthdayCount,
    monthlyGoalsAchievedCount,
    eventsByDate,
    loading,
  };
};
