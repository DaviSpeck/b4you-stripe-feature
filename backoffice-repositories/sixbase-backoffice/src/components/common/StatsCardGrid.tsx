import { FC } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { useSkin } from '../../utility/hooks/useSkin';
import StatCard, { StatCardProps } from './StatCard';

export interface StatsCardGridProps {
  cards: StatCardProps[];
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

const StatsCardGrid: FC<StatsCardGridProps> = ({
  cards,
  columns = { xs: 12, sm: 6, lg: 3 },
  className = '',
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';

  const containerGradient = isDark
    ? 'linear-gradient(135deg, #1f2a40 0%, #121826 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';

  return (
    <Card className={`mb-3 ${className}`} style={{ border: 0, background: 'transparent' }}>
      <CardBody
        style={{
          background: containerGradient,
          borderRadius: 12,
          padding: 16,
          minHeight: 112,
          display: 'flex',
          alignItems: 'center',
          border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Row className="g-3 align-items-stretch w-100">
          {cards.map((card, index) => (
            <Col
              key={index}
              xs={columns.xs || 12}
              sm={columns.sm || 6}
              md={columns.md}
              lg={columns.lg || 3}
              xl={columns.xl}
              className="d-flex"
            >
              <StatCard {...card} />
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  );
};

export default StatsCardGrid;

