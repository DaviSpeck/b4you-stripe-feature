import { FC, useMemo, useCallback } from 'react';
import {
  Line,
  CartesianGrid,
  Legend,
  LineChart,
  Tooltip,
  YAxis,
  XAxis,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment';

interface PerformanceChartData {
  period: string;
  totalSales: number;
  totalRevenue: number;
  totalClicks: number;
  averageTicket: number;
}

interface SeriesVisible {
  faturamento: boolean;
  vendas: boolean;
  cliques: boolean;
  ticketMedio: boolean;
}

interface PerformanceChartProps {
  data: PerformanceChartData[];
  loading?: boolean;
  seriesVisible?: SeriesVisible;
}

const PerformanceChart: FC<PerformanceChartProps> = ({
  data,
  loading = false,
  seriesVisible,
}) => {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: item.period || '',
      faturamento: item.totalRevenue,
      vendas: item.totalSales,
      cliques: item.totalClicks,
      ticketMedio: item.averageTicket,
    }));
  }, [data]);

  const formatCompact = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }),
    [],
  );

  const xAxisInterval = useMemo(() => {
    if (!data || data.length === 0) return 0;

    const startDate = moment(data[0].period);
    const endDate = moment(data[data.length - 1].period);
    const daysDiff = endDate.diff(startDate, 'days');

    if (daysDiff >= 59) {
      return Math.max(1, Math.floor(data.length / 6));
    } else if (daysDiff >= 30) {
      return Math.max(1, Math.floor(data.length / 10));
    } else if (daysDiff >= 7) {
      return Math.max(1, Math.floor(data.length / 7));
    }

    return 0;
  }, [data]);

  const formatXAxisTick = useCallback(
    (date: string) => {
      if (!data || data.length === 0) return moment(date).format('DD/MM');

      const startDate = moment(data[0].period);
      const endDate = moment(data[data.length - 1].period);
      const daysDiff = endDate.diff(startDate, 'days');

      if (daysDiff >= 59) {
        const monthNames = [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ];
        const momentDate = moment(date);
        const month = monthNames[momentDate.month()];
        const year = momentDate.format('YY');
        return `${month}/${year}`;
      } else if (daysDiff >= 7) {
        return moment(date).format('DD/MM');
      }

      return moment(date).format('DD/MM');
    },
    [data],
  );

  const visible: SeriesVisible = seriesVisible || {
    faturamento: true,
    vendas: true,
    cliques: true,
    ticketMedio: true,
  };

  return (
    <div style={{ width: '100%', height: 400, position: 'relative' }}>
      {loading ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
          }}
        >
          <div className="spinner-border text-[#d0d2d7]" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%" debounce={200}>
          <LineChart
            data={chartData}
            className="line-chart"
            margin={{ top: 40, right: 50, bottom: 20, left: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisTick}
              interval={xAxisInterval}
            />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tickFormatter={(v: number) =>
                formatCompact.format(Number(v || 0))
              }
              domain={[0, 'dataMax']}
              label={{
                value: 'Renda Gerada / Ticket Médio (R$)',
                angle: -90,
                offset: -15,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6c757d' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              allowDecimals={false}
              tickFormatter={(v: number) =>
                formatCompact.format(Number(v || 0))
              }
              domain={[0, 'dataMax']}
              label={{
                value: 'Vendas / Cliques',
                angle: 90,
                offset: -15,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#6c757d' },
              }}
            />
            <Tooltip
              labelFormatter={(l: string) => moment(l).format('DD/MM/YYYY')}
              formatter={(value: number, name: string) => {
                const num = Number(value || 0);
                let formattedValue;

                if (name === 'Renda Gerada' || name === 'Ticket Médio') {
                  formattedValue = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 2,
                  }).format(num);
                } else {
                  formattedValue = new Intl.NumberFormat('pt-BR', {
                    maximumFractionDigits: 0,
                  }).format(num);
                }

                return [formattedValue, name];
              }}
            />
            <Legend />
            {visible.faturamento && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="faturamento"
                name="Renda Gerada"
                stroke="#10b981"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
            {visible.vendas && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="vendas"
                name="Vendas"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
            {visible.cliques && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cliques"
                name="Cliques"
                stroke="#BA68C8"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
            {visible.ticketMedio && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ticketMedio"
                name="Ticket Médio"
                stroke="#FFC107"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '0.9rem',
          }}
        >
          Sem dados disponíveis
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;
