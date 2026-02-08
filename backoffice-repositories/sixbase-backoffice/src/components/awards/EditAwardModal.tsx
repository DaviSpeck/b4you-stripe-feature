import { FC } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from 'reactstrap';
import { Trash2, Lock } from 'react-feather';
import { EditAwardModalProps } from '../../interfaces/awards.interface';

const EditAwardModal: FC<EditAwardModalProps> = ({
  isOpen,
  onToggle,
  editingProducer,
  editForm,
  onFormChange,
  onUpdateAward,
  onDeleteAward,
  onBlockAward,
  loading,
  blocking,
  getProducerData,
}) => {
  const isFormValid =
    editForm.tracking_code?.trim() || editForm.tracking_link?.trim();

  return (
    <Modal isOpen={isOpen} toggle={onToggle} centered size="lg">
      <ModalHeader toggle={onToggle}>
        {editingProducer?.status === 'pending'
          ? 'Enviar Premiação'
          : 'Atualizar Premiação'}
      </ModalHeader>
      <ModalBody>
        {editingProducer && (
          <div className="mb-2">
            <h6 className="d-flex align-items-center gap-2">
              <span>
                Produtor: {getProducerData(editingProducer).full_name}
              </span>
              {onBlockAward && (
                <Button
                  color="danger"
                  size="sm"
                  onClick={onBlockAward}
                  className="d-flex align-items-center text-white"
                  style={{ padding: '4px 4px' }}
                  disabled={blocking}
                >
                  {blocking ? (
                    <Spinner size="sm" color="light" className="me-1" />
                  ) : (
                    <Lock size={16} className="me-1" />
                  )}
                  Bloquear Premiação
                </Button>
              )}
            </h6>
            <div className="mb-0 mt-2 d-flex align-items-center gap-4">
              <div>
                <small>Email: </small>
                <a
                  href={`mailto:${getProducerData(editingProducer).email}`}
                  className="text-info text-decoration-none"
                  style={{ cursor: 'pointer' }}
                >
                  <small>{getProducerData(editingProducer).email}</small>
                </a>
              </div>
              <div>
                <small>Telefone: </small>
                <a
                  href={`https://wa.me/55${getProducerData(
                    editingProducer,
                  ).phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-success text-decoration-none"
                  style={{ cursor: 'pointer' }}
                >
                  <small>{getProducerData(editingProducer).phone}</small>
                </a>
              </div>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-md-6">
            <FormGroup>
              <Label for="editTrackingCode">Código de Rastreamento</Label>
              <Input
                type="text"
                id="editTrackingCode"
                value={editForm.tracking_code}
                onChange={(e) => onFormChange('tracking_code', e.target.value)}
                placeholder="Digite o código de rastreamento (ou '-' se não houver)"
              />
              <small className="text-muted">
                {editingProducer?.status === 'pending'
                  ? 'Digite o código de rastreamento ou "-" se não houver'
                  : 'Edite o código de rastreamento se necessário'}
              </small>
            </FormGroup>
          </div>
          <div className="col-md-6">
            <FormGroup>
              <Label for="editTrackingLink">Link de Rastreamento</Label>
              <Input
                type="url"
                id="editTrackingLink"
                value={editForm.tracking_link}
                onChange={(e) => onFormChange('tracking_link', e.target.value)}
                placeholder="Digite o link de rastreamento (ou '-' se não houver)"
              />
              <small className="text-muted">
                {editingProducer?.status === 'pending'
                  ? 'Digite o link de rastreamento ou "-" se não houver'
                  : 'Edite o link de rastreamento se necessário'}
              </small>
            </FormGroup>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-between w-100">
          <Button
            color="danger"
            onClick={onDeleteAward}
            disabled={loading}
            className="d-flex align-items-center"
          >
            <Trash2 size={16} className="me-2" />
            Excluir Premiação
          </Button>
          <div className="d-flex gap-2">
            <Button color="secondary" onClick={onToggle}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onClick={onUpdateAward}
              disabled={loading || !isFormValid}
            >
              {loading ? <Spinner size="sm" className="me-2" /> : null}
              {editingProducer?.status === 'pending'
                ? 'Enviar Premiação'
                : 'Atualizar Premiação'}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default EditAwardModal;
