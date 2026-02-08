export interface RevenueChartProps {
  chartData: Array<{
    date: string;
    faturamento_total?: number;
    faturamento_novos_clientes?: number;
    faturamento_retencao?: number;
    total_churn?: number;
  }>;
  loading: boolean;
}