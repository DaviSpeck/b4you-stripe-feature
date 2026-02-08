import { FC } from 'react';
import { Card, CardBody } from 'reactstrap';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import LineChartComponent from '../../../../LineChart';
import { RevenueChartProps } from './interfaces/revenue-chart.interface';

const RevenueChart: FC<RevenueChartProps> = ({ chartData, loading }) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';

  return (
    <Card className="mt-2" style={{ border: 0, background: 'transparent' }}>
      <CardBody
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1f2a40 0%, #121826 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 12,
          padding: 24,
          border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h4
          className="mb-3"
          style={{
            color: isDark ? '#ffffff' : '#1e293b',
            fontWeight: 600,
          }}
        >
          Evolução do Faturamento
        </h4>
        <LineChartComponent
          data={chartData}
          series={[
            'faturamento_total',
            'faturamento_novos_clientes',
            'faturamento_retencao',
            'total_churn',
          ]}
          height={300}
          valueFormat="currency"
          loading={loading}
        />
      </CardBody>
    </Card>
  );
};

export default RevenueChart;
