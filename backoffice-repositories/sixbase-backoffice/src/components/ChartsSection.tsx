import { FC, useCallback } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Button } from 'reactstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from 'recharts';
import {
  DeviceLevel,
  deviceLevelLabels,
} from '../interfaces/enums/types-devices.enum';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

interface ExtraTooltipProps {
  note?: string;
}

// Tooltip padronizado
const CustomTooltip: React.FC<
  TooltipProps<ValueType, NameType> & ExtraTooltipProps
> = ({ active, payload, label, note }) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value as number;
  const displayLabel = !label ? 'Indefinido' : label.toString();

  return (
    <div
      style={{
        background: '#1e1e1e',
        padding: '8px 12px',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        maxWidth: 260,
        whiteSpace: 'normal',
      }}
    >
      <p style={{ margin: 0, fontWeight: 'bold' }}>{displayLabel}</p>
      <p style={{ margin: 0 }}>Valor: {value}</p>
      {note && (
        <small style={{ display: 'block', marginTop: 4, color: '#999' }}>
          {note}
        </small>
      )}
    </div>
  );
};

// helper: normaliza nomes indefinidos
const normalizeLabel = (name?: string) => {
  if (!name || !name.trim()) return 'Indefinido';
  const lowered = name.toLowerCase();
  if (['outros', 'outro'].includes(lowered)) return 'Indefinido';
  return name;
};

// helper para cor
const getCellColor = (
  entry: any,
  data: any[],
  index: number,
  getBarColor: any,
) => {
  if (
    !entry.name ||
    ['indefinido', 'outros', 'outro'].includes(entry.name.toLowerCase())
  ) {
    return '#888888';
  }
  return getBarColor(entry, data, index);
};

// componente eixo X com quebra automática de texto
const CustomizedAxisTick: FC<any> = ({ x, y, payload }) => {
  const text = normalizeLabel(payload.value);
  const words = text.split(/\s+/); // quebra por espaços
  return (
    <text x={x} y={y + 10} textAnchor="middle" fill="#ffffff" fontSize={11}>
      {words.map((word: string, index: number) => (
        <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
          {word}
        </tspan>
      ))}
    </text>
  );
};

interface ChartsSectionProps {
  byMethod: any[];
  byStatus: any[];
  byDevice: any[];
  byBrowser: any[];
  byOS: any[];
  byOrigin: any[];
  byRegion: any[];
  deviceLevel: DeviceLevel;
  selectedRegion: any;
  onDeviceLevelChange: (level: DeviceLevel) => void;
  getBarColor: (entry: any, data: any[], index: number) => string;
  conversionRates?: any;
  loadingState?: {
    paymentMethod?: boolean;
    status?: boolean;
    region?: boolean;
    origin?: boolean;
  };
}

