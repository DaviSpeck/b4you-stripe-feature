import { useEffect, useState } from 'react';
import { Col, Form, Row, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Currency from '../../../jsx/components/Currency';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import Switch from 'react-switch';
import './modal-offer.scss';
import { toast } from 'react-toastify';

const PlansList = ({ activeOffer, setActiveOffer, uuidProduct }) => {
  const [requesting, setRequesting] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansAll, setPlansAll] = useState(null);
  const [isPlanDiscountMessage, setIsPlanDiscountMessage] = useState(false);

  const { register, getValues, setValue, formState } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  useEffect(() => {
    fetchData();
  }, [activeOffer]);

  const fetchData = () => {
    if (activeOffer) {
      api
        .get(`/products/plans/${uuidProduct}/${activeOffer.uuid}`)
        .then((response) => {
          setPlans(response.data);
        })
        .catch(() => {});

      api
        .get(`/products/plans/${uuidProduct}`)
        .then((response) => {
          setPlansAll(response.data);
        })
        .catch(() => {});
    }
  };

  const handleUpdateMessageDiscount = async (isActive) => {
    try {
      await api.put(`/products/offers/${uuidProduct}/${activeOffer.uuid}`, {
        is_plan_discount_message: isActive,
      });
      toast.success('Status de economia foi atualizado com sucesso');
    } catch (error) {
      return error;
    }
  };

  const handleLink = () => {
    let planSelected = getValues('plan');

    if (planSelected !== null) {
      if (planSelected !== '-1') {
        api
          .post(
            `/products/offers/${uuidProduct}/${activeOffer.uuid}/plan/link/${planSelected}`
          )
          .then((response) => {
            setRequesting(false);
            setValue('plan', '-1', { shouldValidate: true });
            fetchData();

            let newOffer = activeOffer;
            newOffer.plans = response.data;
            setActiveOffer(newOffer);
          })
          .catch(() => {});
      }
    }
  };

  const handleUnlink = (plan) => {
    setRequesting(plan.uuid);

    api
      .delete(
        `/products/offers/${uuidProduct}/${activeOffer.uuid}/plan/unlink/${plan.uuid}`
      )
      .then((response) => {
        fetchData();
        setRequesting(false);

        let newOffer = activeOffer;
        newOffer.plans = response.data;
        setActiveOffer(newOffer);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (activeOffer?.is_plan_discount_message) {
      setIsPlanDiscountMessage(activeOffer.is_plan_discount_message);
    }
  }, [activeOffer]);

  return (
    <>
      {activeOffer ? (
        <>
          <Row>
            <Col md={12}>
              {activeOffer && plansAll && plansAll.length > 0 && (
                <div>
                  <div>
                    <div className='d-block'>
                      <label htmlFor='newPlan' className='mb-2'>
                        Selecione o plano
                      </label>
                    </div>
                    <div className='d-flex align-items-center mb-4'>
                      <Form.Control
                        ref={register({
                          required: true,
                          validate: (value) => value !== '-1',
                        })}
                        id='newPlan'
                        as='select'
                        name='plan'
                        style={{
                          width: 250,
                          display: 'inline',
                          margin: '0 15px',
                          marginLeft: '0px',
                        }}
                      >
                        <option value='-1'>Selecione...</option>
                        {plans.map((item, index) => {
                          return (
                            <option key={index} value={item.uuid}>
                              {item.label}
                            </option>
                          );
                        })}
                      </Form.Control>
                      <ButtonDS
                        variant='primary'
                        size={'sm'}
                        onClick={handleLink}
                        disabled={!isValid || plans.length === 0}
                      >
                        Incluir Plano
                      </ButtonDS>
                    </div>
                  </div>
                  <div
                    style={{ paddingBottom: '28px', gap: '4px' }}
                    className='d-flex align-items-center'
                  >
                    <Switch
                      className='react-switch'
                      htmlFor='switch-show-discount-message'
                      checked={isPlanDiscountMessage}
                      checkedIcon={false}
                      uncheckedIcon={false}
                      onColor='#0f1b35'
                      onHandleColor='#fff'
                      boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                      activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                      handleDiameter={24}
                      height={20}
                      width={40}
                      onChange={() => {
                        setIsPlanDiscountMessage((prev) => !prev);
                        handleUpdateMessageDiscount(!isPlanDiscountMessage);
                      }}
                    />
                    <label
                      style={{ margin: '0px' }}
                      id='switch-show-discount-message'
                    >
                      Exibir mensagem de economia para planos com período maior
                    </label>
                  </div>
                </div>
              )}
              {plansAll !== null && plansAll.length === 0 && (
                <div className='alert alert-danger small'>
                  <b>Não há planos para seu produto ainda.</b> Crie novos planos
                  de assinatura{' '}
                  <Link to={`/produtos/editar/${uuidProduct}/planos`}>
                    clicando aqui.
                  </Link>
                </div>
              )}
            </Col>
            <Col>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Plano</th>
                    <th>Preço</th>
                    <th>Frequência</th>
                    <th className='text-center' width='100'>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeOffer.plans.map((item, index) => {
                    return (
                      <tr className='small mb-2' rel='inactive' key={index}>
                        <td md={4}>{item.label}</td>
                        <td md={2}>
                          <Currency amount={item.price} />
                        </td>
                        <td>{item.frequency_label}</td>
                        {/* <td>{item.description}</td> */}
                        <td className='d-flex justify-content-center'>
                          {!requesting ? (
                            <ButtonDS
                              size='icon'
                              variant='danger'
                              onClick={() => {
                                handleUnlink(item);
                              }}
                              className='shadow sharp mr-1'
                            >
                              <i className='bx bx-trash-alt'></i>
                            </ButtonDS>
                          ) : requesting === item.uuid ? (
                            <i
                              className='bx bx-loader-alt bx-spin'
                              style={{ fontSize: 20 }}
                            />
                          ) : (
                            <></>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {activeOffer.plans.length === 0 && (
                    <tr>
                      <td colSpan='100' className='text-center'>
                        Não há planos para essa oferta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <div className='warning-plans-after'>
            Após registrar sua oferta poderá linkar planos de assinatura.
          </div>
        </>
      )}
    </>
  );
};

export default PlansList;
