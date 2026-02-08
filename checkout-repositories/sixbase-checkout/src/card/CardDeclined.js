import { Alert } from 'react-bootstrap';

const CardDeclined = ({ reason }) => {
  return (
    <div className='card-declined'>
      <div className='text-center'>
        <i className='la la-frown great' />
        <h4>Oops, pera aí</h4>
      </div>
      <p>Sua compra não pode ser concluída.</p>
      <p>
        <Alert variant='danger'>{reason}</Alert>
      </p>
      <p>Feche esta janela e tente novamente...</p>
      <small>
        Se o problema persistir{' '}
        <a href='https://b4you.com.br/' target='blank'>
          entre em contato com nosso suporte.
        </a>{' '}
      </small>
    </div>
  );
};

export default CardDeclined;
