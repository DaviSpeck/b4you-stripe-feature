import { useState, useEffect } from 'react';
import {
  Col,
  Row,
  Modal,
  Form,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from 'reactstrap';
import AlertDS from '../../@core/components/alertDS/AlertDS';

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
  variant = 'danger',
  variantButton = 'danger',
  textAlert = 'Essa operação não poderá ser desfeita.',
  haveLoader = true,
}) => {
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsLoading(false);
      setConfirm('');
    }
  }, [show]);

  const handleClose = () => {
    setShow(false);
  };

  return (
    <>
      <Modal
        isOpen={show}
        toggle={() => handleClose()}
        centered={centered}
        className="modal-generic modal-confirm-action"
      >
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <div className="mb-4">
            <AlertDS warn={'Aviso:'} variant={variant} text={textAlert} />
          </div>

          {description ? (
            <p>{description}</p>
          ) : (
            <p>
              Ao apertar o botão abaixo a ação tomada não poderá ser desfeita!
            </p>
          )}
          <b className="mr-2">Você tem certeza que quer tomar esta ação?</b>
          {!simpleConfirm ? (
            <span>
              Digite o termo "<b>{confirmText}</b>" no campo abaixo.
            </span>
          ) : (
            <span>Aperte o botão para confirmar.</span>
          )}

          {!simpleConfirm ? (
            <Row className="mt-4">
              <Col md={12}>
                <Form.Control
                  className={'text-center'}
                  placeholder={`Digite "${confirmText}"`}
                  onKeyUp={(e) => {
                    setConfirm(e.target.value);
                  }}
                />
              </Col>
              <Col className="d-flex justify-content-end">
                <div className="mt-4">
                  <Button
                    variant={variantButton}
                    size={'xs'}
                    onClick={(e) => {
                      haveLoader && setIsLoading(true);
                      handleAction(e);
                    }}
                    disabled={
                      confirm.toLowerCase().replace(/\s/g, '') !==
                        confirmText.toLowerCase().replace(/\s/g, '') ||
                      isLoading
                    }
                  >
                    <span style={{ fontSize: 16 }}>
                      {isLoading ? 'Carregando...' : buttonText}
                    </span>
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className="mt-4">
              <Col className="d-flex justify-content-between">
                <Button
                  variant={variantButton}
                  size={'sm'}
                  onClick={() => {
                    setShow(false);
                  }}
                  outline
                >
                  Cancelar
                </Button>
                <Button
                  variant={variantButton}
                  size={'sm'}
                  onClick={(e) => {
                    haveLoader && setIsLoading(true);
                    handleAction(e);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Carregando...' : buttonText}
                </Button>
              </Col>
            </Row>
          )}
        </ModalBody>
        {footer && (
          <ModalFooter>
            <Button size={'sm'} variant="light" onClick={handleClose}>
              Fechar
            </Button>
          </ModalFooter>
        )}
      </Modal>
    </>
  );
};

export default ConfirmAction;