const ChartsSection: FC<ChartsSectionProps> = ({
  byMethod,
  byStatus,
  byDevice,
  byBrowser,
  byOS,
  byOrigin,
  byRegion,
  deviceLevel,
  selectedRegion,
  onDeviceLevelChange,
  getBarColor,
  conversionRates,
  loadingState = {},
}) => {
  const handleDeviceLevelChange = useCallback(
    (level) => {
      onDeviceLevelChange(level);
    },
    [onDeviceLevelChange],
  );

  const chartHeight = 300;

  const isPaymentMethodLoading = loadingState.paymentMethod || false;
  const isStatusLoading = loadingState.status || false;
  const isRegionLoading = loadingState.region || false;
  const isOriginLoading = loadingState.origin || false;

  // Sempre renderiza se está carregando ou se tem dados (mesmo que vazios)
  const shouldRenderPaymentMethod = isPaymentMethodLoading || byMethod.length > 0;
  const shouldRenderStatus = isStatusLoading || byStatus.length > 0;
  const shouldRenderOrigin = isOriginLoading || byDevice.length > 0;
  const shouldRenderRegion = isRegionLoading || byRegion.length > 0;

  return (
    <Row className="g-2 align-items-stretch">
      {/* Gráfico por Método */}
      {shouldRenderPaymentMethod && (
        <Col xs={12} md={6} className="d-flex">
          <Card className="w-100 d-flex flex-column h-100">
            <CardBody className="d-flex flex-column">
              {isPaymentMethodLoading ? (
              <>
                <div className="mb-3">
                  <div
                    className="skeleton-shimmer"
                    style={{ height: '18px', width: '200px' }}
                  />
                </div>
                <div style={{ height: chartHeight }} className="skeleton-chart" />
              </>
            ) : (
              <>
                <CardTitle tag="h6" className="mb-2">
                  Por Método de Pagamento
                </CardTitle>
                <div style={{ height: chartHeight, flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byMethod}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={<CustomizedAxisTick />}
                        interval={0}
                      />
                      <YAxis tick={{ fill: '#ffffff', fontSize: 12 }} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const methodKey = (label || 'indefinido').toLowerCase();
                          const rate =
                            conversionRates?.byMethod?.[methodKey] || '0.00';
                          return (
                            <CustomTooltip
                              active={active}
                              payload={payload}
                              label={label}
                            />
                          );
                        }}
                      />
                      <Bar dataKey="value">
                        {byMethod.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getCellColor(entry, byMethod, index, getBarColor)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </Col>
      )}

      {/* Gráfico por Status */}
      {shouldRenderStatus && (
        <Col xs={12} md={6} className="d-flex">
          <Card className="w-100 d-flex flex-column h-100">
            <CardBody className="d-flex flex-column">
              {isStatusLoading ? (
              <>
                <div className="mb-3">
                  <div
                    className="skeleton-shimmer"
                    style={{ height: '18px', width: '150px' }}
                  />
                </div>
                <div style={{ height: chartHeight }} className="skeleton-chart" />
              </>
            ) : (
              <>
                <CardTitle tag="h6" className="mb-2">
                  Por Status de Pagamento
                </CardTitle>
                <div style={{ height: chartHeight, flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={<CustomizedAxisTick />}
                        interval={0}
                      />
                      <YAxis tick={{ fill: '#ffffff', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value">
                        {byStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getCellColor(entry, byStatus, index, getBarColor)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </Col>
      )}

      {/* Gráfico por Dispositivo/Navegador/OS/Origem */}
      {shouldRenderOrigin && (
        <Col xs={12} md={6} className="d-flex">
          <Card className="w-100 d-flex flex-column h-100">
            <CardBody className="d-flex flex-column">
              {isOriginLoading ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="skeleton-shimmer"
                    style={{ height: '18px', width: '180px' }}
                  />
                  <div className="d-flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton-shimmer"
                        style={{ height: '28px', width: '70px' }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ height: chartHeight }} className="skeleton-chart" />
              </>
            ) : (
              <>
                <div
                  className="d-flex justify-content-between align-items-start mb-2"
                  style={{ minHeight: 48 }}
                >
                  <CardTitle tag="h6" className="mb-0">
                    {`Distribuição por ${deviceLevelLabels[deviceLevel]}`}
                  </CardTitle>
                  <div className="d-flex flex-wrap gap-1">
                    {Object.entries(DeviceLevel).map(([key, value]) => (
                      <Button
                        key={value}
                        size="sm"
                        color={deviceLevel === value ? 'primary' : 'light'}
                        onClick={() => handleDeviceLevelChange(value)}
                      >
                        {deviceLevelLabels[value]}
                      </Button>
                    ))}
                  </div>
                </div>
                <div style={{ height: chartHeight, flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        deviceLevel === DeviceLevel.DEVICE
                          ? byDevice
                          : deviceLevel === DeviceLevel.BROWSER
                            ? byBrowser
                            : deviceLevel === DeviceLevel.OS
                              ? byOS
                              : byOrigin
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={<CustomizedAxisTick />}
                        interval={0}
                      />
                      <YAxis tick={{ fill: '#ffffff', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value">
                        {(deviceLevel === DeviceLevel.DEVICE
                          ? byDevice
                          : deviceLevel === DeviceLevel.BROWSER
                            ? byBrowser
                            : deviceLevel === DeviceLevel.OS
                              ? byOS
                              : byOrigin
                        ).map((entry, index, arr) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getCellColor(entry, arr, index, getBarColor)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </Col>
      )}

      {/* Gráfico por Região/Estado */}
      {shouldRenderRegion && (
        <Col xs={12} md={6} className="d-flex">
          <Card className="w-100 d-flex flex-column h-100">
            <CardBody className="d-flex flex-column">
              {isRegionLoading ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="skeleton-shimmer"
                    style={{ height: '18px', width: '180px' }}
                  />
                </div>
                <div style={{ height: chartHeight }} className="skeleton-chart" />
              </>
            ) : (
              <>
                <CardTitle tag="h6" className="mb-2">
                  {selectedRegion
                    ? `Por Estado - ${selectedRegion.label}`
                    : 'Por Região'}
                </CardTitle>
                <div style={{ height: chartHeight, flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byRegion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={<CustomizedAxisTick />}
                        interval={0}
                      />
                      <YAxis tick={{ fill: '#ffffff', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value">
                        {byRegion.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getCellColor(entry, byRegion, index, getBarColor)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </Col>
      )}
    </Row>
  );
};

export default ChartsSection;
