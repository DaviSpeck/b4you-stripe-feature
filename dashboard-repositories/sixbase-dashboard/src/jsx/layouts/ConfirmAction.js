import { useState, useEffect } from 'react';
import { Col, Row, Card, Modal, Button, Form } from 'react-bootstrap';
import AlertDS from '../components/design-system/AlertDS';
import ButtonDS from '../components/design-system/ButtonDS';

const ConfirmAction = ({
  show,
  setShow,
  footer,
  centered,
  title = 'Confirmar ação',
  confirmText = 'Confirmo',
  buttonText = 'Confirmar Ação',
  description,
  handleAction,
  simpleConfirm,
  iconRight,
  iconLeft,
  variant = 'danger',
  variantButton = 'danger',
  textAlert = 'Essa operação não poderá ser desfeita.',
  haveLoader = true,
}) => {
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setShow(false);
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        centered={centered}
        className='modal-generic modal-confirm-action'
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='mb-4'>
            <AlertDS warn={'Aviso:'} variant={variant} text={textAlert} />
          </div>

          {description ? (
            <p>{description}</p>
          ) : (
            <p>
              Ao apertar o botão abaixo a ação tomada não poderá ser desfeita!
            </p>
          )}
          <b className='mr-2'>Você tem certeza que quer tomar esta ação?</b>
          {!simpleConfirm ? (
            <span>
              Digite o termo "<b>{confirmText}</b>" no campo abaixo.
            </span>
          ) : (
            <span>Aperte o botão para confirmar.</span>
          )}

          {!simpleConfirm ? (
            <Row className='mt-4'>
              <Col md={12}>
                <Form.Control
                  className={'text-center'}
                  placeholder={`Digite "${confirmText}"`}
                  onKeyUp={(e) => {
                    setConfirm(e.target.value);
                  }}
                />
              </Col>
              <Col className='d-flex justify-content-end'>
                <div className='mt-4'>
                  <ButtonDS
                    variant={variantButton}
                    size={'xs'}
                    onClick={() => {
                      haveLoader && setIsLoading(true);
                      handleAction();
                    }}
                    disabled={
                      confirm.toLowerCase().replace(/\s/g, '') !==
                        confirmText.toLowerCase().replace(/\s/g, '') ||
                      isLoading
                    }
                    iconLeft={iconLeft}
                    iconRight={iconRight}
                  >
                    <span style={{ fontSize: 16 }}>
                      {isLoading ? 'Carregando...' : buttonText}
                    </span>
                  </ButtonDS>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className='mt-4'>
              <Col className='d-flex justify-content-between'>
                <ButtonDS
                  variant={variantButton}
                  size={'sm'}
                  onClick={() => {
                    setShow(false);
                  }}
                  outline
                >
                  Cancelar
                </ButtonDS>
                <ButtonDS
                  variant={variantButton}
                  size={'sm'}
                  onClick={() => {
                    haveLoader && setIsLoading(true);
                    handleAction();
                  }}
                  disabled={isLoading}
                  iconLeft={iconLeft}
                  iconRight={iconRight}
                >
                  {isLoading ? 'Carregando...' : buttonText}
                </ButtonDS>
              </Col>
            </Row>
          )}
        </Modal.Body>
        {footer && (
          <Modal.Footer>
            <ButtonDS size={'sm'} variant='light' onClick={handleClose}>
              Fechar
            </ButtonDS>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

export default ConfirmAction;
