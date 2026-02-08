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
      .post('/integrations/shopify', {
        name: data.name,
        link: data.link,
        shopName: data.shopName,
        accessToken: data.accessToken,
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
            <label htmlFor='token'>Nome da Loja</label>
            <Form.Control
              name='name'
              ref={register({ required: 'Nome é obrigatório' })}
              isInvalid={!!errors.name}
            />
            {errors.name && (
              <Form.Control.Feedback type='invalid'>
                {errors.name.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <label htmlFor='token'>URL</label>
            <Form.Control
              name='link'
              ref={register({ required: 'Link é obrigatório' })}
              isInvalid={!!errors.link}
            />
            {errors.link && (
              <Form.Control.Feedback type='invalid'>
                {errors.link.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <label htmlFor='token'>Nome da Loja</label>
            <Form.Control
              name='shopName'
              ref={register({ required: 'ShopName é obrigatório' })}
              isInvalid={!!errors.shopName}
            />
            {errors.shopName && (
              <Form.Control.Feedback type='invalid'>
                {errors.shopName.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <label htmlFor='token'>Token de Acesso</label>
            <Form.Control
              name='accessToken'
              ref={register({ required: 'accessToken é obrigatório' })}
              isInvalid={!!errors.accessToken}
            />
            {errors.accessToken && (
              <Form.Control.Feedback type='invalid'>
                {errors.accessToken.message}
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
