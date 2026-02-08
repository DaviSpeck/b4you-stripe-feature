import {
  Line,
  CartesianGrid,
  Legend,
  LineChart,
  Tooltip,
  YAxis,
  XAxis,
  ResponsiveContainer,
  ReferenceDot,
  Label,
} from 'recharts';
import moment from 'moment';
import React from 'react';

type SeriesKey =
  | 'total'
  | 'creator'
  | 'creator_registered'
  | 'marca'
  | 'ma7'
  | 'faturamento'
  | 'vendas'
  | 'cliques'
  | 'faturamento_total'
  | 'faturamento_novos_clientes'
  | 'faturamento_retencao'
  | 'total_churn';

interface LineChartProps {
  data: Array<{
    date: string;
    total?: number;
    creator?: number;
    creator_registered?: number;
    marca?: number;
    ma7?: number;
    faturamento?: number;
    vendas?: number;
    cliques?: number;
    faturamento_total?: number;
    faturamento_novos_clientes?: number;
    faturamento_retencao?: number;
    total_churn?: number;
  }>;
  series?: SeriesKey[];
  height?: number;
  valueFormat?: 'currency' | 'integer';
  description?: string;
  markers?: Array<{
    date: string;
    value: number;
    label: string;
    color?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
    labelOffset?: number;
  }>;
  loading?: boolean;
}

const defaultColors: Record<SeriesKey, string> = {
  total: '#4dd0bb',
  creator: '#d04d62',
  creator_registered: '#8b5cf6',
  marca: '#F59E0B',
  ma7: '#8884d8',
  faturamento: '#4dd0bb',
  vendas: '#d04d62',
  cliques: '#F59E0B',
  faturamento_total: '#22c55e',
  faturamento_novos_clientes: '#3b82f6',
  faturamento_retencao: '#ec4899',
  total_churn: '#ef4444',
};

const defaultLabels: Record<SeriesKey, string> = {
  total: 'Total',
  creator: 'Creators',
  creator_registered: 'Afiliados(qualificados como Creators)',
  marca: 'Marca',
  ma7: 'Média móvel (7 dias)',
  faturamento: 'Faturamento',
  vendas: 'Vendas',
  cliques: 'Cliques',
  faturamento_total: 'Faturamento Total',
  faturamento_novos_clientes: 'Faturamento Novos Clientes',
  faturamento_retencao: 'Faturamento Retenção',
  total_churn: 'Total de Churn',
};

export default function LineChartComponent({
  data,
  series = ['total'],
  height = 260,
  valueFormat = 'currency',
  description,
  markers = [],
  loading,
}: LineChartProps) {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCompact = React.useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }),
    [],
  );

  const xAxisInterval = React.useMemo(() => {
    if (!data || data.length === 0) return 0;

    const startDate = moment(data[0].date);
    const endDate = moment(data[data.length - 1].date);
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

  const formatXAxisTick = React.useCallback(
    (date: string) => {
      if (!data || data.length === 0) return moment(date).format('DD/MM');

      const startDate = moment(data[0].date);
      const endDate = moment(data[data.length - 1].date);
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

  // Calcular margens responsivas baseadas no tamanho da tela
  const responsiveMargins = React.useMemo(() => {
    if (windowWidth < 576) {
      // Mobile
      return { top: 20, right: 10, bottom: 40, left: 10 };
    } else if (windowWidth < 768) {
      // Tablet
      return { top: 24, right: 16, bottom: 30, left: 16 };
    }
    // Desktop
    return { top: 28, right: 32, bottom: 12, left: 32 };
  }, [windowWidth]);

  const isMobile = windowWidth < 576;

  return (
    <div
      style={{ width: '100%', height, position: 'relative', minHeight: 200 }}
    >
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
            data={data}
            className="line-chart"
            margin={responsiveMargins}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisTick}
              interval={xAxisInterval}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : undefined}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickFormatter={(v: number) =>
                formatCompact.format(Number(v || 0))
              }
              domain={[0, 'dataMax']}
              width={isMobile ? 40 : 60}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              labelFormatter={(l: string) => moment(l).format('DD/MM/YYYY')}
              formatter={(value: number, name: string, props: any) => {
                // Mostrar apenas se o valor não for null/undefined
                if (value == null) return null;

                const num = Number(value || 0);
                let formattedValue;

                if (valueFormat === 'integer') {
                  formattedValue = new Intl.NumberFormat('pt-BR', {
                    maximumFractionDigits: 0,
                  }).format(num);
                } else {
                  formattedValue = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 2,
                  }).format(num);
                }

                return [formattedValue, name];
              }}
              contentStyle={{
                fontSize: isMobile ? '12px' : '14px',
                padding: isMobile ? '8px' : '12px',
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: isMobile ? '11px' : '14px',
                paddingTop: isMobile ? '10px' : '20px',
              }}
            />
            {markers.map((m, idx) => (
              <ReferenceDot
                key={`mk-${idx}`}
                x={m.date}
                y={m.value}
                r={5}
                fill={m.color || '#6C5CE7'}
                stroke="none"
                isFront
                ifOverflow="hidden"
              >
                <Label
                  value={m.label}
                  position={m.labelPosition || 'top'}
                  offset={m.labelOffset}
                  fill={m.color || '#6C5CE7'}
                />
              </ReferenceDot>
            ))}
            {series.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={defaultLabels[key]}
                stroke={defaultColors[key]}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                connectNulls={false}
                activeDot={{ r: 4 }}
              />
            ))}
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
}
