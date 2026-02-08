import { FC } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { useSkin } from '../../../utility/hooks/useSkin';
import LoadingSpinner from '../../LoadingSpinner';
import { KanbanColumnCardProps } from './interfaces/kanban-column-card.interface';

const KanbanColumnCard: FC<KanbanColumnCardProps> = ({
  title,
  icon,
  badgeColorClass,
  count = 0,
  loadingCount = false,
  description,
  children,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';

  return (
    <Card style={{ border: 0, background: 'transparent' }} className="h-100">
      <CardBody
        className="d-flex flex-column h-100"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1f2a40 0%, #121826 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 12,
          padding: 12,
          border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardHeader
          className="pb-0"
          style={{
            background: 'transparent',
            border: 'none',
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
          }}
        >
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              {icon}
              <h6 className="mb-0 ml-2">{title}</h6>
            </div>
            <div className="d-flex align-items-center">
              <span
                className={`${badgeColorClass || 'bg-primary'} text-white`}
                style={{
                  minWidth: 28,
                  height: 28,
                  padding: '0 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '999px',
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >
                {loadingCount ? (
                  <LoadingSpinner size={12} className="" showText={false} />
                ) : (
                  count
                )}
              </span>
            </div>
          </div>
          {description && (
            <small
              className="text-muted mt-50 d-block"
              style={{
                fontSize: '11px',
                lineHeight: 1.4,
              }}
            >
              {description}
            </small>
          )}
        </CardHeader>

        <div
          style={{
            paddingTop: 8,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </CardBody>
    </Card>
  );
};

export default KanbanColumnCard;
