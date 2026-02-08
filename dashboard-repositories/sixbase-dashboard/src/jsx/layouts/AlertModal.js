import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ButtonDS from '../components/design-system/ButtonDS';

const ConfirmAction = ({
  show,
  setShow,
  handleAction,
  textInfo,
  textDetails,
  title,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setShow(false);
  };

  return (
    <div>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <b>{textInfo}</b>
          <hr />
          {textDetails}
          <div className='d-flex justify-content-end mt-4'>
            <ButtonDS
              variant='primary'
              onClick={async () => {
                setIsLoading(true);
                await handleAction();
                setIsLoading(false);
                handleClose();
              }}
            >
              {isLoading ? 'Salvando' : 'Enviar'}
            </ButtonDS>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ConfirmAction;
