import moment from 'moment';
import { api } from './api';

export interface DailyTPV {
    date: string;
    total: number;
}

export interface TpvMetrics {
    total: number;
    avg: number;
    ma7: number;
    prevAvg: number;
    series: Array<DailyTPV & { ma7: number }>;
    markers: Array<{
        date: string;
        value: number;
        label: string;
        color: string;
        labelPosition: 'top' | 'bottom';
        labelOffset: number;
    }>;
    projection: number;
}

export const fetchTpvMetrics = async (
    startDate: Date,
    endDate: Date,
): Promise<TpvMetrics> => {
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    const { data } = await api.get('/metrics/average-amount/range', {
        params: { start_date: start.format('YYYY-MM-DD'), end_date: end.format('YYYY-MM-DD') },
    });

    const results: DailyTPV[] = Array.isArray(data?.data)
        ? data.data
        : data?.amount
            ? [{ date: start.format('YYYY-MM-DD'), total: Number(data.amount) }]
            : [];

    const totals = results.map(r => Number(r.total) || 0);
    const total = totals.reduce((acc, v) => acc + v, 0);
    const avg = totals.length > 0 ? total / totals.length : 0;

    const withMA = results.map((pt, idx, arr) => {
        const slice = arr.slice(Math.max(0, idx - 6), idx + 1);
        const ma7 = slice.length > 0
            ? slice.reduce((acc, x) => acc + (Number(x.total) || 0), 0) / slice.length
            : 0;
        return { ...pt, ma7 };
    });
    const ma7 = withMA.length > 0 ? withMA[withMA.length - 1].ma7 : avg;

    const rangeDays = end.diff(start, 'days') + 1;
    const prevEnd = start.clone().subtract(1, 'day');
    const prevStart = prevEnd.clone().subtract(rangeDays - 1, 'days');

    const prevRes = await api.get('/metrics/average-amount/range', {
        params: {
            start_date: prevStart.format('YYYY-MM-DD'),
            end_date: prevEnd.format('YYYY-MM-DD'),
        },
    });

    const prevTotals = Array.isArray(prevRes.data?.data)
        ? prevRes.data.data.map((r: any) => Number(r.total) || 0)
        : [];
    const prevAvg = prevTotals.length > 0
        ? prevTotals.reduce((acc, v) => acc + v, 0) / prevTotals.length
        : 0;

    const sortedAsc = [...results].sort((a, b) => a.total - b.total);
    const sortedDesc = [...results].sort((a, b) => b.total - a.total);
    const markerCount = Math.min(3, results.length);
    const peaks = sortedDesc.slice(0, markerCount);
    const valleys = sortedAsc.slice(0, markerCount);
    const markers = [
        ...peaks.map((p, i) => ({
            date: p.date,
            value: p.total,
            label: `Pico ${i + 1}`,
            color: '#28C76F',
            labelPosition: 'top' as const,
            labelOffset: 8,
        })),
        ...valleys.map((v, i) => ({
            date: v.date,
            value: v.total,
            label: `Vale ${i + 1}`,
            color: '#EA5455',
            labelPosition: 'bottom' as const,
            labelOffset: 8,
        })),
    ];

    const sameMonth = start.month() === end.month() && start.year() === end.year();
    const daysWithData = results.length;
    const baseDays = sameMonth ? start.daysInMonth() : 30;
    const dailyAvg = daysWithData > 0 ? total / daysWithData : 0;
    const projection = dailyAvg * baseDays;

    return {
        total,
        avg,
        ma7,
        prevAvg,
        series: withMA,
        markers,
        projection,
    };
};
