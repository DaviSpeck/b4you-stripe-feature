import { FC } from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import {
  ManagementItem,
  ManagerPhase,
  MANAGER_PHASE_IDS,
} from '../../../../views/client_wallet/tabs/management/interfaces/management.interface';

interface DraggableKanbanCardProps {
  item: ManagementItem;
  phase: ManagerPhase;
  skin: string;
  onUpdatePhase: (userId: number, phase: ManagerPhase | null) => void;
  getFirstAndLastName: (name: string) => string;
  formatCurrency: (value: number | undefined) => string;
  formatDaysAgo: (days: number | null | undefined) => string;
  readOnly?: boolean;
}

const DraggableKanbanCard: FC<DraggableKanbanCardProps> = ({
  item,
  phase,
  skin,
  onUpdatePhase,
  getFirstAndLastName,
  formatCurrency,
  formatDaysAgo,
  readOnly = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `item-${item.id}-${phase}`,
      disabled: readOnly,
      data: {
        item,
        phase,
      },
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: readOnly ? 'default' : isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(readOnly ? {} : { ...attributes, ...listeners })}
    >
      <Card
        className="mb-50"
        style={{
          border: `1px solid ${
            skin === 'dark' ? 'rgba(255,255,255,0.12)' : '#dfe3e8'
          }`,
          borderRadius: 8,
          boxShadow: isDragging
            ? skin === 'dark'
              ? '0 8px 24px rgba(255,255,255,0.2)'
              : '0 8px 24px rgba(0,0,0,0.15)'
            : skin === 'dark'
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <CardBody>
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ flex: 1 }}>
              <div
                className="font-weight-bold d-flex align-items-center"
                style={{ gap: 6 }}
              >
                <Link
                  to={`/producer/${item.user_uuid || item.id}`}
                  style={{ textDecoration: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {getFirstAndLastName(item.name)}
                </Link>
              </div>
              <small className="text-muted">{item.email}</small>

              <div
                className="font-weight-bold mt-1 d-flex align-items-center flex-wrap"
                style={{ gap: 6 }}
              >
                {formatCurrency(item.current_revenue)}
                {phase === MANAGER_PHASE_IDS.NOVOS_CLIENTES &&
                  item.days_since_created !== undefined && (
                    <small className="text-muted">
                      {formatDaysAgo(item.days_since_created)}
                    </small>
                  )}

                {phase !== MANAGER_PHASE_IDS.NOVOS_CLIENTES &&
                  item.days_in_phase !== null &&
                  item.days_in_phase !== undefined && (
                    <small className="text-muted">
                      {formatDaysAgo(item.days_in_phase)} nesta fase
                    </small>
                  )}
              </div>
            </div>
          </div>

          {!readOnly && (
            <>
              {phase === MANAGER_PHASE_IDS.PRONTO_PARA_VENDER && (
                <div className="mt-2">
                  <Button
                    color="success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePhase(item.id, null);
                    }}
                    style={{ width: '100%' }}
                    disabled={readOnly}
                  >
                    Pronto
                  </Button>
                </div>
              )}

              {phase !== MANAGER_PHASE_IDS.NOVOS_CLIENTES &&
                phase !== MANAGER_PHASE_IDS.PRONTO_PARA_VENDER && (
                  <div className="mt-2 d-flex gap-1">
                    <Button
                      color="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextPhase: ManagerPhase | null =
                          phase === MANAGER_PHASE_IDS.NEGOCIACAO
                            ? MANAGER_PHASE_IDS.IMPLEMENTACAO
                            : phase === MANAGER_PHASE_IDS.IMPLEMENTACAO
                            ? MANAGER_PHASE_IDS.PRONTO_PARA_VENDER
                            : null;
                        if (nextPhase) {
                          onUpdatePhase(item.id, nextPhase);
                        }
                      }}
                      style={{ flex: 1 }}
                      disabled={readOnly}
                    >
                      Avançar
                    </Button>
                  </div>
                )}

              {phase === MANAGER_PHASE_IDS.NOVOS_CLIENTES && (
                <div className="mt-2">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePhase(item.id, MANAGER_PHASE_IDS.NEGOCIACAO);
                    }}
                    style={{ width: '100%' }}
                    disabled={readOnly}
                  >
                    Mover para Negociação
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DraggableKanbanCard;
