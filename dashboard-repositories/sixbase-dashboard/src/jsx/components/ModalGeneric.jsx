import React, { useState } from 'react';
import { Col, Row, Card, Modal, Button } from 'react-bootstrap';
import ButtonDS from './design-system/ButtonDS';

// import './styles.scss';

const ModalGeneric = ({
  children,
  show,
  setShow,
  title,
  footer,
  centered,
  id,
  size,
}) => {
  const handleClose = () => {
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered={centered}
      size={size && size}
      className='modal-generic'
      id={id}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title ? title : 'MODAL'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      {footer && (
        <Modal.Footer>
          <ButtonDS size={'sm'} variant='light' onClick={handleClose}>
            Fechar
          </ButtonDS>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ModalGeneric;
