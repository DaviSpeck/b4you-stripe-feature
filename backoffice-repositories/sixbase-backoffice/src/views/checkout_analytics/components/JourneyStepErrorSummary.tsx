import { FC, memo, useMemo } from 'react';
import { Badge, Card, CardBody, CardText, CardTitle } from 'reactstrap';

interface StepMetric {
  step: string;
  stepKey: string;
  started: number;
  completed: number;
  errors: number;
  errorRate: number;
}

interface JourneyStepErrorSummaryProps {
  steps: StepMetric[];
}

const JourneyStepErrorSummary: FC<JourneyStepErrorSummaryProps> = ({ steps }) => {
  const mostProblematic = useMemo(() => {
    if (!steps.length) return null;
    return steps.reduce((highest, current) =>
      current.errorRate > highest.errorRate ? current : highest,
    );
  }, [steps]);

  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h4" className="mb-2">
          Resumo de erros por etapa
        </CardTitle>
        {mostProblematic && mostProblematic.errorRate > 0 ? (
          <CardText className="text-muted mb-2">
            Etapa mais crítica: <strong>{mostProblematic.step}</strong> •{' '}
            {mostProblematic.errorRate.toFixed(1)}% de erro (
            {mostProblematic.errors} erros em {mostProblematic.started} sessões
            iniciadas).
          </CardText>
        ) : (
          <CardText className="text-muted mb-2">
            Nenhuma etapa registrou taxa de erro acima de 0% no período.
          </CardText>
        )}
        <div className="d-flex flex-wrap gap-1">
          {steps.map((step) => (
            <Badge
              key={step.stepKey}
              color={
                mostProblematic?.stepKey === step.stepKey
                  ? 'light-danger'
                  : 'light-secondary'
              }
            >
              {step.step}: {step.errorRate.toFixed(1)}%
            </Badge>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default memo(JourneyStepErrorSummary);
