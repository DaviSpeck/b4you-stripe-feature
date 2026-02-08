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

  const onSubmit = (data) => {
    setRequesting(true);
    api
      .post('/integrations/woocommerce', {
        url: data.url,
        consumer_key: data.consumer_key,
        consumer_secret: data.consumer_secret,
      })
      .then(() => {
        setShow(false);
        fetchData();
        notify({
          message: 'Credencial cadastrada com sucesso!',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao criar credencial',
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
            <label htmlFor='token'>URL da Loja</label>
            <Form.Control
              name='url'
              ref={register({ required: 'URL é obrigatório' })}
              isInvalid={!!errors.url}
            />
            {errors.url && (
              <Form.Control.Feedback type='invalid'>
                {errors.url.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <label htmlFor='token'>Chave do Cliente</label>
            <Form.Control
              name='consumer_key'
              ref={register({ required: 'Chave do cliente é obrigatório' })}
              isInvalid={!!errors.consumer_key}
            />
            {errors.consumer_key && (
              <Form.Control.Feedback type='invalid'>
                {errors.consumer_key.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <label htmlFor='token'>Token do Cliente</label>
            <Form.Control
              name='consumer_secret'
              ref={register({ required: 'Token do cliente é obrigatório' })}
              isInvalid={!!errors.consumer_secret}
            />
            {errors.consumer_secret && (
              <Form.Control.Feedback type='invalid'>
                {errors.consumer_secret.message}
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
