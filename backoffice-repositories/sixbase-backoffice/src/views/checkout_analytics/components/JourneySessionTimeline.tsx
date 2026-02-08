import { FC, memo } from 'react';
import { Info } from 'react-feather';
import {
  Badge,
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem,
  UncontrolledTooltip,
} from 'reactstrap';
import moment from 'moment';

interface SessionEventItem {
  name: string;
  label: string;
  description: string;
  timestamp: number;
  isError: boolean;
}

interface SessionTimeline {
  sessionId: string;
  offerLabel: string;
  checkoutType: string;
  checkoutMode: string;
  paymentMethod: string | null;
  events: SessionEventItem[];
}

interface JourneySessionTimelineProps {
  sessions: SessionTimeline[];
}

const JourneySessionTimeline: FC<JourneySessionTimelineProps> = ({ sessions }) => {
  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h4" className="mb-2">
          <span className="d-inline-flex align-items-center gap-50">
            Linha do tempo por sessão
            <span id="journey-sessions-tooltip">
              <Info size={14} />
            </span>
          </span>
        </CardTitle>
        <UncontrolledTooltip target="journey-sessions-tooltip" placement="top">
          Linha do tempo por sessão em ordem cronológica. Cada item mostra o
          evento, a descrição e o identificador técnico. Checkout concluído
          significa PIX gerado, boleto gerado ou cartão aprovado. Pagamento
          aprovado é apenas cartão aprovado.
        </UncontrolledTooltip>
        <ListGroup flush>
          {sessions.map((session) => (
            <ListGroupItem key={session.sessionId}>
              <div className="d-flex flex-column flex-lg-row justify-content-between gap-1">
                <div>
                  <strong>{session.sessionId}</strong>
                  <div className="text-muted small">
                    {session.offerLabel}
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-1">
                  <Badge color="light-primary">{session.checkoutType}</Badge>
                  <Badge color="light-info">{session.checkoutMode}</Badge>
                  {session.paymentMethod && (
                    <Badge color="light-success">{session.paymentMethod}</Badge>
                  )}
                </div>
              </div>
              <ul className="mt-2 mb-0">
                {session.events.map((event) => (
                  <li key={`${session.sessionId}-${event.name}-${event.timestamp}`}>
                    <span className="text-muted me-2">
                      {moment(event.timestamp).format('HH:mm')}
                    </span>
                    <strong>{event.label}</strong>{' '}
                    <span className="text-muted">({event.name})</span> —{' '}
                    <span className={event.isError ? 'text-danger' : ''}>
                      {event.description}
                    </span>
                  </li>
                ))}
              </ul>
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default memo(JourneySessionTimeline);
