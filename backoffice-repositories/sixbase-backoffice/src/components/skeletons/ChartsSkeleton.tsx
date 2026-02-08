import { FC } from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';

const ChartsSkeleton: FC = () => {
  return (
    <Row className="g-2">
      {/* Chart 1 - Metodos de Pagamento */}
      <Col xs={12} md={6}>
        <Card>
          <CardBody>
            <div className="mb-3">
              <div
                className="skeleton-shimmer"
                style={{ height: '18px', width: '200px' }}
              />
            </div>
            <div style={{ height: 280 }} className="skeleton-chart" />
          </CardBody>
        </Card>
      </Col>

      {/* Chart 2 - Status de Pagamento */}
      <Col xs={12} md={6}>
        <Card>
          <CardBody>
            <div className="mb-3">
              <div
                className="skeleton-shimmer"
                style={{ height: '18px', width: '150px' }}
              />
            </div>
            <div style={{ height: 280 }} className="skeleton-chart" />
          </CardBody>
        </Card>
      </Col>

      {/* Chart 3 - Dispositivo/Navegador/Sistema Operacional */}
      <Col xs={12} md={6}>
        <Card>
          <CardBody>
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
            <div style={{ height: 280 }} className="skeleton-chart" />
          </CardBody>
        </Card>
      </Col>

      {/* Chart 4 - Região */}
      <Col xs={12} md={6}>
        <Card>
          <CardBody>
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
            <div style={{ height: 280 }} className="skeleton-chart" />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ChartsSkeleton;
