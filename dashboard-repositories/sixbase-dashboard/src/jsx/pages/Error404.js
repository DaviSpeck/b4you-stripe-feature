import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../images/logo-horizontal.png';
import img404 from '../../images/img-404.svg';
import '../style.scss';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';

const Error404 = () => {
  return (
    <div className='bg-404'>
      <div className='container'>
        <div className='row'>
          <div className='left col-lg-6 col-md-9'>
            <img src={logo} />
            <h1>A página que você está procurando não foi encontrada!</h1>
            <p>
              Você pode ter digitado o endereço incorretamente ou a página pode
              ter sido movida.
            </p>
            <div className='mt-5'>
              <Link to='/'>
                <ButtonDS size='lg' variant='primary'>
                  Voltar para a página principal
                </ButtonDS>
              </Link>
            </div>
          </div>
          <div className='right col-lg-6 col-md-9'>
            <img src={img404} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;
