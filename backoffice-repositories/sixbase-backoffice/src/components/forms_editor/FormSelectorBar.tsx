import { Button, Input, Label } from 'reactstrap';
import { Plus } from 'react-feather';
import { type FormSelectorBarProps } from '../../interfaces/formseditor.interface';

export const FormSelectorBar = ({
  forms,
  selectedFormId,
  onSelect,
  onCreate,
  formTypeLabelMap,
}: FormSelectorBarProps) => (
  <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
    <Label className="mb-0" style={{ whiteSpace: 'nowrap' }}>
      Selecionar formulário:
    </Label>
    <Input
      type="select"
      value={selectedFormId ?? ''}
      onChange={(event) => onSelect(Number(event.target.value) || null)}
      style={{ width: '100%', minWidth: 200 }}
      className="flex-grow-1"
    >
      <option value="">-- Selecione um formulário --</option>
      {forms.map((form) => (
        <option key={form.id} value={form.id}>
          {form.title} - {formTypeLabelMap[form.form_type] || form.form_type} ·
          v{form.version}
          {form.is_active ? ' (ativo)' : ''}
          {form.answers_count !== undefined && form.answers_count > 0
            ? ` · ${form.answers_count} ${
                form.answers_count === 1
                  ? 'resposta registrada'
                  : 'respostas registradas'
              }`
            : ''}
        </option>
      ))}
    </Input>
    <Button
      size="sm"
      color="primary"
      className="d-flex align-items-center gap-1"
      style={{ whiteSpace: 'nowrap' }}
      onClick={onCreate}
    >
      <Plus size={14} className="mr-50" /> Novo
    </Button>
  </div>
);

export default FormSelectorBar;
