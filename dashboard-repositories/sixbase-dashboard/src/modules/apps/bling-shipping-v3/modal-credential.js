import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';

const ModalCredential = ({
  fetchData,
  setShow,
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

    if (!activeCredential) {
      api
        .post('/integrations/bling-shipping-v3', data)
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
    } else {
      api
        .put('/integrations/bling-shipping-v3', data)
        .then(() => {
          fetchData();
          setShow(false);
          notify({
            message: 'Credencial atualizada com sucesso',
            type: 'success',
          });
        })
        .catch(() => {
          notify({
            message: 'Falha ao atualizar credencial',
            type: 'error',
          });
        })
        .finally(() => setRequesting(false));
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Transportadora *</label>
            <Form.Control
              ref={register({ required: true })}
              name='shipping'
              isInvalid={errors.shipping}
            />
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Serviço transportadora*</label>
            <Form.Control
              ref={register({ required: true })}
              name='shipping_service'
              isInvalid={errors.shipping_service}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor='nat_operacao'>Natureza de operação *</label>
            <Form.Control
              ref={register({ required: true })}
              name='nat_operacao'
              isInvalid={errors.nat_operacao}
              disabled
              value='Venda de Mercadorias'
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Emitir nota fiscal?</label>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='generate_invoice_true'
                  name='generate_invoice'
                  value='true'
                  className='pointer'
                  defaultChecked
                />
                <label htmlFor='generate_invoice_true' className='pointer'>
                  Sim
                </label>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='generate_invoice_false'
                  name='generate_invoice'
                  value='false'
                  className='pointer ml-4'
                />
                <label htmlFor='generate_invoice_false' className='pointer'>
                  Não
                </label>
              </div>
            </small>
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
