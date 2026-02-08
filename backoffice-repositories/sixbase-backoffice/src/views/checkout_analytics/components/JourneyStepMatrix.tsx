import { FC, memo } from 'react';
import { Info } from 'react-feather';
import {
  Card,
  CardBody,
  CardTitle,
  Table,
  UncontrolledTooltip,
} from 'reactstrap';

interface StepMetric {
  step: string;
  stepKey: string;
  started: number;
  completed: number;
  errors: number;
  errorRate: number;
}

interface JourneyStepMatrixProps {
  steps: StepMetric[];
}

const tooltipMap: Record<
  string,
  { started: string; completed: string; errors: string }
> = {
  identification: {
    started: 'Sessões que iniciaram a identificação.',
    completed: 'Sessões que concluíram a identificação.',
    errors: 'Sessões com erro na identificação.',
  },
  address: {
    started: 'Sessões que iniciaram o endereço.',
    completed: 'Sessões que concluíram o endereço.',
    errors: 'Sessões com erro no endereço.',
  },
  payment: {
    started: 'Sessões que iniciaram o pagamento.',
    completed:
      'Sessões com checkout concluído: PIX gerado, boleto gerado ou cartão aprovado.',
    errors: 'Sessões com erro no pagamento.',
  },
};

const JourneyStepMatrix: FC<JourneyStepMatrixProps> = ({ steps }) => {

  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h4" className="mb-2">
          Progresso por etapa
        </CardTitle>
        <Table responsive className="mb-0">
          <thead>
            <tr>
              <th>Etapa</th>
              <th className="text-end">Iniciadas</th>
              <th className="text-end">Concluídas</th>
              <th className="text-end">Taxa de erro</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={step.step}>
                <td>
                  <span className="d-inline-flex align-items-center gap-50">
                    {step.step}
                    <span id={`journey-step-${step.stepKey}`}>
                      <Info size={14} />
                    </span>
                  </span>
                  <UncontrolledTooltip
                    target={`journey-step-${step.stepKey}`}
                    placement="top"
                  >
                    <div>
                      <strong>Iniciadas:</strong>{' '}
                      {tooltipMap[step.stepKey]?.started}
                    </div>
                    <div>
                      <strong>Concluídas:</strong>{' '}
                      {tooltipMap[step.stepKey]?.completed}
                    </div>
                    <div>
                      <strong>Erros:</strong>{' '}
                      {tooltipMap[step.stepKey]?.errors}
                    </div>
                  </UncontrolledTooltip>
                </td>
                <td className="text-end">{step.started}</td>
                <td className="text-end">{step.completed}</td>
                <td className="text-end">{step.errorRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default memo(JourneyStepMatrix);
