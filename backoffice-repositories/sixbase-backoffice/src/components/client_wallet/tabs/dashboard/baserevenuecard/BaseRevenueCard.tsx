import { FC } from 'react';
import { Info } from 'react-feather';
import { Card, CardBody } from 'reactstrap';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import { BaseRevenueCardProps } from './interfaces/base-revenue-card.interface';
import { FormatBRL } from '../../../../../utility/Utils';

const BaseRevenueCard: FC<BaseRevenueCardProps> = ({
  title,
  clientsCount,
  revenue,
  tooltip,
  loading = false,
  onClick,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';

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
          flexDirection: 'column',
          justifyContent: 'center',
          border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
        <div
          style={{
            color: isDark ? '#cbd5e1' : '#64748b',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 8,
          }}
        >
          {title}
          {tooltip && (
            <span
              className="d-inline-flex align-items-center"
              title={tooltip}
              style={{ cursor: 'help' }}
            >
              <Info size={12} />
            </span>
          )}
        </div>
        {loading ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        ) : (
          <>
            <div
              style={{
                color: isDark ? '#ffffff' : '#1e293b',
                fontWeight: 700,
                fontSize: 24,
                marginBottom: 8,
              }}
            >
              {clientsCount.toLocaleString('pt-BR')}
            </div>
            <div
              style={{
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {FormatBRL(revenue)}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default BaseRevenueCard;
