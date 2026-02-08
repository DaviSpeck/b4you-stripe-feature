import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap';
import { type CreateVersionModalProps } from '../../interfaces/formseditor.interface';

const CreateVersionModal: React.FC<CreateVersionModalProps> = ({
  isOpen,
  toggle,
  onConfirm,
  onCancel,
  formTitle,
}) => {
  const handleConfirm = () => {
    onConfirm();
    toggle();
  };

  const handleCancel = () => {
    onCancel();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>
        Criar nova versão do formulário?
      </ModalHeader>
      <ModalBody>
        <p>
          Você editou o formulário <strong>{formTitle || 'este formulário'}</strong>.
          Deseja criar uma nova versão para preservar a estrutura anterior?
        </p>
        <p className="text-muted">
          Criar uma nova versão permite que as respostas já coletadas sejam
          visualizadas com a estrutura anterior, mesmo após as alterações.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel}>
          Não criar versão
        </Button>
        <Button color="primary" onClick={handleConfirm}>
          Sim, criar nova versão
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateVersionModal;

