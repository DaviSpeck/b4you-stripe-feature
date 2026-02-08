import { useEffect, useState } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';
import './style.scss';

const ModalRule = ({ fetchData, setShow, apiData }) => {
  const [requesting, setRequesting] = useState(false);

  const { register, handleSubmit, formState, reset } = useForm({
    mode: 'onChange',
  });

  const { errors } = formState;

  const createZoppy = async (data) => {
    try {
      setRequesting(true);

      await api.post('/integrations/zoppy', {
        apiKey: data.key,
        status: 1,
      });

      notify({
        message: 'Credenciais da API salvas com sucesso',
        type: 'success',
      });

      setShow(false);
      await fetchData();
    } catch (error) {
      notify({
        message:
          error?.response?.data?.message || 'Erro ao salvar credenciais da API',
        type: 'error',
      });

      return error;
    } finally {
      setRequesting(false);
    }
  };

  const updateZoppy = async (data) => {
    try {
      setRequesting(true);

      await api.put(`/integrations/zoppy/${apiData.id}`, {
        status: apiData.status,
        apiKey: data.key,
      });

      notify({
        message: 'Credenciais da API atualizadas com sucesso',
        type: 'success',
      });

      setShow(false);
      await fetchData();
    } catch (error) {
      notify({
        message:
          error?.response?.data?.message ||
          'Erro ao atualizar credenciais da API',
        type: 'error',
      });

      return error;
    } finally {
      setRequesting(false);
    }
  };

  const onSubmit = async (data) => {
    if (!apiData) {
      await createZoppy(data);
    } else {
      await updateZoppy(data);
    }
  };

  useEffect(() => {
    if (apiData) {
      reset({
        key: apiData.apiKey,
      });
    }
  }, [apiData, reset]);

  return (
    <section id='modal-rule-zoppy'>
      <Row>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor='key'>API Key (Chave da API)</label>

            <InputGroup>
              <Form.Control
                ref={register({
                  required: true,
                })}
                name='key'
                placeholder='Digite a chave da API'
                isInvalid={errors.key}
              />
            </InputGroup>
          </div>
        </Col>
      </Row>

      <Row>
        <Col className='d-flex justify-content-end'>
          <ButtonDS
            size={'sm'}
            onClick={handleSubmit(onSubmit)}
            disabled={requesting || errors.key}
          >
            {!requesting ? 'Salvar' : 'Salvando...'}
          </ButtonDS>
        </Col>
      </Row>
    </section>
  );
};

export default ModalRule;
