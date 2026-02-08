import PropTypes from 'prop-types';

const getReturnValues = (countDown) => {
  // calculate time left
  // const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  // const hours = Math.floor(
  //   (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  // );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [minutes, seconds];
};

const PixCountdown = ({ countDown }) => {
  if (!countDown) return <></>;
  const [minutes, seconds] = getReturnValues(countDown);
  return (
    <div className='timer'>
      <div className='clock'>
        <div className='time'>
          {!minutes && !seconds
            ? '05:00'
            : `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`}
        </div>
      </div>
      <div className='description'>
        Você tem 5 min para realizar o pagamento.
      </div>
    </div>
  );
};

PixCountdown.propTypes = {
  countDown: PropTypes.number,
};

export default PixCountdown;
