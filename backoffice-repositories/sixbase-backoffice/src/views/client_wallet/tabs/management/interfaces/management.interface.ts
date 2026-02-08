export type ManagerPhase = 1 | 2 | 3 | 4; // 1=Novos Clientes, 2=Negociação, 3=Implementação, 4=Pronto para Vender

export const MANAGER_PHASE_IDS = {
  NOVOS_CLIENTES: 1,
  NEGOCIACAO: 2,
  IMPLEMENTACAO: 3,
  PRONTO_PARA_VENDER: 4,
} as const;

export const managerPhaseTypes = [
  { id: 1, key: 'NOVOS_CLIENTES', label: 'Novos Clientes' },
  { id: 2, key: 'NEGOCIACAO', label: 'Negociação' },
  { id: 3, key: 'IMPLEMENTACAO', label: 'Implementação' },
  { id: 4, key: 'PRONTO_PARA_VENDER', label: 'Pronto para Vender' },
] as const;

export interface ManagementItem {
  id: number;
  user_uuid?: string;
  name: string;
  email: string;
  created_at?: string;
  manager_phase: ManagerPhase | null;
  manager_phase_updated_at?: string | null;
  current_revenue: number;
  days_since_created?: number;
  days_in_phase?: number | null;
}

export interface ManagementKanbanResponse {
  items: ManagementItem[];
  total: number;
  page: number;
  size: number;
}

export interface ManagementKanbanAllResponse {
  novos_clientes: {
    items: ManagementItem[];
    total: number;
  };
  negociacao: {
    items: ManagementItem[];
    total: number;
  };
  implementacao: {
    items: ManagementItem[];
    total: number;
  };
  pronto_para_vender: {
    items: ManagementItem[];
    total: number;
  };
}
