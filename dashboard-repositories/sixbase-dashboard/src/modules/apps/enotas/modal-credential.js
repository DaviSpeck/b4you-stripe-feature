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
      fields.cancel_invoice_chargeback =
        activeCredential.cancel_invoice_chargeback.toString();
      fields.send_invoice_customer_mail =
        activeCredential.send_invoice_customer_mail.toString();
      fields.issue_invoice = activeCredential.issue_invoice.toString();
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
        .post('/integrations/enotas', data)
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
    } else {
      api
        .put('/integrations/enotas', data)
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
      <h4>Integração</h4>
      <Row>
        <Col xs={12}>
          <Form.Group style={{ marginTop: '30px' }}>
            <label htmlFor=''>API Key *</label>
            <Form.Control
              ref={register({ required: true })}
              name='api_key'
              isInvalid={errors.api_key}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Quando emitir a nota fiscal?</label>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='issue_invoice0'
                  name='issue_invoice'
                  value={0}
                  className='pointer'
                  defaultChecked
                />
                <label htmlFor='issue_invoice0' className='pointer'>
                  Emitir após o período de garantia
                </label>
              </div>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='issue_invoice1'
                  name='issue_invoice'
                  value={1}
                  className='pointer'
                />
                <label htmlFor='issue_invoice1' className='pointer'>
                  Emitir quando o pagamento for aprovado
                </label>
              </div>

              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='issue_invoice2'
                  name='issue_invoice'
                  value={2}
                  className='pointer'
                />
                <label htmlFor='issue_invoice2' className='pointer'>
                  Não emitir automaticamente
                </label>
              </div>
            </small>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>
              Enviar nota fiscal via email para o cliente?
            </label>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='send_invoice_customer_mail1'
                  name='send_invoice_customer_mail'
                  value='true'
                  className='pointer'
                  defaultChecked
                />
                <label
                  htmlFor='send_invoice_customer_mail1'
                  className='pointer'
                >
                  Sim
                </label>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='send_invoice_customer_mail2'
                  name='send_invoice_customer_mail'
                  value='false'
                  className='pointer ml-4'
                />
                <label
                  htmlFor='send_invoice_customer_mail2'
                  className='pointer'
                >
                  Não
                </label>
              </div>
            </small>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>
              Cancelar nota fiscal quando houver um reembolso?
            </label>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='cancel_invoice_chargeback1'
                  name='cancel_invoice_chargeback'
                  value='true'
                  className='pointer'
                  defaultChecked
                />
                <label htmlFor='cancel_invoice_chargeback1' className='pointer'>
                  Sim
                </label>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='cancel_invoice_chargeback2'
                  name='cancel_invoice_chargeback'
                  value='false'
                  className='pointer ml-4'
                />
                <label htmlFor='cancel_invoice_chargeback2' className='pointer'>
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
            {!requesting ? 'Salvar' : 'salvando...'}
          </ButtonDS>
        </Col>
      </Row>
    </>
  );
};

export default ModalCredential;
