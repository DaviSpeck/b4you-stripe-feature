import { useEffect, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { Controller, useForm } from 'react-hook-form';
import api from '../../providers/api';
import { currency, convertStringToFloat } from '../functions';
import './style.scss';
import { notify } from '../functions';
import { useHistory } from 'react-router-dom';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';

const RequestWithdrawal = ({
  show,
  setShow,
  title,
  footer,
  centered,
  id,
  bankAccount,
  balanceAvailable,
  settings,
  withheld,
  maxWithdrawalAmount,
}) => {
  const [minRequestAmount, setMinRequestAmount] = useState(0);
  const [responseRequest, setResponseRequest] = useState(false);
  const [alert, setAlert] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [requestAmount, setRequestAmount] = useState(null);
  const history = useHistory();
  const { handleSubmit, errors, control, formState, setValue, getValues } =
    useForm({
      mode: 'onChange',
    }); // initialize the hook

  const { isValid } = formState;

  useEffect(() => {
    if (!checkbox) {
      setRequestAmount(null);
    }
  }, [checkbox]);

  const onSubmit = (data) => {
    if (typeof data.requestAmount !== 'number') {
      data.requestAmount = convertStringToFloat(
        data.requestAmount.replace('R$ ', '')
      );
    }
    let fields = {};
    fields.amount = data.requestAmount;
    // return
    setRequesting(true);

    setAlert(null);

    api
      .post('/withdrawals', { amount: data.requestAmount })
      .then(() => {
        notify({ message: 'Saque requisitado com sucesso', type: 'success' });
        setResponseRequest(true);
      })
      .catch((err) => {
        notify({ message: 'Falha ao requisitar saque', type: 'error' });
        setAlert(err.response.data.message);
      })
      .finally(() => setRequesting(false));
  };

  const closeModal = () => {
    setShow(false);
  };

  useEffect(() => {
    if (show) {
      setMinRequestAmount(settings.min_amount_per_request);
    }

    return () => {
      setMinRequestAmount(0);
      setResponseRequest(false);
      setRequesting(false);
      setCheckbox(false);
      setRequestAmount(null);
    };
  }, [show]);

  return (
    <>
      <Modal
        show={show}
        onHide={() => {
          setRequestAmount(null);
          closeModal();
        }}
        centered={centered}
        className='modal-generic'
        size='sm'
        id={id}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title ? title : 'MODAL'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bankAccount.bank !== null ? (
            <>
              {responseRequest === true && (
                <>
                  <div className='text-center'>
                    <h3 className='text-success'>Saque requisitado</h3>
                    <p>
                      Seu pedido de saque foi registrado com sucesso, em até 03
                      dias úteis o valor será depositado em sua conta bancária.
                    </p>
                  </div>
                </>
              )}
              {responseRequest === null ||
                (responseRequest === false && (
                  <div id='request-withdrawal'>
                    {alert && (
                      <div className='alert alert-danger alert-sm text-center cap'>
                        {alert}
                      </div>
                    )}
                    <div className='infos justify-content-center'>
                      <div
                        className={`info-item green-item ${
                          balanceAvailable < 0 && 'danger-item'
                        }`}
                      >
                        <div className='icon'>
                          <i className='bx bx-dollar'></i>
                        </div>
                        <div className='wrap'>
                          <span className='label'>Disponível para Saque</span>
                          <div className='value'>
                            {currency(
                              maxWithdrawalAmount >= 0
                                ? maxWithdrawalAmount
                                : balanceAvailable + withheld
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Row className='wrap-row'>
                      <Col md={12}>
                        <div className='value-withdraw'>
                          <div className='value-wrap'>
                            <div className='wrap-top'>
                              <div className='c-input'>
                                <div
                                  className={`c-input-title ${
                                    !isValid ? 'text-danger' : ''
                                  }`}
                                >
                                  Digite o valor
                                </div>
                                <Controller
                                  as={CurrencyInput}
                                  control={control}
                                  readOnly={checkbox}
                                  name='requestAmount'
                                  placeholder='0,00'
                                  decimalSeparator=','
                                  thousandSeparator='.'
                                  defaultValue='0,00'
                                  prefix={'R$ '}
                                  onChangeEvent={(
                                    event,
                                    maskedvalue,
                                    floatvalue
                                  ) => {
                                    setRequestAmount(floatvalue);
                                  }}
                                  className={` ${
                                    errors.price
                                      ? 'amount form-control is-invalid'
                                      : 'amount form-control'
                                  }
                              ${
                                !isValid ? 'text-danger' : 'text-dark'
                              }                        
                              `}
                                  rules={{
                                    required: true,
                                    validate: (value) => {
                                      typeof value !== 'number' &&
                                        (value = convertStringToFloat(
                                          value.replace('R$ ', '')
                                        ));

                                      if (
                                        value >= minRequestAmount &&
                                        value <= maxWithdrawalAmount
                                      ) {
                                        return true;
                                      } else {
                                        return false;
                                      }
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.target.select();
                                  }}
                                  disabled={
                                    maxWithdrawalAmount < minRequestAmount
                                  }
                                />
                              </div>
                              <div className='fill-total'>
                                <label
                                  htmlFor='totalAmount'
                                  style={{
                                    display: 'flex',
                                    fontSize: 14,
                                    marginTop: 4,
                                    cursor: `${
                                      maxWithdrawalAmount < minRequestAmount
                                        ? 'not-allowed'
                                        : 'pointer'
                                    }`,
                                  }}
                                >
                                  <input
                                    type='checkbox'
                                    id='totalAmount'
                                    value='false'
                                    onChange={(e) => {
                                      setCheckbox(e.target.checked);
                                      let newAmount = 0;
                                      if (e.target.checked) {
                                        newAmount = maxWithdrawalAmount;
                                      }
                                      setValue('requestAmount', newAmount, {
                                        shouldValidate: true,
                                      });
                                    }}
                                    disabled={
                                      maxWithdrawalAmount < minRequestAmount
                                    }
                                    style={{
                                      cursor: `${
                                        maxWithdrawalAmount < minRequestAmount
                                          ? 'not-allowed'
                                          : 'pointer'
                                      }`,
                                    }}
                                  />
                                  Sacar o valor total disponível.
                                </label>
                              </div>
                            </div>
                            <div className='max-withdraw-wrap'>
                              <div className='max-withdraw'>
                                <i className='bx bx-dollar-circle'></i>
                                <span>
                                  Limite de saque disponível:
                                  <div className='price'>
                                    {currency(maxWithdrawalAmount, true)}
                                  </div>
                                </span>
                              </div>
                            </div>
                            <div className='wrap-bottom'>
                              <div className='line'>
                                <span>
                                  Saque mínimo:{' '}
                                  {currency(settings.min_amount_per_request)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='receive-total'>
                            <div className='fee'>
                              <div className='text'>
                                Tarifa de transferência:
                              </div>
                              <div className='value'>
                                {currency(settings.cost)}
                              </div>
                            </div>
                            <div className='total-value'>
                              <div className='text'>Valor + Tarifa:</div>
                              <div className='value'>
                                {checkbox
                                  ? currency(
                                      getValues('requestAmount') + settings.cost
                                    )
                                  : currency(requestAmount + settings.cost)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))}
            </>
          ) : (
            <>
              <h4 className='text-danger'>Nenhuma conta bancária registrada</h4>
              <p>
                Você deve acessar suas configurações e registrar uma conta
                bancária para sua conta.
              </p>
              <p>
                Lembre-se que a conta deve estar vinculada ao seu CPF ou ao seu
                CNPJ se sua conta for jurídica.
              </p>
              <ButtonDS onClick={() => history.push('/configuracoes')}>
                Ir para configurações
              </ButtonDS>
            </>
          )}
        </Modal.Body>
        {footer && !responseRequest && (
          <Modal.Footer>
            <div className='w-100 d-flex justify-content-end'>
              <ButtonDS
                size={'md'}
                variant='primary'
                onClick={handleSubmit(onSubmit)}
                disabled={
                  !isValid ||
                  requesting ||
                  balanceAvailable <= 0 ||
                  bankAccount.bank_code === null
                }
                iconRight='bx-check-circle'
              >
                <span>{!requesting ? 'Efetuar Saque' : 'Requisitando...'}</span>
              </ButtonDS>
            </div>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

export default RequestWithdrawal;
