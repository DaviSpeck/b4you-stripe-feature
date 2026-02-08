import React from 'react';
import { Stage } from '../../../../../views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';
import { TrendingDown, TrendingUp, AlertTriangle } from 'react-feather';
import { Badge } from 'reactstrap';

export const stageBadge = (stage: Stage | null): React.ReactElement | null => {
  if (!stage) return null;
  const map: Record<Stage, { color: string; label: string }> = {
    HEALTHY: { color: 'success', label: 'Saudável' },
    ATTENTION: { color: 'warning', label: 'Atenção' },
    DROP: { color: 'danger', label: 'Queda' },
    CHURN: { color: 'dark', label: 'Churn' },
  };
  const stageData = map[stage];
  if (!stageData) return null;
  const { color, label } = stageData;
  return <Badge color={color}>{label}</Badge>;
};

type FeatherIcon = React.ComponentType<{ size?: number | string; className?: string }>;

export const stageIcon = (
  stage: Stage,
): React.ReactElement | null => {
  const map: Record<
    Stage,
    { Icon: FeatherIcon; className: string }
  > = {
    HEALTHY: { Icon: TrendingUp, className: 'text-success' },
    ATTENTION: { Icon: AlertTriangle, className: 'text-warning' },
    DROP: { Icon: TrendingDown, className: 'text-danger' },
    CHURN: { Icon: AlertTriangle, className: 'text-dark' },
  };
  const cfg = map[stage];
  if (!cfg) return null;
  const { Icon, className } = cfg;
  return <Icon size={14} className={`ml-50 ${className}`} />;
};

export const stageDotClass = (stage: Stage): string => {
  const map: Record<Stage, string> = {
    HEALTHY: 'bg-success',
    ATTENTION: 'bg-warning',
    DROP: 'bg-danger',
    CHURN: 'bg-dark',
  };
  return map[stage];
};

export const getStageDescription = (stage: Stage): string => {
  switch (stage) {
    case 'HEALTHY':
      return 'Clientes com queda de faturamento < 10% ou aumento - performance estável ou em crescimento.';
    case 'ATTENTION':
      return 'Clientes sem faturamento ou com queda entre 10% e 30% - necessitam acompanhamento.';
    case 'DROP':
      return 'Clientes com queda de faturamento ≥ 30% comparado ao período anterior - requer atenção imediata.';
    case 'CHURN':
      return 'Clientes que já tiveram vendas mas nos últimos 30 dias o saldo de vendas é zero.';
    default:
      return '';
  }
};

