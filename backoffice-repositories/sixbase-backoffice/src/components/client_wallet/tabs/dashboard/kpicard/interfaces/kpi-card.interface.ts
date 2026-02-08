export interface KPICardProps {
  title: string;
  value: number | string;
  icon?: any;
  isMonetary?: boolean;
  tooltip?: string;
  loading?: boolean;
  valueColor?: string;
  onClick?: () => void;
}