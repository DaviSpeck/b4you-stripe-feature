import SvgPix from 'SvgPix';

const Navigation = ({
  allowedPaymentMethods,
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div className='pay-info form-group'>
      {allowedPaymentMethods && allowedPaymentMethods.includes('card') && (
        <div className='input-group-2'>
          <div className='area'>
            <button
              type='button'
              id='btn-card'
              className={paymentMethod === 'card' ? 'btn active' : 'btn'}
              onClick={() => setPaymentMethod('card')}
            >
              <i className='las la-credit-card' />
              <span>Cartão de crédito</span>
            </button>
          </div>
        </div>
      )}
      {allowedPaymentMethods && allowedPaymentMethods.includes('pix') && (
        <div className='input-group-2'>
          <div className='area'>
            <button
              type='button'
              id='btn-card'
              className={paymentMethod === 'pix' ? 'btn active' : 'btn'}
              onClick={() => setPaymentMethod('pix')}
            >
              <SvgPix />
              <span>Pix</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;
