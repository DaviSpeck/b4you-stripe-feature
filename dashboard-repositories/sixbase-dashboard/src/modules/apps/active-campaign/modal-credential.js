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
      .post('/integrations/activecampaign', data)
      .then(() => {
        fetchData();
        setShow(false);
        notify({
          message: 'Credencial criada com sucesso',
          type: 'success',
        });
      })
      .catch((err) => {
        notify({
          message: err?.response?.data?.message || 'Falha ao criar credencial',
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
            <label htmlFor=''>Nome da Conta</label>
            <Form.Control
              ref={register({ required: true })}
              name='name'
              isInvalid={errors.name}
            />
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>Chave da API Active Campaign</label>
            <Form.Control
              ref={register({ required: true })}
              name='apiKey'
              isInvalid={errors.token}
            />
            {/* <a className='external-link' href='#'>
                Onde encontrar minha API key?
              </a> */}
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>API url</label>
            <Form.Control
              ref={register({ required: true })}
              name='apiUrl'
              isInvalid={errors.token}
            />
            {/* <a className='external-link' href='#'>
                Onde encontrar minha API key?
              </a> */}
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
