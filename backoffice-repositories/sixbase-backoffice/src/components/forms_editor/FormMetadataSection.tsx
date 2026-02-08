import { Button, Input, Label } from 'reactstrap';
import { Save } from 'react-feather';
import { type FormMetadataSectionProps } from '../../interfaces/formseditor.interface';


export const FormMetadataSection = ({
  form,
  formTypeLabelMap,
  onTitleChange,
  onFormTypeChange,
  onSaveMetadata,
  onSaveWithVersionCheck,
  onDeleteForm,
}: FormMetadataSectionProps) => {
  if (!form) return null;

  const answersCount = form.answers_count ?? 0;
  const hasAnswers = answersCount > 0;

  return (
    <div
      className="d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between mb-2 w-100"
      style={{ gap: 12 }}
    >
      <div
        className="d-flex flex-column flex-md-row align-items-start align-items-md-end"
        style={{ gap: 12, flex: 1 }}
      >
        <div className="w-100">
          <Label className="mb-25 d-block">Nome do formulário</Label>
          <Input
            value={form.title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ex.: Onboarding – Creator"
          />
        </div>
        <div className="w-100">
          <Label className="mb-25 d-block" style={{ whiteSpace: 'nowrap' }}>
            Tipo
            {hasAnswers && (
              <span
                className="ml-1"
                style={{
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  fontWeight: 500,
                }}
                title="Não é possível alterar o tipo de um formulário que possui respostas registradas"
              >
                (bloqueado: possui respostas)
              </span>
            )}
          </Label>
          <Input
            type="select"
            value={form.form_type}
            disabled={hasAnswers}
            onChange={async (event) => {
              const value = Number(event.target.value);
              await onFormTypeChange(value);
            }}
          >
            {Object.entries(formTypeLabelMap).map(([id, label]) => (
              <option key={id} value={Number(id)}>
                {label}
              </option>
            ))}
          </Input>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2" style={{ flexShrink: 0 }}>
        <Button
          size="sm"
          color="success"
          className="d-flex align-items-center gap-1"
          onClick={() => onSaveWithVersionCheck(onSaveMetadata)}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Save size={14} /> Salvar metadados
        </Button>
        <Button
          size="sm"
          color="danger"
          disabled={hasAnswers}
          title={
            hasAnswers
              ? 'Não é possível excluir formulários com respostas registradas'
              : 'Excluir formulário'
          }
          onClick={onDeleteForm}
          style={{ whiteSpace: 'nowrap' }}
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export default FormMetadataSection;
