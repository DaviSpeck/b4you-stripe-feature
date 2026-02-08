import { ReactNode } from "react";

export interface CostsData {
  sales: {
    card: {
      [key: string]: Array<{
        installment: number;
        variable: number;
      }>;
    };
    billet: {
      fixed: number;
    };
    pix: {
      fixed: number;
    };
  };
}

export interface StatisticsCardsProps {
  className?: string;
  hideChart?: boolean;
  iconRight?: boolean;
  iconBg?: string;
  icon: ReactNode;
  stat: ReactNode;
  statTitle: string;
  options?: any;
  series?: any[];
  type?: string;
  height?: string;
  gap?: string;
}

export interface TooltipItemProps {
  item: {
    placement: string;
    text: string | ReactNode;
  };
  id: number;
  children: ReactNode;
}

export interface BlockRecord {
  id: number;
  type: string;
  body: {
    offer_id: string;
  };
  email: string;
  full_name: string;
  document_number: string;
  phone: string;
  ip: string;
  created_at: string;
  address?: any;
  cookies?: any;
}

export interface ApiResponse {
  rows: BlockRecord[];
  count: number;
}

export interface SelectedDetails {
  body: any;
  address: any;
  cookies: any;
}

export interface CostItem {
  installment: number;
  variable: number;
}

export interface CostsData {
  sales: {
    card: {
      [key: string]: CostItem[];
    };
    billet: {
      fixed: number;
    };
    pix: {
      fixed: number;
    };
  };
}

export interface CostsProps {
  costs: CostsData;
  fetchCosts: () => void;
}

export interface SalesData {
  balance_total: number;
  pending_total: number;
  balance_total_negative: number;
  sales: {
    gross_percentage: number;
    gross_fixed: number;
    installment_amount: number;
    gross_profit: number;
    cost_total: number;
    net_profit: number;
    card?: {
      count: number;
      installments: Array<{
        installments: number;
        count: number;
        percentage: number;
        total: number;
      }>;
    };
  };
  withdrawals: {
    gross_profit: number;
    net_profit: number;
    withdrawal_amount?: number;
  };
  pending_withdrawals?: number;
}

export interface FilterState {
  calendar: Date[];
}

export interface DeniedRecord {
  provider_response_details: string;
  total_ocorrencias: number;
  porcentagem: number;
}

export interface FilterState {
  calendar: Date[];
}