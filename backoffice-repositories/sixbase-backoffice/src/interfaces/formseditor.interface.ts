import { Question } from "hooks/useFormEditor";
import { FormSummary } from "services/forms.service";

export interface QuestionsTableSectionProps {
  questions: Question[];
  onReorder: (reordered: Question[]) => Promise<void> | void;
  onUpdate: (id: number, changes: Partial<Question>) => void;
  onSave: (id: number, changes: Partial<Question>) => Promise<void>;
  onMove: (index: number, direction: -1 | 1) => Promise<void> | void;
  onDuplicate: (index: number) => Promise<void> | void;
  onRemove: (index: number) => Promise<void> | void;
}

export interface PreviewPanelProps {
  questions: Question[];
  previewStep: number;
  setPreviewStep: (step: number) => void;
  isMobile: boolean;
}

export interface FormStatusHeaderProps {
  form: FormSummary | null;
  isMobile: boolean;
  isDark: boolean;
}

export interface FormSelectorBarProps {
  forms: FormSummary[];
  selectedFormId: number | null;
  onSelect: (id: number | null) => void;
  onCreate: () => Promise<void> | void;
  formTypeLabelMap: Record<number, string>;
}

export interface FormMetadataSectionProps {
  form: FormSummary | null;
  formTypeLabelMap: Record<number, string>;
  onTitleChange: (value: string) => void;
  onFormTypeChange: (value: number) => Promise<boolean>;
  onSaveMetadata: () => Promise<void>;
  onSaveWithVersionCheck: (action: () => Promise<void>) => Promise<void>;
  onDeleteForm: () => Promise<void>;
}

export interface FormActionsBarProps {
  preview: boolean;
  onTogglePreview: () => void;
  onAddQuestion: () => Promise<void> | void;
  onOpenPublishModal: () => void;
  isActive: boolean;
  onToggleActive: () => Promise<void> | void;
}

export interface EventType {
  id: number;
  key: string;
  label: string;
}

export interface FormLogsTabProps {
  formId: number | null;
}

export interface CreateVersionModalProps {
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  formTitle?: string;
}

export interface VersionWarningModalProps {
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
  formTitle?: string;
}