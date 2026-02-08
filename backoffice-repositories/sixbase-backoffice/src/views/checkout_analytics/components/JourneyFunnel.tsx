import { FC, memo } from 'react';
import { Info } from 'react-feather';
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Progress,
  Table,
  UncontrolledTooltip,
} from 'reactstrap';

interface FunnelStep {
  eventName: string;
  label: string;
  count: number;
  rateFromPrevious: number | null;
}

interface JourneyFunnelProps {
  steps: FunnelStep[];
}

const getProgressColor = (rate: number | null) => {
  if (rate === null) return 'secondary';
  if (rate >= 75) return 'success';
  if (rate >= 45) return 'warning';
  return 'danger';
};

const tooltipMap: Record<string, string> = {
  checkout_page_view:
    'Entrada no checkout. Indica sessões que visualizaram a página.',
  checkout_session_started:
    'Sessão efetivamente iniciada após o carregamento inicial.',
  checkout_identification_completed: 'Sessões que concluíram a identificação.',
  checkout_address_completed: 'Sessões que concluíram o endereço.',
  checkout_submit_clicked:
    'Sessões em que o comprador clicou no botão final para enviar o pagamento.',
  checkout_conversion_success:
    'Sessões com checkout concluído: PIX gerado, boleto gerado ou cartão aprovado.',
};

const JourneyFunnel: FC<JourneyFunnelProps> = ({ steps }) => {
  const worstStep = steps.reduce<FunnelStep | null>((current, step) => {
    if (step.rateFromPrevious === null) return current;
    if (!current || current.rateFromPrevious === null) return step;
    return step.rateFromPrevious < current.rateFromPrevious ? step : current;
  }, null);

  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h4" className="mb-2">
          Funil da jornada
        </CardTitle>
        <CardText className="text-muted">
          Conversão = % de sessões que avançaram para a próxima etapa do funil.
        </CardText>
        <Table responsive className="mb-0">
          <thead>
            <tr>
              <th>Etapa</th>
              <th className="text-end">Sessões</th>
              <th>
                <span className="d-inline-flex align-items-center gap-50">
                  Conversão
                  <span id="journey-funnel-conversion-tooltip">
                    <Info size={14} />
                  </span>
                </span>
                <UncontrolledTooltip
                  target="journey-funnel-conversion-tooltip"
                  placement="top"
                >
                  Em produtos sem etapa de endereço, o funil pula etapas. Isso
                  pode fazer a conversão entre etapas ultrapassar 100%.
                </UncontrolledTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={step.label}>
                <td>
                  <span className="d-inline-flex align-items-center gap-50">
                    {step.label}
                    <span id={`journey-funnel-${step.eventName}`}>
                      <Info size={14} />
                    </span>
                  </span>
                  {worstStep?.eventName === step.eventName && (
                    <span className="badge bg-warning text-dark ms-1">
                      Maior queda
                    </span>
                  )}
                  <UncontrolledTooltip
                    target={`journey-funnel-${step.eventName}`}
                    placement="top"
                  >
                    {tooltipMap[step.eventName] || step.label}
                  </UncontrolledTooltip>
                </td>
                <td className="text-end">{step.count}</td>
                <td style={{ minWidth: 180 }}>
                  <div className="d-flex align-items-center gap-2">
                    <Progress
                      value={step.rateFromPrevious ?? 0}
                      color={getProgressColor(step.rateFromPrevious)}
                      className="flex-grow-1"
                    />
                    <span className="text-muted">
                      {step.rateFromPrevious === null
                        ? '—'
                        : `${step.rateFromPrevious.toFixed(1)}%`}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default memo(JourneyFunnel);
