import { Link } from 'react-router-dom';

import '../../scss/pages/_welcome-creator.scss';

export const WelcomeCreator = ({ setNav }) => {
  const handleNavigateToDashboard = () => {
    setNav?.('metrics');
  };

  return (
    <>
      <div className='welcome-creator'>
        <img src='/creator-logo.svg' alt='Escola Creator' height={62} />

        <h2>
          Assista às aulas da Escola Creator e aprenda a{' '}
          <span>transformar visualizações em vendas</span>
        </h2>

        <p>Aulas totalmente grátis pra você. Vem?</p>

        <div>
          <Link className='btn btn-primary' to='/escola-creator'>
            Quero aprender agora! 🤩
          </Link>
        </div>
      </div>

      <button className='btn link' onClick={handleNavigateToDashboard}>
        Acessar dashboard B4You
      </button>
    </>
  );
};
