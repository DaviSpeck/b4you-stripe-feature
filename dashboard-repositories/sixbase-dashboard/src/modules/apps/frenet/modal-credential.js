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
      .post('/integrations/frenet', {
        token: data.token.trim(),
        cep: data.cep,
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
            <label htmlFor='token'>Token *</label>
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
          </Form.Group>
          <Form.Group>
            <label htmlFor='cep'>CEP de origem *</label>
            <Form.Control
              name='cep'
              maxLength={8}
              ref={register({
                pattern: '[0-9]*',
                required: 'CEP é obrigatório',
                validate: async (value) => {
                  if (value.length !== 8) {
                    return 'CEP deve ter 8 dígitos';
                  }
                  try {
                    const response = await fetch(
                      `https://viacep.com.br/ws/${value}/json/`
                    );
                    const data = await response.json();
                    if (data.erro) {
                      return 'CEP inválido';
                    }
                    return true;
                  } catch (error) {
                    return 'Erro ao verificar o CEP';
                  }
                },
              })}
              isInvalid={!!errors.cep}
            />
            {errors.cep && (
              <Form.Control.Feedback type='invalid'>
                {errors.cep.message}
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
