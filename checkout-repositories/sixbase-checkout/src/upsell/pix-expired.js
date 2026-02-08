import PropTypes from 'prop-types';

const PixExpired = ({ generateNew }) => {
  return (
    <>
      <div className='redo-pix'>
        <div
          className='copy'
          title='Copiar código pix.'
          onClick={() => generateNew(true)}
        >
          <i className='las la-redo-alt'></i>
          <span>Gerar novo QrCode PIX</span>
        </div>
      </div>
    </>
  );
};

PixExpired.propTypes = {
  generateNew: PropTypes.func,
};

export default PixExpired;
