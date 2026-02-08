import { Request } from 'express';
export interface FormsQueryParams {
  page?: number;
  size?: number;
  form_type?: number;
  is_active?: boolean;
  [key: string]: any;
}

export interface FormLogsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  [key: string]: any;
}

export interface FormsRequest extends Request {
  query: FormsQueryParams;
}

export interface FormRequest extends Request {
  params: {
    id: string;
  };
}

export interface FormLogsRequest extends Request {
  params: {
    id: string;
  };
  query: FormLogsQueryParams;
}

export interface CreateFormBody {
  title: string;
  form_type: number;
}

export interface UpdateFormBody {
  title?: string;
  form_type?: number;
  is_active?: boolean;
}

export interface CreateQuestionBody {
  key: string;
  label: string;
  type: string;
  options?: any;
  required: boolean;
  order?: number;
  visible_if?: any;
  is_active?: boolean;
  help_text?: string;
  placeholder?: string;
}

export interface UpdateQuestionBody {
  label?: string;
  type?: string;
  options?: any;
  required?: boolean;
  order?: number;
  visible_if?: any;
  is_active?: boolean;
  help_text?: string;
  placeholder?: string;
}

export interface ReorderQuestionsBody {
  orders: Array<{
    questionId: number;
    order: number;
  }>;
}

export interface PublishFormBody {
  version: number;
}

export interface FormData {
  id: number;
  form_type: number;
  title: string;
  version: number;
  is_active: boolean;
  answers_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FormQuestionData {
  id: number;
  id_form: number;
  key: string;
  label: string;
  type: string;
  options?: any;
  required: boolean;
  order: number;
  visible_if?: any;
  is_active: boolean;
  help_text?: string;
  placeholder?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormDetail extends FormData {
  questions: FormQuestionData[];
}

export interface FormLogData {
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
  logs: FormLogData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export type FormSummary = FormData;
export type FormQuestion = FormQuestionData;
export type FormLog = FormLogData;

export interface ListFormsParams {
  page?: number;
  size?: number;
  form_type?: number;
  is_active?: boolean;
}

export interface CreateFormDraftParams {
  title: string;
  form_type: number;
}

export interface UpdateFormMetadataParams {
  title?: string;
  form_type?: number;
  is_active?: boolean;
}

export interface CreateQuestionParams {
  key: string;
  label: string;
  type: string;
  options?: any;
  required: boolean;
  order?: number;
  visible_if?: any;
  is_active?: boolean;
  help_text?: string;
  placeholder?: string;
}

export interface UpdateQuestionParams {
  label?: string;
  type?: string;
  options?: any;
  required?: boolean;
  order?: number;
  visible_if?: any;
  is_active?: boolean;
  help_text?: string;
  placeholder?: string;
}

export interface ReorderQuestionsParams {
  orders: Array<{
    questionId: number;
    order: number;
  }>;
}

export interface GetFormLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface ListFormsInput {
  page: number;
  size: number;
  form_type?: number;
  is_active?: boolean;
}

export interface GetFormByIdInput {
  id: number;
}

export interface CreateFormDraftInput {
  title: string;
  form_type: number;
  userId?: number;
}

export interface UpdateFormMetadataInput {
  id: number;
  title?: string;
  form_type?: number;
  is_active?: boolean;
  userId?: number;
}

export interface DeleteFormInput {
  id: number;
  userId?: number;
}

export interface CreateQuestionInput {
  formId: number;
  key: string;
  label: string;
  type: string;
  options?: any;
  required: boolean;
  order?: number;
  visible_if?: any;
  is_active?: boolean;
  help_text?: string;
  placeholder?: string;
  userId?: number;
}

export interface UpdateQuestionInput {
  id: number;
  label?: string;
  type?: string;
  options?: any;
  required?: boolean;
  order?: number;
  visible_if?: any;
  is_active?: boolean;
  help_text?: string;
  placeholder?: string;
  userId?: number;
}

export interface DeactivateQuestionInput {
  id: number;
  userId?: number;
}

export interface PublishFormVersionInput {
  id: number;
  userId?: number;
}

export interface ReorderQuestionsInput {
  formId: number;
  orders: Array<{
    questionId: number;
    order: number;
  }>;
  userId?: number;
}

export interface GetFormLogsInput {
  formId: number;
  page?: number;
  limit?: number;
  search?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface FormsListResponse {
  count: number;
  rows: FormData[];
}

export interface FormDetailResponse extends FormDetail {}

export interface FormLogsResponseData {
  logs: FormLogData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
