export interface DashboardData {
  totalClientes: number;
  variacaoFaturamento: {
      valor: number;
      percentual: number;
  };
  novosClientes: number;
  churn: number;
  churnRevenueLoss: number;
  churnCount: number;
}

export interface RevenueData {
  total_revenue: number;
  mom_value: number;
  mom_percentage: number;
}

export interface ClientsData {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  new_clients: number;
  new_clients_revenue: number;
  churn_revenue_loss: number;
  churn_count: number;
  clients: any[];
}

export interface Manager {
  id: number;
  email: string;
}

export interface Producer {
  id: number;
  user_uuid?: string;
  name: string;
  email: string;
  birth_date: string;
  phone: string;
  period_revenue: number;
  total_revenue: number;
  goal_status: {
      next_goal: number;
      percentage_achieved: number;
      goal_achieved: boolean;
      goal_achieved_in_period: boolean;
  };
  birthday_in_period: boolean;
  award_achieved: boolean;
}

export interface ProducersResponse {
  page: number;
  size: number;
  total: number;
  producers: Producer[];
}