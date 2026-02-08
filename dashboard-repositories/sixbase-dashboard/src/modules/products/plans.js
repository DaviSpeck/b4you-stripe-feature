import { Fragment, useEffect, useState } from 'react';
import { Card, Col, Modal, Row, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Currency from '../../jsx/components/Currency';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import api from '../../providers/api';
import { notify } from '../functions';
import ModalCreate from '../plans/modal-create';
import './styles.scss';

const PageProductsEditPlans = () => {
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const { uuidProduct } = useParams();
  const [plans, setPlans] = useState([]);
  const [frequencies, setFrequencies] = useState([]);

  useEffect(() => {
    if (!showModalCreate) {
      if (!showModalDelete) {
        fetchData();
      }
    }
  }, [showModalCreate, showModalDelete]);

  const fetchData = () => {
    api
      .get(`/products/plans/${uuidProduct}`)
      .then((response) => {
        setPlans(response.data);
      })
      .catch(() => {});

    if (frequencies.length === 0) {
      api
        .get(`/products/plans/${uuidProduct}/frequencies`)
        .then((response) => {
          setFrequencies(response.data);
        })
        .catch(() => {});
    }
  };

  const handleDelete = (plan) => {
    setShowModalDelete(true);
    setActivePlan(plan);
  };

  const resolvePaymentConfig = ({ charge_first, subscription_fee }) => {
    if (charge_first && subscription_fee) return 'Adesão e primeira parcela';
    if (!charge_first && !subscription_fee) return 'Preço do plano';
    return 'Apenas adesão';
  };

  const handleDeletePlan = () => {
    api
      .delete(`/products/plans/${uuidProduct}/${activePlan.uuid}`)
      .then(() => {
        notify({ message: 'Plano excluido com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Falha ao excluir plano', type: 'error' });
      })
      .finally(() => {
        setShowModalDelete(false);
      });
  };

  return (
    <Fragment>
      {showModalCreate === true && (
        <Modal
          show={showModalCreate}
          centered
          size='lg'
          onHide={() => {
            setShowModalCreate(false);
          }}
        >
          <ModalCreate
            uuidProduct={uuidProduct}
            frequencies={frequencies}
            setShowModalCreate={setShowModalCreate}
          />
        </Modal>
      )}
      {showModalDelete === true && (
        <ConfirmAction
          title={'Excluir plano'}
          show={showModalDelete}
          setShow={setShowModalDelete}
          handleAction={handleDeletePlan}
          buttonText='Excluir'
          description={
            'Ao apertar o botão abaixo o plano será excluída permanentemente'
          }
          centered
          simpleConfirm
        />
      )}
      <section id='plans'>
        <Row>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th width='400'>Plano</th>
                      <th width='150'>Preço</th>
                      <th width='120'>Frequência</th>
                      <th width='260'>Preço Adesão</th>
                      <th width='260'>Primeira cobrança</th>
                      <th width='100' className='text-center'>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.label}</td>
                          <td>
                            <Currency amount={item.price} />
                          </td>
                          <td>{item.frequency_label}</td>
                          <td>
                            <Currency amount={item.subscription_fee_price} />
                          </td>
                          <td>
                            {resolvePaymentConfig({
                              subscription_fee: item.subscription_fee,
                              charge_first: item.charge_first,
                            })}
                          </td>
                          <td className='d-flex justify-content-center'>
                            <ButtonDS
                              size={'icon'}
                              variant='danger'
                              onClick={() => {
                                handleDelete(item);
                              }}
                            >
                              <i class='bx bx-trash-alt'></i>
                            </ButtonDS>
                          </td>
                        </tr>
                      );
                    })}
                    {plans.length === 0 && (
                      <tr>
                        <td colSpan='100' className='text-center'>
                          Não há planos registrados para seu produto.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <ButtonDS
              onClick={() => {
                setShowModalCreate(true);
              }}
              size='sm'
            >
              Novo Plano
            </ButtonDS>
          </Col>
        </Row>
      </section>
    </Fragment>
  );
};

export default PageProductsEditPlans;
