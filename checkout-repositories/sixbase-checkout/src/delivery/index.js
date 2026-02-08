import api from 'api';
import Loader from 'Loader';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import './style.scss';
import logo from '../images/logo-horizontal.png';

const Delivery = () => {
  const { uuidSale } = useParams();
  const [requesting, setRequesting] = useState(true);
  const [sale, setSale] = useState(null);
  document.title = 'Compra Aprovada! 🥳';

  useEffect(() => {
    api
      .get(`delivery/${uuidSale}`)
      .then((r) => {
        setSale(r.data);
        setRequesting(false);
      })
      .catch(() => {});
  }, []);

  const redirect = () => {
    window.location = sale.membership_redirect;
  };

  return (
    <section id='delivery'>
      <div className='box'>
        {requesting === true ? (
          <Loader />
        ) : (
          <>
            {!sale === 'not-found' ? (
              <>not found</>
            ) : (
              <>
                <i className='icon la la-check-circle' />
                <h4 className='title'>Compra Aprovada!</h4>
                {sale.products.length === 1 ? (
                  <p>
                    A sua compra de <b>{sale.products[0].name}</b> foi realizada
                    com sucesso.
                  </p>
                ) : (
                  <>
                    <p>Sua compra foi realizada com sucesso.</p>
                    <ul className='products-bought'>
                      {sale.products.map((item, index) => {
                        return (
                          <li key={index}>
                            {item.payment.status.id === 2 ? (
                              <i className='la la-check success' />
                            ) : (
                              <i className='la la-times danger' />
                            )}
                            <span>{item.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}

                <p>
                  {!sale.physical &&
                    'Acesse o conteúdo clicando no botão abaixo:'}
                </p>
                {!sale.physical && (
                  <div className='d-flex justify-content-center text-center'>
                    <Button onClick={redirect}>Acessar meu produto </Button>
                  </div>
                )}

                <small>
                  Enviamos um e-mail para <b>{sale?.student.email}</b> com o
                  resumo da sua transação.
                </small>

                <small>
                  Se não o encontrar na caixa de entrada, certifique-se de
                  verificar a sua pasta de lixo eletrônico ou spam.
                </small>
                <small className='transaction'>Transação {uuidSale}</small>
              </>
            )}
          </>
        )}
      </div>
      <div className='logo mt-4'>
        <img src={logo} alt='' onClick={redirect} />
      </div>
    </section>
  );
};

export default Delivery;
