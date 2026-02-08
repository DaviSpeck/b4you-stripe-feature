import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';

const ModalCredential = ({
  activeCredential,
  setActiveCredential,
}) => {
  const [requesting, setRequesting] = useState(false);

  const { register, handleSubmit, errors, formState, reset } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  useEffect(() => {
    if (activeCredential) {
      const fields = activeCredential;
      fields.generate_invoice = activeCredential.generate_invoice.toString();
      reset(fields);
    }
    return () => {
      setActiveCredential(null);
      reset({});
    };
  }, []);

  const onSubmit = (data) => {
    setRequesting(true);
      api
        .post('/integrations/melhor-envio', data)
        .then(({ data }) => {
          window.open(
            data.authorizationUrl,
            '_self'
          );
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
            <label htmlFor=''>Nome *</label>
            <Form.Control
              ref={register({ required: true })}
              name='name'
              isInvalid={errors.name}
            />
          </Form.Group>
        </Col>
        <Col xs={12} className='d-flex justify-content-end'>
          <ButtonDS
            size={'sm'}
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || requesting}
          >
            {!requesting ? 'Próximo' : 'salvando...'}
          </ButtonDS>
        </Col>
      </Row>
    </>
  );
};

export default ModalCredential;
