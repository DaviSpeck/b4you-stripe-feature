import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Loader from '../../../utils/loader';

const MetricsCards = ({ metrics, loadingMetrics }) => {
  const formatCurrency = (value) => {
    return Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value || 0);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  if (loadingMetrics) {
    return (
      <Row className='mb-4'>
        <Col>
          <Loader title='Carregando métricas...' />
        </Col>
      </Row>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <>
      <Row className='mb-4'>
        {/* Assinaturas Ativas */}
        <Col md={6} lg={3}>
          <div className='card'>
            <div className='card-body p-3 d-flex flex-column justify-content-center'>
              <div className='d-flex align-items-center justify-content-between mb-1'>
                <h2 className='fs-24 font-w600 mb-0'>
                  {!loadingMetrics && (metrics.activeSubscriptions?.total || 0)}
                  {loadingMetrics && (
                    <i
                      className='bx bx-loader-alt bx-spin'
                      style={{ fontSize: 25 }}
                    />
                  )}
                </h2>
                <OverlayTrigger
                  placement='top'
                  overlay={
                    <Tooltip id='tooltip-active-subscriptions'>
                      Total de assinaturas com status &quot;Ativo&quot; no
                      momento atual. Mostra a variação percentual em relação ao
                      mês anterior.
                    </Tooltip>
                  }
                >
                  <i
                    className='bx bx-info-circle'
                    style={{
                      cursor: 'help',
                      fontSize: '1rem',
                      opacity: 0.7,
                    }}
                  />
                </OverlayTrigger>
              </div>
              <span className='fs-14'>
                {!loadingMetrics && (
                  <>
                    Assinaturas Ativas
                    {metrics.activeSubscriptions?.variation !== undefined && (
                      <span
                        className={`d-block mt-1 ${
                          metrics.activeSubscriptions?.variation >= 0
                            ? 'text-success'
                            : 'text-danger'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <i
                          className={`bx ${
                            metrics.activeSubscriptions?.variation >= 0
                              ? 'bx-trending-up'
                              : 'bx-trending-down'
                          }`}
                        />{' '}
                        {formatPercentage(
                          metrics.activeSubscriptions?.variation
                        )}{' '}
                        vs mês anterior
                      </span>
                    )}
                  </>
                )}
                {loadingMetrics && (
                  <i
                    className='bx bx-loader-alt bx-spin'
                    style={{ fontSize: 25 }}
                  />
                )}
              </span>
            </div>
          </div>
        </Col>

        {/* Assinaturas a Renovar */}
        <Col md={6} lg={3}>
          <div className='card'>
            <div className='card-body p-3 d-flex flex-column justify-content-center'>
              <div className='d-flex align-items-center justify-content-between mb-1'>
                <h2 className='fs-24 font-w600 mb-0'>
                  {!loadingMetrics && (metrics.renewing?.next30Days || 0)}
                  {loadingMetrics && (
                    <i
                      className='bx bx-loader-alt bx-spin'
                      style={{ fontSize: 25 }}
                    />
                  )}
                </h2>
                <OverlayTrigger
                  placement='top'
                  overlay={
                    <Tooltip id='tooltip-renewing'>
                      Assinaturas ativas que terão a próxima cobrança nos
                      próximos 7 ou 30 dias. Útil para planejamento de receita
                      futura.
                    </Tooltip>
                  }
                >
                  <i
                    className='bx bx-info-circle'
                    style={{
                      cursor: 'help',
                      fontSize: '1rem',
                      opacity: 0.7,
                    }}
                  />
                </OverlayTrigger>
              </div>
              <span className='fs-14'>
                {!loadingMetrics && (
                  <>
                    A Renovar
                    <span
                      className='d-block mt-1'
                      style={{ fontSize: '0.75rem' }}
                    >
                      Próximos 30 dias: {metrics.renewing?.next30Days || 0}
                      <br />
                      Próximos 7 dias: {metrics.renewing?.next7Days || 0}
                    </span>
                  </>
                )}
                {loadingMetrics && (
                  <i
                    className='bx bx-loader-alt bx-spin'
                    style={{ fontSize: 25 }}
                  />
                )}
              </span>
            </div>
          </div>
        </Col>

        {/* Churn */}
        <Col md={6} lg={3}>
          <div className='card'>
            <div className='card-body p-3 d-flex flex-column justify-content-center'>
              <div className='d-flex align-items-center justify-content-between mb-1'>
                <h2 className='fs-24 font-w600 mb-0'>
                  {!loadingMetrics && (metrics.churn?.total || 0)}
                  {loadingMetrics && (
                    <i
                      className='bx bx-loader-alt bx-spin'
                      style={{ fontSize: 25 }}
                    />
                  )}
                </h2>
                <OverlayTrigger
                  placement='top'
                  overlay={
                    <Tooltip id='tooltip-churn'>
                      Total de assinaturas canceladas neste mês. Churn
                      voluntário: cancelamento pelo cliente (sem problemas de
                      pagamento). Churn involuntário: cancelamento por falha na
                      cobrança (após tentativas de pagamento).
                    </Tooltip>
                  }
                >
                  <i
                    className='bx bx-info-circle'
                    style={{
                      cursor: 'help',
                      fontSize: '1rem',
                      opacity: 0.7,
                    }}
                  />
                </OverlayTrigger>
              </div>
              <span className='fs-14'>
                {!loadingMetrics && (
                  <>
                    Churn do Mês
                    <span
                      className='d-block mt-1'
                      style={{ fontSize: '0.75rem' }}
                    >
                      {metrics.churn?.rate || 0}%
                      <br />
                      Voluntário: {metrics.churn?.voluntary || 0}
                      <br />
                      Involuntário: {metrics.churn?.involuntary || 0}
                    </span>
                  </>
                )}
                {loadingMetrics && (
                  <i
                    className='bx bx-loader-alt bx-spin'
                    style={{ fontSize: 25 }}
                  />
                )}
              </span>
            </div>
          </div>
        </Col>

        {/* Volume de Pagamento */}
        <Col md={6} lg={3}>
          <div className='card'>
            <div className='card-body p-3 d-flex flex-column justify-content-center'>
              <div className='d-flex align-items-center justify-content-between mb-1'>
                <h2 className='fs-24 font-w600 mb-0'>
                  {!loadingMetrics && formatCurrency(metrics.monthlyRevenue)}
                  {loadingMetrics && (
                    <i
                      className='bx bx-loader-alt bx-spin'
                      style={{ fontSize: 25 }}
                    />
                  )}
                </h2>
                <OverlayTrigger
                  placement='top'
                  overlay={
                    <Tooltip id='tooltip-monthly-revenue'>
                      Soma de todas as cobranças de assinaturas que foram pagas
                      e confirmadas no mês atual. Considera apenas pagamentos
                      com status &quot;Pago&quot;.
                    </Tooltip>
                  }
                >
                  <i
                    className='bx bx-info-circle'
                    style={{
                      cursor: 'help',
                      fontSize: '1rem',
                      opacity: 0.7,
                    }}
                  />
                </OverlayTrigger>
              </div>
              <span className='fs-14'>
                {!loadingMetrics && 'Receita do Mês'}
                {loadingMetrics && (
                  <i
                    className='bx bx-loader-alt bx-spin'
                    style={{ fontSize: 25 }}
                  />
                )}
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Distribuição por Planos */}
      {metrics.planDistribution && metrics.planDistribution.length > 0 && (
        <>
          <Row className='mb-3'>
            <Col>
              <h5 className='mb-0'>
                <i className='bx bx-pie-chart-alt-2' /> Distribuição por Planos
              </h5>
            </Col>
          </Row>
          <Row className='mb-4'>
          {metrics.planDistribution.map((plan) => (
            <Col key={plan.type} md={6} lg={3}>
              <div className='card'>
                <div className='card-body p-3 d-flex flex-column justify-content-center'>
                  <div className='d-flex align-items-center justify-content-between mb-1'>
                    <h2 className='fs-24 font-w600 mb-0'>
                      {!loadingMetrics && (plan.count || 0)}
                      {loadingMetrics && (
                        <i
                          className='bx bx-loader-alt bx-spin'
                          style={{ fontSize: 25 }}
                        />
                      )}
                    </h2>
                    <OverlayTrigger
                      placement='top'
                      overlay={
                        <Tooltip id={`tooltip-plan-${plan.type}`}>
                          Número de assinaturas do plano {plan.type}. 
                          {plan.revenue !== undefined && (
                            <> Receita total: {formatCurrency(plan.revenue)}</>
                          )}
                          {plan.percentage !== undefined && (
                            <> Representa {plan.percentage}% do total de assinaturas.</>
                          )}
                        </Tooltip>
                      }
                    >
                      <i
                        className='bx bx-info-circle'
                        style={{
                          cursor: 'help',
                          fontSize: '1rem',
                          opacity: 0.7,
                        }}
                      />
                    </OverlayTrigger>
                  </div>
                  <span className='fs-14'>
                    {!loadingMetrics && (
                      <>
                        {plan.type}
                        {plan.revenue !== undefined && (
                          <span
                            className='d-block mt-1'
                            style={{ fontSize: '0.75rem' }}
                          >
                            {formatCurrency(plan.revenue)}
                          </span>
                        )}
                        {plan.percentage !== undefined && (
                          <div className='mt-2'>
                            <div
                              className='progress'
                              style={{
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: '#e9ecef',
                              }}
                            >
                              <div
                                className='progress-bar'
                                role='progressbar'
                                style={{
                                  width: `${plan.percentage}%`,
                                  backgroundColor: '#0f1b35',
                                }}
                                aria-valuenow={plan.percentage}
                                aria-valuemin='0'
                                aria-valuemax='100'
                              />
                            </div>
                            <small
                              className='text-muted d-block mt-1'
                              style={{ fontSize: '0.75rem' }}
                            >
                              {plan.percentage}% do total
                            </small>
                          </div>
                        )}
                      </>
                    )}
                    {loadingMetrics && (
                      <i
                        className='bx bx-loader-alt bx-spin'
                        style={{ fontSize: 25 }}
                      />
                    )}
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        </>
      )}
    </>
  );
};

export default MetricsCards;
