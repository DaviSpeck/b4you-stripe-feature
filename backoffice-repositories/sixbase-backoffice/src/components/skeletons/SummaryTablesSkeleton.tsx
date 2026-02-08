import { FC } from 'react';
import { Row, Col } from 'reactstrap';

const SummaryTablesSkeleton: FC = () => {
  return (
    <Row>
      {/* Tabela de Vendas */}
      <Col lg={4} md={12} className="mb-3">
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <div
                    className="skeleton-shimmer"
                    style={{ height: '14px', width: '60px' }}
                  />
                </th>
                <th
                  style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                  className="text-end"
                >
                  <div
                    className="skeleton-shimmer"
                    style={{
                      height: '14px',
                      width: '50px',
                      marginLeft: 'auto',
                    }}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.9rem' }}>
                    <div
                      className="skeleton-shimmer skeleton-pill"
                      style={{ height: '20px', width: `${120 - i * 8}px` }}
                    />
                  </td>
                  <td className="text-end">
                    <div
                      className="skeleton-shimmer"
                      style={{
                        height: '16px',
                        width: `${80 - i * 5}px`,
                        marginLeft: 'auto',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Col>

      {/* Tabela de Comissões */}
      <Col lg={4} md={12} className="mb-3">
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <div
                    className="skeleton-shimmer"
                    style={{
                      height: '16px',
                      width: '40px',
                      borderRadius: '4px',
                    }}
                  />
                </th>
                <th
                  style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                  className="text-end"
                >
                  <div
                    className="skeleton-shimmer"
                    style={{
                      height: '16px',
                      width: '90px',
                      borderRadius: '4px',
                      marginLeft: 'auto',
                    }}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.9rem' }}>
                    <div
                      className="skeleton-shimmer"
                      style={{
                        height: '20px',
                        width: '100px',
                        borderRadius: '12px',
                      }}
                    />
                  </td>
                  <td className="text-end">
                    <div
                      className="skeleton-shimmer"
                      style={{
                        height: '16px',
                        width: '70px',
                        borderRadius: '4px',
                        marginLeft: 'auto',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Col>

      {/* Tabela de Taxas de Conversão */}
      <Col lg={4} md={12} className="mb-3">
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <div
                    className="skeleton-shimmer"
                    style={{
                      height: '16px',
                      width: '60px',
                      borderRadius: '4px',
                    }}
                  />
                </th>
                <th
                  style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                  className="text-end"
                >
                  <div
                    className="skeleton-shimmer"
                    style={{
                      height: '16px',
                      width: '40px',
                      borderRadius: '4px',
                      marginLeft: 'auto',
                    }}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.9rem' }}>
                    <div
                      className="skeleton-shimmer"
                      style={{
                        height: '20px',
                        width: '60px',
                        borderRadius: '12px',
                      }}
                    />
                  </td>
                  <td className="text-end">
                    <div
                      className="skeleton-shimmer"
                      style={{
                        height: '16px',
                        width: '50px',
                        borderRadius: '4px',
                        marginLeft: 'auto',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Col>
    </Row>
  );
};

export default SummaryTablesSkeleton;
