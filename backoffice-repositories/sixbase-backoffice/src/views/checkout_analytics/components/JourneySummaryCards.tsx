import { FC, memo } from 'react';
import { Info } from 'react-feather';
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';

interface JourneySummaryCardsProps {
  totalSessions: number;
  totalEvents: number;
  conversionRate: number;
  conversionSuccessSessions: number;
  paymentSuccessSessions: number;
  errorSessions: number;
}

const JourneySummaryCards: FC<JourneySummaryCardsProps> = ({
  totalSessions,
  totalEvents,
  conversionRate,
  conversionSuccessSessions,
  paymentSuccessSessions,
  errorSessions,
}) => {
  const averageEventsPerSession = totalSessions
    ? totalEvents / totalSessions
    : 0;
  const percentOfSessions = (value: number) =>
    totalSessions ? (value / totalSessions) * 100 : 0;

  return (
    <Row className="mb-3">
      <Col md="4" sm="6" className="mb-2">
        <Card>
          <CardBody>
            <CardText className="text-muted mb-1 d-flex align-items-center gap-50">
              Sessões únicas
              <span id="journey-sessions-tooltip">
                <Info size={14} />
              </span>
            </CardText>
            <UncontrolledTooltip target="journey-sessions-tooltip" placement="top">
              Sessões únicas no período (session_id distinto). Base para todos os
              percentuais do painel.
            </UncontrolledTooltip>
            <CardTitle tag="h3" className="mb-0">
              {totalSessions}
            </CardTitle>
            <small className="text-muted d-block mt-1">
              100% das sessões • base: total do período
            </small>
          </CardBody>
        </Card>
      </Col>
      <Col md="4" sm="6" className="mb-2">
        <Card>
          <CardBody>
            <CardText className="text-muted mb-1 d-flex align-items-center gap-50">
              Eventos totais
              <span id="journey-events-tooltip">
                <Info size={14} />
              </span>
            </CardText>
            <UncontrolledTooltip target="journey-events-tooltip" placement="top">
              Total de eventos registrados no período. Ajuda a entender volume de
              interação por sessão.
            </UncontrolledTooltip>
            <CardTitle tag="h3" className="mb-0">
              {totalEvents}
            </CardTitle>
            <small className="text-muted d-block mt-1">
              Média de {averageEventsPerSession.toFixed(1)} eventos por sessão •
              base: total de sessões
            </small>
          </CardBody>
        </Card>
      </Col>
      <Col md="4" sm="6" className="mb-2">
        <Card>
          <CardBody>
            <CardText className="text-muted mb-1 d-flex align-items-center gap-50">
              Conversão geral
              <span id="journey-conversion-rate-tooltip">
                <Info size={14} />
              </span>
            </CardText>
            <UncontrolledTooltip
              target="journey-conversion-rate-tooltip"
              placement="top"
            >
              Percentual de sessões que chegaram ao checkout concluído: PIX
              gerado, boleto gerado ou cartão aprovado.
            </UncontrolledTooltip>
            <CardTitle tag="h3" className="mb-0">
              {conversionRate.toFixed(1)}%
            </CardTitle>
            <small className="text-muted d-block mt-1">
              {conversionSuccessSessions} sessões • base: total do período
            </small>
          </CardBody>
        </Card>
      </Col>
      <Col md="4" sm="6" className="mb-2">
        <Card>
          <CardBody>
            <CardText className="text-muted mb-1 d-flex align-items-center gap-50">
              Sessões com checkout concluído
              <span id="journey-conversion-success-tooltip">
                <Info size={14} />
              </span>
            </CardText>
            <UncontrolledTooltip
              target="journey-conversion-success-tooltip"
              placement="top"
            >
              Sessões em que o checkout foi concluído: PIX gerado, boleto gerado
              ou cartão aprovado.
            </UncontrolledTooltip>
            <CardTitle tag="h3" className="mb-0">
              {conversionSuccessSessions}
            </CardTitle>
            <small className="text-muted d-block mt-1">
              {percentOfSessions(conversionSuccessSessions).toFixed(1)}% das
              sessões • base: total do período
            </small>
          </CardBody>
        </Card>
      </Col>
      <Col md="4" sm="6" className="mb-2">
        <Card>
          <CardBody>
            <CardText className="text-muted mb-1 d-flex align-items-center gap-50">
              Sessões com pagamento aprovado
              <span id="journey-payment-success-tooltip">
                <Info size={14} />
              </span>
            </CardText>
            <UncontrolledTooltip
              target="journey-payment-success-tooltip"
              placement="top"
            >
              Sessões com cartão aprovado. Útil para acompanhar aprovações de
              cartão separadamente dos checkouts concluídos.
            </UncontrolledTooltip>
            <CardTitle tag="h3" className="mb-0">
              {paymentSuccessSessions}
            </CardTitle>
            <small className="text-muted d-block mt-1">
              {percentOfSessions(paymentSuccessSessions).toFixed(1)}% das
              sessões • base: total do período
            </small>
          </CardBody>
        </Card>
      </Col>
      <Col md="4" sm="6" className="mb-2">
        <Card>
          <CardBody>
            <CardText className="text-muted mb-1 d-flex align-items-center gap-50">
              Sessões com erro
              <span id="journey-errors-tooltip">
                <Info size={14} />
              </span>
            </CardText>
            <UncontrolledTooltip target="journey-errors-tooltip" placement="top">
              Sessões que tiveram ao menos um erro nas etapas de identificação,
              endereço ou pagamento.
            </UncontrolledTooltip>
            <CardTitle tag="h3" className="mb-0">
              {errorSessions}
            </CardTitle>
            <small className="text-muted d-block mt-1">
              {percentOfSessions(errorSessions).toFixed(1)}% das sessões • base:
              total do período
            </small>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default memo(JourneySummaryCards);
