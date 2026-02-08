import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Col, Form, Row } from 'react-bootstrap';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const ModalCredential = ({ fetchData, setShow }) => {
  const { register, handleSubmit, errors, formState } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  const [requesting, setRequesting] = useState(false);

  const onSubmit = (data) => {
    setRequesting(true);

    api
      .post('/integrations/voxuy', data)
      .then(() => {
        fetchData();
        setShow(false);
        notify({
          message: 'Credencial criada com sucesso',
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
          <div className='form-group'>
            <label htmlFor='name'>Nome</label>
            <Form.Control
              ref={register({ required: true })}
              name='name'
              isInvalid={errors.name}
            />
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor='api_key'>API key</label>
            <Form.Control
              ref={register({ required: true })}
              name='api_key'
              isInvalid={errors.api_key}
            />
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor='api_url'>API url</label>
            <Form.Control
              ref={register({ required: true })}
              name='api_url'
              isInvalid={errors.api_url}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col className='d-flex justify-content-end'>
          <ButtonDS
            size={'sm'}
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
