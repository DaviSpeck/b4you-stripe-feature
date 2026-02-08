export interface BaseRevenueCardProps {
  title: string;
  clientsCount: number;
  revenue: number;
  tooltip?: string;
  loading?: boolean;
  onClick?: () => void;
}