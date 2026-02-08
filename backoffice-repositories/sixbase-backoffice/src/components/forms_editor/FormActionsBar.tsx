import { Button } from 'reactstrap';
import { Eye, Plus, Save } from 'react-feather';
import { type FormActionsBarProps } from '../../interfaces/formseditor.interface';

export const FormActionsBar = ({
  preview,
  onTogglePreview,
  onAddQuestion,
  onOpenPublishModal,
  isActive,
  onToggleActive,
}: FormActionsBarProps) => (
  <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-2">
    <Button
      size="sm"
      color="light"
      className="d-flex align-items-center gap-1"
      onClick={onTogglePreview}
      style={{ whiteSpace: 'nowrap' }}
    >
      <Eye size={14} /> {preview ? 'Fechar preview' : 'Preview'}
    </Button>
    <div className="d-flex flex-wrap align-items-center justify-content-start justify-content-md-end gap-2">
      <Button
        color="primary"
        className="d-flex align-items-center gap-1"
        size="sm"
        onClick={onAddQuestion}
        style={{ whiteSpace: 'nowrap' }}
      >
        <Plus size={14} /> Adicionar pergunta
      </Button>
      <Button
        size="sm"
        color="success"
        className="d-flex align-items-center gap-1"
        onClick={onOpenPublishModal}
        style={{ whiteSpace: 'nowrap' }}
      >
        <Save size={14} className="mr-50" /> Salvar versão
      </Button>
      <Button
        size="sm"
        color={isActive ? 'danger' : 'success'}
        onClick={onToggleActive}
        title="Ativar/Desativar formulário"
        style={{ whiteSpace: 'nowrap' }}
      >
        {isActive ? 'Desativar' : 'Ativar'}
      </Button>
    </div>
  </div>
);

export default FormActionsBar;

