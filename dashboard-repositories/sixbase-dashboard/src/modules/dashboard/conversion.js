import './style.scss';
import IconPix from '../../images/icons/pix.svg';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';

const Conversion = ({ metrics }) => {
  return (
    <div>
      {metrics && (
        <div className='methods'>
          <div className='item'>
            <div style={{ width: 97, height: 97 }}>
              <CircularProgressbarWithChildren
                value={metrics.billet.percentage.replace('%', '')}
              >
                <div className='progress-text'>{metrics.billet.percentage}</div>
              </CircularProgressbarWithChildren>
            </div>
            <div className='details'>
              <div className='title'>
                <i className='bx bx-barcode'></i>
                Boleto
              </div>
              <div className='amount'>{metrics.billet.count_paid} pagos</div>
              <div className='count'>{metrics.billet.count_total} gerados</div>
            </div>
          </div>
          <div className='item'>
            <div style={{ width: 97, height: 97 }}>
              <CircularProgressbarWithChildren
                value={metrics.card.percentage.replace('%', '')}
              >
                <div className='progress-text'>{metrics.card.percentage}</div>
              </CircularProgressbarWithChildren>
            </div>
            <div className='details'>
              <div className='title'>
                <i className='bx bx-credit-card'></i>
                Cartão de Crédito
              </div>
              <div className='amount'>{metrics.card.count_paid} pagos </div>
              <div className='count'>{metrics.card.count_total} tentativas</div>
            </div>
          </div>
          <div className='item'>
            <div style={{ width: 97, height: 97 }}>
              <CircularProgressbarWithChildren
                value={metrics.pix.percentage.replace('%', '')}
              >
                <div className='progress-text'>{metrics.pix.percentage}</div>
              </CircularProgressbarWithChildren>
            </div>
            <div className='details'>
              <div className='title'>
                <img src={IconPix} alt='' />
                PIX
              </div>
              <div className='amount'>{metrics.pix.count_paid} pagos</div>
              <div className='count'>{metrics.pix.count_total} tentativas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversion;
