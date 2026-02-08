import { Fragment, useEffect, useState } from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import './styles.scss';
import { notify } from '../functions';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import moment from 'moment';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ModalCoproductionOffer from './ModalCoproductionOffer';

const PageProductsCoproductions = () => {
  const [modalShow, setModalShow] = useState(false);
  const [coproductions, setCoproductions] = useState([]);
  const [activeCoproduction, setActiveCoproduction] = useState(null);
  const [invites, setInvites] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [modalCoproductionOfferShow, setModalCoproductionOfferShow] =
    useState(false);

  useEffect(() => {
    if (
      modalCancelShow === false &&
      modalShow === false &&
      modalCoproductionOfferShow === false
    ) {
      fetchData();
    }
  }, [modalCancelShow, modalShow]);

  const fetchData = () => {
    api
      .get('/products/coproductions?size=100')
      .then((response) => {
        setCoproductions(response.data.rows);
        setLoading(false);
      })
      .catch(() => {});

    api
      .get('/coproduction')
      .then((response) => {
        setInvites(response.data);
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    api
      .post(`coproduction/${activeCoproduction.uuid}/cancel/`)
      .then(() => {
        notify({
          message: 'Coproducao cancelada com sucesso',
          type: 'success',
        });
        setModalCancelShow(false);
      })
      .catch(() => {
        notify({ message: 'Falha ao cancelar coproducao', type: 'error' });
      });
  };

  const inviteResponse = (response, invite) => {
    setRequesting(true);
    api
      .post(`coproduction/${invite.product.uuid}/${response}`)
      .then(() => {
        notify({ message: 'Salvo com sucesso', type: 'success' });

        setRequesting(false);
        setModalShow(false);
      })
      .catch(() => {
        notify({ message: 'Falha ao salvar com sucesso', type: 'error' });
      });
  };

  return (
    <Fragment>
      <PageTitle
        title='Minhas Coproduções'
        path={[
          { url: '/produtos', text: 'Produtos' },
          { url: null, text: 'Minhas Coproduções' },
        ]}
      />
      <ModalGeneric
        title='Convites de coprodução'
        show={modalShow}
        setShow={setModalShow}
        centered
        size='xl'
      >
        <Table responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Participação</th>
              <th>Contrato</th>
              <th>Produtor</th>
              <th style={{ minWidth: '150px' }} className='text-center'>
                Aceitar ou Rejeitar
              </th>
            </tr>
          </thead>
          <tbody>
            {invites.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.product.name}</td>
                  <td>{item.commission_percentage}%</td>
                  {item.coproduction.expires_at === 'Vitalício' ? (
                    <td>{item.coproduction.expires_at}</td>
                  ) : (
                    <td>
                      {moment(item.coproduction.expires_at).format(
                        'DD/MM/YYYY'
                      )}
                    </td>
                  )}
                  <td>{item.producer.full_name}</td>
                  <td className='text-center'>
                    {!requesting ? (
                      <div className='d-flex justify-content-center'>
                        <div className='mr-1'>
                          <ButtonDS
                            size={'icon'}
                            variant='success'
                            className='mr-4'
                            onClick={() => {
                              inviteResponse('accept', item);
                            }}
                          >
                            <i className='bx bxs-like'></i>
                          </ButtonDS>
                        </div>
                        <div>
                          <ButtonDS
                            size={'icon'}
                            variant='danger'
                            onClick={() => {
                              inviteResponse('reject', item);
                            }}
                          >
                            <i className='bx bxs-dislike'></i>
                          </ButtonDS>
                        </div>
                      </div>
                    ) : (
                      'aguarde...'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ModalGeneric>
      <section id='pageProductsCoproductions'>
        <Row>
          <Col className='d-flex justify-content-between mb-4'>
            <ButtonDS
              variant='primary'
              size='sm'
              onClick={() => {
                setModalShow(true);
              }}
              iconLeft={'bx-envelope'}
              disabled={invites.length === 0}
            >
              Convites Pendentes
              <span
                className='counter'
                style={{
                  background: 'white',
                  color: '#0f1b35',
                  borderRadius: '100%',
                  width: '18px',
                  display: 'inline-block',
                  marginLeft: '8px',
                  fontSize: 12,
                }}
              >
                {invites.length}
              </span>
            </ButtonDS>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Card>
              <Card.Body>
                {!loading && (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>
                          <strong>Nome</strong>
                        </th>
                        <th width='150'>
                          <strong>Tipo Mídia</strong>
                        </th>
                        <th>
                          <strong>Produtor</strong>
                        </th>

                        <th className='text-center'>
                          <strong>Participação</strong>
                        </th>
                        <th>Fatura</th>
                        <th className='text-center'>
                          <strong>Expiração</strong>
                        </th>
                        <th className='text-center'>
                          <strong>Ações</strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {coproductions.length > 0 ? (
                        coproductions.map((item, index) => {
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
                              <td style={{ textTransform: 'capitalize' }}>
                                {item.producer.full_name}
                              </td>

                              <td>{item.rules.commission}%</td>
                              <td>
                                {item.rules.split_invoice
                                  ? 'Dividir'
                                  : 'Produtor'}
                              </td>
                              <td className='small'>
                                {item.rules.expires_at === null
                                  ? 'Vitalício'
                                  : `até ${moment(item.rules.expires_at).format(
                                      'DD/MM/YYYY'
                                    )}`}
                              </td>
                              <td className='small'>
                                <ButtonDS
                                  size={'icon'}
                                  variant='danger'
                                  className='sharp'
                                  onClick={() => {
                                    setActiveCoproduction(item);

                                    setModalCancelShow(true);
                                  }}
                                >
                                  <i
                                    className='bx bx-x'
                                    style={{ fontSize: 20 }}
                                  ></i>
                                </ButtonDS>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan='100' className='text-center'>
                            <p>Você não tem nenhuma coprodução ativa.</p>
                            <p>
                              Faça parcerias e fature mais com outros
                              produtores...
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
                {loading && (
                  <Loader
                    title='Carregando coproduções...'
                    style={{ padding: '50px' }}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
      {activeCoproduction && (
        <ModalCoproductionOffer
          show={modalCoproductionOfferShow}
          setShow={setModalCoproductionOfferShow}
          activeCoproduction={activeCoproduction}
          centered={true}
        />
      )}
      {modalCancelShow && (
        <ConfirmAction
          title={'Cancelar Coprodução'}
          show={modalCancelShow}
          setShow={setModalCancelShow}
          handleAction={handleCancel}
          confirmText={activeCoproduction.name}
          description={`No momento que você cancelar este contrato, você deixará de
          receber pagamentos referente as vendas do produto 
          ${
            activeCoproduction.name
          }. Você tem certeza que quer cancelar o contrato de ${
            activeCoproduction.rules.commission
          }% com o usuário
         ${' ' + activeCoproduction.producer.full_name}?`}
          centered
        />
      )}
    </Fragment>
  );
};

export default PageProductsCoproductions;
