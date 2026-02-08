import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';

const ModalNf = ({
  fetchData,
  setShow,
  activeCredential,
  setActiveCredential,
}) => {
  const [requesting, setRequesting] = useState(false);

  const { register, handleSubmit, formState, reset } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  useEffect(() => {
    if (activeCredential) {
      reset({
        ...activeCredential,
        issue_invoice:
          activeCredential.issue_invoice !== undefined
            ? activeCredential.issue_invoice.toString()
            : '0',
      });
    } else {
      reset({ issue_invoice: '0' });
    }

    return () => {
      setActiveCredential(null);
      reset({});
    };
  }, [activeCredential, reset, setActiveCredential]);

  const onSubmit = (data) => {
    data.uuid = activeCredential.uuid;
    setRequesting(true);
    api
      .put('/integrations/bling-shipping-v3/nfe', data)
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
  };

  return (
    <>
      <Row>
        <Col xs={12} className='mt-2'>
          <Form.Group>
            <label htmlFor='issue_when'>Quando emitir a nota fiscal?</label>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  name='issue_invoice'
                  id='issue_invoice0'
                  value={0}
                  className='pointer'
                />
                <label htmlFor='issue_invoice0' className='pointer'>
                  Não emitir
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
                  Emitir após o periodo de garantia
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
                  defaultChecked
                />
                <label htmlFor='issue_invoice2' className='pointer'>
                  Emitir quando o pagamento for aprovado
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

export default ModalNf;
