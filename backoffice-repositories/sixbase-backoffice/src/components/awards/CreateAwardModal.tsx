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
import { CreateAwardModalProps } from '../../interfaces/awards.interface';

const CreateAwardModal: FC<CreateAwardModalProps> = ({
  isOpen,
  onToggle,
  selectedMilestone,
  createForm,
  onFormChange,
  onCreateAward,
  loading,
}) => {
  const isFormValid =
    createForm.producer_uuid.trim() || createForm.producer_email.trim();

  return (
    <Modal isOpen={isOpen} toggle={onToggle} centered size="lg">
      <ModalHeader toggle={onToggle}>Cadastrar Nova Premiação</ModalHeader>
      <ModalBody>
        <div className="row">
          <div className="col-12">
            <h6 className="mb-3">Marco Selecionado: {selectedMilestone}</h6>

            {/* Formulário de Premiação */}
            <div className="row">
              <div className="col-md-6">
                <FormGroup>
                  <Label for="producerEmail">Email do Produtor</Label>
                  <Input
                    type="email"
                    id="producerEmail"
                    value={createForm.producer_email}
                    onChange={(e) =>
                      onFormChange('producer_email', e.target.value)
                    }
                    placeholder="Digite o email do produtor"
                  />
                  <small className="text-muted">
                    Email do produtor no sistema
                  </small>
                </FormGroup>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <FormGroup>
                  <Label>Data de Conquista</Label>
                  <Input
                    type="text"
                    value={new Date().toLocaleDateString('pt-BR')}
                    disabled
                    className="bg-light"
                  />
                  <small className="text-muted">Data atual (automática)</small>
                </FormGroup>
              </div>
              <div className="col-md-6">
                <FormGroup>
                  <Label>Marco de Receita</Label>
                  <Input
                    type="text"
                    value={selectedMilestone}
                    disabled
                    className="bg-light"
                  />
                  <small className="text-muted">
                    Marco selecionado (automático)
                  </small>
                </FormGroup>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <FormGroup>
                  <Label for="trackingCode">
                    Código de Rastreamento (Opcional)
                  </Label>
                  <Input
                    type="text"
                    id="trackingCode"
                    value={createForm.tracking_code}
                    onChange={(e) =>
                      onFormChange('tracking_code', e.target.value)
                    }
                    placeholder="Digite o código de rastreamento"
                  />
                </FormGroup>
              </div>
              <div className="col-md-6">
                <FormGroup>
                  <Label for="trackingLink">
                    Link de Rastreamento (Opcional)
                  </Label>
                  <Input
                    type="url"
                    id="trackingLink"
                    value={createForm.tracking_link}
                    onChange={(e) =>
                      onFormChange('tracking_link', e.target.value)
                    }
                    placeholder="Digite o link de rastreamento"
                  />
                </FormGroup>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onToggle}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={onCreateAward}
          disabled={!isFormValid || loading}
        >
          {loading ? <Spinner size="sm" className="me-2" /> : null}
          Cadastrar Premiação
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateAwardModal;
