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
  Alert,
} from 'reactstrap';
import { UploadAwardModalProps } from '../../interfaces/awards.interface';

const UploadAwardModal: FC<UploadAwardModalProps> = ({
  isOpen,
  onToggle,
  selectedMilestone,
  uploadEmails,
  uploadResults,
  uploadLoading,
  onFileChange,
  onBulkUpload,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={onToggle} centered size="lg">
      <ModalHeader toggle={onToggle}>Upload em Lote - Premiações</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <h6 className="mb-3">Marco Selecionado: {selectedMilestone}</h6>
          <Alert color="info" className="mb-3">
            <small>
              <strong>Instruções:</strong> Faça upload de uma planilha Excel
              (.xlsx) com os emails dos produtores na primeira coluna (coluna
              A). Cada linha deve conter um email válido.
            </small>
          </Alert>
        </div>

        <FormGroup>
          <Label for="excelFile">Arquivo Excel</Label>
          <Input
            type="file"
            id="excelFile"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileChange(file);
              }
            }}
          />
          <small className="text-muted">Formatos aceitos: .xlsx, .xls</small>
        </FormGroup>

        {uploadEmails.length > 0 && (
          <div className="mt-3">
            <h6>Emails encontrados ({uploadEmails.length}):</h6>
            <div
              className="border rounded p-2"
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#f8f9fa',
              }}
            >
              {uploadEmails.map((email, index) => (
                <div key={index} className="mb-1">
                  <small className="text-muted">
                    {index + 1}. {email}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadResults && (
          <div className="mt-3">
            <Alert
              color={uploadResults.errors.length === 0 ? 'success' : 'warning'}
            >
              <h6>Resultado do Upload:</h6>
              <p className="mb-1">
                <strong>Sucessos:</strong> {uploadResults.success}
              </p>
              {uploadResults.errors.length > 0 && (
                <div>
                  <strong>Erros ({uploadResults.errors.length}):</strong>
                  <div
                    className="mt-2"
                    style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      fontSize: '0.875rem',
                    }}
                  >
                    {uploadResults.errors.map((error, index) => (
                      <div key={index} className="text-danger">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Alert>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onToggle}>
          Cancelar
        </Button>
        <Button
          color="success"
          onClick={onBulkUpload}
          disabled={uploadEmails.length === 0 || uploadLoading}
        >
          {uploadLoading ? <Spinner size="sm" className="me-2" /> : null}
          {uploadLoading
            ? 'Processando...'
            : `Cadastrar ${uploadEmails.length} Premiações`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UploadAwardModal;
