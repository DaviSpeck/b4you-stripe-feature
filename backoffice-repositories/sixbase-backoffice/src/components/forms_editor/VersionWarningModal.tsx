import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
} from 'reactstrap';
import { AlertTriangle } from 'react-feather';
import { type VersionWarningModalProps } from '../../interfaces/formseditor.interface';

const VersionWarningModal: React.FC<VersionWarningModalProps> = ({
  isOpen,
  toggle,
  onConfirm,
  formTitle,
}) => {
  const handleConfirm = () => {
    onConfirm();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>
        <AlertTriangle size={18} className="me-2 text-warning" />
        Aviso sobre alterações
      </ModalHeader>
      <ModalBody>
        <Alert color="warning" className="mb-3">
          <strong>Atenção!</strong> Você optou por não criar uma nova versão do
          formulário.
        </Alert>
        <p>
          As alterações realizadas no formulário{' '}
          <strong>{formTitle || 'este formulário'}</strong> podem impactar a
          visualização das respostas já coletadas.
        </p>
        <ul>
          <li>
            Perguntas que foram <strong>removidas</strong> não aparecerão mais
            nas respostas antigas
          </li>
          <li>
            Perguntas que foram <strong>modificadas</strong> (tipo, opções, etc.)
            podem causar inconsistências na visualização
          </li>
          <li>
            Novas perguntas adicionadas não terão respostas nos formulários
            anteriores
          </li>
        </ul>
        <p className="text-muted mb-0">
          Você ainda pode criar uma nova versão posteriormente através do botão
          "Publicar versão".
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Voltar
        </Button>
        <Button color="warning" onClick={handleConfirm}>
          Continuar mesmo assim
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default VersionWarningModal;

