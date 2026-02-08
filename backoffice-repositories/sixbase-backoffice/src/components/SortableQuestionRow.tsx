import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSkin } from '../utility/hooks/useSkin';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  Edit,
  Save,
} from 'react-feather';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'date'
  | 'number';

export interface QuestionRowData {
  id: number;
  label: string;
  key: string;
  type: QuestionType;
  required: boolean;
  step?: number;
  options?: string[] | Record<string, any>;
}

interface SortableQuestionRowProps {
  question: QuestionRowData;
  index: number;
  steps: number[];
  onChange: (id: number, changes: Partial<QuestionRowData>) => void;
  onSave: (id: number, changes: Partial<QuestionRowData>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

const SortableQuestionRow: FC<SortableQuestionRowProps> = ({
  question,
  index,
  steps,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onSave,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';
  const containerGradient = isDark
    ? 'linear-gradient(135deg, #272f45 0%, #1e2538 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(question.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  } as React.CSSProperties;

  const [localLabel, setLocalLabel] = useState(question.label);
  const [localType, setLocalType] = useState<QuestionType>(question.type);
  const [localOptions, setLocalOptions] = useState<string[]>(
    Array.isArray(question.options)
      ? (question.options as string[])
      : typeof question.options === 'object' && question.options
      ? Object.values(question.options as any).map(String)
      : [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLabel, setModalLabel] = useState(question.label);
  const [modalType, setModalType] = useState<QuestionType>(question.type);
  const [modalOptions, setModalOptions] = useState<string[]>(
    Array.isArray(question.options)
      ? (question.options as string[])
      : typeof question.options === 'object' && question.options
      ? Object.values(question.options as any).map(String)
      : [],
  );

  useEffect(() => {
    setLocalLabel(question.label);
    setLocalType(question.type);
    setLocalOptions(
      Array.isArray(question.options)
        ? (question.options as string[])
        : typeof question.options === 'object' && question.options
        ? Object.values(question.options as any).map(String)
        : [],
    );
  }, [question.id]);

  const handleOpenModal = () => {
    setModalLabel(question.label);
    setModalType(question.type);
    setModalOptions(
      Array.isArray(question.options)
        ? (question.options as string[])
        : typeof question.options === 'object' && question.options
        ? Object.values(question.options as any).map(String)
        : [],
    );
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    setLocalLabel(modalLabel);
    setLocalType(modalType);
    setLocalOptions(modalOptions);
    onSave(question.id, {
      label: modalLabel,
      key: question.key,
      type: modalType,
      required: true,
      options: ['select', 'multiselect'].includes(modalType)
        ? modalOptions.filter((s) => s.trim().length > 0)
        : undefined,
    });
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className="sortable-row"
        {...attributes}
      >
        <td style={{ width: 40, verticalAlign: 'middle' }}>
          <Button
            color="light"
            className="p-0"
            style={{
              cursor: 'grab',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
            {...listeners}
          >
            <i
              className="bx bx-dots-vertical-rounded"
              style={{ fontSize: 20, color: '#6c757d' }}
            ></i>
          </Button>
        </td>
        <td style={{ width: 50, verticalAlign: 'middle' }}>
          <span
            className="badge"
            style={{ backgroundColor: '#343d55', color: 'white' }}
          >
            {index + 1}
          </span>
        </td>
        <td style={{ minWidth: 300, verticalAlign: 'middle' }}>
          <Input
            value={localLabel}
            onChange={(e) => {
              setLocalLabel(e.target.value);
              onChange(question.id, { label: e.target.value });
            }}
            onBlur={() => {
              onSave(question.id, {
                label: localLabel,
                key: question.key,
                type: localType,
                required: true,
              });
            }}
          />
        </td>
        <td style={{ width: 180, verticalAlign: 'middle' }}>
          <Input
            type="select"
            value={localType}
            onChange={(e) => {
              const newType = e.target.value as QuestionType;
              setLocalType(newType);
              onChange(question.id, { type: newType });
              if (!['select', 'multiselect'].includes(newType)) {
                setLocalOptions([]);
              } else if (localOptions.length === 0) {
                setLocalOptions(['']);
              }
              onSave(question.id, {
                label: localLabel,
                key: question.key,
                type: newType,
                required: true,
                options: ['select', 'multiselect'].includes(newType)
                  ? localOptions.filter((s) => s.trim().length > 0)
                  : undefined,
              });
            }}
          >
            {[
              'text',
              'textarea',
              'select',
              'multiselect',
              'boolean',
              'date',
              'number',
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Input>
        </td>
        <td style={{ width: 100, verticalAlign: 'middle' }}>
          <Button
            size="sm"
            color="primary"
            onClick={handleOpenModal}
            className="d-flex align-items-center gap-1"
          >
            <Edit size={14} />
            {['select', 'multiselect'].includes(localType)
              ? `Editar (${localOptions.filter((o) => o.trim()).length})`
              : 'Editar'}
          </Button>
        </td>
        <td style={{ width: 140, textAlign: 'right', verticalAlign: 'middle' }}>
          <div
            className="d-flex"
            style={{ gap: 6, justifyContent: 'flex-end' }}
          >
            <Button
              size="sm"
              color="success"
              onClick={() =>
                onSave(question.id, {
                  label: localLabel,
                  key: question.key,
                  type: localType,
                  required: true,
                  options: ['select', 'multiselect'].includes(localType)
                    ? localOptions.filter((s) => s.trim().length > 0)
                    : undefined,
                })
              }
              title="Salvar alterações"
            >
              <Save size={14} />
            </Button>
            <Button
              size="sm"
              color="light"
              onClick={onDuplicate}
            >
              <Copy size={14} />
            </Button>
            <Button
              size="sm"
              color="danger"
              onClick={onRemove}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </td>

        {/* Modal de edição */}
        <Modal
          isOpen={isModalOpen}
          toggle={handleCloseModal}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={handleCloseModal}
            style={{
              background: containerGradient,
              borderRadius: '12px 12px 0 0',
              borderBottom: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
            }}
          >
            Editar Pergunta
          </ModalHeader>
          <ModalBody
            style={{
              background: containerGradient,
              padding: 20,
              borderLeft: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
              borderRight: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
            }}
          >
            <div className="mb-3">
              <Label for="modal-label">Pergunta (Label)</Label>
              <Input
                id="modal-label"
                type="text"
                value={modalLabel}
                onChange={(e) => setModalLabel(e.target.value)}
                placeholder="Digite a pergunta"
              />
            </div>

            <div className="mb-3">
              <Label for="modal-type">Tipo</Label>
              <Input
                id="modal-type"
                type="select"
                value={modalType}
                onChange={(e) => {
                  const newType = e.target.value as QuestionType;
                  setModalType(newType);
                  if (!['select', 'multiselect'].includes(newType)) {
                    setModalOptions([]);
                  } else if (modalOptions.length === 0) {
                    setModalOptions(['']);
                  }
                }}
              >
                {[
                  'text',
                  'textarea',
                  'select',
                  'multiselect',
                  'boolean',
                  'date',
                  'number',
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Input>
            </div>

            {['select', 'multiselect'].includes(modalType) && (
              <div className="mb-3">
                <Label>Opções</Label>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {modalOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center mb-2"
                      style={{ gap: 8 }}
                    >
                      <Input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...modalOptions];
                          updated[idx] = e.target.value;
                          setModalOptions(updated);
                        }}
                        placeholder={`Opção ${idx + 1}`}
                        style={{ flex: 1 }}
                      />
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => {
                          setModalOptions(
                            modalOptions.filter((_, i) => i !== idx),
                          );
                        }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    color="primary"
                    className="d-flex align-items-center justify-content-center gap-1"
                    onClick={() => setModalOptions([...modalOptions, ''])}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    <Plus size={14} /> Adicionar opção
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter
            style={{
              background: containerGradient,
              borderRadius: '0 0 12px 12px',
              borderTop: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
            }}
          >
            <Button color="light" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button color="success" onClick={handleSaveModal}>
              Salvar
            </Button>
          </ModalFooter>
        </Modal>
      </tr>
    </>
  );
};

export default SortableQuestionRow;
