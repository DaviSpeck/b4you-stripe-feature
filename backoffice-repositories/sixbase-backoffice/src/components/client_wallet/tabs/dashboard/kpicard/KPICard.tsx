import { FC } from 'react';
import { Card, CardBody } from 'reactstrap';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import StatCard from '../../../../common/StatCard';
import { KPICardProps } from './interfaces/kpi-card.interface';

const KPICard: FC<KPICardProps> = ({
  title,
  value,
  icon,
  isMonetary = false,
  tooltip,
  loading = false,
  valueColor,
  onClick,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';
  const clickable = !!onClick;

  return (
    <Card style={{ border: 0, background: 'transparent' }}>
      <CardBody
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1f2a40 0%, #121826 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 12,
          padding: 16,
          minHeight: 140,
          display: 'flex',
          alignItems: 'center',
          border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <StatCard
          title={title}
          value={value}
          icon={icon}
          isMonetary={isMonetary}
          tooltip={tooltip}
          loading={loading}
          animate={true}
          valueColor={valueColor}
          onClick={() => clickable && onClick()}
        />
      </CardBody>
    </Card>
  );
};

export default KPICard;
