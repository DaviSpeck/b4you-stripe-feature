import { useEffect, useState } from 'react';
import { Col, Form, FormLabel, Row, Spinner } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import api from '../../providers/api';
import Cleave from 'cleave.js/react';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import { notify } from '../functions';
import ModalEditManagersAffiliates from '../ModalEditManager';

const ModalManager = ({
  setShow,
  activeManager,
  requesting,
  setRequesting,
  alert,
  setAlert,
  uuidProduct,
  setRecords,
  fetchCountAffiliates,
  count = 0,
  loadingCount,
}) => {
  const { register, handleSubmit, control, formState, watch } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;
  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (inputValue && inputValue.includes('@')) {
      fetchOptions(inputValue);
    }
  }, [inputValue]);

  const fetchOptions = async (query) => {
    api
      .get(`products/managers/${uuidProduct}/find?email=${query}`)
      .then((r) => {
        const newOptions = r.data.map((item) => ({
          label: `${item.email} - ${item.full_name}`,
          value: item.id,
        }));
        setOptions(newOptions);
      })
      // eslint-disable-next-line
      .catch((err) => console.log(err));
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleChange = (selectedOption) => {
    setSelectedValue(selectedOption);
  };

  useEffect(() => {
    if (inputValue && inputValue.includes('@')) {
      fetchOptions(inputValue);
    }
  }, [inputValue]);

  const onSubmit = (data) => {
    setAlert(null);
    setRequesting('post');

    let selectedManager = selectedValue;

    if (activeManager) {
      selectedManager = {
        label: `${activeManager.email - activeManager.full_name}`,
        value: activeManager.id,
      };
    }

    if (activeManager) {
      const allow_share_link = data.allow_share_link === 'true';
      api
        .put(
          '/products/managers/' + uuidProduct + `/` + selectedManager.value,
          { ...data, allow_share_link: allow_share_link }
        )
        .then(() => {
          setRecords((prevRecords) => {
            const updatedRecords = prevRecords.map((record) =>
              record.id === activeManager.id
                ? { ...record, ...data, allow_share_link }
                : record
            );
            return updatedRecords;
          });
          setShow(false);
          notify({
            message: 'Gerente editado com sucesso',
            type: 'success',
          });
          setRequesting(null);
        })
        .catch((err) => {
          if (err.response.data.code === 400) {
            setAlert(err.response.data.message);
          }
          notify({ message: 'Falha ao editar gerente', type: 'error' });
          setRequesting(null);
        });
    } else {
      api
        .post('/products/managers/' + uuidProduct + '/', {
          ...data,
          id_manager: selectedManager.value,
        })
        .then(() => {
          setShow(false);

          notify({
            message: 'Gerente convidado com sucesso',
            type: 'success',
          });
          setRequesting(null);
        })
        .catch((err) => {
          if (err.response.data.code === 400) {
            setAlert(err.response.data.message);
          }
          notify({ message: 'Falha ao convidar gerente', type: 'error' });
          setRequesting(null);
        });
    }
  };

  return (
    <div>
      <Row>
        {alert && (
          <Col md={12}>
            <div className='alert alert-danger alert-sm text-center'>
              {alert}
            </div>
          </Col>
        )}
        {activeManager && (
          <Col md={12} className='mb-3'>
            <label>Quantidade de afiliados: </label>
            <ButtonDS onClick={() => setShowModal(true)} iconLeft={'bx-edit'}>
              {loadingCount ? (
                <Spinner size='sm' variant='light' animation='border' />
              ) : (
                `${count} Afiliado(s)`
              )}
            </ButtonDS>
          </Col>
        )}

        <Col md={12}>
          <Form.Group className='mb-2'>
            <FormLabel for='supplier'>E-mail</FormLabel>
            {!activeManager ? (
              <Select
                options={options}
                onInputChange={handleInputChange}
                inputValue={inputValue}
                onChange={handleChange}
                isClearable
                noOptionsMessage={() => {
                  return 'Nenhuma opção disponível';
                }}
                placeholder='Email do gerente'
              />
            ) : (
              <input
                className='form-control'
                value={`${activeManager.email} - ${activeManager.full_name}`}
                disabled
              />
            )}
          </Form.Group>
        </Col>
        <Col>
          <label className='d-block'>
            <div className='mt-2 mb-1'>Tipo de comissão</div>
            <input
              type='radio'
              name='commission_type'
              value='percentage'
              ref={register({ required: true })}
              defaultChecked={
                activeManager
                  ? activeManager?.commission_type === `percentage`
                  : true
              }
            />
            <span className='ml-2'>Porcentagem</span>
          </label>
          <label className='d-block'>
            <input
              type='radio'
              name='commission_type'
              value='fixed'
              ref={register({ required: true })}
              defaultChecked={activeManager?.commission_type === `fixed`}
            />
            <span className='ml-2'>Valor fixo</span>
          </label>
        </Col>
        {watch(`commission_type`) === `percentage` ? (
          <>
            <Col md={12} className='mt-2'>
              <Form.Group>
                <label htmlFor=''>
                  Comissão
                  <small> (mín 0.1 e máx 98%)</small>
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
                  name='commission_with_affiliate'
                  defaultValue={
                    activeManager ? activeManager.commission_with_affiliate : 10
                  }
                  rules={{
                    required: true,
                  }}
                />
              </Form.Group>
            </Col>
          </>
        ) : (
          <>
            <Col md={12} className='mt-2'>
              <Form.Group>
                <label htmlFor=''>
                  Comissão
                  <small> (R$)</small>
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
                    />
                  )}
                  control={control}
                  name='commission_with_affiliate'
                  defaultValue={
                    activeManager ? activeManager.commission_with_affiliate : 10
                  }
                  rules={{
                    required: true,
                  }}
                />
              </Form.Group>
            </Col>
          </>
        )}
        <Col>
          <label className='mt-2 mb-0'>
            Permite divulgar link para afiliação
          </label>
          <Form.Group className='mb-2'></Form.Group>
          <label className='d-block'>
            <input
              type='radio'
              name='allow_share_link'
              value='true'
              defaultChecked={
                activeManager ? activeManager?.allow_share_link : true
              }
              ref={register({ required: true })}
            />
            <span className='ml-2'>Sim</span>
          </label>
          <label className='d-block'>
            <input
              type='radio'
              name='allow_share_link'
              value='false'
              ref={register({ required: true })}
              defaultChecked={
                activeManager && activeManager?.allow_share_link === false
              }
            />
            <span className='ml-2'>Nao</span>
          </label>
        </Col>

        <Col md={12} className=' d-flex justify-content-end'>
          <ButtonDS
            size={'sm'}
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || requesting === 'post'}
          >
            {requesting !== 'post'
              ? !activeManager
                ? 'Convidar'
                : 'Editar'
              : `Carregando...`}
          </ButtonDS>
        </Col>
      </Row>
      {showModal && (
        <ModalEditManagersAffiliates
          show={showModal}
          setShow={(state) => {
            fetchCountAffiliates(activeManager);
            setShowModal(state);
          }}
          manager={activeManager}
        />
      )}
    </div>
  );
};

export default ModalManager;
