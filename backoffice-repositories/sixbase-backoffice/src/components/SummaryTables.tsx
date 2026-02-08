import { Row, Col } from 'reactstrap';
import { FormatBRL } from '../utility/Utils';
import { Summary } from '../interfaces/analytics.interface';
import { CombinedAnalyticsData } from '../interfaces/analytics.interface';

interface SummaryTablesProps {
  summary: Summary;
  apiData: CombinedAnalyticsData | null;
  loadingState?: {
    paymentMethod?: boolean;
    calculations?: boolean;
  };
}

const SummaryTables = ({
  summary,
  apiData,
  loadingState = {},
}: SummaryTablesProps) => {
  const isPaymentMethodLoading = loadingState.paymentMethod || false;
  const isCalculationsLoading = loadingState.calculations || false;

  // Sempre renderiza se está carregando ou se apiData existe
  const shouldRenderPaymentMethod = isPaymentMethodLoading || !!apiData;
  const shouldRenderCommissions = isCalculationsLoading || !!apiData;
  const shouldRenderConversionRates = isCalculationsLoading || !!apiData;

  return (
    <Row>
      {/* Coluna do Resumo Geral */}
      {shouldRenderPaymentMethod && (
        <Col lg={4} md={12} className="mb-3">
          {isPaymentMethodLoading ? (
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
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Métrica
                  </th>
                  <th
                    style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                    className="text-end"
                  >
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontSize: '0.9rem' }}>
                    <span className="badge badge-light-primary">
                      Total de Vendas
                    </span>
                  </td>
                  <td
                    style={{ fontSize: '0.9rem', fontWeight: '500' }}
                    className="text-end text-primary"
                  >
                    {summary.totalVendas.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: '0.9rem' }}>
                    <span className="badge badge-light-primary">Faturamento</span>
                  </td>
                  <td
                    style={{ fontSize: '0.9rem', fontWeight: '500' }}
                    className="text-end text-primary"
                  >
                    {FormatBRL(summary.totalFaturamento)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: '0.9rem' }}>
                    <span className="badge badge-light-primary">
                      B4You Recebeu
                    </span>
                  </td>
                  <td
                    style={{ fontSize: '0.9rem', fontWeight: '500' }}
                    className="text-end text-primary"
                  >
                    {FormatBRL(summary.b4youRecebeu)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        </Col>
      )}

      {/* Coluna das Comissões por Role */}
      {shouldRenderCommissions && (
        <Col lg={4} md={12} className="mb-3">
          {isCalculationsLoading ? (
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
        ) : (
          <>
            {apiData?.commissionsByRole && (
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Função
                      </th>
                      <th
                        style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                        className="text-end"
                      >
                        Total Recebido
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(apiData.commissionsByRole)
                      .filter(([, data]) => data.total > 0)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([roleKey, data]) => (
                        <tr key={roleKey}>
                          <td style={{ fontSize: '0.9rem' }}>
                            <span className="badge badge-light-primary">
                              {data.label}
                            </span>
                          </td>
                          <td
                            style={{ fontSize: '0.9rem', fontWeight: '500' }}
                            className="text-end"
                          >
                            {FormatBRL(data.total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {(!apiData?.commissionsByRole ||
              Object.values(apiData.commissionsByRole).every(
                (data) => data.total === 0,
              )) && (
              <div
                className="text-center text-muted"
                style={{ fontSize: '0.9rem' }}
              >
                <em>Nenhuma comissão registrada no período</em>
              </div>
            )}
          </>
        )}
        </Col>
      )}

      {/* Coluna das Taxas de Conversão */}
      {shouldRenderConversionRates && (
        <Col lg={4} md={12} className="mb-3">
          {isCalculationsLoading ? (
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
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Método
                  </th>
                  <th
                    style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                    className="text-end"
                  >
                    Taxa
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontSize: '0.9rem' }}>
                    <span className="badge badge-light-primary">PIX</span>
                  </td>
                  <td
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      color:
                        summary.taxaConversaoPix < 30
                          ? '#dc3545'
                          : summary.taxaConversaoPix < 60
                          ? '#ffc107'
                          : '#28a745',
                    }}
                    className="text-end"
                  >
                    {summary.taxaConversaoPix}%
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: '0.9rem' }}>
                    <span className="badge badge-light-primary">Cartão</span>
                  </td>
                  <td
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      color:
                        summary.taxaConversaoCartao < 30
                          ? '#dc3545'
                          : summary.taxaConversaoCartao < 60
                          ? '#ffc107'
                          : '#28a745',
                    }}
                    className="text-end"
                  >
                    {summary.taxaConversaoCartao}%
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: '0.9rem' }}>
                    <span className="badge badge-light-primary">Boleto</span>
                  </td>
                  <td
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      color:
                        summary.taxaConversaoBoleto < 30
                          ? '#dc3545'
                          : summary.taxaConversaoBoleto < 60
                          ? '#ffc107'
                          : '#28a745',
                    }}
                    className="text-end"
                  >
                    {summary.taxaConversaoBoleto}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        </Col>
      )}
    </Row>
  );
};

export default SummaryTables;
