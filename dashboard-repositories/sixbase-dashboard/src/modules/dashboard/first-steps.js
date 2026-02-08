import { Link } from 'react-router-dom';
import '../../scss/pages/_first-steps.scss';

const FirstSteps = () => {
  return (
    <>
      <div className='first-steps' style={{ marginTop: 100 }}>
        <h2>Seja bem-vindo(a) a B4you!</h2>
        <p>Sua conta está pronta! Escolha abaixo o que deseja fazer</p>

        <div className='first-steps-buttons'>
          <Link className='btn btn-primary' to='/vitrine'>
            Escolha um produto e comece a vender
            <i className='bx bx-store-alt' />
          </Link>

          <Link className='btn btn-primary' to='/produtos/listar'>
            Crie seu primeiro produto <i className='bx bx-plus-circle' />
          </Link>
        </div>
      </div>
    </>
  );
};

export default FirstSteps;
