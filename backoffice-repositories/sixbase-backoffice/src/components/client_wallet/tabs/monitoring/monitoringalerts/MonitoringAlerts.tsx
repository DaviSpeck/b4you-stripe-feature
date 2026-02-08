import { FC } from 'react';
import { Alert } from 'reactstrap';

interface MonitoringAlertsProps {
  noCompleteDays: boolean;
}

const MonitoringAlerts: FC<MonitoringAlertsProps> = ({ noCompleteDays }) => {
  return (
    <>
      <Alert color="info text-center">
        Esta página aplica a regra N-1: consideramos apenas dias completos. Se o
        período selecionado incluir o dia atual, usamos os dados até ontem.
      </Alert>
      {noCompleteDays && (
        <Alert color="warning">
          Hoje não há dias completos disponíveis para o período atual. Aguarde
          até amanhã para visualizar os dados comparativos.
        </Alert>
      )}
    </>
  );
};

export default MonitoringAlerts;

