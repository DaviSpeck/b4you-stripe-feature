import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ButtonDS from './design-system/ButtonDS';

// import './styles.scss';

const ModalFilter = ({ children, show, setShow, title, removeFilters }) => {
  const handleClose = () => {
    setShow(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className='modal-filter'>
      <Modal.Header closeButton>
        <Modal.Title>{title ? title : 'Filtrar'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <ButtonDS
          size={'sm'}
          variant='light'
          onClick={() => {
            removeFilters();
            handleClose();
          }}
        >
          Remover Filtros
        </ButtonDS>
        <ButtonDS size={'sm'} variant='primary' onClick={handleClose}>
          Aplicar Filtros
        </ButtonDS>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalFilter;
