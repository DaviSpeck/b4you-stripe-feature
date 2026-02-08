import { FC, useMemo, useCallback } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { Info } from 'react-feather';
import { PerformanceChartData } from '../../interfaces/creators.interface';
import PerformanceChart from './PerformanceChart';
import { useSkin } from '../../utility/hooks/useSkin';
import InfoTooltip from '../common/InfoTooltip';

interface SeriesVisible {
  faturamento: boolean;
  vendas: boolean;
  cliques: boolean;
  ticketMedio: boolean;
}

interface PerformanceChartSectionProps {
  data: PerformanceChartData[];
  loading: boolean;
  chartScope: 'all' | 'new';
  onChartScopeChange: (scope: 'all' | 'new') => void;
  seriesVisible: SeriesVisible;
  onToggleSeriesVisible: (key: keyof SeriesVisible) => void;
}

const PerformanceChartSection: FC<PerformanceChartSectionProps> = ({
  data,
  loading,
  chartScope,
  onChartScopeChange,
  seriesVisible,
  onToggleSeriesVisible,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';
  const processedPerformanceChartData = useMemo(() => {
    return data.map((data) => ({
      ...data,
      totalSales: Number(data.totalSales || 0),
      totalRevenue: Number(data.totalRevenue || 0),
      totalClicks: Number(data.totalClicks || 0),
      averageTicket: Number(data.averageTicket || 0),
    }));
  }, [data]);

  return (
    <Card className="mb-3">
      <CardHeader
        className="d-flex justify-content-between align-items-center flex-wrap"
        style={{ gap: 12 }}
      >
        <div className="d-flex align-items-center">
          <h5
            className="mb-0"
            style={{ color: isDark ? '#ffffff' : '#1e293b' }}
          >
            Performance dos Creators (Afiliados)
          </h5>
        </div>

        {/* Tabs centralizados */}
        <div className="nav nav-tabs border-0" style={{ gap: 0 }}>
          <button
            type="button"
            className={`nav-link ${chartScope === 'all' ? 'active' : ''}`}
            onClick={() => onChartScopeChange('all')}
            style={{
              border: 'none',
              borderBottom:
                chartScope === 'all'
                  ? '1px solid var(--bs-primary)'
                  : '1px solid transparent',
              borderRadius: 0,
              backgroundColor: 'transparent',
              color:
                chartScope === 'all'
                  ? isDark
                    ? '#ffffff'
                    : '#1e293b'
                  : isDark
                    ? '#6c757d'
                    : '#64748b',
              fontSize: '14px',
              fontWeight: chartScope === 'all' ? '600' : '400',
              padding: '8px 16px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <span className="d-flex align-items-center gap-1">
              Todos
              <InfoTooltip
                size={12}
                content="Exibe a performance de todos os creators que já realizaram ao menos uma venda como afiliado, independentemente da data da primeira venda."
              />
            </span>
          </button>
          <button
            type="button"
            className={`nav-link ${chartScope === 'new' ? 'active' : ''}`}
            onClick={() => onChartScopeChange('new')}
            style={{
              border: 'none',
              borderBottom:
                chartScope === 'new'
                  ? '1px solid var(--bs-primary)'
                  : '1px solid transparent',
              borderRadius: 0,
              backgroundColor: 'transparent',
              color:
                chartScope === 'new'
                  ? isDark
                    ? '#ffffff'
                    : '#1e293b'
                  : isDark
                    ? '#6c757d'
                    : '#64748b',
              fontSize: '14px',
              fontWeight: chartScope === 'new' ? '600' : '400',
              padding: '8px 16px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <span className="d-flex align-items-center gap-1">
              Novos
              <InfoTooltip
                size={12}
                content="Exibe a performance apenas dos creators cuja primeira venda como afiliado ocorreu dentro do período selecionado."
              />
            </span>
          </button>
        </div>
        <div
          className="d-flex flex-wrap align-items-center"
          style={{ gap: 20 }}
        >
          <label
            className="d-flex align-items-center mb-0"
            style={{ gap: 10, whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              style={{
                margin: 0,
                cursor: 'pointer',
                width: 16,
                height: 16,
                flexShrink: 0,
                accentColor: 'var(--bs-primary)',
              }}
              checked={seriesVisible.faturamento}
              onChange={() => onToggleSeriesVisible('faturamento')}
            />
            <span
              className="small d-flex align-items-center"
              style={{ color: isDark ? '#10b981' : '#059669', gap: 6 }}
            >
              Renda Gerada
              <InfoTooltip
                content="Cálculo baseado na soma do valor total das vendas pagas realizadas por creators como afiliados no período selecionado."
                size={12}
              />
            </span>
          </label>
          <label
            className="d-flex align-items-center mb-0"
            style={{ gap: 10, whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              style={{
                margin: 0,
                cursor: 'pointer',
                width: 16,
                height: 16,
                flexShrink: 0,
                accentColor: 'var(--bs-primary)',
              }}
              checked={seriesVisible.vendas}
              onChange={() => onToggleSeriesVisible('vendas')}
            />
            <span
              className="small d-flex align-items-center"
              style={{ color: isDark ? '#3b82f6' : '#2563eb', gap: 6 }}
            >
              Vendas
              <InfoTooltip
                content="Cálculo baseado no total de vendas pagas realizadas por creators atuando como afiliados no período selecionado."
                size={12}
              />
            </span>
          </label>
          <label
            className="d-flex align-items-center mb-0"
            style={{ gap: 10, whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              style={{
                margin: 0,
                cursor: 'pointer',
                width: 16,
                height: 16,
                flexShrink: 0,
                accentColor: 'var(--bs-primary)',
              }}
              checked={seriesVisible.cliques}
              onChange={() => onToggleSeriesVisible('cliques')}
            />
            <span
              className="small d-flex align-items-center"
              style={{ color: isDark ? '#BA68C8' : '#9333ea', gap: 6 }}
            >
              Cliques
              <InfoTooltip
                content="Cálculo baseado no total de cliques afiliados registrados nos produtos no período selecionado. 
Observação: nem todos os cliques são capturados, podendo haver pequenas inconsistências nos dados."
                size={12}
              />
            </span>
          </label>
          <label
            className="d-flex align-items-center mb-0"
            style={{ gap: 10, whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              style={{
                margin: 0,
                cursor: 'pointer',
                width: 16,
                height: 16,
                flexShrink: 0,
                accentColor: 'var(--bs-primary)',
              }}
              checked={seriesVisible.ticketMedio}
              onChange={() => onToggleSeriesVisible('ticketMedio')}
            />
            <span
              className="small d-flex align-items-center"
              style={{ color: isDark ? '#FFC107' : '#d97706', gap: 6 }}
            >
              Ticket Médio
              <InfoTooltip
                content="Cálculo: Renda Gerada ÷ Total de Vendas afiliadas. Representa o valor médio por venda realizada por creators como afiliados no período selecionado."
                size={12}
              />
            </span>
          </label>
        </div>
      </CardHeader>
      <CardBody>
        <PerformanceChart
          data={processedPerformanceChartData}
          loading={loading}
          seriesVisible={seriesVisible}
        />
      </CardBody>
    </Card>
  );
};

export default PerformanceChartSection;
