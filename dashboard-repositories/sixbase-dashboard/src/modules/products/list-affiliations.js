import { Fragment, useEffect, useState } from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import './styles.scss';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import { notify } from '../functions';

const PageProductsAffiliationList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api
      .get('/products/affiliates?size=100')
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(() => {});
  };

  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const cancelAffiliation = () => {
    api
      .put(`/products/affiliates/${activeItem.uuid}`)
      .then(() => {
        fetchData();
        setModalCancelShow(false);
        setActiveItem(null);
        notify({
          message: 'Afiliação cancelada com sucesso.',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao cancelar afiliação.',
          type: 'error',
        });
      });
  };

  return (
    <Fragment>
      <ConfirmAction
        title={'Cancelar afiliação'}
        show={modalCancelShow}
        setShow={setModalCancelShow}
        handleAction={cancelAffiliation}
        buttonText={'Cancelar afiliação'}
        variant={'danger'}
        variantButton={'danger'}
        textAlert={'Você deseja cancelar afiliação?'}
        simpleConfirm
        centered
      />

      <section id='pageProductsList'>
        <PageTitle
          title='Minhas Afiliações'
          path={[
            { url: '/produtos', text: 'Produtos' },
            { url: null, text: 'Minhas Afiliações' },
          ]}
        />
        <Row>
          <Col lg={12}>
            <Card>
              <Card.Body>
                {!loading && (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th width='350'>
                          <strong>Nome</strong>
                        </th>
                        <th width='150'>
                          <strong>Tipo</strong>
                        </th>
                        <th width='150'>
                          <strong>Pagamento</strong>
                        </th>
                        <th width='120' className='text-center'>
                          <strong>Status</strong>
                        </th>
                        <th className='text-center' width='120'>
                          <strong>Ações</strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? (
                        products.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>
                                {item.type === 'video'
                                  ? 'Vídeo'
                                  : item.type === 'physical'
                                  ? 'Físico'
                                  : 'E-book'}
                              </td>
                              <td>
                                {item.payment_type === 'single'
                                  ? 'Único'
                                  : 'Assinatura'}
                              </td>
                              <td className='text-center'>
                                {item.status && (
                                  <BadgeDS variant={item.status.color} disc>
                                    {item.status.label}
                                  </BadgeDS>
                                )}
                              </td>
                              <td className='d-flex justify-content-center'>
                                <Link
                                  to={`/vitrine/produto/${item.slug}/${item.uuid}`}
                                >
                                  <ButtonDS size='icon'>
                                    <i className='bx bxs-cart'></i>
                                  </ButtonDS>
                                </Link>
                                {(item.status.id === 1 ||
                                  item.status.id === 2) && (
                                  <ButtonDS
                                    size='icon'
                                    variant='danger'
                                    className={'ml-2'}
                                    onClick={() => {
                                      setModalCancelShow(true);
                                      setActiveItem(item);
                                    }}
                                  >
                                    <i className='bx bx-x'></i>
                                  </ButtonDS>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan='100' className='text-center'>
                            Nenhum produto registrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
                {loading && (
                  <Loader
                    title='Carregando produtos...'
                    style={{ padding: '50px' }}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </Fragment>
  );
};

export default PageProductsAffiliationList;
