import { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

export const ModalExport = ({
  show,
  onHide,
  onSubmit,
  user,
  email,
  setEmail,
}) => {
  const [checkEmail, setCheckEmail] = useState(true);

  const onChangeCheckEmail = ({ target: { checked } }) => {
    setEmail(null);
    if (checked) setEmail(user.email);
    setCheckEmail(checked);
  };

  return (
    <Modal show={show} className='modal-filter' onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Configurações para exportação</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className='mb-3'>
            <Form.Check
              type='checkbox'
              label='Enviar para email da conta'
              value={checkEmail}
              defaultChecked={true}
              onChange={onChangeCheckEmail}
            />
          </Form.Group>

          <Form.Group className='mb-3' controlId='formBasicEmail'>
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type='email'
              value={email}
              name='email'
              onChange={(e) => setEmail(e.target.value)}
              disabled={checkEmail}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className='d-flex justify-content-end'>
        <ButtonDS size={'sm'} variant='primary' onClick={onSubmit}>
          Enviar
        </ButtonDS>
      </Modal.Footer>
    </Modal>
  );
};
