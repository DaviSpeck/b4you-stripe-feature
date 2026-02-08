import { api } from './api';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'date'
  | 'number';

export interface FormSummary {
  id: number;
  form_type: number;
  title: string;
  version: number;
  is_active: boolean;
  answers_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FormQuestion {
  id: number;
  id_form: number;
  key: string;
  label: string;
  type: QuestionType;
  options?: any;
  required: boolean;
  order: number;
  visible_if?: any;
  is_active: boolean;
  help_text?: string;
  placeholder?: string;
}

export interface FormDetail extends FormSummary {
  questions: FormQuestion[];
}

export async function listForms(params?: {
  page?: number;
  size?: number;
  form_type?: number;
  is_active?: boolean;
}): Promise<{ count: number; rows: FormSummary[] }> {
  const { data } = await api.get('/backoffice/forms', { params });
  return data;
}

export async function getFormById(id: number): Promise<FormDetail> {
  const { data } = await api.get(`/backoffice/forms/${id}`);
  return data;
}

export async function createFormDraft(payload: {
  form_type: number;
  title: string;
}): Promise<FormSummary> {
  const { data } = await api.post('/backoffice/forms', payload);
  return data;
}

export async function updateFormMetadata(
  id: number,
  payload: Partial<{ form_type: number; title: string; is_active: boolean }>,
): Promise<FormSummary> {
  const { data } = await api.put(`/backoffice/forms/${id}`, payload);
  return data;
}

export async function deactivateForm(id: number): Promise<void> {
  await api.delete(`/backoffice/forms/${id}`);
}

export async function createQuestion(
  formId: number,
  payload: Omit<FormQuestion, 'id' | 'id_form'>,
): Promise<FormQuestion> {
  const { data } = await api.post(
    `/backoffice/forms/${formId}/questions`,
    payload,
  );
  return data;
}

export async function updateQuestion(
  questionId: number,
  payload: Partial<FormQuestion>,
): Promise<FormQuestion> {
  const { data } = await api.put(
    `/backoffice/forms/questions/${questionId}`,
    payload,
  );
  return data;
}

export async function deactivateQuestion(questionId: number): Promise<void> {
  await api.delete(`/backoffice/forms/questions/${questionId}`);
}

export async function publishFormVersion(id: number): Promise<FormSummary> {
  const { data } = await api.post(`/backoffice/forms/${id}/publish`, {});
  return data;
}

export async function reorderQuestions(
  formId: number,
  orders: { questionId: number; order: number }[],
): Promise<void> {
  await api.post(`/backoffice/forms/${formId}/reorder`, { orders });
}

export async function triggerV1Seed(): Promise<{
  success: boolean;
  message?: string;
}> {
  const { data } = await api.post('/backoffice/forms/seed-v1', {});
  return data;
}

export interface FormLog {
  id: number;
  id_user_backoffice: number;
  id_form: number;
  id_event: number;
  params: Record<string, any>;
  ip_address: string;
  created_at: string;
  event_key?: string;
  event_label?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  event?: {
    id: number;
    name: string;
    description: string;
  };
}

export interface FormLogsResponse {
  logs: FormLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export async function getFormLogs(
  formId: number,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    event_type?: string;
    start_date?: string;
    end_date?: string;
  },
): Promise<FormLogsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.event_type) queryParams.append('event_type', params.event_type);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const { data } = await api.get(
    `/backoffice/forms/${formId}/logs?${queryParams.toString()}`,
  );
  return data.data;
}
