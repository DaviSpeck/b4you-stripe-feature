import { Fragment, useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import Cleave from 'cleave.js/react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import DataTable from '../../jsx/components/DataTable';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import api from '../../providers/api';
import regexEmail from '../../utils/regex-email';
import './styles.scss';
import { notify } from '../functions';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import formatDate from '../../utils/formatters';
import moment from 'moment';
import CurrencyInput from 'react-currency-input';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import AlertDS from '../../jsx/components/design-system/AlertDS';

const PageProductsEditCoproduction = () => {
  const [objectData, setObjectData] = useState({ data: [], columns: [] });
  const [modalInviteShow, setModalInviteShow] = useState(false);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [modalChangeCommissionShow, setModalChangeCommissionShow] =
    useState(false);

  const [product, setProduct] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [activeCoproduction, setActiveCoproduction] = useState(null);
  const [alert, setAlert] = useState(null);
  const [maxCommission, setMaxCommission] = useState(null);
  const { register, handleSubmit, errors, control, formState, getValues } =
    useForm({
      mode: 'onChange',
    });
  const { uuidProduct } = useParams();

  const { isValid } = formState;

  useEffect(() => {
    if (!modalInviteShow && !modalCancelShow && !modalChangeCommissionShow) {
      fetchData();
    }
    setAlert(null);
  }, [modalInviteShow, modalCancelShow, modalChangeCommissionShow]);

  const fetchData = () => {
    api
      .get('/products/coproduction/' + uuidProduct)
      .then((response) => {
        setTimeout(() => {
          setRequesting(false);
          setDataTable(response.data);
        }, 10);
      })
      .catch(() => {});

    api
      .get('/products/product/' + uuidProduct)
      .then((response) => {
        setProduct(response.data);
      })
      .catch(() => {});
  };

  const setDataTable = (rows) => {
    let preparedData = [];
    rows.forEach((item) => {
      let newRow = [
        item.user.full_name,
        formatDate(item.created_at),
        item.commission_percentage + '%',
        item.expires_at === 'Vitalício'
          ? item.expires_at
          : moment(item.expires_at).format(`DD/MM/YYYY`),
        item.status.name,
        renderActions(item),
      ];
      preparedData.push(newRow);
    });

    const object = {
      data: preparedData,
      columns: [
        'Coprodutor',
        'Convidado em',
        'Comissão',
        'Expiração',
        'Status',
        'Ações',
      ],
    };

    setObjectData(object);
  };

  const renderActions = (coprod) => {
    return (
      <>
        {coprod.status.id === 1 || coprod.status.id === 2 ? (
          <div className='d-flex justify-content-start'>
            <div className='mr-1'>
              <ButtonDS
                size={'icon'}
                variant='primary'
                onClick={() => {
                  setActiveCoproduction(coprod);
                  setModalChangeCommissionShow(true);
                }}
              >
                <i className='bx bxs-pencil'></i>
              </ButtonDS>
            </div>
            <div>
              <ButtonDS
                size={'icon'}
                variant='danger'
                onClick={() => {
                  setActiveCoproduction(coprod);
                  setModalCancelShow(true);
                }}
              >
                <i className='bx bx-x' style={{ fontSize: 20 }}></i>
              </ButtonDS>
            </div>
          </div>
        ) : (
          <>
            <div className='d-block text-center'>-</div>
          </>
        )}
      </>
    );
  };

  const onSubmit = (data) => {
    data.expires_at = parseInt(data.expires_at);

    setMaxCommission(null);
    setAlert(null);
    setRequesting('post');

    api
      .post('/products/coproduction/' + uuidProduct + '/invite', data)
      .then(() => {
        setModalInviteShow(false);
        notify({
          message: 'Coprodutor convidado com sucesso',
          type: 'success',
        });
        setRequesting(null);
      })
      .catch((err) => {
        if (err.response.data.code === 400) {
          setAlert(err.response.data.message);

          if (err.response.data.available) {
            setMaxCommission(err.response.data.available);
          }
        }
        notify({ message: 'Falha ao convidar coprodutor', type: 'error' });
        setRequesting(null);
      });
  };

  const handleCancel = () => {
    api
      .post(
        '/products/coproduction/' +
          uuidProduct +
          '/cancel/' +
          activeCoproduction.uuid
      )
      .then(() => {
        notify({
          message: 'Coprodutor removido com sucesso',
          type: 'success',
        });
        setModalCancelShow(false);
      })
      .catch(() => {
        notify({ message: 'Falha ao remover coprodutor', type: 'error' });
      });
  };

  const handleChangeCommission = () => {
    setRequesting(true);

    let fields = {
      commission: parseFloat(getValues('commission')),
    };

    api
      .put(
        `/products/coproduction/${uuidProduct}/${activeCoproduction.uuid}`,
        fields
      )
      .then(() => {
        notify({ message: 'Comissão salva com sucesso', type: 'success' });

        setModalChangeCommissionShow(false);
        setRequesting(false);
      })
      .catch(() => {
        notify({ message: 'Falha ao salvar comissão', type: 'error' });
        setRequesting(false);
      });
  };

  return (
    <Fragment>
      {modalInviteShow && (
        <>
          <ModalGeneric
            title={'Convidar Coprodutor'}
            show={modalInviteShow}
            setShow={setModalInviteShow}
            centered
          >
            <Row>
              {alert && (
                <Col md={12}>
                  <div className='alert alert-danger alert-sm text-center'>
                    {alert}
                    {maxCommission && (
                      <b className='d-block'>
                        Máxima comissão disponível é de {maxCommission}%
                      </b>
                    )}
                  </div>
                </Col>
              )}
              <Col className='mb-4'>
                <AlertDS
                  warn={'Aviso:'}
                  variant={'primary'}
                  text={`
                  a soma das divisões não pode exceder 99%.
                `}
                  size={'sm'}
                />
              </Col>
              <Col md={12}>
                <Form.Group>
                  <label htmlFor=''>E-mail do Coprodutor</label>
                  <Form.Control
                    ref={register({
                      required: true,
                      validate: (value) => {
                        return regexEmail(value);
                      },
                    })}
                    name='email'
                    type='email'
                    isInvalid={errors.email}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <label htmlFor=''>Duração do Contrato</label>
                  <Form.Control ref={register} as='select' name='expires_at'>
                    <option value='0'>Eterno</option>
                    <option value='30'>30 dias</option>
                    <option value='60'>60 dias</option>
                    <option value='90'>90 dias</option>
                    <option value='180'>180 dias</option>
                    <option value='365'>365 dias</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <label htmlFor=''>
                    Comissão <small>(mín 0.1 e máx 98%)</small>
                  </label>

                  <Controller
                    render={(
                      { onChange, onBlur, value, name, ref },
                      { invalid }
                    ) => (
                      <Cleave
                        name={name}
                        onBlur={onBlur}
                        className={
                          invalid ? 'form-control is-invalid' : 'form-control'
                        }
                        onChange={(e) => {
                          const raw = parseFloat(e.target.rawValue);
                          if (raw) onChange(raw);
                        }}
                        value={value}
                        ref={ref}
                        options={{
                          prefix: '% ',
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralPositiveOnly: true,
                          rawValueTrimPrefix: true,
                          numeralDecimalMark: '.',
                        }}
                      />
                    )}
                    control={control}
                    name='commission'
                    defaultValue={10}
                    rules={{
                      required: true,
                      validate: (value) => {
                        if (value) if (value >= 0.1 && value < 99) return true;
                        return false;
                      },
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={12} className=' d-flex justify-content-end'>
                <ButtonDS
                  size={'sm'}
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isValid || requesting === 'post'}
                >
                  {requesting !== 'post' ? 'Convidar' : 'enviando convite...'}
                </ButtonDS>
              </Col>
            </Row>
          </ModalGeneric>
        </>
      )}
      {modalCancelShow && (
        <ConfirmAction
          title={'Cancelar Coprodução'}
          show={modalCancelShow}
          setShow={setModalCancelShow}
          handleAction={handleCancel}
          confirmText={activeCoproduction.user.full_name}
          description={`No momento que você cancelar este contrato, o coprodutor deixará
          de receber pagamentos referente as vendas do produto 
          ${
            product.name
          }. Contudo, você sempre poderá convidar este usuário a ser um
         coprodutor novamente.
          Você tem certeza que quer cancelar o contrato de ${
            activeCoproduction.commission_percentage
          }% com o usuário
           ${' ' + activeCoproduction.user.full_name}?`}
          centered
        />
      )}

      {modalChangeCommissionShow && (
        <ModalGeneric
          show={modalChangeCommissionShow}
          setShow={setModalChangeCommissionShow}
          title={'Alterar comissão'}
          centered
        >
          <Row>
            <Col>
              <div className='mb-2'>
                <b>Comissão Atual:</b>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '56px',
                }}
              >
                {activeCoproduction.commission_percentage}%
              </div>
            </Col>
            <Col>
              <div className='mb-2'>
                <b>Nova Comissão:</b>
              </div>
              <div>
                <Controller
                  as={CurrencyInput}
                  control={control}
                  name='commission'
                  suffix='%'
                  selectAllOnFocus
                  className={
                    errors.comission
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  rules={{
                    required: true,
                    validate: (value) => {
                      if (isNaN(value)) {
                        if (
                          parseFloat(value.replace('%', '')) > 0 &&
                          parseFloat(value.replace('%', '')) < 100
                        ) {
                          return true;
                        } else {
                          return false;
                        }
                      } else {
                        return false;
                      }
                    },
                  }}
                  precision='0'
                  maxLength={3}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <small className='mt-2 d-block'>
                Comissão mínima de 0.1% e máxima de 99%.
              </small>
            </Col>
          </Row>
          <Row>
            <Col className='d-flex justify-content-between mt-4'>
              <ButtonDS
                size={'sm'}
                variant='light'
                onClick={() => {
                  setModalChangeCommissionShow(false);
                }}
              >
                Voltar
              </ButtonDS>
              <ButtonDS
                size={'sm'}
                variant='primary'
                onClick={handleChangeCommission}
                disabled={!isValid || requesting}
              >
                {!requesting ? 'Alterar' : 'Alterando...'}
              </ButtonDS>
            </Col>
          </Row>
        </ModalGeneric>
      )}

      <section id='coproduction'>
        <Row>
          <Col>
            <DataTable
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página',
                rangeSeparatorText: 'de',
                selectAllRowsItem: true,
                selectAllRowsItemText: 'Todos',
              }}
              title='Coproduções'
              object={objectData}
              perPage={10}
              unit={'coproduções'}
              skeleton={requesting}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <ButtonDS
              onClick={() => {
                setModalInviteShow(true);
              }}
              size='md'
            >
              Convidar Coprodutor
            </ButtonDS>
          </Col>
        </Row>
      </section>
    </Fragment>
  );
};

export default PageProductsEditCoproduction;
