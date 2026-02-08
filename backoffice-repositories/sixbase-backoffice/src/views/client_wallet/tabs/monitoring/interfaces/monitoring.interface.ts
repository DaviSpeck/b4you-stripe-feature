export type Stage = 'DROP' | 'HEALTHY' | 'ATTENTION' | 'CHURN';
export type ContactStatusKey =
  (typeof managerStatusContactTypes)[number]['key'];

export const managerStatusContactTypes = [
  { id: 1, key: 'NAO_CONTATADO', label: 'Não contatado' },
  { id: 2, key: 'EM_CONTATO', label: 'Em contato' },
  { id: 3, key: 'EM_ACOMPANHAMENTO', label: 'Em acompanhamento' },
  { id: 4, key: 'SEM_RETORNO', label: 'Sem retorno' },
  { id: 5, key: 'CONCLUIDO', label: 'Concluído' },
  { id: 6, key: 'CONCLUIDO_REMOVIDO', label: 'Concluído - Remover do fluxo' },
] as const;

export interface ProducerPerformanceItem {
  id: number;
  user_uuid?: string;
  name: string;
  email: string;
  created_at?: string;
  current_revenue: number;
  prev_revenue: number;
  variation_percentage: number;
  stage: Stage | null;
  contact_status: ContactStatusKey;
  is_new_client?: boolean;
  is_active_client?: boolean;
  days_since_created?: number;
}

export interface ProducersPerformanceResponse {
  producers?: ProducerPerformanceItem[];
  items?: ProducerPerformanceItem[];
  total: number;
  page?: number;
  size?: number;
  meta?: {
    note?: string;
    no_complete_days?: boolean;
  };
}
