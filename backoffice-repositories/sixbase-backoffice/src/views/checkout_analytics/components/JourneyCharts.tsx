import { FC, memo } from 'react';
import { Card, CardBody, CardText, CardTitle, Col, Row } from 'reactstrap';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

interface FunnelChartDatum {
  step: string;
  sessions: number;
  conversion: number | null;
}

interface PaymentChartDatum {
  method: string;
  sessions: number;
  successRate: number;
}

interface JourneyChartsProps {
  funnelData: FunnelChartDatum[];
  paymentData: PaymentChartDatum[];
  checkoutTypeData: Array<{ name: string; value: number }>;
  checkoutModeData: Array<{ name: string; value: number }>;
}

const palette = ['#5B8FF9', '#61DDAA', '#65789B', '#F6BD16', '#E8684A'];
const sessionBarColor = '#5B8FF9';
const conversionLineColor = '#22C55E';

const FunnelTooltip: FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) return null;

  const sessions = payload.find((item) => item.dataKey === 'sessions')?.value;
  const conversion = payload.find((item) => item.dataKey === 'conversion')?.value;

  return (
    <div
      style={{
        background: '#1e1e1e',
        padding: '8px 12px',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        maxWidth: 260,
      }}
    >
      <strong>{label}</strong>
      <div>Sessões: {sessions ?? 0}</div>
      <div>
        Conversão:{' '}
        {conversion === null || conversion === undefined
          ? '—'
          : `${Number(conversion).toFixed(1)}%`}
      </div>
      <small className="text-muted d-block mt-1">
        Conversão = % de sessões que avançaram para a próxima etapa.
      </small>
    </div>
  );
};

const PaymentTooltip: FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) return null;

  const sessions = payload.find((item) => item.dataKey === 'sessions')?.value;
  const conversion = payload.find((item) => item.dataKey === 'successRate')?.value;

  return (
    <div
      style={{
        background: '#1e1e1e',
        padding: '8px 12px',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        maxWidth: 260,
      }}
    >
      <strong>{label}</strong>
      <div>Sessões: {sessions ?? 0}</div>
      <div>
        Conversão:{' '}
        {conversion === null || conversion === undefined
          ? '—'
          : `${Number(conversion).toFixed(1)}%`}
      </div>
      <small className="text-muted d-block mt-1">
        Conversão = % de sessões que concluíram o checkout
        (evento <code>checkout_conversion_success</code>).
      </small>
    </div>
  );
};

const PieTooltip: FC<TooltipProps<ValueType, NameType> & { total: number }> = ({
  active,
  payload,
  total,
}) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const value = Number(entry.value ?? 0);
  const percent = total ? (value / total) * 100 : 0;

  return (
    <div
      style={{
        background: '#1e1e1e',
        padding: '8px 12px',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        maxWidth: 260,
      }}
    >
      <strong>{entry.name}</strong>
      <div>Sessões: {value}</div>
      <div>{percent.toFixed(1)}% das sessões</div>
    </div>
  );
};

const JourneyCharts: FC<JourneyChartsProps> = ({
  funnelData,
  paymentData,
  checkoutTypeData,
  checkoutModeData,
}) => {
  const checkoutTypeTotal = checkoutTypeData.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const checkoutModeTotal = checkoutModeData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <>
      <Row className="mb-3">
        <Col lg="7" className="mb-2">
          <Card>
            <CardBody>
              <CardTitle tag="h4" className="mb-1">
                Conversão por etapa da jornada
              </CardTitle>
              <CardText className="text-muted mb-2">
                Volume de sessões por etapa com a taxa de avanço entre elas.
              </CardText>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={funnelData} margin={{ top: 8, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3548" />
                    <XAxis
                      dataKey="step"
                      tick={{ fill: '#b9b9c3' }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-12}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#b9b9c3' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#b9b9c3' }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<FunnelTooltip />} />
                    <Legend verticalAlign="top" height={24} />
                    <Bar
                      yAxisId="left"
                      dataKey="sessions"
                      name="Sessões"
                      fill={sessionBarColor}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversion"
                      name="Conversão"
                      stroke={conversionLineColor}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg="5" className="mb-2">
          <Card>
            <CardBody>
              <CardTitle tag="h4" className="mb-1">
                Conversão por método de pagamento
              </CardTitle>
              <CardText className="text-muted mb-2">
                Volume de sessões por método e taxa de checkout concluído.
              </CardText>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={paymentData} margin={{ top: 8, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3548" />
                    <XAxis
                      dataKey="method"
                      tick={{ fill: '#b9b9c3' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#b9b9c3' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#b9b9c3' }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<PaymentTooltip />} />
                    <Legend verticalAlign="top" height={24} />
                    <Bar
                      yAxisId="left"
                      dataKey="sessions"
                      name="Sessões"
                      radius={[4, 4, 0, 0]}
                      fill={sessionBarColor}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="successRate"
                      name="Conversão"
                      stroke={conversionLineColor}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col lg="6" className="mb-2">
          <Card>
            <CardBody>
              <CardTitle tag="h4" className="mb-1">
                Distribuição por tipo de checkout
              </CardTitle>
              <CardText className="text-muted mb-2">
                Distribuição de sessões entre checkout padrão e 3 etapas.
              </CardText>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Tooltip content={<PieTooltip total={checkoutTypeTotal} />} />
                    <Legend />
                    <Pie
                      data={checkoutTypeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {checkoutTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={palette[index % palette.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg="6" className="mb-2">
          <Card>
            <CardBody>
              <CardTitle tag="h4" className="mb-1">
                Distribuição por modo de checkout
              </CardTitle>
              <CardText className="text-muted mb-2">
                Mostra onde o checkout foi exibido: embutido, transparente,
                sandbox ou desenvolvimento.
              </CardText>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Tooltip content={<PieTooltip total={checkoutModeTotal} />} />
                    <Legend />
                    <Pie
                      data={checkoutModeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {checkoutModeData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={palette[(index + 2) % palette.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default memo(JourneyCharts);
