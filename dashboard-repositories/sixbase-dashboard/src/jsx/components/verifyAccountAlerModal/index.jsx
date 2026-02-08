import { Modal } from 'react-bootstrap';
import { IoIosClose } from 'react-icons/io';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ButtonDS from '../design-system/ButtonDS';
import IconWarning from '../../../images/warning.png';
import './style.scss';

export const ModalVerifyAccountAlert = (props) => {
  const [isClickedVerify, setIsClickedVerify] = useState(false);

  const { isOpen, onClose } = props;

  if (isClickedVerify) {
    return (
      <ModalVerifyAccountAlert.VerificationType
        isOpen={isClickedVerify}
        onClose={() => setIsClickedVerify(false)}
      />
    );
  }

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      className='verify-account-alert-modal'
      backdrop='static'
      keyboard={false}
    >
      <div className='wrapper-btn-close-modal-warning'>
        <button onClick={onClose}>
          <IoIosClose size={32} />
        </button>
      </div>
      <div className='wrapper-content'>
        <img src={IconWarning} />
        <div className='wrapper-text'>
          <h2>Verifique sua conta!</h2>
          <p>Verifique sua conta, caso contrário você não poderá vender!</p>
        </div>
        <div className='wrapper-button-verify'>
          <ButtonDS
            type='button'
            onClick={() => setIsClickedVerify(true)}
            style={{
              padding: '8px 25px',
              borderRadius: '999px',
              backgroundColor: '#ffc712',
              color: '#0f1b35',
            }}
          >
            Verificar minha conta
          </ButtonDS>
        </div>
      </div>
    </Modal>
  );
};

ModalVerifyAccountAlert.VerificationType = function (props) {
  const { isOpen, onClose } = props;

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Como você quer se cadastrar?</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className='mb-3'>Escolha o tipo de cadastro para continuar:</p>

        <div className='d-flex flex-column flex-md-row'>
          <Link
            to='/verificar-identidade'
            onClick={onClose}
            className='mr-md-2 mb-2'
          >
            <ButtonDS variant='primary' className='w-100'>
              Sou Pessoa Física (PF)
            </ButtonDS>
          </Link>

          <Link to='/configuracoes?tab=cnpj' onClick={onClose}>
            <ButtonDS variant='primary' className='w-100'>
              Sou Pessoa Jurídica (PJ)
            </ButtonDS>
          </Link>
        </div>
      </Modal.Body>
    </Modal>
  );
};
