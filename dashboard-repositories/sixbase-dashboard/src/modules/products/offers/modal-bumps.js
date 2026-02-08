import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { currency } from '../../functions';
import OrderBumpForm from './order-bumb-form';

const ModalBump = ({
  activeOffer,
  setActiveOffer,
  uuidProduct,
  setShowModal,
  setShowModalBumps,
}) => {
  const [nav, setNav] = useState('list');
  const [activeBump, setActiveBump] = useState(null);

  useEffect(() => {
    setActiveBump(null);
  }, [activeOffer]);

  return (
    <>
      {activeOffer && (
        <>
          {nav === 'list' ? (
            <>
              <small className='mb-3 d-flex'>
                Order bumps são ofertas adicionais em seu checkout.
                {/*  <div className='ml-2'>
                  <ButtonDS variant='link' style={{ fontSize: '13px' }}>
                    <a href='#'>Saiba mais.</a>
                  </ButtonDS>
                </div> */}
              </small>
              <div className='table-responsive'>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>
                        Preço <b>De</b>
                      </th>
                      <th>
                        Preço <b>Por</b>
                      </th>
                      <th className='text-center' width='100'>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOffer.order_bumps.map((item, index) => {
                      return (
                        <tr className='small mb-2' rel='inactive' key={index}>
                          <td>{item.product.name}</td>
                          <td>{currency(item.price_before)}</td>
                          <td>
                            {item.product.payment_type === 'subscription'
                              ? currency(
                                item.plans && item.plans.length > 0
                                  ? item.plans[0].price || 0
                                  : 0
                              )
                              : currency(item.offer.price || 0)
                            }
                          </td>
                          <td className='text-center'>
                            <Button
                              size='xs'
                              onClick={() => {
                                setNav('form');
                                setActiveBump(item);
                              }}
                              className='shadow sharp mr-1'
                            >
                              <i className='fa fa-pencil' />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {activeOffer.order_bumps.length === 0 && (
                      <tr>
                        <td colSpan='100' className='text-center'>
                          Não há order bumps para essa oferta.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div className='d-flex justify-content-end mt-3'>
                <ButtonDS
                  variant='primary'
                  size='sm'
                  onClick={() => {
                    setNav('form');
                    setActiveBump(null);
                  }}
                >
                  Novo Order Bump
                </ButtonDS>
              </div>
            </>
          ) : (
            <>
              <OrderBumpForm
                setNav={setNav}
                activeOffer={activeOffer}
                setActiveOffer={setActiveOffer}
                activeBump={activeBump}
                setActiveBump={setActiveBump}
                uuidProduct={uuidProduct}
                showQuantity={activeBump?.show_quantity}
                setShowModal={setShowModal}
                setShowModalBumps={setShowModalBumps}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default ModalBump;
