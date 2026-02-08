import { useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { Controller, useForm } from 'react-hook-form';
import api from '../../providers/api';
import Switch from 'react-switch';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';

const ModalCreate = ({ uuidProduct, frequencies, setShowModalCreate }) => {
  const [requesting, setRequesting] = useState(false);

  const { register, handleSubmit, errors, control, formState, watch } = useForm(
    {
      mode: 'onChange',
    }
  );

  const allowSubscriptionFee = watch('subscription_fee');

  const { isValid } = formState;

  const onSubmit = (data) => {
    setRequesting('post');

    let fields = data;

    fields.price = parseFloat(
      fields.price.replaceAll('.', '').replace(',', '.')
    );

    api
      .post(`/products/plans/${uuidProduct}`, fields)
      .then(() => {
        setRequesting(false);
        setShowModalCreate(false);
      })
      .catch(() => {
        setRequesting(false);
      });
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Criar Plano</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={5}>
            <Form.Group>
              <label htmlFor=''>Plano</label>
              <Form.Control
                ref={register({ required: true })}
                name='label'
                isInvalid={errors.name}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <label htmlFor=''>Preço</label>
              <Controller
                as={CurrencyInput}
                control={control}
                name='price'
                decimalSeparator=','
                thousandSeparator='.'
                className={
                  errors.price ? 'form-control is-invalid' : 'form-control'
                }
                rules={{
                  required: true,
                  validate: (value) => {
                    let newValue = parseFloat(
                      value.replaceAll('.', '').replace(',', '.')
                    );
                    return newValue > 4.99;
                  },
                }}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <label htmlFor=''>Frequência</label>
            <Form.Control ref={register} as='select' name='payment_frequency'>
              {frequencies.map((item, index) => {
                return (
                  <option value={item.key} key={index}>
                    {item.label}
                  </option>
                );
              })}
            </Form.Control>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col md={5}>
            <div className='d-flex align-items-center'>
              <Controller
                name='subscription_fee'
                control={control}
                render={({ onChange, value, ...rest }, fieldState) => (
                  <Switch
                    {...rest}
                    {...fieldState}
                    checked={value}
                    onChange={(checked) => {
                      onChange(checked);
                    }}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    onColor='#0f1b35'
                    onHandleColor='#fff'
                    boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                    activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                    handleDiameter={24}
                    height={30}
                    width={56}
                    className='react-switch'
                  />
                )}
              />
              <span className='ml-4'>Plano com adesão</span>
            </div>
          </Col>
        </Row>
        {allowSubscriptionFee && (
          <Row>
            <Col md={5}>
              <Form.Group>
                <label htmlFor=''>Preço da adesão</label>
                <Controller
                  control={control}
                  name='subscription_fee_price'
                  rules={{
                    required: true,
                    validate: (value) => {
                      return value > 4.99;
                    },
                  }}
                  render={({ onChange, ...rest }, fieldState) => (
                    <CurrencyInput
                      {...rest}
                      {...fieldState}
                      className={
                        errors.subscription_fee_price
                          ? 'form-control is-invalid'
                          : 'form-control'
                      }
                      decimalSeparator=','
                      thousandSeparator='.'
                      onChangeEvent={(e, maskedValue, floatValue) => {
                        onChange(floatValue);
                      }}
                    />
                  )}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <label>Primeira cobrança</label>
                <Form.Control ref={register} as='select' name='charge_first'>
                  <option value='0'>Apenas adesão</option>
                  <option value='1'>Adesão e primeira parcela</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        )}
        <Row>
          <Col md={12} className='text-left mt-4'>
            <ButtonDS
              size={'sm'}
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || requesting}
            >
              {!requesting ? 'Novo Plano' : 'salvando...'}
            </ButtonDS>
          </Col>
        </Row>
      </Modal.Body>
    </>
  );
};

export default ModalCreate;
