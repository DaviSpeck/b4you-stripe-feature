import { Col, Row } from 'react-bootstrap';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import { currency } from '../functions';
import './style.scss';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';

const Status = ({ metrics }) => {
  return (
    <div>
      {metrics && (
        <div className='status'>
          <Row>
            <Col>
              <div className='item'>
                <div style={{ width: 97, height: 97 }}>
                  <CircularProgressbarWithChildren
                    value={metrics.approved.percentage.replace('%', '')}
                  >
                    <div className='progress-text'>
                      {metrics.approved.percentage}
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
                <div className='details'>
                  <BadgeDS variant='success' disc>
                    Aprovado
                  </BadgeDS>
                  <div className='amount mt-1'>
                    {currency(metrics.approved.amount)}
                  </div>
                  <div className='count'>{metrics.approved.count} vendas</div>
                </div>
              </div>
              <div className='item'>
                <div style={{ width: 97, height: 97 }}>
                  <CircularProgressbarWithChildren
                    value={metrics.pending.percentage.replace('%', '')}
                  >
                    <div className='progress-text'>
                      {metrics.pending.percentage}
                    </div>
                  </CircularProgressbarWithChildren>
                </div>

                <div className='details'>
                  <BadgeDS variant='light' disc>
                    Aguardando
                  </BadgeDS>
                  <div className='amount mt-1'>
                    {currency(metrics.pending.amount)}
                  </div>
                  <div className='count'>{metrics.pending.count} vendas</div>
                </div>
              </div>
              <div className='item'>
                <div style={{ width: 97, height: 97 }}>
                  <CircularProgressbarWithChildren
                    value={metrics.refund.percentage.replace('%', '')}
                  >
                    <div className='progress-text'>
                      {metrics.refund.percentage}
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
                <div className='details'>
                  <BadgeDS variant='danger' disc>
                    Reembolsado
                  </BadgeDS>
                  <div className='amount mt-1'>
                    {currency(metrics.refund.amount)}
                  </div>
                  <div className='count'>{metrics.refund.count} vendas</div>
                </div>
              </div>
              <div className='item'>
                <div style={{ width: 97, height: 97 }}>
                  <CircularProgressbarWithChildren
                    value={metrics.chargeback.percentage.replace('%', '')}
                  >
                    <div className='progress-text'>
                      {metrics.chargeback.percentage}
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
                <div className='details'>
                  <BadgeDS variant='dark-danger' disc>
                    Chargeback
                  </BadgeDS>
                  <div className='amount mt-1'>
                    {currency(metrics.chargeback.amount)}
                  </div>
                  <div className='count'>{metrics.chargeback.count} vendas</div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default Status;
