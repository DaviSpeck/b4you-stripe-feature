import { Modal } from 'react-bootstrap';
import Pixels from '../products/checkout/pixels';

const ModalPixel = ({ show, setShow, size }) => {
  return (
    <Modal
      show={show}
      className='modal-filter'
      size={size}
      onHide={() => setShow(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Pixel</Modal.Title>
      </Modal.Header>
      <Modal.Body className='pl-3 pr-3'>
        <Pixels />
      </Modal.Body>
    </Modal>
  );
};

export default ModalPixel;
