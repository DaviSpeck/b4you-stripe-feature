import { FC } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp } from 'react-feather';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import StatCard from '../../../../common/StatCard';
import { HealthKanbanSectionProps } from './interfaces/health-kanban-section.interface';

const HealthKanbanSection: FC<HealthKanbanSectionProps> = ({
  kanbanSummary,
  loading,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';

  return (
    <Row className="mt-2">
      <Col xs={12}>
        <Card
          style={{
            border: 0,
            background: 'transparent',
          }}
        >
          <CardHeader
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            <h5
              className="mb-1"
              style={{
                color: isDark ? '#ffffff' : '#1e293b',
                fontWeight: 600,
              }}
            >
              Saúde da Carteira
            </h5>
          </CardHeader>
          <CardBody
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #1f2a40 0%, #121826 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: 12,
              padding: 20,
              border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
              boxShadow: isDark
                ? '0 2px 8px rgba(0, 0, 0, 0.35)'
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Row>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Saudável"
                  value={kanbanSummary.HEALTHY}
                  icon={TrendingUp}
                  isMonetary={false}
                  tooltip="Clientes com queda de faturamento < 10% ou aumento - performance estável ou em crescimento"
                  loading={loading}
                  animate={true}
                  valueColor="#22c55e"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Atenção"
                  value={kanbanSummary.ATTENTION}
                  icon={AlertTriangle}
                  isMonetary={false}
                  tooltip="Clientes com queda de faturamento entre 10% e 30% - requer atenção"
                  loading={loading}
                  animate={true}
                  valueColor="#f59e0b"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Queda"
                  value={kanbanSummary.DROP}
                  icon={TrendingDown}
                  isMonetary={false}
                  tooltip="Clientes com queda de faturamento entre 30% e 50% - queda significativa"
                  loading={loading}
                  animate={true}
                  valueColor="#ef4444"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Churn"
                  value={kanbanSummary.CHURN}
                  icon={AlertTriangle}
                  isMonetary={false}
                  tooltip="Clientes com queda de faturamento > 50% ou sem vendas - risco de churn"
                  loading={loading}
                  animate={true}
                  valueColor="#6b7280"
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default HealthKanbanSection;
