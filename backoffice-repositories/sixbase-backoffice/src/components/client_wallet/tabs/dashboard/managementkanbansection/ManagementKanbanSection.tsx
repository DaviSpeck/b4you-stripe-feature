import { FC } from 'react';
import { Briefcase, CheckCircle, Settings, UserPlus } from 'react-feather';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import StatCard from '../../../../common/StatCard';
import { MANAGER_PHASE_IDS } from '../../../../../views/client_wallet/tabs/management/interfaces/management.interface';
import { ManagementKanbanSectionProps } from './interfaces/management-kanban-section.interface';

const ManagementKanbanSection: FC<ManagementKanbanSectionProps> = ({
  managementSummary,
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
              Gerenciamento de Carteira
            </h5>
            <hr
              style={{
                borderColor: isDark ? '#2f3a4f' : '#e2e8f0',
              }}
            />
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
                  title="Novos Clientes"
                  value={managementSummary[MANAGER_PHASE_IDS.NOVOS_CLIENTES]}
                  icon={UserPlus}
                  isMonetary={false}
                  tooltip="Clientes que se registraram nos últimos 30 dias. Este kanban é automático."
                  loading={loading}
                  animate={true}
                  valueColor="#3b82f6"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Negociação"
                  value={managementSummary[MANAGER_PHASE_IDS.NEGOCIACAO]}
                  icon={Briefcase}
                  isMonetary={false}
                  tooltip="Clientes em fase de negociação"
                  loading={loading}
                  animate={true}
                  valueColor="#f59e0b"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Implementação"
                  value={managementSummary[MANAGER_PHASE_IDS.IMPLEMENTACAO]}
                  icon={Settings}
                  isMonetary={false}
                  tooltip="Clientes em fase de implementação"
                  loading={loading}
                  animate={true}
                  valueColor="#8b5cf6"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Pronto para Vender"
                  value={
                    managementSummary[MANAGER_PHASE_IDS.PRONTO_PARA_VENDER]
                  }
                  icon={CheckCircle}
                  isMonetary={false}
                  tooltip="Clientes prontos para vender"
                  loading={loading}
                  animate={true}
                  valueColor="#22c55e"
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ManagementKanbanSection;
