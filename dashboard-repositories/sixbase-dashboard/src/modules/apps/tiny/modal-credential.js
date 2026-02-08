import { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';

const ModalCredential = ({ fetchData, setShow }) => {
  const [requesting, setRequesting] = useState(false);

  const { register, handleSubmit, errors, formState } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  const shippingOptions = [
    { code: "C", label: "Correios" },
    { code: "T", label: "Transportadora" },
    { code: "M", label: "Mercado Envios" },
    { code: "E", label: "Correios E-fulfillment" },
    { code: "B", label: "B2W Entrega" },
    { code: "X", label: "Customizada" },
    { code: "D", label: "ConectaLá Etiquetas" },
    { code: "J", label: "Jadlog" },
    { code: "S", label: "Sem Frete" },
    { code: "TOTALEXPRESS", label: "Total Express" },
    { code: "OLIST", label: "Olist" },
    { code: "GATEWAY", label: "Gateway logístico" },
    { code: "MAGALU_ENTREGAS", label: "Magalu Entregas" },
    { code: "MAGALU_FULFILLMENT", label: "Magalu Fulfillment" },
    { code: "SHOPEE_ENVIOS", label: "Shopee Envios" },
    { code: "NS_ENTREGAS", label: "Netshoes Entregas" },
    { code: "VIAVAREJO_ENVVIAS", label: "Via Varejo Envvias" },
    { code: "ALI_ENVIOS", label: "AliExpress Envios" },
    { code: "MADEIRA_ENVIOS", label: "Madeira Envios" },
    { code: "LOGGI", label: "Loggi" },
    { code: "AMAZON_DBA", label: "Amazon DBA" },
    { code: "NS_MAGALU_ENTREGAS", label: "Magalu Entregas por Netshoes" },
  ];

  const onSubmit = (data) => {
    setRequesting(true);
    api
      .post('/integrations/tiny', {
        token: data.token.trim(),
        methods_shipping:data.methods_shipping,
        shipping_service:data.shipping_service,
        descricao: data.descricao,
        operation_nature: data.operation_nature,
      })
      .then(() => {
        setShow(false);
        fetchData();
        notify({
          message: 'Credencial cadastrada com sucesso!',
          type: 'success',
        });
      })
      .catch((error) => {
        let errorMessage = 'Falha ao criar credencial';

        if (error.response) {
          errorMessage = error.response.data?.mensagem || error.response.data?.message || errorMessage;
        }

        notify({
          message: errorMessage,
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor='token'>Token*:</label>
            <Form.Control
              name='token'
              ref={register({ required: 'Token é obrigatório' })}
              isInvalid={!!errors.token}
            />
            {errors.token && (
              <Form.Control.Feedback type='invalid'>
                {errors.token.message}
              </Form.Control.Feedback>
            )}
          <Form.Group>
            <label htmlFor='product'>Formas de envio</label>
            <Form.Control
              as='select'
              name='methods_shipping'
              ref={register({ required: "Formas de envio é obrigatório" })}
              isInvalid={!!errors.product}
              className='w-100'
            >
              <option value=''>Selecione uma Forma de envio</option>
              {shippingOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </Form.Control>
            {errors.methods_shipping && (
              <Form.Control.Feedback type='invalid'>
                {errors.methods_shipping.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          </Form.Group>
          <Form.Group>
            <label htmlFor='token'>Transportadora*:</label>
            <Form.Control
              name='shipping_service'
              ref={register({ required: 'Transportadora é obrigatório' })}
              isInvalid={errors.shipping_service}
            />
            {errors.token && (
              <Form.Control.Feedback type='invalid'>
                {errors.token.shipping_service}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <label htmlFor='descricao'>Descrição*:</label>
            <Form.Control
              name='descricao'
              ref={register({ required: 'Descrição é obrigatório' })}
              isInvalid={!!errors.descricao}
            />
            {errors.token && (
              <Form.Control.Feedback type='invalid'>
                {errors.token.descricao}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <label htmlFor='operation_nature'>Natureza da operação:</label>
            <Form.Control
              name='operation_nature'
              ref={register}
              isInvalid={!!errors.operation_nature}
            />
            {errors.operation_nature && (
              <Form.Control.Feedback type='invalid'>
                {errors.operation_nature.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col xs={12} className='d-flex justify-content-end'>
          <ButtonDS
            size='sm'
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || requesting}
          >
            {!requesting ? 'Salvar' : 'salvando...'}
          </ButtonDS>
        </Col>
      </Row>
    </>
  );
};

export default ModalCredential;