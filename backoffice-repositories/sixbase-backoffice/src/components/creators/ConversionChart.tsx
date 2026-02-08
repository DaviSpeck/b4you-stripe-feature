import { FC, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CreatorChartData } from '../../interfaces/creators.interface';

interface ConversionChartProps {
  data: CreatorChartData[];
}

const ConversionChart: FC<ConversionChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.name,
      conversao: item.conversao,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: '#ffffff',
            padding: '12px 16px',
            borderRadius: '8px',
            color: '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid #e0e0e0',
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            {label}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <span style={{ color: '#f97316', fontWeight: 'bold' }}>
              Conversão:
            </span>
            {` ${payload[0].value}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#ffffff', fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis
            tick={{ fill: '#ffffff', fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
            label={{
              value: 'Conversão (%)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#ffffff' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              color: '#ffffff',
              paddingTop: '20px',
              fontSize: '13px',
            }}
          />

          <Line
            type="monotone"
            dataKey="conversao"
            name="Conversão (%)"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ fill: '#f97316', strokeWidth: 2, r: 5 }}
            activeDot={{
              r: 7,
              stroke: '#f97316',
              strokeWidth: 2,
              fill: '#ffffff',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConversionChart;
