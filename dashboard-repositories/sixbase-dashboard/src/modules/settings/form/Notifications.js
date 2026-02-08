import { Col, FormGroup, Row, Form } from 'react-bootstrap';
import { notify } from '../../functions';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../providers/api';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import PushSettings from '../components/PushSettings';
import OneSignal from "react-onesignal";

const Notifications = () => {
  const device_id = localStorage.getItem('device_id');

  const [requesting, setRequesting] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  const onSubmit = (data) => {
    setRequesting(true);
    api
      .put('/users/notifications-settings', data)
      .then(() => {
        notify({
          message: 'Configuração de notificações salvas com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao salvar configuração de notificação',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const fetchData = () => {
    setRequesting(true);

    api
      .get('/users/notifications-settings')
      .then((response) => {
        const {
          data: {
            show_product_name,
            generated_pix,
            generated_billet,
            paid_pix,
            paid_billet,
            paid_card,
            expired_pix,
            expired_billet,
            mail_approved_payment,
          },
        } = response;
        reset({
          show_product_name,
          generated_pix,
          generated_billet,
          paid_pix,
          paid_billet,
          paid_card,
          expired_pix,
          expired_billet,
          mail_approved_payment,
        });
      })
      .catch(() => { });
    setRequesting(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section id='page-settings-notifications'>
      <div className='d-flex align-items-center justify-content-between flex-wrap gap-2'>
        <h4 className='mb-0'>Configurações de Notificações</h4>
        {(OneSignal.Notifications.isPushSupported() && !device_id) && (
          <PushSettings />
        )}
      </div>
      <div>
        <span style={{ color: 'gray', fontSize: '15px' }}>
          Essas notificações são apenas para os dipositivos móveis (aplicativo
          B4you)
        </span>
      </div>
      <form action='' className='mt-4' onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Form.Check
            type='checkbox'
            label='Mostrar nome do produto'
            name='show_product_name'
            id='show_product_name'
            ref={register}
          />
        </FormGroup>
        <FormGroup>
          <Form.Check
            type='checkbox'
            label='Pix gerado'
            name='generated_pix'
            id='generated_pix'
            ref={register}
          />
        </FormGroup>
        <FormGroup>
          <Form.Check
            type='checkbox'
            label='Boleto gerado'
            name='generated_billet'
            id='generated_billet'
            ref={register}
          />
        </FormGroup>
        <FormGroup>
          <Form.Check
            type='checkbox'
            label='Pix pago'
            name='paid_pix'
            id='paid_pix'
            ref={register}
          />
        </FormGroup>
        <FormGroup>
          <Form.Check
            type='checkbox'
            label='Boleto pago'
            name='paid_billet'
            id='paid_billet'
            ref={register}
          />
        </FormGroup>
        <FormGroup>
          <Form.Check
            type='checkbox'
            label='Cartão pago'
            name='paid_card'
            id='paid_card'
            ref={register}
          />
        </FormGroup>
        <FormGroup>
          <Form.Check
            type='checkbox'
            label='Boleto expirado'
            name='expired_billet'
            id='expired_billet'
            ref={register}
          />
        </FormGroup>
        <FormGroup>
          <Form.Check
            type='checkbox'
            label='Pix expirado'
            name='expired_pix'
            id='expired_pix'
            ref={register}
          />
        </FormGroup>

        <hr />
        <div>
          <span style={{ color: 'gray', fontSize: '15px' }}>
            Habilite ou desabilite as notificações de email para seus
            compradores
          </span>
        </div>
        <FormGroup className='mt-3'>
          <Form.Check
            type='checkbox'
            label='Compra aprovada'
            name='mail_approved_payment'
            id='mail_approved_payment'
            ref={register}
          />
        </FormGroup>
        <Row>
          <Col className='mt-3'>
            <ButtonDS
              variant='primary'
              size='sm'
              type='submit'
              disabled={!isValid || requesting}
              outline
            >
              {!requesting ? 'Salvar Informações' : 'salvando...'}
            </ButtonDS>
          </Col>
        </Row>
      </form>
    </section>
  );
};

export default Notifications;
