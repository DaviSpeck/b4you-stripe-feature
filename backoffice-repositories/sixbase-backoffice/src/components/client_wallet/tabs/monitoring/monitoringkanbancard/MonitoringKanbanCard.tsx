import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';
import { TrendingUp, TrendingDown} from 'react-feather';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import { ProducerPerformanceItem } from '../../../../../views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';
import { getFirstAndLastName } from '../utils/monitoring.utils';
import { FormatBRL } from '../../../../../utility/Utils';

interface MonitoringKanbanCardProps {
  item: ProducerPerformanceItem;
}

const MonitoringKanbanCard: FC<MonitoringKanbanCardProps> = ({ item }) => {
  const { skin } = useSkin();

  return (
    <Card
      className="mb-50"
      style={{
        border: `1px solid ${
          skin === 'dark' ? 'rgba(255,255,255,0.12)' : '#dfe3e8'
        }`,
        borderRadius: 8,
        boxShadow:
          skin === 'dark'
            ? '0 2px 10px rgba(0,0,0,0.30)'
            : '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <CardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div
              className="font-weight-bold d-flex align-items-center"
              style={{ gap: 6 }}
            >
              <Link
                to={`/producer/${item.user_uuid || item.id}`}
                style={{ textDecoration: 'none' }}
              >
                {getFirstAndLastName(item.name)}
              </Link>
            </div>
            <small className="text-muted">{item.email}</small>
            <div
              className="font-weight-bold mt-1 d-flex align-items-center"
              style={{ gap: 6 }}
            >
              {FormatBRL(item.current_revenue)}
              {item.days_since_created !== undefined &&
                (() => {
                  const created = item.created_at
                    ? new Date(item.created_at)
                    : null;
                  const now = new Date();
                  const days = created
                    ? Math.max(
                        0,
                        Math.floor(
                          (now.getTime() - created.getTime()) /
                            (1000 * 60 * 60 * 24),
                        ),
                      )
                    : null;
                  return days !== null ? (
                    <small className="text-muted">
                      entrou há {days} dias
                    </small>
                  ) : null;
                })()}
              {item.days_since_created === undefined &&
                (() => {
                  const isPositive =
                    (item.variation_percentage || 0) >= 0;
                  const IconVar = isPositive ? TrendingUp : TrendingDown;
                  const colorClass = isPositive
                    ? 'text-success'
                    : 'text-danger';
                  return (
                    <span
                      className={`d-inline-flex align-items-center ${colorClass}`}
                      style={{ gap: 4 }}
                    >
                      <IconVar size={12} />
                      <small>
                        {(item.variation_percentage || 0).toFixed(2)}%
                      </small>
                    </span>
                  );
                })()}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default MonitoringKanbanCard;

