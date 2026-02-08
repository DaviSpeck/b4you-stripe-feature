import { FC } from 'react';
import { CheckCircle, Clock, MessageSquare, XCircle } from 'react-feather';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import StatCard from '../../../../common/StatCard';
import { ContactStatusSectionProps } from './interfaces/contact-status-section.interface';

const ContactStatusSection: FC<ContactStatusSectionProps> = ({
  contactStatusSummary,
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
              Status de Contato
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
                  title="Não contatado"
                  value={contactStatusSummary.NAO_CONTATADO}
                  icon={MessageSquare}
                  isMonetary={false}
                  tooltip="Clientes que ainda não foram contatados"
                  loading={loading}
                  animate={true}
                  valueColor="#6b7280"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Em andamento"
                  value={contactStatusSummary.EM_ANDAMENTO}
                  icon={Clock}
                  isMonetary={false}
                  tooltip="Clientes em contato ou em acompanhamento"
                  loading={loading}
                  animate={true}
                  valueColor="#3b82f6"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Sem retorno"
                  value={contactStatusSummary.SEM_RETORNO}
                  icon={XCircle}
                  isMonetary={false}
                  tooltip="Clientes que não retornaram o contato"
                  loading={loading}
                  animate={true}
                  valueColor="#ef4444"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard
                  title="Finalizado"
                  value={contactStatusSummary.FINALIZADO}
                  icon={CheckCircle}
                  isMonetary={false}
                  tooltip="Clientes com contato finalizado"
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

export default ContactStatusSection;

