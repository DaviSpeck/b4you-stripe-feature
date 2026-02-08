import { Spinner } from 'react-bootstrap';
import imageIconLoading from '../../images/footer-logo.svg';

const LoadingIconB4Y = () => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div class='spinner'></div>
      <Spinner
        size='sm'
        animation='border'
        style={{
          width: '56px',
          height: '56px',
          position: 'absolute',
        }}
        role='status'
      ></Spinner>
      <img className='loading-pulse-icon-b4y' src={imageIconLoading} />
    </div>
  );
};

export default LoadingIconB4Y;
