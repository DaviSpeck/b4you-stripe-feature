import { FC, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CreatorChartData } from '../../interfaces/creators.interface';

interface CreatorChartProps {
  data: CreatorChartData[];
}

const CreatorChart: FC<CreatorChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.name,
      faturamento: item.faturamento,
      vendas: item.vendas,
      conversao: item.conversao,
    }));
  }, [data]);

  const colors = ['#28a745', '#007bff', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#6c757d', '#e83e8c', '#17a2b8'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: '#1e1e1e',
            padding: '12px 16px',
            borderRadius: '8px',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            maxWidth: 300,
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '4px 0', fontSize: '13px' }}>
              <span style={{ color: entry.color }}>
                {entry.name === 'faturamento' && 'Faturamento: '}
                {entry.name === 'vendas' && 'Vendas: '}
                {entry.name === 'conversao' && 'Conversão: '}
              </span>
              {entry.name === 'faturamento' && `R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              {entry.name === 'vendas' && entry.value.toLocaleString()}
              {entry.name === 'conversao' && `${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fill: '#ffffff', fontSize: 11 }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#ffffff', fontSize: 12 }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#ffffff', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#ffffff', paddingTop: '20px' }}
          />
          
          {/* Barra para Faturamento */}
          <Bar 
            yAxisId="left"
            dataKey="faturamento" 
            name="Faturamento (R$)"
            fill="#28a745"
            radius={[2, 2, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
          
          {/* Barra para Vendas */}
          <Bar 
            yAxisId="left"
            dataKey="vendas" 
            name="Vendas (Qtd)"
            fill="#007bff"
            radius={[2, 2, 0, 0]}
          />
          
          {/* Linha para Conversão */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="conversao" 
            name="Conversão (%)"
            stroke="#ffc107"
            strokeWidth={3}
            dot={{ fill: '#ffc107', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#ffc107', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CreatorChart;
