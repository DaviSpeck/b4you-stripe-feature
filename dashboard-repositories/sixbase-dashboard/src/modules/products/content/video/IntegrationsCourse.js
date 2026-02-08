import { useEffect, useState } from 'react';
import { Card, Col, Form, Modal, Row } from 'react-bootstrap';
import api from '../../../../providers/api';
import { useParams } from 'react-router-dom';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import { notify } from '../../../functions';
import whatsAppLogo from '../../../../images/whatsapplogo.png';
import jivoChatLogo from '../../../../images/jivochatlogo.png';

const IntegrationsCourse = () => {
  const [modalShowWhatsApp, setShowModalWhatsApp] = useState(false);
  const [modalShowJivoChat, setShowModalJivoChat] = useState(false);
  const [jivo, setJivo] = useState(null);
  const [whatsApp, setWhatsApp] = useState(null);

  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const { uuidProduct } = useParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api
      .get(`/products/${uuidProduct}/membership-plugins`)
      .then((r) => {
        const whatsPlugin = r.data.plugins.find(
          (p) => p.type.key === 'whatsapp'
        );
        const jivoPlugin = r.data.plugins.find(
          (p) => p.type.key === 'jivo-chat'
        );
        setWhatsApp(whatsPlugin);
        setJivo(jivoPlugin);
        if (jivoPlugin) {
          setToken(jivoPlugin.settings.token);
        }
        if (whatsPlugin) {
          setPhone(whatsPlugin.settings.phone);
          setMessage(whatsPlugin.settings.message);
        }
      })
      // eslint-disable-next-line
      .catch((err) => console.log(err));
  };

  const submitWhats = () => {
    api
      .post(`/products/${uuidProduct}/membership-plugins`, {
        type: `whatsapp`,
        settings: { phone, message },
      })
      .then(() => {
        fetchData();
        setShowModalWhatsApp(false);
        notify({
          message: 'Integração com WhatsApp criada com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao criar integração com WhatsApp',
          type: 'error',
        });
      });
  };

  const deleteWhats = () => {
    api
      .delete(`/products/${uuidProduct}/membership-plugins/${whatsApp.uuid}`)
      .then(() => {
        fetchData();
        setShowModalWhatsApp(false);
        setPhone('');
        setMessage('');
        notify({
          message: 'Integração com WhatsApp removida com sucesso',
          type: 'success',
        });
      })
      .catch(() =>
        notify({
          message: 'Falha ao remover integração com WhatsApp',
          type: 'error',
        })
      );
  };

  const submitJivo = () => {
    api
      .post(`/products/${uuidProduct}/membership-plugins`, {
        type: `jivo-chat`,
        settings: { token: token },
      })
      .then(() => {
        fetchData();
        setShowModalJivoChat(false);
        notify({
          message: 'Integração com JivoChat criada com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao criar integração com JivoChat',
          type: 'error',
        });
      });
  };

  const deleteJivo = () => {
    api
      .delete(`/products/${uuidProduct}/membership-plugins/${jivo.uuid}`)
      .then(() => {
        fetchData();
        setShowModalJivoChat(false);
        setToken('');
        notify({
          message: 'Integração com JivoChat removida com sucesso',
          type: 'success',
        });
      })
      .catch(() =>
        notify({
          message: 'Falha ao remover integração com JivoChat',
          type: 'error',
        })
      );
  };

  return (
    <div>
      <Row>
        <Col md={3}>
          <Card onClick={() => setShowModalWhatsApp(true)} className='pointer'>
            <Card.Body className='d-flex justify-content-center align-items-center'>
              <img
                src={whatsAppLogo}
                style={{ maxWidth: 180, height: 'fit-content' }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card onClick={() => setShowModalJivoChat(true)} className='pointer'>
            <Card.Body className='d-flex justify-content-center align-items-center'>
              <img src={jivoChatLogo} style={{ maxWidth: 180 }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={modalShowWhatsApp}
        onHide={() => setShowModalWhatsApp(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>WhatsApp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Adiciona um botão do WhatsApp dentro da área de membros do seu
            produto
          </p>
          <div className='mt-4'>
            <Form.Label htmlFor='phone'>Telefone</Form.Label>
            <Form.Control
              type='tel'
              id='phone'
              name='phone'
              aria-describedby='phone'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={whatsApp}
            />
          </div>
          <div className='mt-3'>
            <Form.Label htmlFor='message'>Mensagem (Opcional)</Form.Label>
            <Form.Control
              type='text'
              id='message'
              name='message'
              aria-describedby='message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={whatsApp}
            />
          </div>
          <Row>
            {whatsApp && (
              <Col className='d-flex justify-content-start'>
                <ButtonDS
                  className='mt-4'
                  onClick={deleteWhats}
                  variant='danger'
                >
                  Remover
                </ButtonDS>
              </Col>
            )}
            <Col className='d-flex justify-content-end'>
              <ButtonDS
                className='mt-4'
                onClick={submitWhats}
                disabled={!phone || whatsApp}
              >
                Salvar
              </ButtonDS>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <Modal
        show={modalShowJivoChat}
        onHide={() => setShowModalJivoChat(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>JivoChat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Adiciona um botão do JivoChat dentro da área de membros do seu
            produto
          </p>
          <div className='mt-4'>
            <Form.Label htmlFor='token'>Token</Form.Label>
            <Form.Control
              type='text'
              id='token'
              name='token'
              aria-describedby='token'
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={jivo}
            />
          </div>
          <Row>
            {jivo && (
              <Col className='d-flex justify-content-start'>
                <ButtonDS
                  className='mt-4'
                  onClick={deleteJivo}
                  variant='danger'
                >
                  Remover
                </ButtonDS>
              </Col>
            )}
            <Col className='d-flex justify-content-end'>
              <ButtonDS
                className='mt-4'
                onClick={submitJivo}
                disabled={!token || jivo}
              >
                Salvar
              </ButtonDS>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default IntegrationsCourse;
